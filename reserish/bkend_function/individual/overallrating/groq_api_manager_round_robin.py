import os
import json
import logging
import threading
import time
from typing import List, Optional, Dict, Any
from collections import deque, defaultdict
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

class GroqAPIRoundRobinManager:
    """
    Manages multiple Groq API keys with round-robin distribution and per-minute rate limiting.
    Implements proper time-based rate limiting instead of cumulative call counting.
    """
    
    def __init__(self, requests_per_minute_per_key: int = 100, max_parallel_keys: int = 3):
        self.requests_per_minute_per_key = requests_per_minute_per_key
        self.max_parallel_keys = max_parallel_keys
        self.api_keys = []
        self.key_clients = {}
        self.key_status = {}
        self.request_timestamps = defaultdict(deque)  # Track request times for each key
        self.current_key_index = 0
        self.lock = threading.Lock()
        
        # Load environment variables
        dotenv_path = Path(__file__).resolve().parents[1] / ".env"
        load_dotenv(dotenv_path)
        
        # Load API keys from environment variables
        self._load_api_keys()
        
        # Initialize clients for all keys
        self._initialize_all_clients()
        
        # Start background cleanup thread
        self._start_cleanup_thread()
    
    def _load_api_keys(self):
        """Load API keys from environment variables"""
        # Try to load multiple API keys
        base_key = os.getenv("GROQ_API_KEY")
        if base_key:
            self.api_keys.append(base_key)
            self.key_status[base_key] = {
                'healthy': True,
                'last_used': time.time(),
                'error_count': 0,
                'total_calls': 0,
                'rate_limit_exceeded': False
            }
        
        # Try to load additional API keys
        for i in range(1, 11):  # Support up to 10 API keys
            additional_key = os.getenv(f"GROQ_API_KEY_{i}")
            if additional_key:
                self.api_keys.append(additional_key)
                self.key_status[additional_key] = {
                    'healthy': True,
                    'last_used': time.time(),
                    'error_count': 0,
                    'total_calls': 0,
                    'rate_limit_exceeded': False
                }
        
        # If no additional keys found, try to load from a comma-separated string
        if len(self.api_keys) <= 1:
            keys_string = os.getenv("GROQ_API_KEYS")
            if keys_string:
                keys_list = [key.strip() for key in keys_string.split(",") if key.strip()]
                for key in keys_list:
                    if key not in self.api_keys:
                        self.api_keys.append(key)
                        self.key_status[key] = {
                            'healthy': True,
                            'last_used': time.time(),
                            'error_count': 0,
                            'total_calls': 0,
                            'rate_limit_exceeded': False
                        }
        
        logging.info(f"Loaded {len(self.api_keys)} Groq API keys for round-robin distribution")
    
    def _initialize_all_clients(self):
        """Initialize Groq clients for all API keys"""
        for key in self.api_keys:
            try:
                self.key_clients[key] = Groq(api_key=key)
                logging.info(f"Initialized client for API key {self.api_keys.index(key) + 1}")
            except Exception as e:
                logging.error(f"Failed to initialize client for key {self.api_keys.index(key) + 1}: {e}")
                self.key_status[key]['healthy'] = False
    
    def _start_cleanup_thread(self):
        """Start background thread to clean up old timestamps"""
        def cleanup():
            while True:
                try:
                    self._cleanup_old_timestamps()
                    time.sleep(60)  # Clean up every minute
                except Exception as e:
                    logging.error(f"Cleanup thread error: {e}")
                    time.sleep(60)
        
        cleanup_thread = threading.Thread(target=cleanup, daemon=True)
        cleanup_thread.start()
    
    def _cleanup_old_timestamps(self):
        """Remove timestamps older than 1 minute"""
        current_time = time.time()
        cutoff_time = current_time - 60  # 1 minute ago
        
        with self.lock:
            for key in self.api_keys:
                if key in self.request_timestamps:
                    # Remove timestamps older than 1 minute
                    while (self.request_timestamps[key] and 
                           self.request_timestamps[key][0] < cutoff_time):
                        self.request_timestamps[key].popleft()
                    
                    # Check if rate limit is still exceeded
                    if len(self.request_timestamps[key]) < self.requests_per_minute_per_key:
                        self.key_status[key]['rate_limit_exceeded'] = False
    
    def _is_key_available(self, key: str) -> bool:
        """Check if a key is available for use (healthy and not rate limited)"""
        if not self.key_status[key]['healthy']:
            return False
        
        if self.key_status[key]['rate_limit_exceeded']:
            return False
        
        # Check current minute rate limit
        current_time = time.time()
        minute_ago = current_time - 60
        
        # Count requests in the last minute
        recent_requests = sum(1 for timestamp in self.request_timestamps[key] 
                            if timestamp > minute_ago)
        
        return recent_requests < self.requests_per_minute_per_key
    
    def _get_next_available_key(self) -> Optional[str]:
        """Get the next available key using round-robin with availability check"""
        if not self.api_keys:
            return None
        
        # Try to find an available key starting from current position
        attempts = 0
        while attempts < len(self.api_keys):
            # Get next key in round-robin order
            key = self.api_keys[self.current_key_index]
            
            if self._is_key_available(key):
                return key
            
            # Move to next key
            self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
            attempts += 1
        
        # If no keys are available, return None
        return None
    
    def _get_available_keys_for_parallel(self, count: int) -> List[str]:
        """Get multiple available keys for parallel execution"""
        available_keys = []
        checked_keys = set()
        
        # Start from current position and find available keys
        start_index = self.current_key_index
        current_index = start_index
        
        while len(available_keys) < count and len(checked_keys) < len(self.api_keys):
            key = self.api_keys[current_index]
            
            if key not in checked_keys:
                checked_keys.add(key)
                
                if self._is_key_available(key):
                    available_keys.append(key)
            
            current_index = (current_index + 1) % len(self.api_keys)
            
            # If we've checked all keys, break
            if current_index == start_index and len(checked_keys) == len(self.api_keys):
                break
        
        return available_keys
    
    def _record_request(self, key: str):
        """Record a request timestamp for rate limiting"""
        current_time = time.time()
        
        with self.lock:
            self.request_timestamps[key].append(current_time)
            self.key_status[key]['last_used'] = current_time
            self.key_status[key]['total_calls'] += 1
            
            # Check if rate limit exceeded
            minute_ago = current_time - 60
            recent_requests = sum(1 for timestamp in self.request_timestamps[key] 
                                if timestamp > minute_ago)
            
            if recent_requests >= self.requests_per_minute_per_key:
                self.key_status[key]['rate_limit_exceeded'] = True
                logging.info(f"Rate limit exceeded for API key {self.api_keys.index(key) + 1}")
    
    def make_request(self, *args, **kwargs):
        """Make a single API request using round-robin distribution"""
        # Get next available key
        selected_key = self._get_next_available_key()
        
        if not selected_key:
            raise Exception("No available Groq API keys (all rate limited or unhealthy)")
        
        return self._execute_request(selected_key, *args, **kwargs)
    
    def make_parallel_requests(self, requests: List[Dict[str, Any]], max_parallel: int = None) -> List[Any]:
        """
        Make multiple API requests in parallel using round-robin distribution
        
        Args:
            requests: List of request parameters
            max_parallel: Maximum number of parallel requests (default: max_parallel_keys)
        
        Returns:
            List of responses in the same order as requests
        """
        if max_parallel is None:
            max_parallel = self.max_parallel_keys
        
        if not requests:
            return []
        
        # Get available keys for parallel execution
        available_keys = self._get_available_keys_for_parallel(max_parallel)
        
        if not available_keys:
            raise Exception("No available Groq API keys for parallel execution")
        
        # Distribute requests across available keys using round-robin
        responses = [None] * len(requests)
        key_assignments = self._distribute_requests_round_robin(requests, available_keys)
        
        # Execute requests in parallel
        with threading.ThreadPoolExecutor(max_workers=max_parallel) as executor:
            future_to_request = {}
            
            for i, (request_params, key) in enumerate(zip(requests, key_assignments)):
                future = executor.submit(self._execute_request, key, **request_params)
                future_to_request[future] = i
            
            # Collect results
            for future in future_to_request:
                request_index = future_to_request[future]
                try:
                    response = future.result()
                    responses[request_index] = response
                except Exception as e:
                    logging.error(f"Request {request_index} failed: {e}")
                    responses[request_index] = None
        
        return responses
    
    def _distribute_requests_round_robin(self, requests: List[Dict], keys: List[str]) -> List[str]:
        """Distribute requests across keys using round-robin"""
        if len(keys) == 1:
            return [keys[0]] * len(requests)
        
        # Round-robin distribution
        key_assignments = []
        for i in range(len(requests)):
            key_index = i % len(keys)
            key_assignments.append(keys[key_index])
        
        return key_assignments
    
    def _execute_request(self, key: str, *args, **kwargs):
        """Execute a single API request with a specific key"""
        start_time = time.time()
        
        try:
            client = self.key_clients[key]
            response = client.chat.completions.create(*args, **kwargs)
            
            # Record successful request
            self._record_request(key)
            
            return response
            
        except Exception as e:
            # Update error metrics
            with self.lock:
                self.key_status[key]['error_count'] += 1
                if self.key_status[key]['error_count'] >= 5:  # Mark as unhealthy after 5 errors
                    self.key_status[key]['healthy'] = False
                    logging.warning(f"API key {self.api_keys.index(key) + 1} marked as unhealthy due to errors")
            
            logging.error(f"Groq API request failed with key {self.api_keys.index(key) + 1}: {e}")
            raise e
    
    def get_usage_stats(self) -> dict:
        """Get comprehensive usage statistics for all API keys"""
        with self.lock:
            stats = {
                "total_keys": len(self.api_keys),
                "healthy_keys": sum(1 for status in self.key_status.values() if status['healthy']),
                "requests_per_minute_per_key": self.requests_per_minute_per_key,
                "max_parallel_keys": self.max_parallel_keys,
                "current_key_index": self.current_key_index,
                "key_details": {}
            }
            
            for i, key in enumerate(self.api_keys):
                status = self.key_status[key]
                
                # Calculate current minute usage
                current_time = time.time()
                minute_ago = current_time - 60
                current_minute_requests = sum(1 for timestamp in self.request_timestamps.get(key, [])
                                           if timestamp > minute_ago)
                
                # Calculate remaining requests this minute
                remaining_this_minute = max(0, self.requests_per_minute_per_key - current_minute_requests)
                
                stats["key_details"][f"key_{i+1}"] = {
                    "index": i,
                    "healthy": status['healthy'],
                    "rate_limit_exceeded": status['rate_limit_exceeded'],
                    "current_minute_requests": current_minute_requests,
                    "remaining_this_minute": remaining_this_minute,
                    "total_calls": status['total_calls'],
                    "error_count": status['error_count'],
                    "last_used": status['last_used']
                }
            
            return stats
    
    def set_requests_per_minute(self, requests_per_minute: int):
        """Set the rate limit per minute per key"""
        self.requests_per_minute_per_key = requests_per_minute
        logging.info(f"Rate limit set to {requests_per_minute} requests per minute per key")
    
    def set_max_parallel_keys(self, max_keys: int):
        """Set maximum number of keys to use in parallel"""
        self.max_parallel_keys = min(max_keys, len(self.api_keys))
        logging.info(f"Max parallel keys set to {self.max_parallel_keys}")
    
    def reset_rate_limits(self):
        """Reset rate limit tracking for all keys"""
        with self.lock:
            for key in self.api_keys:
                self.request_timestamps[key].clear()
                self.key_status[key]['rate_limit_exceeded'] = False
            logging.info("Rate limit tracking reset for all keys")
    
    def reset_key_health(self, key_index: Optional[int] = None):
        """Reset health status for a specific key or all keys"""
        with self.lock:
            if key_index is not None:
                if 0 <= key_index < len(self.api_keys):
                    key = self.api_keys[key_index]
                    self.key_status[key]['healthy'] = True
                    self.key_status[key]['error_count'] = 0
                    self.key_status[key]['rate_limit_exceeded'] = False
                    logging.info(f"Reset health for API key {key_index + 1}")
            else:
                # Reset all keys
                for key in self.key_status:
                    self.key_status[key]['healthy'] = True
                    self.key_status[key]['error_count'] = 0
                    self.key_status[key]['rate_limit_exceeded'] = False
                logging.info("Reset health for all API keys")
    
    def add_api_key(self, api_key: str):
        """Add a new API key to the manager"""
        with self.lock:
            if api_key not in self.api_keys:
                self.api_keys.append(api_key)
                self.key_status[api_key] = {
                    'healthy': True,
                    'last_used': time.time(),
                    'error_count': 0,
                    'total_calls': 0,
                    'rate_limit_exceeded': False
                }
                
                # Initialize client
                try:
                    self.key_clients[api_key] = Groq(api_key=api_key)
                    logging.info(f"Added new API key (total: {len(self.api_keys)})")
                except Exception as e:
                    logging.error(f"Failed to initialize client for new key: {e}")
                    self.key_status[api_key]['healthy'] = False
            else:
                logging.warning("API key already exists")
    
    def remove_api_key(self, api_key: str):
        """Remove an API key from the manager"""
        with self.lock:
            if api_key in self.api_keys:
                index = self.api_keys.index(api_key)
                self.api_keys.remove(api_key)
                del self.key_status[api_key]
                del self.key_clients[api_key]
                del self.request_timestamps[api_key]
                
                # Adjust current index if necessary
                if index <= self.current_key_index and self.current_key_index > 0:
                    self.current_key_index -= 1
                
                logging.info(f"Removed API key (total: {len(self.api_keys)})")
            else:
                logging.warning("API key not found")

# Global instance for easy access
groq_round_robin_manager = GroqAPIRoundRobinManager()


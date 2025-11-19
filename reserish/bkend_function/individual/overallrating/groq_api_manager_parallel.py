import os
import json
import logging
import asyncio
import threading
import time
from typing import List, Optional, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path
import random

class GroqAPIParallelManager:
    """
    Manages multiple Groq API keys with parallel execution capabilities.
    Can use multiple keys simultaneously for better performance and load distribution.
    """
    
    def __init__(self, max_calls_per_key: int = 1000, max_parallel_keys: int = 3):
        self.max_calls_per_key = max_calls_per_key
        self.max_parallel_keys = max_parallel_keys
        self.api_keys = []
        self.key_usage = {}
        self.key_clients = {}
        self.key_status = {}  # Track key health and performance
        self.parallel_mode = True
        self.lock = threading.Lock()
        
        # Load environment variables
        dotenv_path = Path(__file__).resolve().parents[1] / ".env"
        load_dotenv(dotenv_path)
        
        # Load API keys from environment variables
        self._load_api_keys()
        
        # Initialize clients for all keys
        self._initialize_all_clients()
        
        # Start background health monitoring
        self._start_health_monitor()
    
    def _load_api_keys(self):
        """Load API keys from environment variables"""
        # Try to load multiple API keys
        base_key = os.getenv("GROQ_API_KEY")
        if base_key:
            self.api_keys.append(base_key)
            self.key_usage[base_key] = 0
            self.key_status[base_key] = {
                'healthy': True,
                'last_used': time.time(),
                'error_count': 0,
                'response_time': 0,
                'total_calls': 0
            }
        
        # Try to load additional API keys
        for i in range(1, 11):  # Support up to 10 API keys
            additional_key = os.getenv(f"GROQ_API_KEY_{i}")
            if additional_key:
                self.api_keys.append(additional_key)
                self.key_usage[additional_key] = 0
                self.key_status[additional_key] = {
                    'healthy': True,
                    'last_used': time.time(),
                    'error_count': 0,
                    'response_time': 0,
                    'total_calls': 0
                }
        
        # If no additional keys found, try to load from a comma-separated string
        if len(self.api_keys) <= 1:
            keys_string = os.getenv("GROQ_API_KEYS")
            if keys_string:
                keys_list = [key.strip() for key in keys_string.split(",") if key.strip()]
                for key in keys_list:
                    if key not in self.api_keys:
                        self.api_keys.append(key)
                        self.key_usage[key] = 0
                        self.key_status[key] = {
                            'healthy': True,
                            'last_used': time.time(),
                            'error_count': 0,
                            'response_time': 0,
                            'total_calls': 0
                        }
        
        logging.info(f"Loaded {len(self.api_keys)} Groq API keys for parallel execution")
    
    def _initialize_all_clients(self):
        """Initialize Groq clients for all API keys"""
        for key in self.api_keys:
            try:
                self.key_clients[key] = Groq(api_key=key)
                logging.info(f"Initialized client for API key {self.api_keys.index(key) + 1}")
            except Exception as e:
                logging.error(f"Failed to initialize client for key {self.api_keys.index(key) + 1}: {e}")
                self.key_status[key]['healthy'] = False
    
    def _start_health_monitor(self):
        """Start background thread for monitoring key health"""
        def monitor():
            while True:
                try:
                    self._check_key_health()
                    time.sleep(60)  # Check every minute
                except Exception as e:
                    logging.error(f"Health monitor error: {e}")
                    time.sleep(60)
        
        monitor_thread = threading.Thread(target=monitor, daemon=True)
        monitor_thread.start()
    
    def _check_key_health(self):
        """Check health of all API keys"""
        with self.lock:
            for key in self.api_keys:
                if not self.key_status[key]['healthy']:
                    # Try to reinitialize unhealthy keys
                    try:
                        self.key_clients[key] = Groq(api_key=key)
                        self.key_status[key]['healthy'] = True
                        self.key_status[key]['error_count'] = 0
                        logging.info(f"Recovered API key {self.api_keys.index(key) + 1}")
                    except Exception as e:
                        logging.warning(f"Failed to recover API key {self.api_keys.index(key) + 1}: {e}")
    
    def _get_available_keys(self, count: int = None) -> List[str]:
        """Get list of available API keys for parallel execution"""
        if count is None:
            count = min(self.max_parallel_keys, len(self.api_keys))
        
        available_keys = []
        with self.lock:
            for key in self.api_keys:
                if (self.key_status[key]['healthy'] and 
                    self.key_usage[key] < self.max_calls_per_key):
                    available_keys.append(key)
                    if len(available_keys) >= count:
                        break
        
        return available_keys
    
    def _select_optimal_keys(self, count: int) -> List[str]:
        """Select optimal keys based on health, usage, and performance"""
        available_keys = self._get_available_keys(count)
        
        if not available_keys:
            return []
        
        # Sort by priority: health > remaining calls > performance
        def key_priority(key):
            status = self.key_status[key]
            remaining_calls = self.max_calls_per_key - self.key_usage[key]
            performance_score = 1.0 / (1.0 + status['error_count']) if status['error_count'] > 0 else 1.0
            return (status['healthy'], remaining_calls, performance_score)
        
        sorted_keys = sorted(available_keys, key=key_priority, reverse=True)
        return sorted_keys[:count]
    
    def make_request(self, *args, **kwargs):
        """Make a single API request using the best available key"""
        available_keys = self._get_available_keys(1)
        
        if not available_keys:
            raise Exception("No available Groq API keys")
        
        # Use the best available key
        selected_key = self._select_optimal_keys(1)[0]
        return self._execute_request(selected_key, *args, **kwargs)
    
    def make_parallel_requests(self, requests: List[Dict[str, Any]], max_parallel: int = None) -> List[Any]:
        """
        Make multiple API requests in parallel using multiple keys
        
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
        
        # Select optimal keys for parallel execution
        selected_keys = self._select_optimal_keys(max_parallel)
        
        if not selected_keys:
            raise Exception("No available Groq API keys for parallel execution")
        
        # Distribute requests across selected keys
        responses = [None] * len(requests)
        key_assignments = self._distribute_requests(requests, selected_keys)
        
        # Execute requests in parallel
        with ThreadPoolExecutor(max_workers=max_parallel) as executor:
            future_to_request = {}
            
            for i, (request_params, key) in enumerate(zip(requests, key_assignments)):
                future = executor.submit(self._execute_request, key, **request_params)
                future_to_request[future] = i
            
            # Collect results
            for future in as_completed(future_to_request):
                request_index = future_to_request[future]
                try:
                    response = future.result()
                    responses[request_index] = response
                except Exception as e:
                    logging.error(f"Request {request_index} failed: {e}")
                    responses[request_index] = None
        
        return responses
    
    def _distribute_requests(self, requests: List[Dict], keys: List[str]) -> List[str]:
        """Distribute requests across available keys for optimal load balancing"""
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
            
            # Update usage and performance metrics
            with self.lock:
                self.key_usage[key] = self.key_usage.get(key, 0) + 1
                self.key_status[key]['last_used'] = time.time()
                self.key_status[key]['total_calls'] += 1
                self.key_status[key]['response_time'] = time.time() - start_time
                
                # Check if key reached limit
                if self.key_usage[key] >= self.max_calls_per_key:
                    logging.info(f"API key {self.api_keys.index(key) + 1} reached limit ({self.max_calls_per_key} calls)")
            
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
                "max_calls_per_key": self.max_calls_per_key,
                "max_parallel_keys": self.max_parallel_keys,
                "parallel_mode": self.parallel_mode,
                "key_details": {}
            }
            
            for i, key in enumerate(self.api_keys):
                status = self.key_status[key]
                usage = self.key_usage.get(key, 0)
                remaining = max(0, self.max_calls_per_key - usage)
                
                stats["key_details"][f"key_{i+1}"] = {
                    "index": i,
                    "healthy": status['healthy'],
                    "usage": usage,
                    "remaining": remaining,
                    "error_count": status['error_count'],
                    "total_calls": status['total_calls'],
                    "avg_response_time": status['response_time'],
                    "last_used": status['last_used']
                }
            
            return stats
    
    def set_parallel_mode(self, enabled: bool):
        """Enable or disable parallel execution mode"""
        self.parallel_mode = enabled
        logging.info(f"Parallel mode {'enabled' if enabled else 'disabled'}")
    
    def set_max_parallel_keys(self, max_keys: int):
        """Set maximum number of keys to use in parallel"""
        self.max_parallel_keys = min(max_keys, len(self.api_keys))
        logging.info(f"Max parallel keys set to {self.max_parallel_keys}")
    
    def reset_usage(self, key_index: Optional[int] = None):
        """Reset usage counter for a specific key or all keys"""
        with self.lock:
            if key_index is not None:
                if 0 <= key_index < len(self.api_keys):
                    key = self.api_keys[key_index]
                    self.key_usage[key] = 0
                    logging.info(f"Reset usage for API key {key_index + 1}")
            else:
                # Reset all keys
                for key in self.key_usage:
                    self.key_usage[key] = 0
                logging.info("Reset usage for all API keys")
    
    def add_api_key(self, api_key: str):
        """Add a new API key to the manager"""
        with self.lock:
            if api_key not in self.api_keys:
                self.api_keys.append(api_key)
                self.key_usage[api_key] = 0
                self.key_status[api_key] = {
                    'healthy': True,
                    'last_used': time.time(),
                    'error_count': 0,
                    'response_time': 0,
                    'total_calls': 0
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
                del self.key_usage[api_key]
                del self.key_status[api_key]
                del self.key_clients[api_key]
                
                logging.info(f"Removed API key (total: {len(self.api_keys)})")
            else:
                logging.warning("API key not found")

# Global instance for easy access
groq_parallel_manager = GroqAPIParallelManager()


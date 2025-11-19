import os
import json
import logging
from typing import List, Optional
from groq import Groq
from dotenv import load_dotenv
from pathlib import Path

class GroqAPIManager:
    """
    Manages multiple Groq API keys with automatic rotation after 1000 calls.
    Tracks usage and switches to the next available key when limits are reached.
    """
    
    def __init__(self, max_calls_per_key: int = 1000):
        self.max_calls_per_key = max_calls_per_key
        self.current_key_index = 0
        self.api_keys = []
        self.key_usage = {}
        self.current_client = None
        
        # Load environment variables
        dotenv_path = Path(__file__).resolve().parents[1] / ".env"
        load_dotenv(dotenv_path)
        
        # Load API keys from environment variables
        self._load_api_keys()
        
        # Initialize the first client
        if self.api_keys:
            self._initialize_client()
        else:
            logging.error("No Groq API keys found in environment variables")
    
    def _load_api_keys(self):
        """Load API keys from environment variables"""
        # Try to load multiple API keys
        base_key = os.getenv("GROQ_API_KEY")
        if base_key:
            self.api_keys.append(base_key)
            self.key_usage[base_key] = 0
        
        # Try to load additional API keys
        for i in range(1, 11):  # Support up to 10 API keys
            additional_key = os.getenv(f"GROQ_API_KEY_{i}")
            if additional_key:
                self.api_keys.append(additional_key)
                self.key_usage[additional_key] = 0
        
        # If no additional keys found, try to load from a comma-separated string
        if len(self.api_keys) <= 1:
            keys_string = os.getenv("GROQ_API_KEYS")
            if keys_string:
                keys_list = [key.strip() for key in keys_string.split(",") if key.strip()]
                for key in keys_list:
                    if key not in self.api_keys:
                        self.api_keys.append(key)
                        self.key_usage[key] = 0
        
        logging.info(f"Loaded {len(self.api_keys)} Groq API keys")
    
    def _initialize_client(self):
        """Initialize the Groq client with the current API key"""
        if not self.api_keys:
            return None
        
        current_key = self.api_keys[self.current_key_index]
        try:
            self.current_client = Groq(api_key=current_key)
            logging.info(f"Initialized Groq client with API key {self.current_key_index + 1}")
        except Exception as e:
            logging.error(f"Failed to initialize Groq client with key {self.current_key_index + 1}: {e}")
            self._rotate_to_next_key()
    
    def _rotate_to_next_key(self):
        """Rotate to the next available API key"""
        if len(self.api_keys) <= 1:
            logging.warning("Only one API key available, cannot rotate")
            return False
        
        # Mark current key as exhausted
        if self.current_key_index < len(self.api_keys):
            current_key = self.api_keys[self.current_key_index]
            self.key_usage[current_key] = self.max_calls_per_key
        
        # Move to next key
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        
        # Check if we've tried all keys
        attempts = 0
        while attempts < len(self.api_keys):
            current_key = self.api_keys[self.current_key_index]
            if self.key_usage[current_key] < self.max_calls_per_key:
                # Found a key with remaining calls
                self._initialize_client()
                logging.info(f"Rotated to API key {self.current_key_index + 1} (remaining calls: {self.max_calls_per_key - self.key_usage[current_key]})")
                return True
            else:
                # This key is also exhausted, try next
                self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
                attempts += 1
        
        # All keys are exhausted
        logging.error("All API keys have reached their call limit")
        return False
    
    def _increment_usage(self):
        """Increment the usage counter for the current API key"""
        if not self.api_keys:
            return
        
        current_key = self.api_keys[self.current_key_index]
        self.key_usage[current_key] = self.key_usage.get(current_key, 0) + 1
        
        # Check if we need to rotate
        if self.key_usage[current_key] >= self.max_calls_per_key:
            logging.info(f"API key {self.current_key_index + 1} reached limit ({self.max_calls_per_key} calls), rotating...")
            self._rotate_to_next_key()
    
    def get_client(self) -> Optional[Groq]:
        """Get the current Groq client"""
        if not self.current_client:
            self._initialize_client()
        return self.current_client
    
    def make_request(self, *args, **kwargs):
        """Make a request using the current API key and track usage"""
        client = self.get_client()
        if not client:
            raise Exception("No available Groq API clients")
        
        try:
            # Make the request
            response = client.chat.completions.create(*args, **kwargs)
            
            # Increment usage counter
            self._increment_usage()
            
            return response
        except Exception as e:
            logging.error(f"Groq API request failed: {e}")
            
            # If it's an authentication error, try rotating keys
            if "authentication" in str(e).lower() or "unauthorized" in str(e).lower():
                logging.info("Authentication error detected, attempting to rotate API keys...")
                if self._rotate_to_next_key():
                    # Retry with new key
                    client = self.get_client()
                    if client:
                        response = client.chat.completions.create(*args, **kwargs)
                        self._increment_usage()
                        return response
            
            raise e
    
    def get_usage_stats(self) -> dict:
        """Get current usage statistics for all API keys"""
        stats = {
            "total_keys": len(self.api_keys),
            "current_key_index": self.current_key_index,
            "max_calls_per_key": self.max_calls_per_key,
            "key_usage": self.key_usage.copy(),
            "current_key_remaining": 0
        }
        
        if self.api_keys:
            current_key = self.api_keys[self.current_key_index]
            stats["current_key_remaining"] = max(0, self.max_calls_per_key - self.key_usage.get(current_key, 0))
        
        return stats
    
    def reset_usage(self, key_index: Optional[int] = None):
        """Reset usage counter for a specific key or all keys"""
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
        if api_key not in self.api_keys:
            self.api_keys.append(api_key)
            self.key_usage[api_key] = 0
            logging.info(f"Added new API key (total: {len(self.api_keys)})")
        else:
            logging.warning("API key already exists")
    
    def remove_api_key(self, api_key: str):
        """Remove an API key from the manager"""
        if api_key in self.api_keys:
            index = self.api_keys.index(api_key)
            self.api_keys.remove(api_key)
            del self.key_usage[api_key]
            
            # Adjust current index if necessary
            if index <= self.current_key_index and self.current_key_index > 0:
                self.current_key_index -= 1
            
            logging.info(f"Removed API key (total: {len(self.api_keys)})")
        else:
            logging.warning("API key not found")

# Global instance for easy access
groq_manager = GroqAPIManager()


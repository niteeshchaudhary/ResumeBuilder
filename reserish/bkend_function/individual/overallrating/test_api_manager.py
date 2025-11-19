#!/usr/bin/env python3
"""
Test script for the Groq API Manager to verify API key rotation functionality.
This script simulates multiple API calls to test the rotation mechanism.
"""

import os
import sys
import time
from pathlib import Path

# Add the current directory to the Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from groq_api_manager import groq_manager

def test_api_key_rotation():
    """Test the API key rotation functionality"""
    print("🧪 Testing Groq API Key Manager")
    print("=" * 50)
    
    # Display initial configuration
    stats = groq_manager.get_usage_stats()
    print(f"📊 Initial Configuration:")
    print(f"   Total API keys: {stats['total_keys']}")
    print(f"   Current key index: {stats['current_key_index']}")
    print(f"   Max calls per key: {stats['max_calls_per_key']}")
    print(f"   Current key remaining: {stats['current_key_remaining']}")
    print()
    
    if stats['total_keys'] == 0:
        print("❌ No API keys found! Please configure your API keys first.")
        print("   See README_API_KEYS.md for configuration instructions.")
        return
    
    # Test a simple API call
    print("🔍 Testing API call...")
    try:
        response = groq_manager.make_request(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Hello! Please respond with just 'Test successful'."}],
            temperature=0.1,
            max_tokens=10,
        )
        print(f"✅ API call successful: {response.choices[0].message.content.strip()}")
        
        # Show updated stats
        stats = groq_manager.get_usage_stats()
        print(f"📊 Updated stats:")
        print(f"   Current key: {stats['current_key_index'] + 1}")
        print(f"   Remaining calls: {stats['current_key_remaining']}")
        print(f"   Key usage: {stats['key_usage']}")
        
    except Exception as e:
        print(f"❌ API call failed: {e}")
        return
    
    print()
    print("🔄 Testing key rotation simulation...")
    
    # Simulate multiple calls to test rotation (without actually making them)
    if stats['total_keys'] > 1:
        print("   Simulating calls to trigger rotation...")
        
        # Temporarily reduce the max calls to test rotation
        original_max = groq_manager.max_calls_per_key
        groq_manager.max_calls_per_key = 2  # Set to 2 for testing
        
        # Simulate calls
        for i in range(3):
            groq_manager._increment_usage()
            current_stats = groq_manager.get_usage_stats()
            print(f"   Call {i+1}: Key {current_stats['current_key_index'] + 1}, Remaining: {current_stats['current_key_remaining']}")
            
            if current_stats['current_key_index'] != stats['current_key_index']:
                print(f"   ✅ Key rotation detected! Now using key {current_stats['current_key_index'] + 1}")
                break
        
        # Restore original max calls
        groq_manager.max_calls_per_key = original_max
        
        # Reset usage for clean state
        groq_manager.reset_usage()
        print("   🔄 Reset usage counters for clean state")
    else:
        print("   ℹ️  Only one API key available, rotation test skipped")
    
    print()
    print("📋 Available commands:")
    print("   groq_manager.get_usage_stats() - Get current usage statistics")
    print("   groq_manager.reset_usage() - Reset all usage counters")
    print("   groq_manager.add_api_key('new_key') - Add a new API key")
    print("   groq_manager.remove_api_key('key') - Remove an API key")
    
    print()
    print("✅ Test completed successfully!")

def test_environment_variables():
    """Test environment variable loading"""
    print("🔧 Testing Environment Variable Loading")
    print("=" * 50)
    
    # Check for environment variables
    env_vars = [
        "GROQ_API_KEY",
        "GROQ_API_KEY_1", 
        "GROQ_API_KEY_2",
        "GROQ_API_KEY_3",
        "GROQ_API_KEYS"
    ]
    
    print("📋 Environment Variables:")
    for var in env_vars:
        value = os.getenv(var)
        if value:
            # Mask the API key for security
            masked_value = value[:8] + "..." + value[-4:] if len(value) > 12 else "***"
            print(f"   {var}: {masked_value}")
        else:
            print(f"   {var}: Not set")
    
    print()
    print("💡 To add more API keys, set these environment variables:")
    print("   export GROQ_API_KEY_1='your_second_key'")
    print("   export GROQ_API_KEY_2='your_third_key'")
    print("   # Or use a .env file with the same variable names")

if __name__ == "__main__":
    print("🚀 Groq API Manager Test Suite")
    print("=" * 50)
    print()
    
    # Test environment variables first
    test_environment_variables()
    print()
    
    # Test API manager functionality
    test_api_key_rotation()
    
    print()
    print("🎯 For production use, ensure you have multiple valid API keys configured.")
    print("   The system will automatically rotate between them after 1000 calls.")


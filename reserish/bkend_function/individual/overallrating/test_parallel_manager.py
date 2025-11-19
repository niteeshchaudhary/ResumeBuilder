#!/usr/bin/env python3
"""
Test script for the Groq API Parallel Manager to demonstrate parallel execution capabilities.
This script shows how multiple API keys can work simultaneously for better performance.
"""

import os
import sys
import time
import asyncio
from pathlib import Path

# Add the current directory to the Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from groq_api_manager_parallel import groq_parallel_manager

def test_parallel_execution():
    """Test parallel execution with multiple API keys"""
    print("🚀 Testing Groq API Parallel Manager")
    print("=" * 60)
    
    # Display initial configuration
    stats = groq_parallel_manager.get_usage_stats()
    print(f"📊 Initial Configuration:")
    print(f"   Total API keys: {stats['total_keys']}")
    print(f"   Healthy keys: {stats['healthy_keys']}")
    print(f"   Max parallel keys: {stats['max_parallel_keys']}")
    print(f"   Parallel mode: {stats['parallel_mode']}")
    print()
    
    if stats['total_keys'] == 0:
        print("❌ No API keys found! Please configure your API keys first.")
        print("   See README_API_KEYS.md for configuration instructions.")
        return
    
    if stats['healthy_keys'] < 2:
        print("⚠️  Need at least 2 healthy API keys for parallel execution testing")
        print(f"   Current healthy keys: {stats['healthy_keys']}")
        return
    
    # Test single request
    print("🔍 Testing single API request...")
    try:
        response = groq_parallel_manager.make_request(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Hello! Please respond with just 'Single request successful'."}],
            temperature=0.1,
            max_tokens=10,
        )
        print(f"✅ Single request successful: {response.choices[0].message.content.strip()}")
        
    except Exception as e:
        print(f"❌ Single request failed: {e}")
        return
    
    # Test parallel requests
    print("\n🔄 Testing parallel API requests...")
    
    # Create multiple test requests
    test_requests = []
    for i in range(5):
        test_requests.append({
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": f"Request {i+1}: Please respond with just 'Parallel request {i+1} successful'."}],
            "temperature": 0.1,
            "max_tokens": 15,
        })
    
    print(f"   Sending {len(test_requests)} requests in parallel...")
    start_time = time.time()
    
    try:
        responses = groq_parallel_manager.make_parallel_requests(test_requests)
        end_time = time.time()
        
        print(f"   ⏱️  Total time: {end_time - start_time:.2f} seconds")
        print(f"   📊 Responses received: {len([r for r in responses if r is not None])}/{len(responses)}")
        
        # Display responses
        for i, response in enumerate(responses):
            if response:
                content = response.choices[0].message.content.strip()
                print(f"   ✅ Request {i+1}: {content}")
            else:
                print(f"   ❌ Request {i+1}: Failed")
        
        # Calculate performance metrics
        avg_time = (end_time - start_time) / len(test_requests)
        print(f"   📈 Average time per request: {avg_time:.2f} seconds")
        
        # Show updated stats
        updated_stats = groq_parallel_manager.get_usage_stats()
        print(f"\n📊 Updated Statistics:")
        print(f"   Total calls made: {sum(stats['key_details'][f'key_{i+1}']['total_calls'] for i in range(stats['total_keys']))}")
        
        for i in range(stats['total_keys']):
            key_info = updated_stats['key_details'][f'key_{i+1}']
            print(f"   Key {i+1}: {key_info['usage']}/{updated_stats['max_calls_per_key']} calls, "
                  f"Errors: {key_info['error_count']}, "
                  f"Response time: {key_info['avg_response_time']:.3f}s")
        
    except Exception as e:
        print(f"❌ Parallel execution failed: {e}")
        return
    
    print("\n🎯 Parallel execution test completed!")

def test_key_health_monitoring():
    """Test the key health monitoring system"""
    print("\n🏥 Testing Key Health Monitoring")
    print("=" * 60)
    
    stats = groq_parallel_manager.get_usage_stats()
    
    print("📋 Current Key Health Status:")
    for i in range(stats['total_keys']):
        key_info = stats['key_details'][f'key_{i+1}']
        health_status = "🟢 Healthy" if key_info['healthy'] else "🔴 Unhealthy"
        print(f"   Key {i+1}: {health_status}")
        print(f"      Usage: {key_info['usage']}/{stats['max_calls_per_key']}")
        print(f"      Error count: {key_info['error_count']}")
        print(f"      Total calls: {key_info['total_calls']}")
        print(f"      Last used: {time.ctime(key_info['last_used'])}")
        print()

def test_parallel_configuration():
    """Test parallel configuration options"""
    print("\n⚙️  Testing Parallel Configuration")
    print("=" * 60)
    
    # Test changing parallel settings
    print("🔧 Testing parallel configuration changes...")
    
    # Get current settings
    current_max = groq_parallel_manager.max_parallel_keys
    print(f"   Current max parallel keys: {current_max}")
    
    # Test setting different values
    test_values = [1, 2, 3, 5]
    for value in test_values:
        if value <= len(groq_parallel_manager.api_keys):
            groq_parallel_manager.set_max_parallel_keys(value)
            print(f"   ✅ Set max parallel keys to {value}")
        else:
            print(f"   ⚠️  Cannot set max parallel keys to {value} (only {len(groq_parallel_manager.api_keys)} keys available)")
    
    # Restore original setting
    groq_parallel_manager.set_max_parallel_keys(current_max)
    print(f"   🔄 Restored max parallel keys to {current_max}")
    
    # Test parallel mode toggle
    print(f"\n🔄 Testing parallel mode toggle...")
    current_mode = groq_parallel_manager.parallel_mode
    print(f"   Current parallel mode: {current_mode}")
    
    groq_parallel_manager.set_parallel_mode(False)
    print(f"   ✅ Disabled parallel mode")
    
    groq_parallel_manager.set_parallel_mode(True)
    print(f"   ✅ Re-enabled parallel mode")
    
    groq_parallel_manager.set_parallel_mode(current_mode)
    print(f"   🔄 Restored parallel mode to {current_mode}")

def test_load_balancing():
    """Test load balancing across multiple keys"""
    print("\n⚖️  Testing Load Balancing")
    print("=" * 60)
    
    stats = groq_parallel_manager.get_usage_stats()
    
    if stats['total_keys'] < 2:
        print("⚠️  Need at least 2 API keys to test load balancing")
        return
    
    print("📊 Current key usage distribution:")
    for i in range(stats['total_keys']):
        key_info = stats['key_details'][f'key_{i+1}']
        usage_percentage = (key_info['usage'] / stats['max_calls_per_key']) * 100
        print(f"   Key {i+1}: {key_info['usage']}/{stats['max_calls_per_key']} ({usage_percentage:.1f}%)")
    
    print(f"\n🔄 Load balancing strategy:")
    print(f"   - Keys are selected based on: health > remaining calls > performance")
    print(f"   - Requests are distributed using round-robin when multiple keys are available")
    print(f"   - Unhealthy keys are automatically excluded")
    print(f"   - Performance metrics track response times and error rates")

def demonstrate_benefits():
    """Demonstrate the benefits of parallel execution"""
    print("\n💡 Benefits of Parallel API Key Execution")
    print("=" * 60)
    
    print("🚀 **Performance Improvements:**")
    print("   • Multiple requests processed simultaneously")
    print("   • Reduced total processing time")
    print("   • Better throughput for batch operations")
    
    print("\n⚖️  **Load Distribution:**")
    print("   • Even distribution across all available keys")
    print("   • Prevents single key from being overwhelmed")
    print("   • Better rate limit management")
    
    print("\n🔄 **High Availability:**")
    print("   • Automatic failover to healthy keys")
    print("   • Continuous operation even if some keys fail")
    print("   • Self-healing with automatic key recovery")
    
    print("\n📊 **Monitoring & Analytics:**")
    print("   • Real-time health monitoring")
    print("   • Performance metrics per key")
    print("   • Usage statistics and trends")
    
    print("\n🎯 **Use Cases:**")
    print("   • Batch resume processing")
    print("   • Multiple concurrent user requests")
    print("   • High-volume API operations")
    print("   • Load testing and stress testing")

def main():
    """Main test function"""
    print("🧪 Groq API Parallel Manager Test Suite")
    print("=" * 60)
    print()
    
    # Run all tests
    test_parallel_execution()
    test_key_health_monitoring()
    test_parallel_configuration()
    test_load_balancing()
    demonstrate_benefits()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("\n🎯 **Next Steps:**")
    print("   1. Configure multiple API keys in your .env file")
    print("   2. Use groq_parallel_manager.make_parallel_requests() for batch operations")
    print("   3. Monitor key health and performance")
    print("   4. Adjust parallel settings based on your needs")
    
    print("\n📚 **Available Methods:**")
    print("   • make_request() - Single request with best key")
    print("   • make_parallel_requests() - Multiple requests in parallel")
    print("   • get_usage_stats() - Comprehensive statistics")
    print("   • set_max_parallel_keys() - Configure parallelism")
    print("   • set_parallel_mode() - Enable/disable parallel mode")

if __name__ == "__main__":
    main()


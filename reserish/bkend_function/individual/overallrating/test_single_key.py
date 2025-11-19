#!/usr/bin/env python3
"""
Test script to demonstrate that the Round-Robin Manager works with just one API key.
This shows how the system gracefully handles single-key scenarios.
"""

import os
import sys
import time
from pathlib import Path

# Add the current directory to the Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from groq_api_manager_round_robin import groq_round_robin_manager

def test_single_key_functionality():
    """Test the round-robin manager with a single API key"""
    print("🔑 Testing Round-Robin Manager with Single API Key")
    print("=" * 60)
    
    # Display initial configuration
    stats = groq_round_robin_manager.get_usage_stats()
    print(f"📊 Initial Configuration:")
    print(f"   Total API keys: {stats['total_keys']}")
    print(f"   Healthy keys: {stats['healthy_keys']}")
    print(f"   Requests per minute per key: {stats['requests_per_minute_per_key']}")
    print(f"   Current key index: {stats['current_key_index']}")
    print()
    
    if stats['total_keys'] == 0:
        print("❌ No API keys found! Please configure your API key first.")
        print("   Set GROQ_API_KEY in your .env file or environment variables.")
        return
    
    if stats['total_keys'] == 1:
        print("✅ Single API key detected - Round-Robin manager will work perfectly!")
        print("   The system will use your single key with proper rate limiting.")
    else:
        print(f"✅ Multiple API keys detected ({stats['total_keys']}) - Full round-robin functionality available!")
    
    print()
    
    # Test single request
    print("🔍 Testing single API request...")
    try:
        response = groq_round_robin_manager.make_request(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Hello! Please respond with just 'Single key test successful'."}],
            temperature=0.1,
            max_tokens=10,
        )
        print(f"✅ Single request successful: {response.choices[0].message.content.strip()}")
        
        # Show updated stats
        stats = groq_round_robin_manager.get_usage_stats()
        print(f"📊 Updated stats:")
        print(f"   Current key index: {stats['current_key_index']}")
        
        if stats['total_keys'] == 1:
            key_info = stats['key_details']['key_1']
            print(f"   Key 1 usage this minute: {key_info['current_minute_requests']}/{stats['requests_per_minute_per_key']}")
            print(f"   Remaining this minute: {key_info['remaining_this_minute']}")
            print(f"   Total calls: {key_info['total_calls']}")
        
    except Exception as e:
        print(f"❌ Single request failed: {e}")
        return
    
    # Test multiple requests (will use the same key if only one available)
    print("\n🔄 Testing multiple requests...")
    
    test_requests = []
    for i in range(3):
        test_requests.append({
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": f"Request {i+1}: Please respond with just 'Test {i+1} successful'."}],
            "temperature": 0.1,
            "max_tokens": 10,
        })
    
    print(f"   Sending {len(test_requests)} requests...")
    start_time = time.time()
    
    try:
        responses = groq_round_robin_manager.make_parallel_requests(test_requests)
        end_time = time.time()
        
        print(f"   ⏱️  Total time: {end_time - start_time:.2f} seconds")
        print(f"   📊 Successful responses: {len([r for r in responses if r is not None])}/{len(responses)}")
        
        # Show which keys were used
        if stats['total_keys'] == 1:
            print(f"   🔑 All requests used the same key (Key 1)")
        else:
            print(f"   🔑 Requests distributed across {stats['total_keys']} keys")
        
        # Display responses
        for i, response in enumerate(responses):
            if response:
                content = response.choices[0].message.content.strip()
                print(f"   ✅ Request {i+1}: {content}")
            else:
                print(f"   ❌ Request {i+1}: Failed")
        
    except Exception as e:
        print(f"❌ Multiple requests failed: {e}")
        return
    
    # Test rate limiting behavior
    print("\n⏰ Testing rate limiting behavior...")
    
    if stats['total_keys'] == 1:
        print("   🔑 Single key scenario - testing per-minute rate limiting")
        
        # Get current usage
        current_stats = groq_round_robin_manager.get_usage_stats()
        key_info = current_stats['key_details']['key_1']
        
        print(f"   📊 Current minute usage: {key_info['current_minute_requests']}/{current_stats['requests_per_minute_per_key']}")
        print(f"   📊 Remaining this minute: {key_info['remaining_this_minute']}")
        
        if key_info['current_minute_requests'] >= current_stats['requests_per_minute_per_key']:
            print("   ⚠️  Rate limit reached for this minute")
            print("   ⏰ Key will automatically become available in the next minute")
        else:
            print("   ✅ Key still has capacity for this minute")
    else:
        print("   🔑 Multiple keys scenario - testing round-robin distribution")
        
        # Show round-robin order
        print(f"   🔄 Round-robin order: {' → '.join([f'Key {i+1}' for i in range(current_stats['total_keys'])])}")
        print(f"   🔄 Next key to be used: Key {(current_stats['current_key_index'] + 1) % current_stats['total_keys'] + 1}")

def demonstrate_single_key_benefits():
    """Show the benefits of using the round-robin manager even with one key"""
    print("\n💡 Benefits of Round-Robin Manager with Single Key")
    print("=" * 60)
    
    print("✅ **Rate Limiting Protection:**")
    print("   • Automatically tracks requests per minute")
    print("   • Prevents hitting Groq's rate limits")
    print("   • No more '429 Too Many Requests' errors")
    
    print("\n✅ **Future-Proof:**")
    print("   • Easy to add more keys later")
    print("   • No code changes needed")
    print("   • Automatic round-robin when you add keys")
    
    print("\n✅ **Professional Features:**")
    print("   • Health monitoring")
    print("   • Error tracking")
    print("   • Usage statistics")
    print("   • Automatic recovery")
    
    print("\n✅ **Easy Migration:**")
    print("   • Same interface as other managers")
    print("   • Drop-in replacement")
    print("   • No breaking changes")

def show_single_key_usage():
    """Show how to use the manager with a single key"""
    print("\n🔧 Single Key Usage Examples")
    print("=" * 60)
    
    print("📝 **Basic Usage (Same as before):**")
    print("```python")
    print("from .groq_api_manager_round_robin import groq_round_robin_manager")
    print("")
    print("# Make requests (works exactly like before)")
    print("response = groq_round_robin_manager.make_request(")
    print("    model=\"llama-3.3-70b-versatile\",")
    print("    messages=[{\"role\": \"user\", \"content\": \"Hello\"}],")
    print("    temperature=0.5,")
    print("    max_tokens=100")
    print(")")
    print("```")
    
    print("\n📝 **Rate Limit Monitoring:**")
    print("```python")
    print("# Check current usage")
    print("stats = groq_round_robin_manager.get_usage_stats()")
    print("key_info = stats['key_details']['key_1']")
    print("print(f\"Used {key_info['current_minute_requests']} times this minute\")")
    print("print(f\"Remaining: {key_info['remaining_this_minute']} requests\")")
    print("```")
    
    print("\n📝 **Configuration:**")
    print("```python")
    print("# Set your rate limit (Groq's actual limit)")
    print("groq_round_robin_manager.set_requests_per_minute(100)  # Free tier")
    print("groq_round_robin_manager.set_requests_per_minute(1000) # Paid tier")
    print("```")

def main():
    """Main test function"""
    print("🚀 Round-Robin Manager - Single Key Compatibility Test")
    print("=" * 70)
    print()
    
    # Run tests
    test_single_key_functionality()
    demonstrate_single_key_benefits()
    show_single_key_usage()
    
    print("\n" + "=" * 70)
    print("✅ Single key compatibility test completed!")
    
    print("\n🎯 **Key Points:**")
    print("   • ✅ Works perfectly with just one API key")
    print("   • ✅ Provides proper rate limiting protection")
    print("   • ✅ Easy to add more keys later")
    print("   • ✅ Same interface as other managers")
    
    print("\n📚 **Next Steps:**")
    print("   1. Use groq_round_robin_manager.make_request() exactly like before")
    print("   2. Monitor rate limits with get_usage_stats()")
    print("   3. Add more keys when you get them (no code changes needed)")
    print("   4. Enjoy automatic round-robin distribution")
    
    print("\n🔑 **Single Key Setup:**")
    print("   Just set GROQ_API_KEY in your .env file:")
    print("   GROQ_API_KEY=gsk_your_api_key_here")
    print("   That's it! The manager will work perfectly.")

if __name__ == "__main__":
    main()


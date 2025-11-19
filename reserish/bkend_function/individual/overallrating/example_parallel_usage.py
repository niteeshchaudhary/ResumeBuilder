#!/usr/bin/env python3
"""
Example usage of the Groq API Parallel Manager.
This file demonstrates how to integrate parallel API key management into your existing code.
"""

from .groq_api_manager_parallel import groq_parallel_manager
import time

def example_single_request():
    """Example of making a single request (same interface as before)"""
    print("🔍 Making single request...")
    
    try:
        response = groq_parallel_manager.make_request(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Hello! Please respond with just 'Single request successful'."}],
            temperature=0.1,
            max_tokens=10,
        )
        print(f"✅ Response: {response.choices[0].message.content.strip()}")
        return response
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def example_batch_processing():
    """Example of processing multiple resumes in parallel"""
    print("\n🔄 Processing multiple resumes in parallel...")
    
    # Simulate multiple resume processing requests
    resume_requests = []
    
    # Request 1: Extract skills
    resume_requests.append({
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "Extract technical skills from this resume: Software Engineer with Python, JavaScript, React experience"}],
        "temperature": 0.1,
        "max_tokens": 100,
    })
    
    # Request 2: Rate resume
    resume_requests.append({
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "Rate this resume on a scale of 1-10: Software Engineer with Python, JavaScript, React experience"}],
        "temperature": 0.1,
        "max_tokens": 50,
    })
    
    # Request 3: Suggest improvements
    resume_requests.append({
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "Suggest 3 improvements for this resume: Software Engineer with Python, JavaScript, React experience"}],
        "temperature": 0.1,
        "max_tokens": 150,
    })
    
    # Request 4: Generate summary
    resume_requests.append({
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "Generate a professional summary for this resume: Software Engineer with Python, JavaScript, React experience"}],
        "temperature": 0.1,
        "max_tokens": 100,
    })
    
    # Request 5: Identify job roles
    resume_requests.append({
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "What job roles would this person be suitable for: Software Engineer with Python, JavaScript, React experience"}],
        "temperature": 0.1,
        "max_tokens": 100,
    })
    
    print(f"   Sending {len(resume_requests)} resume processing requests...")
    start_time = time.time()
    
    try:
        # Process all requests in parallel using multiple API keys
        responses = groq_parallel_manager.make_parallel_requests(resume_requests)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        print(f"   ⏱️  Total processing time: {total_time:.2f} seconds")
        print(f"   📊 Successful responses: {len([r for r in responses if r is not None])}/{len(responses)}")
        print(f"   📈 Average time per request: {total_time/len(resume_requests):.2f}s")
        
        # Display results
        print("\n📋 Resume Processing Results:")
        for i, response in enumerate(responses):
            if response:
                content = response.choices[0].message.content.strip()
                print(f"   ✅ Request {i+1}: {content[:100]}{'...' if len(content) > 100 else ''}")
            else:
                print(f"   ❌ Request {i+1}: Failed")
        
        return responses
        
    except Exception as e:
        print(f"❌ Batch processing failed: {e}")
        return None

def example_performance_comparison():
    """Compare sequential vs parallel processing"""
    print("\n⚡ Performance Comparison: Sequential vs Parallel")
    print("=" * 60)
    
    # Test requests
    test_requests = [
        {"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": "Test 1: Hello"}], "max_tokens": 10},
        {"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": "Test 2: World"}], "max_tokens": 10},
        {"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": "Test 3: Test"}], "max_tokens": 10},
    ]
    
    # Sequential processing simulation
    print("🔄 Sequential Processing (simulated):")
    sequential_start = time.time()
    
    # Simulate sequential processing
    for i, request in enumerate(test_requests):
        print(f"   Processing request {i+1}...")
        time.sleep(0.1)  # Simulate API call time
    
    sequential_time = time.time() - sequential_start
    print(f"   ⏱️  Sequential time: {sequential_time:.2f}s")
    
    # Parallel processing (actual)
    print("\n🚀 Parallel Processing (actual):")
    parallel_start = time.time()
    
    try:
        responses = groq_parallel_manager.make_parallel_requests(test_requests)
        parallel_time = time.time() - parallel_start
        
        print(f"   ⏱️  Parallel time: {parallel_time:.2f}s")
        
        # Calculate improvement
        if sequential_time > 0:
            improvement = ((sequential_time - parallel_time) / sequential_time) * 100
            print(f"   📈 Performance improvement: {improvement:.1f}%")
            
            if improvement > 0:
                print(f"   🎯 Speedup: {sequential_time/parallel_time:.1f}x faster")
        
    except Exception as e:
        print(f"   ❌ Parallel processing failed: {e}")

def example_monitoring_and_stats():
    """Show how to monitor and get statistics"""
    print("\n📊 Monitoring and Statistics")
    print("=" * 60)
    
    # Get current usage statistics
    stats = groq_parallel_manager.get_usage_stats()
    
    print(f"📈 Current Status:")
    print(f"   Total API keys: {stats['total_keys']}")
    print(f"   Healthy keys: {stats['healthy_keys']}")
    print(f"   Max parallel keys: {stats['max_parallel_keys']}")
    print(f"   Parallel mode: {'🟢 Enabled' if stats['parallel_mode'] else '🔴 Disabled'}")
    
    if stats['key_details']:
        print(f"\n🔑 Key Performance:")
        for i in range(stats['total_keys']):
            key_info = stats['key_details'][f'key_{i+1}']
            health_icon = "🟢" if key_info['healthy'] else "🔴"
            
            print(f"   {health_icon} Key {i+1}:")
            print(f"      Usage: {key_info['usage']}/{stats['max_calls_per_key']}")
            print(f"      Errors: {key_info['error_count']}")
            print(f"      Response time: {key_info['avg_response_time']:.3f}s")
            print(f"      Total calls: {key_info['total_calls']}")

def example_configuration():
    """Show how to configure the parallel manager"""
    print("\n⚙️  Configuration Examples")
    print("=" * 60)
    
    print("🔧 Available Configuration Methods:")
    
    # Show current settings
    stats = groq_parallel_manager.get_usage_stats()
    print(f"   Current max parallel keys: {stats['max_parallel_keys']}")
    print(f"   Current parallel mode: {stats['parallel_mode']}")
    
    print("\n📝 Configuration Examples:")
    print("   # Set maximum parallel keys")
    print("   groq_parallel_manager.set_max_parallel_keys(3)")
    print("   ")
    print("   # Enable/disable parallel mode")
    print("   groq_parallel_manager.set_parallel_mode(True)")
    print("   groq_parallel_manager.set_parallel_mode(False)")
    print("   ")
    print("   # Reset usage counters")
    print("   groq_parallel_manager.reset_usage()")
    print("   ")
    print("   # Add/remove API keys")
    print("   groq_parallel_manager.add_api_key('gsk_new_key')")
    print("   groq_parallel_manager.remove_api_key('gsk_old_key')")

def main():
    """Main example function"""
    print("🚀 Groq API Parallel Manager - Usage Examples")
    print("=" * 70)
    print()
    
    # Check if we have API keys configured
    stats = groq_parallel_manager.get_usage_stats()
    if stats['total_keys'] == 0:
        print("❌ No API keys configured!")
        print("   Please set up your API keys first using setup_api_keys.py")
        return
    
    if stats['healthy_keys'] < 2:
        print("⚠️  Need at least 2 healthy API keys for parallel execution examples")
        print(f"   Current healthy keys: {stats['healthy_keys']}")
        return
    
    # Run examples
    example_single_request()
    example_batch_processing()
    example_performance_comparison()
    example_monitoring_and_stats()
    example_configuration()
    
    print("\n" + "=" * 70)
    print("✅ All examples completed!")
    print("\n🎯 **Key Benefits Demonstrated:**")
    print("   • Single requests work exactly like before")
    print("   • Batch processing is much faster")
    print("   • Automatic load balancing across keys")
    print("   • Health monitoring and error handling")
    print("   • Easy configuration and monitoring")
    
    print("\n📚 **Next Steps:**")
    print("   1. Use make_request() for single requests (drop-in replacement)")
    print("   2. Use make_parallel_requests() for batch processing")
    print("   3. Monitor performance with get_usage_stats()")
    print("   4. Configure settings based on your needs")

if __name__ == "__main__":
    main()


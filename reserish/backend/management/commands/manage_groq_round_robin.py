from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import os
import sys
from pathlib import Path

# Add the backend function path to sys.path
backend_path = Path(settings.BASE_DIR) / "bkend_function" / "individual" / "overallrating"
sys.path.insert(0, str(backend_path))

try:
    from groq_api_manager_round_robin import groq_round_robin_manager
except ImportError:
    groq_round_robin_manager = None

class Command(BaseCommand):
    help = 'Manage Groq API Round-Robin Manager with per-minute rate limiting'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            choices=['status', 'rate-limit', 'health', 'round-robin', 'test', 'config', 'reset'],
            help='Action to perform'
        )
        parser.add_argument(
            '--requests-per-minute',
            type=int,
            help='Set requests per minute per key'
        )
        parser.add_argument(
            '--max-keys',
            type=int,
            help='Maximum number of keys to use in parallel'
        )
        parser.add_argument(
            '--requests',
            type=int,
            default=5,
            help='Number of test requests to send'
        )

    def handle(self, *args, **options):
        if not groq_round_robin_manager:
            raise CommandError("Groq API Round-Robin Manager not available. Check the import path.")

        action = options['action']

        if action == 'status':
            self.show_status()
        elif action == 'rate-limit':
            self.manage_rate_limits(options)
        elif action == 'health':
            self.show_health_status()
        elif action == 'round-robin':
            self.show_round_robin_info()
        elif action == 'test':
            self.test_round_robin_execution(options['requests'])
        elif action == 'config':
            self.show_configuration()
        elif action == 'reset':
            self.reset_manager()

    def show_status(self):
        """Show comprehensive status of the round-robin manager"""
        self.stdout.write(self.style.SUCCESS("🔄 Groq API Round-Robin Manager Status"))
        self.stdout.write("=" * 70)
        
        stats = groq_round_robin_manager.get_usage_stats()
        
        self.stdout.write(f"Total API keys: {stats['total_keys']}")
        self.stdout.write(f"Healthy keys: {stats['healthy_keys']}")
        self.stdout.write(f"Requests per minute per key: {stats['requests_per_minute_per_key']}")
        self.stdout.write(f"Max parallel keys: {stats['max_parallel_keys']}")
        self.stdout.write(f"Current key index: {stats['current_key_index']}")
        
        if stats['key_details']:
            self.stdout.write("\n📊 Key Details:")
            for i in range(stats['total_keys']):
                key_info = stats['key_details'][f'key_{i+1}']
                health_icon = "🟢" if key_info['healthy'] else "🔴"
                rate_limit_icon = "⚠️" if key_info['rate_limit_exceeded'] else "✅"
                current_indicator = " (Current)" if i == stats['current_key_index'] else ""
                
                self.stdout.write(f"  {health_icon} Key {i+1}:{current_indicator}")
                self.stdout.write(f"    Rate limit: {rate_limit_icon} {key_info['current_minute_requests']}/{stats['requests_per_minute_per_key']} this minute")
                self.stdout.write(f"    Remaining this minute: {key_info['remaining_this_minute']}")
                self.stdout.write(f"    Total calls: {key_info['total_calls']}")
                self.stdout.write(f"    Errors: {key_info['error_count']}")
                self.stdout.write(f"    Last used: {key_info['last_used']}")
                self.stdout.write("")

    def manage_rate_limits(self, options):
        """Manage rate limit settings"""
        if options['requests_per_minute'] is not None:
            groq_round_robin_manager.set_requests_per_minute(options['requests_per_minute'])
            self.stdout.write(
                self.style.SUCCESS(f"✅ Rate limit set to {options['requests_per_minute']} requests per minute per key")
            )
        
        if options['max_keys'] is not None:
            groq_round_robin_manager.set_max_parallel_keys(options['max_keys'])
            self.stdout.write(
                self.style.SUCCESS(f"✅ Max parallel keys set to {options['max_keys']}")
            )
        
        # Show current configuration
        stats = groq_round_robin_manager.get_usage_stats()
        self.stdout.write(f"\n📊 Current Configuration:")
        self.stdout.write(f"   Requests per minute per key: {stats['requests_per_minute_per_key']}")
        self.stdout.write(f"   Max parallel keys: {stats['max_parallel_keys']}")

    def show_health_status(self):
        """Show detailed health status of all API keys"""
        self.stdout.write(self.style.SUCCESS("🏥 API Key Health Status"))
        self.stdout.write("=" * 50)
        
        stats = groq_round_robin_manager.get_usage_stats()
        
        if not stats['key_details']:
            self.stdout.write("No API keys configured")
            return
        
        for i in range(stats['total_keys']):
            key_info = stats['key_details'][f'key_{i+1}']
            health_status = "🟢 Healthy" if key_info['healthy'] else "🔴 Unhealthy"
            rate_limit_status = "⚠️ Rate Limited" if key_info['rate_limit_exceeded'] else "✅ Available"
            
            self.stdout.write(f"Key {i+1}: {health_status} | {rate_limit_status}")
            self.stdout.write(f"  Error count: {key_info['error_count']}")
            self.stdout.write(f"  Current minute usage: {key_info['current_minute_requests']}/{stats['requests_per_minute_per_key']}")
            self.stdout.write(f"  Remaining this minute: {key_info['remaining_this_minute']}")
            
            if key_info['error_count'] > 0:
                self.stdout.write(f"  ⚠️  This key has encountered {key_info['error_count']} errors")
            
            if key_info['rate_limit_exceeded']:
                self.stdout.write(f"  ⏰ Rate limit exceeded, will reset in next minute")
            
            self.stdout.write("")

    def show_round_robin_info(self):
        """Show round-robin distribution information"""
        self.stdout.write(self.style.SUCCESS("🔄 Round-Robin Distribution Info"))
        self.stdout.write("=" * 50)
        
        stats = groq_round_robin_manager.get_usage_stats()
        
        self.stdout.write(f"Current key index: {stats['current_key_index']}")
        self.stdout.write(f"Total keys: {stats['total_keys']}")
        
        if stats['total_keys'] > 0:
            self.stdout.write(f"\nRound-robin order:")
            for i in range(stats['total_keys']):
                current_indicator = " ← Current" if i == stats['current_key_index'] else ""
                self.stdout.write(f"  {i+1}. Key {i+1}{current_indicator}")
            
            self.stdout.write(f"\nNext key to be used: Key {(stats['current_key_index'] + 1) % stats['total_keys'] + 1}")
        
        self.stdout.write(f"\n🔄 How Round-Robin Works:")
        self.stdout.write(f"   • Keys are used in sequential order: 1 → 2 → 3 → ... → N → 1")
        self.stdout.write(f"   • Each key respects its per-minute rate limit")
        self.stdout.write(f"   • If a key is rate-limited, the next available key is used")
        self.stdout.write(f"   • Automatic fallback ensures continuous operation")

    def test_round_robin_execution(self, num_requests):
        """Test round-robin execution with multiple requests"""
        self.stdout.write(self.style.SUCCESS("🧪 Testing Round-Robin Execution"))
        self.stdout.write("=" * 50)
        
        stats = groq_round_robin_manager.get_usage_stats()
        
        if stats['healthy_keys'] < 1:
            self.stdout.write(
                self.style.WARNING("⚠️  Need at least 1 healthy API key for testing")
            )
            return
        
        # Create test requests
        test_requests = []
        for i in range(num_requests):
            test_requests.append({
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": f"Test request {i+1}: Please respond with just 'Test {i+1} successful'."}],
                "temperature": 0.1,
                "max_tokens": 10,
            })
        
        self.stdout.write(f"Sending {num_requests} test requests using round-robin distribution...")
        
        try:
            import time
            start_time = time.time()
            
            # Track which keys are used
            key_usage_tracking = {}
            
            # Send requests one by one to see round-robin in action
            responses = []
            for i, request in enumerate(test_requests):
                self.stdout.write(f"  Sending request {i+1}...")
                
                # Get current key before request
                current_key_index = groq_round_robin_manager.current_key_index
                current_key = groq_round_robin_manager.api_keys[current_key_index]
                
                response = groq_round_robin_manager.make_request(**request)
                responses.append(response)
                
                # Track key usage
                key_num = groq_round_robin_manager.api_keys.index(current_key) + 1
                key_usage_tracking[key_num] = key_usage_tracking.get(key_num, 0) + 1
                
                self.stdout.write(f"    ✅ Request {i+1} completed using Key {key_num}")
                
                # Small delay to see round-robin progression
                time.sleep(0.1)
            
            end_time = time.time()
            total_time = end_time - start_time
            
            self.stdout.write(f"\n✅ Test completed in {total_time:.2f} seconds")
            self.stdout.write(f"📊 Key usage distribution:")
            
            for key_num, usage_count in sorted(key_usage_tracking.items()):
                self.stdout.write(f"   Key {key_num}: {usage_count} requests")
            
            # Show final status
            final_stats = groq_round_round_robin_manager.get_usage_stats()
            self.stdout.write(f"\n📈 Final Status:")
            self.stdout.write(f"   Current key index: {final_stats['current_key_index']}")
            self.stdout.write(f"   Next key to be used: Key {(final_stats['current_key_index'] + 1) % final_stats['total_keys'] + 1}")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Round-robin test failed: {e}")
            )

    def show_configuration(self):
        """Show current configuration settings"""
        self.stdout.write(self.style.SUCCESS("⚙️  Configuration Settings"))
        self.stdout.write("=" * 50)
        
        stats = groq_round_robin_manager.get_usage_stats()
        
        self.stdout.write(f"Requests per minute per key: {stats['requests_per_minute_per_key']}")
        self.stdout.write(f"Max parallel keys: {stats['max_parallel_keys']}")
        self.stdout.write(f"Total configured keys: {stats['total_keys']}")
        self.stdout.write(f"Healthy keys: {stats['healthy_keys']}")
        self.stdout.write(f"Current round-robin index: {stats['current_key_index']}")
        
        self.stdout.write("\n🔧 Available Configuration Options:")
        self.stdout.write("  • set_requests_per_minute(n) - Set rate limit per minute")
        self.stdout.write("  • set_max_parallel_keys(n) - Set max parallel keys")
        self.stdout.write("  • reset_rate_limits() - Reset rate limit tracking")
        self.stdout.write("  • reset_key_health() - Reset key health status")
        self.stdout.write("  • add_api_key(key) - Add new API key")
        self.stdout.write("  • remove_api_key(key) - Remove API key")
        
        self.stdout.write("\n📊 Monitoring Commands:")
        self.stdout.write("  • python manage.py manage_groq_round_robin status")
        self.stdout.write("  • python manage.py manage_groq_round_robin health")
        self.stdout.write("  • python manage.py manage_groq_round_robin round-robin")
        self.stdout.write("  • python manage.py manage_groq_round_robin test")

    def reset_manager(self):
        """Reset rate limits and health status"""
        self.stdout.write(self.style.SUCCESS("🔄 Resetting Manager"))
        self.stdout.write("=" * 50)
        
        try:
            # Reset rate limits
            groq_round_robin_manager.reset_rate_limits()
            self.stdout.write("✅ Rate limits reset")
            
            # Reset health status
            groq_round_robin_manager.reset_key_health()
            self.stdout.write("✅ Health status reset")
            
            self.stdout.write("\n🔄 Manager has been reset to initial state")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Reset failed: {e}")
            )


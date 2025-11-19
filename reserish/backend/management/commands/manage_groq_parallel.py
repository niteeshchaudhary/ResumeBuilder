from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import os
import sys
from pathlib import Path

# Add the backend function path to sys.path
backend_path = Path(settings.BASE_DIR) / "bkend_function" / "individual" / "overallrating"
sys.path.insert(0, str(backend_path))

try:
    from groq_api_manager_parallel import groq_parallel_manager
except ImportError:
    groq_parallel_manager = None

class Command(BaseCommand):
    help = 'Manage Groq API Parallel Manager for concurrent API key usage'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            choices=['status', 'parallel', 'health', 'performance', 'test', 'config'],
            help='Action to perform'
        )
        parser.add_argument(
            '--max-keys',
            type=int,
            help='Maximum number of keys to use in parallel'
        )
        parser.add_argument(
            '--enable',
            action='store_true',
            help='Enable parallel mode'
        )
        parser.add_argument(
            '--disable',
            action='store_true',
            help='Disable parallel mode'
        )
        parser.add_argument(
            '--requests',
            type=int,
            default=3,
            help='Number of test requests to send in parallel'
        )

    def handle(self, *args, **options):
        if not groq_parallel_manager:
            raise CommandError("Groq API Parallel Manager not available. Check the import path.")

        action = options['action']

        if action == 'status':
            self.show_status()
        elif action == 'parallel':
            self.manage_parallel_mode(options)
        elif action == 'health':
            self.show_health_status()
        elif action == 'performance':
            self.show_performance_metrics()
        elif action == 'test':
            self.test_parallel_execution(options['requests'])
        elif action == 'config':
            self.show_configuration()

    def show_status(self):
        """Show comprehensive status of the parallel manager"""
        self.stdout.write(self.style.SUCCESS("🚀 Groq API Parallel Manager Status"))
        self.stdout.write("=" * 70)
        
        stats = groq_parallel_manager.get_usage_stats()
        
        self.stdout.write(f"Total API keys: {stats['total_keys']}")
        self.stdout.write(f"Healthy keys: {stats['healthy_keys']}")
        self.stdout.write(f"Max parallel keys: {stats['max_parallel_keys']}")
        self.stdout.write(f"Parallel mode: {'🟢 Enabled' if stats['parallel_mode'] else '🔴 Disabled'}")
        
        if stats['key_details']:
            self.stdout.write("\n📊 Key Details:")
            for i in range(stats['total_keys']):
                key_info = stats['key_details'][f'key_{i+1}']
                health_icon = "🟢" if key_info['healthy'] else "🔴"
                usage_percentage = (key_info['usage'] / stats['max_calls_per_key']) * 100
                
                self.stdout.write(f"  {health_icon} Key {i+1}:")
                self.stdout.write(f"    Usage: {key_info['usage']}/{stats['max_calls_per_key']} ({usage_percentage:.1f}%)")
                self.stdout.write(f"    Errors: {key_info['error_count']}")
                self.stdout.write(f"    Total calls: {key_info['total_calls']}")
                self.stdout.write(f"    Response time: {key_info['avg_response_time']:.3f}s")
                self.stdout.write(f"    Last used: {key_info['last_used']}")
                self.stdout.write("")

    def manage_parallel_mode(self, options):
        """Manage parallel execution mode and settings"""
        if options['max_keys'] is not None:
            groq_parallel_manager.set_max_parallel_keys(options['max_keys'])
            self.stdout.write(
                self.style.SUCCESS(f"✅ Max parallel keys set to {options['max_keys']}")
            )
        
        if options['enable']:
            groq_parallel_manager.set_parallel_mode(True)
            self.stdout.write(
                self.style.SUCCESS("✅ Parallel mode enabled")
            )
        
        if options['disable']:
            groq_parallel_manager.set_parallel_mode(False)
            self.stdout.write(
                self.style.SUCCESS("✅ Parallel mode disabled")
            )
        
        # Show current configuration
        stats = groq_parallel_manager.get_usage_stats()
        self.stdout.write(f"\n📊 Current Configuration:")
        self.stdout.write(f"   Parallel mode: {stats['parallel_mode']}")
        self.stdout.write(f"   Max parallel keys: {stats['max_parallel_keys']}")

    def show_health_status(self):
        """Show detailed health status of all API keys"""
        self.stdout.write(self.style.SUCCESS("🏥 API Key Health Status"))
        self.stdout.write("=" * 50)
        
        stats = groq_parallel_manager.get_usage_stats()
        
        if not stats['key_details']:
            self.stdout.write("No API keys configured")
            return
        
        for i in range(stats['total_keys']):
            key_info = stats['key_details'][f'key_{i+1}']
            health_status = "🟢 Healthy" if key_info['healthy'] else "🔴 Unhealthy"
            
            self.stdout.write(f"Key {i+1}: {health_status}")
            self.stdout.write(f"  Error count: {key_info['error_count']}")
            self.stdout.write(f"  Last used: {key_info['last_used']}")
            
            if key_info['error_count'] > 0:
                self.stdout.write(f"  ⚠️  This key has encountered {key_info['error_count']} errors")
            
            self.stdout.write("")

    def show_performance_metrics(self):
        """Show performance metrics for all API keys"""
        self.stdout.write(self.style.SUCCESS("📈 Performance Metrics"))
        self.stdout.write("=" * 50)
        
        stats = groq_parallel_manager.get_usage_stats()
        
        if not stats['key_details']:
            self.stdout.write("No API keys configured")
            return
        
        total_calls = 0
        total_errors = 0
        avg_response_time = 0
        
        for i in range(stats['total_keys']):
            key_info = stats['key_details'][f'key_{i+1}']
            total_calls += key_info['total_calls']
            total_errors += key_info['error_count']
            avg_response_time += key_info['avg_response_time']
            
            self.stdout.write(f"Key {i+1}:")
            self.stdout.write(f"  Total calls: {key_info['total_calls']}")
            self.stdout.write(f"  Response time: {key_info['avg_response_time']:.3f}s")
            self.stdout.write(f"  Success rate: {((key_info['total_calls'] - key_info['error_count']) / max(key_info['total_calls'], 1) * 100):.1f}%")
            self.stdout.write("")
        
        if total_calls > 0:
            overall_success_rate = ((total_calls - total_errors) / total_calls) * 100
            overall_avg_response = avg_response_time / stats['total_keys']
            
            self.stdout.write("📊 Overall Performance:")
            self.stdout.write(f"  Total calls: {total_calls}")
            self.stdout.write(f"  Total errors: {total_errors}")
            self.stdout.write(f"  Overall success rate: {overall_success_rate:.1f}%")
            self.stdout.write(f"  Average response time: {overall_avg_response:.3f}s")

    def test_parallel_execution(self, num_requests):
        """Test parallel execution with multiple API keys"""
        self.stdout.write(self.style.SUCCESS("🧪 Testing Parallel Execution"))
        self.stdout.write("=" * 50)
        
        stats = groq_parallel_manager.get_usage_stats()
        
        if stats['healthy_keys'] < 2:
            self.stdout.write(
                self.style.WARNING("⚠️  Need at least 2 healthy API keys for parallel execution testing")
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
        
        self.stdout.write(f"Sending {num_requests} test requests in parallel...")
        
        try:
            import time
            start_time = time.time()
            
            responses = groq_parallel_manager.make_parallel_requests(test_requests)
            
            end_time = time.time()
            total_time = end_time - start_time
            
            successful_responses = [r for r in responses if r is not None]
            
            self.stdout.write(f"✅ Test completed in {total_time:.2f} seconds")
            self.stdout.write(f"📊 Results: {len(successful_responses)}/{len(responses)} successful")
            self.stdout.write(f"📈 Average time per request: {total_time/len(test_requests):.2f}s")
            
            # Show responses
            for i, response in enumerate(responses):
                if response:
                    content = response.choices[0].message.content.strip()
                    self.stdout.write(f"  ✅ Request {i+1}: {content}")
                else:
                    self.stdout.write(f"  ❌ Request {i+1}: Failed")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"❌ Parallel execution test failed: {e}")
            )

    def show_configuration(self):
        """Show current configuration settings"""
        self.stdout.write(self.style.SUCCESS("⚙️  Configuration Settings"))
        self.stdout.write("=" * 50)
        
        stats = groq_parallel_manager.get_usage_stats()
        
        self.stdout.write(f"Parallel mode: {stats['parallel_mode']}")
        self.stdout.write(f"Max parallel keys: {stats['max_parallel_keys']}")
        self.stdout.write(f"Max calls per key: {stats['max_calls_per_key']}")
        self.stdout.write(f"Total configured keys: {stats['total_keys']}")
        self.stdout.write(f"Healthy keys: {stats['healthy_keys']}")
        
        self.stdout.write("\n🔧 Available Configuration Options:")
        self.stdout.write("  • set_max_parallel_keys(n) - Set max parallel keys")
        self.stdout.write("  • set_parallel_mode(True/False) - Enable/disable parallel mode")
        self.stdout.write("  • reset_usage() - Reset usage counters")
        self.stdout.write("  • add_api_key(key) - Add new API key")
        self.stdout.write("  • remove_api_key(key) - Remove API key")
        
        self.stdout.write("\n📊 Monitoring Commands:")
        self.stdout.write("  • python manage.py manage_groq_parallel status")
        self.stdout.write("  • python manage.py manage_groq_parallel health")
        self.stdout.write("  • python manage.py manage_groq_parallel performance")
        self.stdout.write("  • python manage.py manage_groq_parallel test")


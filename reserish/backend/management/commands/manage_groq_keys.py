from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
import os
import sys
from pathlib import Path

# Add the backend function path to sys.path
backend_path = Path(settings.BASE_DIR) / "bkend_function" / "individual" / "overallrating"
sys.path.insert(0, str(backend_path))

try:
    from groq_api_manager import groq_manager
except ImportError:
    groq_manager = None

class Command(BaseCommand):
    help = 'Manage Groq API keys and monitor usage'

    def add_arguments(self, parser):
        parser.add_argument(
            'action',
            choices=['status', 'add', 'remove', 'reset', 'list', 'test'],
            help='Action to perform'
        )
        parser.add_argument(
            '--key',
            type=str,
            help='API key to add/remove'
        )
        parser.add_argument(
            '--index',
            type=int,
            help='Index of the key to remove (0-based)'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=1000,
            help='Maximum calls per key (default: 1000)'
        )

    def handle(self, *args, **options):
        if not groq_manager:
            raise CommandError("Groq API Manager not available. Check the import path.")

        action = options['action']

        if action == 'status':
            self.show_status()
        elif action == 'add':
            if not options['key']:
                raise CommandError("--key is required for 'add' action")
            self.add_key(options['key'])
        elif action == 'remove':
            if options['key']:
                self.remove_key_by_value(options['key'])
            elif options['index'] is not None:
                self.remove_key_by_index(options['index'])
            else:
                raise CommandError("Either --key or --index is required for 'remove' action")
        elif action == 'reset':
            self.reset_usage(options['index'])
        elif action == 'list':
            self.list_keys()
        elif action == 'test':
            self.test_connection()

    def show_status(self):
        """Show current status and usage statistics"""
        self.stdout.write(self.style.SUCCESS("📊 Groq API Key Status"))
        self.stdout.write("=" * 50)
        
        stats = groq_manager.get_usage_stats()
        
        self.stdout.write(f"Total API keys: {stats['total_keys']}")
        self.stdout.write(f"Current key index: {stats['current_key_index']}")
        self.stdout.write(f"Max calls per key: {stats['max_calls_per_key']}")
        self.stdout.write(f"Current key remaining: {stats['current_key_remaining']}")
        
        if stats['key_usage']:
            self.stdout.write("\nKey Usage:")
            for i, (key, usage) in enumerate(stats['key_usage'].items()):
                remaining = max(0, stats['max_calls_per_key'] - usage)
                status = "🟢 Active" if remaining > 0 else "🔴 Exhausted"
                current_indicator = " (Current)" if i == stats['current_key_index'] else ""
                self.stdout.write(f"  Key {i+1}: {usage}/{stats['max_calls_per_key']} calls, {remaining} remaining {status}{current_indicator}")

    def add_key(self, api_key):
        """Add a new API key"""
        try:
            groq_manager.add_api_key(api_key)
            self.stdout.write(
                self.style.SUCCESS(f"✅ API key added successfully. Total keys: {len(groq_manager.api_keys)}")
            )
        except Exception as e:
            raise CommandError(f"Failed to add API key: {e}")

    def remove_key_by_value(self, api_key):
        """Remove an API key by its value"""
        try:
            groq_manager.remove_api_key(api_key)
            self.stdout.write(
                self.style.SUCCESS(f"✅ API key removed successfully. Total keys: {len(groq_manager.api_keys)}")
            )
        except Exception as e:
            raise CommandError(f"Failed to remove API key: {e}")

    def remove_key_by_index(self, index):
        """Remove an API key by its index"""
        if index < 0 or index >= len(groq_manager.api_keys):
            raise CommandError(f"Invalid index {index}. Valid range: 0-{len(groq_manager.api_keys)-1}")
        
        key_to_remove = groq_manager.api_keys[index]
        try:
            groq_manager.remove_api_key(key_to_remove)
            self.stdout.write(
                self.style.SUCCESS(f"✅ API key at index {index} removed successfully. Total keys: {len(groq_manager.api_keys)}")
            )
        except Exception as e:
            raise CommandError(f"Failed to remove API key: {e}")

    def reset_usage(self, key_index):
        """Reset usage counters"""
        try:
            if key_index is not None:
                groq_manager.reset_usage(key_index)
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Usage reset for key at index {key_index}")
                )
            else:
                groq_manager.reset_usage()
                self.stdout.write(
                    self.style.SUCCESS("✅ Usage reset for all keys")
                )
        except Exception as e:
            raise CommandError(f"Failed to reset usage: {e}")

    def list_keys(self):
        """List all configured API keys"""
        self.stdout.write(self.style.SUCCESS("🔑 Configured API Keys"))
        self.stdout.write("=" * 50)
        
        if not groq_manager.api_keys:
            self.stdout.write("No API keys configured")
            return
        
        for i, key in enumerate(groq_manager.api_keys):
            usage = groq_manager.key_usage.get(key, 0)
            remaining = max(0, groq_manager.max_calls_per_key - usage)
            current_indicator = " (Current)" if i == groq_manager.current_key_index else ""
            
            # Mask the key for security
            masked_key = key[:8] + "..." + key[-4:] if len(key) > 12 else key
            
            self.stdout.write(f"Key {i+1}: {masked_key}")
            self.stdout.write(f"  Usage: {usage}/{groq_manager.max_calls_per_key}, Remaining: {remaining}{current_indicator}")
            self.stdout.write("")

    def test_connection(self):
        """Test the current API key connection"""
        self.stdout.write(self.style.SUCCESS("🧪 Testing API Connection"))
        self.stdout.write("=" * 50)
        
        try:
            response = groq_manager.make_request(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": "Hello! Please respond with just 'Test successful'."}],
                temperature=0.1,
                max_tokens=10,
            )
            
            self.stdout.write(
                self.style.SUCCESS(f"✅ Connection successful: {response.choices[0].message.content.strip()}")
            )
            
            # Show updated stats
            stats = groq_manager.get_usage_stats()
            self.stdout.write(f"Current key: {stats['current_key_index'] + 1}")
            self.stdout.write(f"Remaining calls: {stats['current_key_remaining']}")
            
        except Exception as e:
            raise CommandError(f"❌ Connection failed: {e}")

    def show_environment_info(self):
        """Show information about environment variables"""
        self.stdout.write("\n🔧 Environment Variables:")
        env_vars = [
            "GROQ_API_KEY",
            "GROQ_API_KEY_1", 
            "GROQ_API_KEY_2",
            "GROQ_API_KEY_3",
            "GROQ_API_KEYS"
        ]
        
        for var in env_vars:
            value = os.getenv(var)
            if value:
                masked_value = value[:8] + "..." + value[-4:] if len(value) > 12 else "***"
                self.stdout.write(f"  {var}: {masked_value}")
            else:
                self.stdout.write(f"  {var}: Not set")


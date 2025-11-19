from django.core.management.base import BaseCommand
from django.utils import timezone
from backend.tasks import scrape_jobs_automated, cleanup_old_jobs, sync_scraped_jobs_to_main
from backend.models import ScrapedJob, Job
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test the automated job scraping system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--action',
            type=str,
            choices=['scrape', 'cleanup', 'sync', 'all'],
            default='all',
            help='Action to perform: scrape, cleanup, sync, or all'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without making changes'
        )

    def handle(self, *args, **options):
        action = options['action']
        dry_run = options['dry_run']
        
        self.stdout.write(
            self.style.SUCCESS(f'🚀 Testing automated job scraping system...')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('⚠️ DRY RUN MODE - No changes will be made')
            )
        
        # Show current stats
        self.show_current_stats()
        
        if action in ['scrape', 'all']:
            self.test_scraping(dry_run)
        
        if action in ['cleanup', 'all']:
            self.test_cleanup(dry_run)
        
        if action in ['sync', 'all']:
            self.test_sync(dry_run)
        
        # Show final stats
        self.show_current_stats()
        
        self.stdout.write(
            self.style.SUCCESS('✅ Testing completed!')
        )

    def show_current_stats(self):
        """Show current statistics"""
        total_scraped = ScrapedJob.objects.count()
        active_scraped = ScrapedJob.objects.filter(is_active=True).count()
        total_jobs = Job.objects.count()
        scraped_jobs = Job.objects.filter(is_scraped=True).count()
        
        self.stdout.write('\n📊 Current Statistics:')
        self.stdout.write(f'   ScrapedJob table: {total_scraped} total, {active_scraped} active')
        self.stdout.write(f'   Job table: {total_jobs} total, {scraped_jobs} scraped')
        
        # Show recent scraped jobs
        recent_scraped = ScrapedJob.objects.filter(is_active=True).order_by('-scraped_at')[:5]
        if recent_scraped:
            self.stdout.write('\n🆕 Recent Scraped Jobs:')
            for job in recent_scraped:
                self.stdout.write(f'   • {job.title} at {job.company_name} from {job.source} ({job.days_old} days old)')

    def test_scraping(self, dry_run):
        """Test job scraping"""
        self.stdout.write('\n🔍 Testing job scraping...')
        
        if dry_run:
            self.stdout.write('   (Dry run - would call scrape_jobs_automated task)')
            return
        
        try:
            # Call the task directly
            result = scrape_jobs_automated()
            if result:
                self.stdout.write(
                    self.style.SUCCESS('   ✅ Job scraping completed successfully')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('   ❌ Job scraping failed')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Error during scraping: {e}')
            )

    def test_cleanup(self, dry_run):
        """Test cleanup of old jobs"""
        self.stdout.write('\n🧹 Testing cleanup of old jobs...')
        
        if dry_run:
            self.stdout.write('   (Dry run - would call cleanup_old_jobs task)')
            return
        
        try:
            # Call the task directly
            result = cleanup_old_jobs()
            if result:
                self.stdout.write(
                    self.style.SUCCESS('   ✅ Cleanup completed successfully')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('   ❌ Cleanup failed')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Error during cleanup: {e}')
            )

    def test_sync(self, dry_run):
        """Test syncing scraped jobs to main table"""
        self.stdout.write('\n🔄 Testing sync of scraped jobs...')
        
        if dry_run:
            self.stdout.write('   (Dry run - would call sync_scraped_jobs_to_main task)')
            return
        
        try:
            # Call the task directly
            result = sync_scraped_jobs_to_main()
            if result:
                self.stdout.write(
                    self.style.SUCCESS('   ✅ Sync completed successfully')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('   ❌ Sync failed')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'   ❌ Error during sync: {e}')
            )

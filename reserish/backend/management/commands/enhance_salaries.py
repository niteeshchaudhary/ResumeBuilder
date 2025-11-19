from django.core.management.base import BaseCommand
from django.utils import timezone
from backend.models import ScrapedJob, EnhancedSalary
from backend.tasks import enhance_job_salaries
import logging
from django.db.models import Q

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Manually trigger enhanced salary scraping for scraped jobs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Number of jobs to process (default: 10)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update even if salary data is recent'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be processed without actually doing it'
        )

    def handle(self, *args, **options):
        limit = options['limit']
        force = options['force']
        dry_run = options['dry_run']

        self.stdout.write(
            self.style.SUCCESS(f'💰 Starting enhanced salary scraping (limit: {limit}, force: {force}, dry-run: {dry_run})')
        )

        try:
            # Import the salary scraper
            import sys
            import os
            sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'bkend_function', 'jobs'))
            
            try:
                from salary_scraper import scrape_salaries_for_jobs
            except ImportError as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Could not import salary_scraper: {e}')
                )
                return

            # Get jobs that need salary enhancement
            if force:
                # Force update all active jobs
                jobs_to_update = ScrapedJob.objects.filter(is_active=True)[:limit]
            else:
                # Get jobs without enhanced salary or with salary older than 7 days
                from datetime import timedelta
                cutoff_date = timezone.now() - timedelta(days=7)
                
                jobs_to_update = ScrapedJob.objects.filter(
                    is_active=True
                ).filter(
                    Q(enhanced_salary__isnull=True) |
                    Q(enhanced_salary__last_updated__lt=cutoff_date)
                )[:limit]

            if not jobs_to_update:
                self.stdout.write(
                    self.style.WARNING('ℹ️ No jobs need salary enhancement')
                )
                return

            self.stdout.write(
                self.style.SUCCESS(f'🎯 Found {len(jobs_to_update)} jobs that need salary enhancement')
            )

            if dry_run:
                self.stdout.write('\n📋 Jobs that would be processed:')
                for job in jobs_to_update:
                    self.stdout.write(f'   • {job.title} at {job.company_name} ({job.source})')
                return

            # Convert to list format for the salary scraper
            jobs_list = []
            for job in jobs_to_update:
                jobs_list.append({
                    'title': job.title,
                    'company': job.company_name,
                    'location': job.location,
                    'id': job.id
                })

            # Scrape enhanced salaries
            self.stdout.write('🔍 Scraping enhanced salaries...')
            enhanced_jobs = scrape_salaries_for_jobs(jobs_list)

            if not enhanced_jobs:
                self.stdout.write(
                    self.style.WARNING('⚠️ No enhanced salary data was scraped')
                )
                return

            # Update jobs with enhanced salary information
            jobs_updated = 0
            for enhanced_job in enhanced_jobs:
                try:
                    job_id = enhanced_job.get('id')
                    job = ScrapedJob.objects.get(id=job_id)

                    if enhanced_job.get('enhanced_salary'):
                        salary_data = enhanced_job['enhanced_salary']

                        # Create or update EnhancedSalary object
                        enhanced_salary, created = EnhancedSalary.objects.get_or_create(
                            job_title=salary_data['job_title'],
                            company_name=salary_data['company_name'],
                            location=salary_data.get('location'),
                            defaults={
                                'average_base_salary': salary_data.get('average_base_salary'),
                                'average_total_comp': salary_data.get('average_total_comp'),
                                'salary_range': salary_data.get('salary_range'),
                                'currency': 'USD',  # Default currency
                                'confidence': salary_data.get('confidence', 'low'),
                                'source_details': {
                                    'sources': salary_data.get('sources', []),
                                    'last_updated': salary_data.get('last_updated')
                                }
                            }
                        )

                        if not created:
                            # Update existing enhanced salary
                            enhanced_salary.average_base_salary = salary_data.get('average_base_salary')
                            enhanced_salary.average_total_comp = salary_data.get('average_total_comp')
                            enhanced_salary.salary_range = salary_data.get('salary_range')
                            enhanced_salary.confidence = salary_data.get('confidence', 'low')
                            enhanced_salary.source_details = {
                                'sources': salary_data.get('sources', []),
                                'last_updated': salary_data.get('last_updated')
                            }
                            enhanced_salary.save()

                        # Link the enhanced salary to the scraped job
                        job.enhanced_salary = enhanced_salary
                        job.save()

                        jobs_updated += 1
                        self.stdout.write(
                            self.style.SUCCESS(f'✅ Enhanced salary for job: {job.title} at {job.company_name}')
                        )
                        
                        # Show salary details
                        if enhanced_salary.average_base_salary:
                            self.stdout.write(f'   💰 Base Salary: ${enhanced_salary.average_base_salary:,.2f} {enhanced_salary.currency}')
                        if enhanced_salary.average_total_comp:
                            self.stdout.write(f'   💰 Total Comp: ${enhanced_salary.average_total_comp:,.2f} {enhanced_salary.currency}')
                        if enhanced_salary.salary_range:
                            self.stdout.write(f'   📊 Range: {enhanced_salary.salary_range}')
                        self.stdout.write(f'   🎯 Confidence: {enhanced_salary.confidence}')
                        self.stdout.write(f'   📍 Sources: {len(enhanced_salary.source_details.get("sources", []))} salary sources')

                    else:
                        self.stdout.write(
                            self.style.WARNING(f'ℹ️ No enhanced salary found for job: {job.title} at {job.company_name}')
                        )

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'❌ Error updating job {enhanced_job.get("title", "Unknown")}: {e}')
                    )
                    continue

            self.stdout.write(
                self.style.SUCCESS(f'🎯 Enhanced salary scraping completed. Updated {jobs_updated} jobs out of {len(enhanced_jobs)} processed')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error in enhanced salary scraping: {e}')
            )
            import traceback
            traceback.print_exc()

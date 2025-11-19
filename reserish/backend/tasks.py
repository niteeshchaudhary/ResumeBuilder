from django.contrib.auth import get_user_model
from django.utils import timezone
from .utils.emails import send_expired_email,send_expiring_email

# from django_cron import CronJobBase, Schedule
from celery import shared_task
from django.core.mail import send_mail
from reserish import settings
import json
import threading
import time
from .models import Order,Plan,Transaction,CustomUser
from django.db.models import Q
from celery import Celery
from datetime import timedelta
from .models import ScrapedJob, Job, EnhancedSalary
import logging
import os

logger = logging.getLogger(__name__)

# celery task to check for expired plans to run every 24 hours
@shared_task
def check_plan_expiries():
    expired_users = CustomUser.objects.filter(
        plan_expiry__lte=timezone.now(),
        active_plan__isnull=False 
    ).exclude(
        Q(active_plan__level=1)  # Exclude free plan users
    )
    
    for profile in expired_users:
        # Optional: Downgrade to free plan
        if profile.active_plan.level > 1:
            if profile.is_enterprise:
                send_expired_email(profile.user)
                # Downgrade to free plan for enterprise users
                profile.active_plan = None
            else:
                send_expired_email(profile.user)
                profile.active_plan = Plan.objects.get(id=1)
                profile.save()

# class CheckPlanExpiries(CronJobBase):
#     RUN_EVERY_MINS = 1440  # 24 hours

#     schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
#     code = 'subscriptions.check_plan_expiries'

#     def do(self):
#         expired_users = CustomUser.objects.filter(
#             plan_expiry__lte=timezone.now(),
#             acive_plan__isnull=False
#         )
        
#         for profile in expired_users:
#             # Send expiry notification
#             send_expiry_email(profile.user)
            
#             # Optional: Downgrade to free plan
#             if profile.active_plan.level > 1:
#                 profile.active_plan = Plan.objects.get(level=1)
#                 profile.save()

@shared_task
def scrape_jobs_automated():
    """
    Automated job scraping task that runs every 2 hours
    """
    try:
        logger.info("🚀 Starting automated job scraping...")
        
        # Import the scraper
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'bkend_function', 'jobs'))
        
        try:
            from optimized_job_scraper import scrape_jobs_with_filters
        except ImportError:
            logger.error("❌ Could not import optimized_job_scraper")
            return False
        
        # Define default filters for automated scraping
        default_filters = {
            'profession': 'Software',
            'discipline': 'Computer Science'
        }
        
        # Scrape jobs (get more jobs for automated scraping)
        scraped_jobs = scrape_jobs_with_filters(default_filters, 50)
        
        if not scraped_jobs:
            logger.warning("⚠️ No jobs were scraped in automated run")
            return False
        
        # Store scraped jobs in database
        jobs_stored = 0
        for job_data in scraped_jobs:
            try:
                # Check if job already exists
                existing_job = ScrapedJob.objects.filter(
                    title=job_data['title'],
                    company_name=job_data['company'],
                    source=job_data['source']
                ).first()
                
                if not existing_job:
                    # Create new scraped job
                    ScrapedJob.objects.create(
                        title=job_data['title'],
                        company_name=job_data['company'],
                        location=job_data['location'],
                        job_type=job_data['jobType'],
                        profession=job_data['profession'],
                        discipline=job_data['discipline'],
                        description=job_data['description'],
                        experience=job_data['experience'],
                        # Removed basic salary field - not needed
                        source=job_data['source'],
                        source_url=job_data.get('url', ''),
                        is_active=True
                    )
                    jobs_stored += 1
                    logger.info(f"✅ Stored new job: {job_data['title']} at {job_data['company']}")
                else:
                    logger.debug(f"ℹ️ Job already exists: {job_data['title']} at {job_data['company']}")
                    
            except Exception as e:
                logger.error(f"❌ Error storing job {job_data.get('title', 'Unknown')}: {e}")
                continue
        
        logger.info(f"🎯 Automated scraping completed. Stored {jobs_stored} new jobs out of {len(scraped_jobs)} scraped")
        
        # Clean up old jobs (older than 10 days)
        cleanup_old_jobs.delay()
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error in automated job scraping: {e}")
        return False

@shared_task
def enhance_job_salaries():
    """
    Enhanced salary scraping task that runs every 6 hours
    Scrapes detailed salary information from multiple sources for existing scraped jobs
    """
    try:
        logger.info("💰 Starting enhanced salary scraping...")
        
        # Import the salary scraper
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'bkend_function', 'jobs'))
        
        try:
            from salary_scraper import scrape_salaries_for_jobs
        except ImportError:
            logger.error("❌ Could not import salary_scraper")
            return False
        
        # Get jobs that don't have enhanced salary information or have old salary data
        from django.utils import timezone
        from datetime import timedelta
        
        # Get jobs without enhanced salary or with salary older than 7 days
        cutoff_date = timezone.now() - timedelta(days=7)
        
        jobs_to_update = ScrapedJob.objects.filter(
            is_active=True
        ).filter(
            Q(enhanced_salary__isnull=True) |
            Q(enhanced_salary__last_updated__lt=cutoff_date)
        )[:20]  # Process 20 jobs at a time to avoid overwhelming
        
        if not jobs_to_update:
            logger.info("ℹ️ No jobs need salary enhancement")
            return True
        
        logger.info(f"🎯 Found {len(jobs_to_update)} jobs that need salary enhancement")
        
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
        enhanced_jobs = scrape_salaries_for_jobs(jobs_list)
        
        if not enhanced_jobs:
            logger.warning("⚠️ No enhanced salary data was scraped")
            return False
        
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
                    logger.info(f"✅ Enhanced salary for job: {job.title} at {job.company_name}")
                    
                else:
                    logger.debug(f"ℹ️ No enhanced salary found for job: {job.title} at {job.company_name}")
                    
            except Exception as e:
                logger.error(f"❌ Error updating job {enhanced_job.get('title', 'Unknown')}: {e}")
                continue
        
        logger.info(f"🎯 Enhanced salary scraping completed. Updated {jobs_updated} jobs out of {len(enhanced_jobs)} processed")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error in enhanced salary scraping: {e}")
        return False


@shared_task
def cleanup_old_salary_data():
    """
    Clean up old enhanced salary data (older than 30 days)
    """
    try:
        logger.info("🧹 Starting cleanup of old enhanced salary data...")
        
        # Calculate cutoff date (30 days ago)
        from django.utils import timezone
        from datetime import timedelta
        cutoff_date = timezone.now() - timedelta(days=30)
        
        # Get old enhanced salary data
        old_salaries = EnhancedSalary.objects.filter(last_updated__lt=cutoff_date)
        count = old_salaries.count()
        
        if count > 0:
            # Delete old enhanced salary data
            old_salaries.delete()
            logger.info(f"🗑️ Cleaned up {count} old enhanced salary records")
        else:
            logger.info("ℹ️ No old enhanced salary data to clean up")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error cleaning up old salary data: {e}")
        return False

@shared_task
def cleanup_old_jobs():
    """
    Clean up scraped jobs older than 10 days
    """
    try:
        logger.info("🧹 Starting cleanup of old scraped jobs...")
        
        # Calculate cutoff date (10 days ago)
        cutoff_date = timezone.now() - timedelta(days=10)
        
        # Find old scraped jobs
        old_jobs = ScrapedJob.objects.filter(
            scraped_at__lt=cutoff_date,
            is_active=True
        )
        
        old_jobs_count = old_jobs.count()
        
        if old_jobs_count > 0:
            # Soft delete by setting is_active to False
            old_jobs.update(is_active=False)
            logger.info(f"🗑️ Cleaned up {old_jobs_count} old scraped jobs (older than 10 days)")
        else:
            logger.info("ℹ️ No old jobs to clean up")
        
        # Also clean up old jobs from the main Job table that are marked as scraped
        old_main_jobs = Job.objects.filter(
            is_scraped=True,
            created_at__lt=cutoff_date
        )
        
        old_main_count = old_main_jobs.count()
        if old_main_count > 0:
            old_main_jobs.update(status='archived')
            logger.info(f"🗑️ Archived {old_main_count} old scraped jobs from main table")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error cleaning up old jobs: {e}")
        return False

@shared_task
def sync_scraped_jobs_to_main():
    """
    Sync active scraped jobs to the main Job table for display
    """
    try:
        logger.info("🔄 Starting sync of scraped jobs to main table...")
        
        # Get active scraped jobs
        active_scraped_jobs = ScrapedJob.objects.filter(is_active=True)
        
        synced_count = 0
        for scraped_job in active_scraped_jobs:
            try:
                # Check if job already exists in main table
                existing_job = Job.objects.filter(
                    title=scraped_job.title,
                    scraped_source=scraped_job.source
                ).first()
                
                if not existing_job:
                    # Find or create a system user for scraped jobs
                    try:
                        system_user = CustomUser.objects.filter(is_superuser=True).first()
                        if not system_user:
                            # Create a system user if none exists
                            system_user = CustomUser.objects.create(
                                email='system@reserish.com',
                                is_superuser=True,
                                is_staff=True,
                                is_active=True
                            )
                            logger.info("✅ Created system user for scraped jobs")
                    except Exception as e:
                        logger.error(f"❌ Error creating system user: {e}")
                        continue
                    
                    try:
                        # Create new job in main table
                        Job.objects.create(
                            title=scraped_job.title,
                            company=system_user,  # Use the system user
                            location=scraped_job.location,
                            job_type=scraped_job.job_type,
                            profession=scraped_job.profession,
                            discipline=scraped_job.discipline,
                            description=scraped_job.description,
                            experience=scraped_job.experience,
                            status='active',
                            is_scraped=True,
                            scraped_source=scraped_job.source,
                            scraped_url=scraped_job.source_url,
                                                               scraped_salary=scraped_job.salary if hasattr(scraped_job, 'salary') else 'Not specified'
                        )
                        synced_count += 1
                        logger.info(f"✅ Synced job: {scraped_job.title}")
                    except Exception as e:
                        logger.error(f"❌ Error creating job in main table: {e}")
                        continue
                else:
                    logger.debug(f"ℹ️ Job already synced: {scraped_job.title}")
                    
            except Exception as e:
                logger.error(f"❌ Error syncing job {scraped_job.title}: {e}")
                continue
        
        logger.info(f"🔄 Sync completed. Synced {synced_count} new jobs to main table")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error syncing scraped jobs: {e}")
        return False


# Background tasks for authentication and registration
@shared_task
def send_welcome_email_and_notification(user_email, is_enterprise=False):
    """
    Background task to send welcome email and notification to new users
    """
    try:
        logger.info(f"📧 Sending welcome email and notification to {user_email}")
        
        # Send notification
        send_notification_task.delay(user_email, is_enterprise)
        
        # Send welcome email
        send_welcome_email_task.delay(user_email)
        
        logger.info(f"✅ Welcome email and notification tasks queued for {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error queuing welcome tasks for {user_email}: {e}")
        return False


@shared_task
def send_verification_email_task(user_email, request_data=None):
    """
    Background task to send verification email
    """
    try:
        logger.info(f"📧 Sending verification email to {user_email}")
        
        # Import here to avoid circular imports
        from .views import send_custom_email
        
        result = send_custom_email(user_email, "verify", request_data)
        
        if result.status_code == 200:
            logger.info(f"✅ Verification email sent successfully to {user_email}")
            return True
        else:
            logger.error(f"❌ Verification email failed for {user_email}: {result}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error sending verification email to {user_email}: {e}")
        return False


@shared_task
def send_welcome_email_task(user_email):
    """
    Background task to send welcome email
    """
    try:
        logger.info(f"📧 Sending welcome email to {user_email}")
        
        # Import here to avoid circular imports
        from .views import send_custom_email
        
        result = send_custom_email(user_email, "welcome")
        
        if result.status_code == 200:
            logger.info(f"✅ Welcome email sent successfully to {user_email}")
            return True
        else:
            logger.error(f"❌ Welcome email failed for {user_email}: {result}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error sending welcome email to {user_email}: {e}")
        return False


@shared_task
def send_notification_task(user_email, is_enterprise=False):
    """
    Background task to send notification
    """
    try:
        logger.info(f"🔔 Sending notification to {user_email}")
        
        # Import here to avoid circular imports
        from .views import sendNotification
        
        if is_enterprise:
            sendNotification(user_email, body="Welcome to Hire Smarts! We are excited to have you on board.", workflow_id="onboarding-demo-workflow-enp")
        else:
            sendNotification(user_email, body="Welcome to Resume Upgrade! We are excited to have you on board.", workflow_id="onboarding-demo-workflow")
        
        logger.info(f"✅ Notification sent successfully to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error sending notification to {user_email}: {e}")
        return False

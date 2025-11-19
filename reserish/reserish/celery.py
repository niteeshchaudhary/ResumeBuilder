import os
from celery import Celery
from celery.schedules import crontab
from django.core.checks.registry import registry
registry.registered_checks.clear()
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reserish.settings')

app = Celery('reserish')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Configure periodic tasks
app.conf.beat_schedule = {
    'scrape-jobs-every-12-hours': {
        'task': 'backend.tasks.scrape_jobs_automated',
        'schedule': crontab(minute=0, hour='*/12'),  # Every 12 hours
    },
    'cleanup-old-jobs-every-day': {
        'task': 'backend.tasks.cleanup_old_jobs',
        'schedule': crontab(minute=0, hour=0),  # Every day at midnight
    },
    'sync-scraped-jobs-every-12-hours': {
        'task': 'backend.tasks.sync_scraped_jobs_to_main',
        'schedule': crontab(minute=0, hour='*/12'),  # Every 12 hours
    },
    'check-plan-expiries-every-day': {
        'task': 'backend.tasks.check_plan_expiries',
        'schedule': crontab(minute=0, hour=0),  # Every day at midnight
    },
}
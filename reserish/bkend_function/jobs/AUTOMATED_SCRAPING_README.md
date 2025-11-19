# 🤖 Automated Job Scraping System

This system automatically scrapes jobs from external websites every 2 hours, stores them in a database, and automatically cleans up old jobs after 10 days.

## 🚀 Features

- **Automated Scraping**: Runs every 2 hours using Celery
- **Database Storage**: Stores scraped jobs in dedicated tables
- **Automatic Cleanup**: Removes jobs older than 10 days
- **Frontend Integration**: Shows both local and external jobs
- **Filter Support**: Apply filters to both local and external jobs
- **Source Tracking**: Know which website each job came from

## 🏗️ Architecture

### Database Models

#### 1. Updated Job Model
```python
class Job(models.Model):
    # ... existing fields ...
    is_scraped = models.BooleanField(default=False)  # New field
    scraped_source = models.CharField(max_length=100, blank=True, null=True)
    scraped_url = models.URLField(blank=True, null=True)
    scraped_salary = models.CharField(max_length=100, blank=True, null=True)
```

#### 2. New ScrapedJob Model
```python
class ScrapedJob(models.Model):
    title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    job_type = models.CharField(max_length=50, blank=True, null=True)
    profession = models.CharField(max_length=50, blank=True, null=True)
    discipline = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    experience = models.CharField(max_length=100, blank=True, null=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    source = models.CharField(max_length=100)  # e.g., 'RemoteOK', 'LinkedIn'
    source_url = models.URLField(blank=True, null=True)
    scraped_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
```

### Celery Tasks

#### 1. `scrape_jobs_automated`
- **Schedule**: Every 2 hours
- **Purpose**: Scrapes jobs from external sources
- **Storage**: Saves to `ScrapedJob` table
- **Triggers**: Cleanup task after completion

#### 2. `cleanup_old_jobs`
- **Schedule**: Daily at 2 AM
- **Purpose**: Removes jobs older than 10 days
- **Method**: Soft delete (sets `is_active=False`)

#### 3. `sync_scraped_jobs_to_main`
- **Schedule**: Every hour
- **Purpose**: Syncs active scraped jobs to main `Job` table
- **Benefit**: Unified job display and filtering

### API Endpoints

#### 1. `/api/joblistings/` (Updated)
- **Method**: POST
- **Purpose**: Get both local and external jobs
- **Filters**: Apply to both job types
- **Response**: Combined jobs with source information

#### 2. `/api/enhanced-job-scraping/` (Legacy)
- **Method**: POST
- **Purpose**: Manual job scraping (kept for compatibility)
- **Note**: Will be deprecated in favor of automated system

## 🔧 Setup Instructions

### 1. Database Migration
```bash
cd reserish
python manage.py makemigrations
python manage.py migrate
```

### 2. Celery Configuration
The system is already configured in `reserish/celery.py`:
```python
app.conf.beat_schedule = {
    'scrape-jobs-every-2-hours': {
        'task': 'backend.tasks.scrape_jobs_automated',
        'schedule': crontab(minute=0, hour='*/2'),
    },
    'cleanup-old-jobs-daily': {
        'task': 'backend.tasks.cleanup_old_jobs',
        'schedule': crontab(minute=0, hour=2),
    },
    'sync-scraped-jobs-hourly': {
        'task': 'backend.tasks.sync_scraped_jobs_to_main',
        'schedule': crontab(minute=0, hour='*/1'),
    },
}
```

### 3. Start Celery Workers
```bash
# Terminal 1: Start Celery worker
cd reserish
celery -A reserish worker --loglevel=info

# Terminal 2: Start Celery beat scheduler
cd reserish
celery -A reserish beat --loglevel=info
```

## 🧪 Testing

### 1. Test Management Command
```bash
cd reserish
python manage.py test_automated_scraping --action=all --dry-run
python manage.py test_automated_scraping --action=scrape
python manage.py test_automated_scraping --action=cleanup
python manage.py test_automated_scraping --action=sync
```

### 2. Manual Task Testing
```python
from backend.tasks import scrape_jobs_automated, cleanup_old_jobs, sync_scraped_jobs_to_main

# Test scraping
result = scrape_jobs_automated()

# Test cleanup
result = cleanup_old_jobs()

# Test sync
result = sync_scraped_jobs_to_main()
```

## 📊 Monitoring

### 1. Check Task Status
```bash
# Check Celery worker status
celery -A reserish inspect active

# Check scheduled tasks
celery -A reserish inspect scheduled
```

### 2. Database Queries
```python
from backend.models import ScrapedJob, Job

# Count active scraped jobs
active_count = ScrapedJob.objects.filter(is_active=True).count()

# Count jobs by source
source_counts = ScrapedJob.objects.filter(is_active=True).values('source').annotate(count=Count('id'))

# Find old jobs (older than 10 days)
from django.utils import timezone
from datetime import timedelta
cutoff = timezone.now() - timedelta(days=10)
old_jobs = ScrapedJob.objects.filter(scraped_at__lt=cutoff, is_active=True)
```

## 🎯 Frontend Integration

### 1. Job Display
- **Local Jobs**: Blue border, "Local" badge
- **External Jobs**: Green border, source badge (e.g., "RemoteOK")
- **Salary Display**: Shows for external jobs when available
- **View Job Button**: Only for external jobs with URLs

### 2. Filtering
- Filters apply to both local and external jobs
- Toggle between "Local Jobs" and "External Jobs" views
- Real-time filtering as you type/select

### 3. User Experience
- Loading states during job fetching
- Informative messages about automation
- Clear distinction between job sources

## 🔄 Workflow

### 1. Automated Scraping (Every 2 Hours)
```
1. Celery beat triggers scrape_jobs_automated task
2. Task scrapes jobs from multiple sources
3. New jobs are stored in ScrapedJob table
4. Cleanup task is triggered
5. Sync task is triggered
```

### 2. Cleanup Process (Daily)
```
1. Find jobs older than 10 days
2. Set is_active=False (soft delete)
3. Archive scraped jobs in main Job table
4. Log cleanup statistics
```

### 3. Sync Process (Hourly)
```
1. Find active scraped jobs
2. Check if they exist in main Job table
3. Create new entries if needed
4. Update existing entries
5. Maintain data consistency
```

## 🚨 Troubleshooting

### 1. Jobs Not Scraping
- Check Celery worker status
- Verify Celery beat is running
- Check task logs for errors
- Verify scraper dependencies are installed

### 2. Jobs Not Displaying
- Check if sync task is running
- Verify database connections
- Check API endpoint responses
- Verify frontend API calls

### 3. Performance Issues
- Monitor database query performance
- Check Celery worker concurrency
- Optimize cleanup queries
- Consider database indexing

## 🔮 Future Enhancements

### 1. Advanced Filtering
- Salary range filtering
- Company size filtering
- Remote work filtering
- Skill-based filtering

### 2. Job Recommendations
- AI-powered job matching
- User preference learning
- Similar job suggestions
- Application tracking

### 3. Analytics Dashboard
- Scraping success rates
- Job source statistics
- User engagement metrics
- Performance monitoring

### 4. Multi-language Support
- International job sources
- Language-specific scraping
- Localized job descriptions
- Regional filtering

## 📝 Configuration

### 1. Scraping Frequency
Modify `reserish/celery.py`:
```python
'scrape-jobs-every-2-hours': {
    'task': 'backend.tasks.scrape_jobs_automated',
    'schedule': crontab(minute=0, hour='*/2'),  # Change to desired frequency
},
```

### 2. Cleanup Age
Modify `backend/tasks.py`:
```python
# Calculate cutoff date (10 days ago)
cutoff_date = timezone.now() - timedelta(days=10)  # Change number of days
```

### 3. Job Sources
Modify `backend/tasks.py` in `scrape_jobs_automated`:
```python
# Define default filters for automated scraping
default_filters = {
    'profession': 'Software',  # Change profession
    'discipline': 'Computer Science',  # Change discipline
}
```

## 🎉 Benefits

1. **Always Fresh**: Jobs are updated every 2 hours
2. **No Manual Work**: Fully automated system
3. **Data Quality**: Automatic cleanup prevents stale data
4. **Scalability**: Celery handles concurrent scraping
5. **User Experience**: Seamless integration with existing system
6. **Maintenance**: Self-cleaning system reduces manual intervention

---

**Note**: This system replaces the manual scraping button with a fully automated solution that provides a better user experience and more reliable job data.

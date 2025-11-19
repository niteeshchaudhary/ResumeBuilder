from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from .managers import CustomUserManager
from django.contrib.postgres.fields import ArrayField
from django.db.models import Q, CheckConstraint

class Plan(models.Model):
    name = models.CharField(max_length=50)
    price_month = models.DecimalField(max_digits=6, decimal_places=2)
    price_qyear = models.DecimalField(max_digits=6, decimal_places=2)
    price_hyear = models.DecimalField(max_digits=6, decimal_places=2)
    price_year = models.DecimalField(max_digits=6, decimal_places=2)
    level = models.IntegerField(help_text="Higher number means better plan")
    features = models.TextField()
    def __str__(self):
        if(self.id>3):
            return f"e_{self.name}"
        else:
            return f"u_{self.name}"

class CustomUser(AbstractUser):
    email = models.EmailField("email address", unique=True)
    is_enterprise = models.BooleanField(default=False)
    rid = models.TextField(blank=True, null=True)
    active_plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True,default=1) #models.CharField(max_length=50, default='Free')
    plan_duration = models.IntegerField(default=-1,help_text="Duration in days")
    plan_activated_on = models.DateTimeField(auto_now_add=True)
    plan_expiry_date = models.DateTimeField(null=True, blank=True, help_text="Date when the plan expires")
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    username=None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    address = models.TextField(blank=True)
    phone_number = models.CharField(max_length=15, blank=True)
    profile_updated = models.BooleanField(default=False)
    is_anonymous=False
    is_authenticated=False
    objects = CustomUserManager()
    class Meta:
        constraints = [
            CheckConstraint(
                check=(
                    Q(is_enterprise=False) | Q(is_enterprise=True, rid__isnull=False)
                ),
                name='require_rid_if_enterprise'
            ),
        ]
    def __str__(self):
        return self.email
    

class Templates(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=50)
    description = models.TextField()
    category = models.CharField(max_length=50)
    image = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.title


    
class UserAccount(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="account")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.user.username} - Balance: {self.balance}"

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    payment_id = models.CharField(max_length=100, unique=True)
    order_id = models.CharField(max_length=100,unique=True)
    signature = models.CharField(max_length=200,unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.amount} {self.currency} ({self.status})"

class Feedback(models.Model):
    RATING_CHOICES = [
        (1, 'Poor'),
        (2, 'Fair'),
        (3, 'Good'),
        (4, 'Very Good'),
        (5, 'Excellent'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    feature_name = models.CharField(max_length=100, help_text="Name of the feature being rated")
    rating = models.IntegerField(choices=RATING_CHOICES)
    detailed_feedback = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Feedback"
    
    def __str__(self):
        user_identifier = self.user.email if self.user else f"Anonymous ({self.ip_address})"
        return f"{user_identifier} - {self.feature_name} - {self.get_rating_display()}"

class FeedbackReminder(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    feature_name = models.CharField(max_length=100)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    reminder_time = models.DateTimeField()
    is_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['reminder_time']
    
    def __str__(self):
        user_identifier = self.user.email if self.user else f"Anonymous ({self.ip_address})"
        return f"{user_identifier} - {self.feature_name} - {self.reminder_time}"
    
# class Transaction(models.Model):
#     TRANSACTION_TYPE_CHOICES = [
#         ('DEPOSIT', 'Deposit'),
#         ('WITHDRAWAL', 'Withdrawal'),
#         ('TRANSFER', 'Transfer'),
#     ]
#     STATUS_CHOICES = [
#         ('PENDING', 'Pending'),
#         ('COMPLETED', 'Completed'),
#         ('FAILED', 'Failed'),
#     ]

#     sender = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name="sent_transactions", null=True, blank=True)
#     receiver = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name="received_transactions", null=True, blank=True)
#     transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
#     amount = models.DecimalField(max_digits=12, decimal_places=2)
#     timestamp = models.DateTimeField(auto_now_add=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
#     description = models.TextField(null=True, blank=True)

#     def __str__(self):
#         return f"{self.transaction_type} - Amount: {self.amount} - Status: {self.status} - Timestamp: {self.timestamp}"



    

class PersonalInfo(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(blank=True,max_length=255)
    phonenumber = models.CharField(max_length=15, blank=True, null=True)
    email = models.CharField(blank=True, null=True)
    emailthumbnail = models.CharField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    linkedinthumbnail = models.URLField(blank=True, null=True)
    linkedin= models.URLField(blank=True, null=True)
    githubthumbnail = models.CharField(blank=True, null=True)
    github= models.URLField(blank=True, null=True)
    portfoliothumbnail = models.CharField(blank=True, null=True)
    portfolio= models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.email}'s Personal Info"

class Experience(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    role = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    from_date = models.DateField(blank=True, null=True)
    to_date = models.DateField(blank=True, null=True)  # Null if current job
    currentlyWorking = models.BooleanField(default=False)
    details=ArrayField(models.CharField(max_length=250),null=True, blank=True, default=list)
    class Meta:
        unique_together = ('user','role','company', 'from_date')
    def __str__(self):
        return f"{self.role} at {self.company}"

class Education(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    fieldOfStudy = models.CharField(max_length=255, blank=True, null=True)
    from_date = models.DateField(blank=True, null=True)
    to_date = models.DateField(blank=True, null=True)
    currentlyStuding = models.BooleanField(default=False)
    scoreType = models.CharField(max_length=50, blank=True, null=True)
    score = models.CharField(max_length=50, blank=True, null=True)
    coursework=ArrayField(models.CharField(max_length=50),null=True, blank=True, default=list)
    
    class Meta:
        unique_together = ('user','institution','degree', 'fieldOfStudy')

    def __str__(self):
        return f"{self.degree} in {self.fieldOfStudy} at {self.institution}"

class Skill(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    category = models.CharField(max_length=100)  # e.g., "Technical", "Soft Skills"
    skill_name = models.CharField(max_length=100)
    # proficiency = models.CharField(max_length=50, blank=True, null=True)
    # experience = models.CharField(max_length=50, blank=True, null=True)
    # projects = models.TextField(blank=True, null=True)
    # certifications = models.TextField(blank=True, null=True)
    # publications = models.TextField(blank=True, null=True)
    # achievements = models.TextField(blank=True, null=True)
    class Meta:
        unique_together = ('category','skill_name', 'user')

    def __str__(self):
        return f"{self.skill_name} ({self.category})"

class Project(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    details = ArrayField(models.CharField(max_length=300),null=True, blank=True, default=list)
    technologies = models.TextField(blank=True, null=True)  # Store as comma-separated values
    projectLink = models.URLField(blank=True, null=True)
    from_date = models.DateField(blank=True, null=True)
    to_date = models.DateField(blank=True, null=True)

    class Meta:
        unique_together = ('title', 'user')
    def __str__(self):
        return self.title

class Certification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True, null=True)
    authority = models.CharField(max_length=255, blank=True, null=True)
    issue_date = models.DateField(blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    credential_id = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ('name', 'user')

    def __str__(self):
        return f"{self.name}"
    
class Publications(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    journel = models.CharField(max_length=255, blank=True, null=True)
    publish_date = models.DateField(blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('title', 'user')
    def __str__(self):
        return f"{self.title} from {self.journel}"
    
class Achievement(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    link = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(blank=True, null=True)

    class Meta:
        unique_together = ('title', 'user')
    def __str__(self):
        return self.title
    
class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return self.name

class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.user.username}"
    
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in cart for {self.cart.user.username}"   
    
class Order(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"Order for {self.user.username} - Total: {self.total_amount} - Status: {self.payment_status}"
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in order for {self.order.user.username}"


class Job(models.Model):

    title = models.CharField(max_length=255)
    company = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    location = models.CharField(max_length=255,blank=True, null=True)
    job_type = models.CharField(max_length=50,blank=True, null=True)
    profession = models.CharField(max_length=50,blank=True, null=True)
    discipline = models.CharField(max_length=50,blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    skills = models.CharField(max_length=500,blank=True, null=True)
    experience = models.CharField(max_length=100,blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    applicants = models.ManyToManyField(CustomUser, through='JobApplication', related_name='applied_jobs')
    status = models.CharField(max_length=20, default='active', choices=[
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('archived', 'Archived')
    ])
    # New field to distinguish between local and scraped jobs
    is_scraped = models.BooleanField(default=False)
    # Source information for scraped jobs
    scraped_source = models.CharField(max_length=100, blank=True, null=True)
    scraped_url = models.URLField(blank=True, null=True)
    scraped_salary = models.CharField(max_length=100, blank=True, null=True)

    from django.db.models import Count
    class Meta:
        indexes = [
            models.Index(fields=['title', 'company']),
            models.Index(fields=['is_scraped', 'created_at']),  # For cleanup queries
        ]
    

    def __str__(self):
        return self.title


class EnhancedSalary(models.Model):
    """Model to store enhanced salary information from multiple sources"""
    job_title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    
    # Consolidated salary data
    average_base_salary = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    average_total_comp = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    currency = models.CharField(max_length=10, default='USD')
    confidence = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High')
    ], default='low')
    
    # Source details stored as JSON
    source_details = models.JSONField(default=dict, help_text="Detailed salary information from each source")
    
    # Metadata
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['job_title', 'company_name']),
            models.Index(fields=['confidence', 'last_updated']),
        ]
        unique_together = ('job_title', 'company_name', 'location')
    
    def __str__(self):
        return f"{self.job_title} at {self.company_name} - ${self.average_base_salary or 'N/A'}"
    
    @property
    def formatted_salary(self):
        """Return formatted salary string"""
        if self.average_base_salary:
            return f"${self.average_base_salary:,.2f} {self.currency}"
        return "Not specified"
    
    @property
    def days_old(self):
        """Return the number of days since the salary was last updated"""
        from django.utils import timezone
        return (timezone.now() - self.last_updated).days


class ScrapedJob(models.Model):
    """Model to store scraped jobs from external sources"""
    title = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)  # Company name as string, not FK
    location = models.CharField(max_length=255, blank=True, null=True)
    job_type = models.CharField(max_length=50, blank=True, null=True)
    profession = models.CharField(max_length=50, blank=True, null=True)
    discipline = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    experience = models.CharField(max_length=100, blank=True, null=True)
    # Removed basic salary field - not needed for scraped data
    source = models.CharField(max_length=100)  # e.g., 'RemoteOK', 'LinkedIn', 'Indeed'
    source_url = models.URLField(blank=True, null=True)
    scraped_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)  # For soft deletion
    

    
    class Meta:
        indexes = [
            models.Index(fields=['source', 'scraped_at']),
            models.Index(fields=['is_active', 'scraped_at']),
        ]
        # Prevent duplicate jobs from same source
        unique_together = ('title', 'company_name', 'source')
    
    def __str__(self):
        return f"{self.title} at {self.company_name} from {self.source}"
    
    @property
    def days_old(self):
        """Return the number of days since the job was scraped"""
        from django.utils import timezone
        return (timezone.now() - self.scraped_at).days
    



class JobApplication(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("interviewed", "Interviewed"),
        ("shortlisted", "Shortlisted"),
        ("rejected", "Rejected"),
    ]

    applicantName= models.CharField(max_length=255, blank=True, null=True)
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    phone = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    experience= models.CharField(max_length=100, blank=True, null=True)
    currentPosition = models.CharField(max_length=100, blank=True, null=True)
    currentCompany = models.CharField(max_length=100, blank=True, null=True)
    currentLocation = models.CharField(max_length=100, blank=True, null=True)
    expectedSalary = models.CharField(max_length=50, blank=True, null=True)
    applicant = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    skills = ArrayField(models.CharField(max_length=100), blank=True, null=True, default=list)
    resume = models.TextField(max_length=500, blank=True, null=True)
    cover_letter = models.TextField(max_length=1502,blank=True, null=True)
    availability = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    applied_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('applicant', 'job')
    def __str__(self):
        return f"{self.applicant.email} applied for {self.job.title} in {self.job.company.email.split('@')[1].split('.')[0]} - Status: {self.status}"

class InterviewSlot(models.Model):
    """Model to store available interview time slots"""
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.IntegerField(default=30)
    max_bookings = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('date', 'start_time')
        ordering = ['date', 'start_time']
    
    def __str__(self):
        return f"{self.date} {self.start_time}-{self.end_time}"
    
    @property
    def is_available(self):
        """Check if slot has available capacity"""
        return self.interviewbookings.count() < self.max_bookings
    
    @property
    def available_capacity(self):
        """Return available capacity"""
        return max(0, self.max_bookings - self.interviewbookings.count())


class InterviewBooking(models.Model):
    """Model to store user interview bookings"""
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='interview_bookings')
    slot = models.ForeignKey(InterviewSlot, on_delete=models.CASCADE, related_name='interviewbookings')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    meeting_link = models.URLField(blank=True, null=True)
    meeting_id = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'slot')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.slot.date} {self.slot.start_time}"
    
    def save(self, *args, **kwargs):
        # Don't auto-generate meeting link here - it will be created by the service
        super().save(*args, **kwargs)
    
    def create_google_calendar_event(self):
        """Create real Google Calendar event with Google Meet"""
        try:
            from .services.google_calendar import google_calendar_service
            
            # Get user details
            user_name = f"{self.user.first_name or ''} {self.user.last_name or ''}".strip()
            if not user_name:
                user_name = self.user.email.split('@')[0]
            
            print(f"🔍 Debug: Creating calendar event for {user_name} ({self.user.email})")
            print(f"🔍 Debug: Slot details - Date: {self.slot.date}, Time: {self.slot.start_time}-{self.slot.end_time}")
            
            # Create calendar event
            result = google_calendar_service.create_interview_event(
                user_email=self.user.email,
                user_name=user_name,
                slot_date=self.slot.date,
                start_time=self.slot.start_time,
                end_time=self.slot.end_time,
                duration_minutes=self.slot.duration_minutes,
                notes=self.notes or ""
            )
            
            print(f"🔍 Debug: Calendar service result: {result}")
            
            if result['success']:
                # Update the booking with real meeting details
                self.meeting_link = result['meet_link']
                self.meeting_id = result['meeting_id']  # Fixed: was using event_id instead of meeting_id
                self.save(update_fields=['meeting_link', 'meeting_id'])
                
                print(f"✅ Updated booking with meeting link: {self.meeting_link}")
                print(f"✅ Meeting ID: {self.meeting_id}")
                
                return result
            else:
                print(f"❌ Failed to create calendar event: {result.get('error')}")
                return result
                
        except Exception as e:
            print(f"❌ Error creating Google Calendar event: {e}")
            import traceback
            traceback.print_exc()
            
            # NO FALLBACK - return error so we can see the real issue
            return {
                'success': False,
                'error': f'Google Calendar API failed: {str(e)}',
                'details': 'No fallback links generated - this is intentional for debugging'
            }
    
    def send_confirmation_emails(self):
        """Send confirmation emails to user and team"""
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            from django.template.loader import render_to_string
            from django.core.mail import EmailMultiAlternatives
            
            # Prepare context for templates
            user_name = f"{self.user.first_name or ''} {self.user.last_name or ''}".strip()
            if not user_name:
                user_name = self.user.email.split('@')[0]
            
            context = {
                'user_name': user_name,
                'user_email': self.user.email,
                'slot_date': self.slot.date,
                'start_time': self.slot.start_time,
                'end_time': self.slot.end_time,
                'duration_minutes': self.slot.duration_minutes,
                'meeting_link': self.meeting_link,
                'notes': self.notes or 'No notes provided',
            }
            
            # Email to user - Using template
            user_subject = f"🎯 Interview Practice Session Confirmed - {self.slot.date.strftime('%B %d, %Y')}"
            
            # Render templates
            user_html_message = render_to_string('emails/interview_confirmation_user.html', context)
            user_text_message = render_to_string('emails/interview_confirmation_user.txt', context)
            
            # Send HTML email
            email = EmailMultiAlternatives(
                user_subject,
                user_text_message,
                settings.DEFAULT_FROM_EMAIL,
                [self.user.email]
            )
            email.attach_alternative(user_html_message, "text/html")
            email.send()
            
            # Email to team - Using template
            team_subject = f"📋 New Interview Booking - {self.user.email}"
            team_html_message = render_to_string('emails/interview_confirmation_team.html', context)
            team_text_message = render_to_string('emails/interview_confirmation_team.txt', context)
            
            # Send team email
            team_email = EmailMultiAlternatives(
                team_subject,
                team_text_message,
                settings.DEFAULT_FROM_EMAIL,
                ['reserish@gmail.com']
            )
            team_email.attach_alternative(team_html_message, "text/html")
            team_email.send()
            
            return True
        except Exception as e:
            print(f"Failed to send confirmation emails: {e}")
            import traceback
            traceback.print_exc()
            return False


class InterviewSession(models.Model):
    """Model to store interview session details"""
    booking = models.OneToOneField(InterviewBooking, on_delete=models.CASCADE, related_name='session')
    interviewer_name = models.CharField(max_length=255, default='AI Interview Coach')
    interviewer_email = models.EmailField(blank=True, null=True)
    session_notes = models.TextField(blank=True)
    feedback_score = models.IntegerField(blank=True, null=True, help_text="Rating from 1-5")
    feedback_comments = models.TextField(blank=True)
    started_at = models.DateTimeField(blank=True, null=True)
    ended_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Session for {self.booking.user.email} on {self.booking.slot.date}"
    
    @property
    def duration_minutes(self):
        """Calculate actual session duration"""
        if self.started_at and self.ended_at:
            return int((self.ended_at - self.started_at).total_seconds() / 60)
        return 0


class InterviewConversation(models.Model):
    """Model to store AI interview conversation data"""
    session = models.OneToOneField(InterviewSession, on_delete=models.CASCADE, related_name='conversation')
    job_description = models.TextField(blank=True, help_text="Job description for context")
    user_resume_summary = models.TextField(blank=True, help_text="Summary of user's resume for context")
    conversation_data = models.JSONField(default=list, help_text="Stored conversation in JSON format")
    ai_evaluation = models.JSONField(default=dict, help_text="AI evaluation of the interview")
    overall_score = models.IntegerField(blank=True, null=True, help_text="Overall interview score (1-10)")
    strengths = models.JSONField(default=list, help_text="List of user's strengths identified")
    areas_for_improvement = models.JSONField(default=list, help_text="Areas for improvement")
    recommendations = models.TextField(blank=True, help_text="AI recommendations for improvement")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Conversation for {self.session.booking.user.email} on {self.session.booking.slot.date}"
    
    @property
    def total_questions(self):
        """Get total number of questions asked"""
        return len([msg for msg in self.conversation_data if msg.get('type') == 'question'])
    
    @property
    def total_user_responses(self):
        """Get total number of user responses"""
        return len([msg for msg in self.conversation_data if msg.get('type') == 'user_response'])


class AIInterviewQuestion(models.Model):
    """Model to store AI-generated interview questions"""
    QUESTION_TYPES = [
        ('behavioral', 'Behavioral'),
        ('technical', 'Technical'),
        ('situational', 'Situational'),
        ('general', 'General'),
        ('role_specific', 'Role Specific'),
    ]
    
    DIFFICULTY_LEVELS = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='general')
    difficulty_level = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default='medium')
    job_role = models.CharField(max_length=100, blank=True, help_text="Target job role for this question")
    skills_required = models.JSONField(default=list, help_text="Skills this question tests")
    expected_answer_points = models.JSONField(default=list, help_text="Key points expected in answer")
    ai_generated = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.question_type.title()} Question: {self.question_text[:50]}..."


class InterviewQuestionResponse(models.Model):
    """Model to store individual question-answer pairs with AI evaluation"""
    conversation = models.ForeignKey(InterviewConversation, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(AIInterviewQuestion, on_delete=models.CASCADE, related_name='responses')
    question_text = models.TextField(help_text="The actual question asked")
    user_response = models.TextField(help_text="User's verbal response")
    ai_evaluation = models.JSONField(default=dict, help_text="AI evaluation of the response")
    score = models.IntegerField(blank=True, null=True, help_text="Score for this response (1-10)")
    feedback = models.TextField(blank=True, help_text="AI feedback on the response")
    strengths = models.JSONField(default=list, help_text="Strengths in the response")
    improvements = models.JSONField(default=list, help_text="Areas for improvement")
    follow_up_questions = models.JSONField(default=list, help_text="Suggested follow-up questions")
    response_duration = models.IntegerField(blank=True, null=True, help_text="Response duration in seconds")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Response to '{self.question_text[:30]}...' by {self.conversation.session.booking.user.email}"


class ReferralCode(models.Model):
    """Model to store user referral codes"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='referral_code')
    code = models.CharField(max_length=20, unique=True, help_text="Unique referral code")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.code}"
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_unique_code()
        super().save(*args, **kwargs)
    
    def generate_unique_code(self):
        """Generate a unique referral code"""
        import random
        import string
        
        while True:
            # Generate 8-character code with letters and numbers
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not ReferralCode.objects.filter(code=code).exists():
                return code
    
    @property
    def referral_link(self):
        """Generate referral link"""
        from django.conf import settings
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        return f"{base_url}/u/signup?ref={self.code}"


class UserReferral(models.Model):
    """Model to track referrals made by users"""
    referrer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='referrals_made')
    referred_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='referred_by')
    referral_code = models.ForeignKey(ReferralCode, on_delete=models.CASCADE, related_name='referrals')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('referrer', 'referred_user')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.referrer.email} referred {self.referred_user.email}"


class ReferralAchievement(models.Model):
    """Model to define referral achievement thresholds and rewards"""
    name = models.CharField(max_length=100, help_text="Achievement name (e.g., 'First Referral', 'Referral Master')")
    description = models.TextField(help_text="Description of the achievement")
    threshold = models.IntegerField(help_text="Number of referrals required to unlock this achievement")
    reward_type = models.CharField(max_length=50, choices=[
        ('badge', 'Badge'),
        ('discount', 'Discount'),
        ('premium_days', 'Premium Days'),
        ('points', 'Points'),
        ('special_access', 'Special Access')
    ], help_text="Type of reward")
    reward_value = models.CharField(max_length=100, help_text="Value of the reward (e.g., '10%', '30 days', '100 points')")
    icon = models.CharField(max_length=50, default="🏆", help_text="Icon for the achievement")
    color = models.CharField(max_length=20, default="gold", help_text="Color theme for the achievement")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['threshold']
    
    def __str__(self):
        return f"{self.name} ({self.threshold} referrals)"


class UserReferralAchievement(models.Model):
    """Model to track user's unlocked achievements"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='referral_achievements')
    achievement = models.ForeignKey(ReferralAchievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)
    is_claimed = models.BooleanField(default=False)
    claimed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('user', 'achievement')
        ordering = ['-unlocked_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.achievement.name}"
    
    def claim_reward(self):
        """Mark achievement as claimed"""
        if not self.is_claimed:
            self.is_claimed = True
            self.claimed_at = timezone.now()
            self.save()


class ReferralLeaderboard(models.Model):
    """Model to store referral leaderboard data (updated periodically)"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='leaderboard_entries')
    referral_count = models.IntegerField(help_text="Total number of referrals")
    rank = models.IntegerField(help_text="Current rank in leaderboard")
    period = models.CharField(max_length=20, choices=[
        ('all_time', 'All Time'),
        ('monthly', 'Monthly'),
        ('weekly', 'Weekly')
    ], default='all_time')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'period')
        ordering = ['rank', '-referral_count']
    
    def __str__(self):
        return f"{self.user.email} - Rank {self.rank} ({self.referral_count} referrals)"


class ReferralCodeApplication(models.Model):
    """Model to track when users apply referral codes"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='referral_application')
    applied_referral_code = models.ForeignKey(ReferralCode, on_delete=models.CASCADE, related_name='applications')
    applied_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.user.email} applied {self.applied_referral_code.code} on {self.applied_at}"

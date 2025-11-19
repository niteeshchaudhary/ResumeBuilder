from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backend.models import InterviewSlot, InterviewBooking, InterviewSession
from django.utils import timezone
from datetime import date, time

CustomUser = get_user_model()

class Command(BaseCommand):
    help = 'Test interview email functionality'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Email to send test to')

    def handle(self, *args, **options):
        self.stdout.write('🧪 Testing Interview Email System...')
        
        # Get or create a test user
        test_email = options.get('email') or 'test@example.com'
        user, created = CustomUser.objects.get_or_create(
            email=test_email,
            defaults={
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(f'✅ Created test user: {user.email}')
        else:
            self.stdout.write(f'✅ Using existing user: {user.email}')
        
        # Create a test slot
        tomorrow = date.today().replace(day=date.today().day + 1)
        slot, created = InterviewSlot.objects.get_or_create(
            date=tomorrow,
            start_time=time(10, 0),  # 10:00 AM
            defaults={
                'end_time': time(11, 0),  # 11:00 AM
                'duration_minutes': 60,
                'max_bookings': 1,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(f'✅ Created test slot: {slot}')
        else:
            self.stdout.write(f'✅ Using existing slot: {slot}')
        
        # Create a test booking
        booking, created = InterviewBooking.objects.get_or_create(
            user=user,
            slot=slot,
            defaults={
                'notes': 'Test interview booking',
                'status': 'confirmed'
            }
        )
        
        if created:
            self.stdout.write(f'✅ Created test booking: {booking}')
        else:
            self.stdout.write(f'✅ Using existing booking: {booking}')
        
        # Test meeting link generation
        self.stdout.write(f'🔗 Meeting Link: {booking.meeting_link}')
        self.stdout.write(f'🆔 Meeting ID: {booking.meeting_id}')
        
        # Test email sending
        self.stdout.write('📧 Testing email sending...')
        try:
            email_sent = booking.send_confirmation_emails()
            if email_sent:
                self.stdout.write('✅ Emails sent successfully!')
                self.stdout.write(f'   - User email: {user.email}')
                self.stdout.write(f'   - Team email: reserish@gmail.com')
            else:
                self.stdout.write('❌ Email sending failed')
        except Exception as e:
            self.stdout.write(f'❌ Email error: {e}')
        
        # Create session
        session, created = InterviewSession.objects.get_or_create(
            booking=booking,
            defaults={
                'interviewer_name': 'AI Interview Coach'
            }
        )
        
        if created:
            self.stdout.write(f'✅ Created test session: {session}')
        else:
            self.stdout.write(f'✅ Using existing session: {session}')
        
        self.stdout.write('🎉 Test completed!')
        self.stdout.write('')
        self.stdout.write('📋 Summary:')
        self.stdout.write(f'   User: {user.email}')
        self.stdout.write(f'   Slot: {slot.date} at {slot.start_time}')
        self.stdout.write(f'   Meeting: {booking.meeting_link}')
        self.stdout.write(f'   Status: {booking.status}')

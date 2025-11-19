from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta, time
from backend.models import InterviewSlot

class Command(BaseCommand):
    help = 'Seed sample interview slots for the next 30 days'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample interview slots...')
        
        # Clear existing slots
        InterviewSlot.objects.all().delete()
        
        # Generate slots for next 30 days
        start_date = timezone.now().date()
        slots_created = 0
        
        for i in range(30):
            current_date = start_date + timedelta(days=i)
            
            # Skip weekends (Saturday = 5, Sunday = 6)
            if current_date.weekday() >= 5:
                continue
            
            # Create 3-5 slots per day between 9 AM and 6 PM
            num_slots = 4 if current_date.weekday() < 5 else 2
            
            for j in range(num_slots):
                # Start times: 9 AM, 11 AM, 2 PM, 4 PM
                start_hours = [9, 11, 14, 16]
                if j < len(start_hours):
                    start_hour = start_hours[j]
                    start_time = time(start_hour, 0)
                    end_time = time(start_hour + 1, 0)  # 1 hour duration
                    
                    slot = InterviewSlot.objects.create(
                        date=current_date,
                        start_time=start_time,
                        end_time=end_time,
                        duration_minutes=60,
                        max_bookings=1,
                        is_active=True
                    )
                    slots_created += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {slots_created} interview slots')
        )

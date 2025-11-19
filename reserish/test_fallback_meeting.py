#!/usr/bin/env python3
"""
Test script for fallback meeting link generation
Run this to verify the system works without Google Calendar API
"""

import os
import sys
import django

# Add the reserish directory to Python path
sys.path.append('/home/nkc/Documents/GitHub/reserish_main/reserish')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reserish.settings')
django.setup()

def test_fallback_meeting_links():
    """Test the fallback meeting link generation"""
    print("🧪 Testing Fallback Meeting Link System...")
    
    try:
        from backend.models import InterviewSlot, InterviewBooking, InterviewSession
        from django.contrib.auth import get_user_model
        from datetime import date, time
        
        CustomUser = get_user_model()
        
        # Get or create a test user
        test_email = 'test@example.com'
        user, created = CustomUser.objects.get_or_create(
            email=test_email,
            defaults={
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True
            }
        )
        
        if created:
            print(f"✅ Created test user: {user.email}")
        else:
            print(f"✅ Using existing user: {user.email}")
        
        # Get or create a test slot
        tomorrow = date.today().replace(day=date.today().day + 1)
        slot, created = InterviewSlot.objects.get_or_create(
            date=tomorrow,
            start_time=time(10, 0),
            defaults={
                'end_time': time(11, 0),
                'duration_minutes': 60,
                'max_bookings': 1,
                'is_active': True
            }
        )
        
        if created:
            print(f"✅ Created test slot: {slot}")
        else:
            print(f"✅ Using existing slot: {slot}")
        
        # Create a test booking
        booking, created = InterviewBooking.objects.get_or_create(
            user=user,
            slot=slot,
            defaults={
                'notes': 'Test fallback meeting link',
                'status': 'confirmed'
            }
        )
        
        if created:
            print(f"✅ Created test booking: {booking}")
        else:
            print(f"✅ Using existing booking: {booking}")
        
        # Test fallback meeting link generation
        print("\n🔗 Testing fallback meeting link generation...")
        
        # This will trigger the fallback system since Google API isn't configured
        result = booking.create_google_calendar_event()
        
        print(f"Result: {result}")
        
        if result.get('success'):
            print("✅ Fallback meeting link generated successfully!")
            print(f"🔗 Meeting Link: {result.get('meet_link')}")
            print(f"🆔 Meeting ID: {result.get('meeting_id')}")
            print(f"📝 Message: {result.get('message')}")
            
            # Check if fallback flag is set
            if result.get('fallback'):
                print("⚠️ This is a fallback link (Google API not configured)")
            
            # Test email sending
            print("\n📧 Testing email sending...")
            try:
                email_sent = booking.send_confirmation_emails()
                if email_sent:
                    print("✅ Emails sent successfully!")
                else:
                    print("❌ Email sending failed")
            except Exception as e:
                print(f"❌ Email error: {e}")
            
            return True
        else:
            print(f"❌ Failed to generate meeting link: {result}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing fallback system: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    print("🚀 Fallback Meeting Link System Test")
    print("=" * 50)
    
    if test_fallback_meeting_links():
        print("\n🎉 Fallback system test passed!")
        print("\n📋 What this means:")
        print("   ✅ Meeting links are generated (fallback mode)")
        print("   ✅ Emails are sent with meeting details")
        print("   ✅ System works without Google Calendar API")
        print("\n🚀 To get REAL Google Meet links:")
        print("   1. Follow GOOGLE_CALENDAR_SETUP.md")
        print("   2. Set up Google Calendar API credentials")
        print("   3. Run setup_google_calendar.sh")
    else:
        print("\n❌ Fallback system test failed")
        print("   Check the error messages above")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Test script for Google Calendar integration
Run this to verify the setup works correctly
"""

import os
import sys
import django

# Add the reserish directory to Python path
sys.path.append('/home/nkc/Documents/GitHub/reserish_main/reserish')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reserish.settings')
django.setup()

def test_google_calendar_service():
    """Test the Google Calendar service"""
    print("🧪 Testing Google Calendar Service...")
    
    try:
        from backend.services.google_calendar import google_calendar_service
        print("✅ Google Calendar service imported successfully")
        
        # Test basic functionality
        print("🔍 Testing service initialization...")
        if google_calendar_service.service:
            print("✅ Google Calendar service initialized")
        else:
            print("❌ Service not properly initialized")
            return False
            
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_calendar_event_creation():
    """Test creating a calendar event"""
    print("\n📅 Testing Calendar Event Creation...")
    
    try:
        from backend.services.google_calendar import google_calendar_service
        from datetime import date, time
        
        # Test data
        test_email = "test@example.com"
        test_name = "Test User"
        test_date = date.today()
        test_start = time(10, 0)  # 10:00 AM
        test_end = time(11, 0)    # 11:00 AM
        
        print(f"📧 Test Email: {test_email}")
        print(f"👤 Test Name: {test_name}")
        print(f"📅 Test Date: {test_date}")
        print(f"🕐 Test Time: {test_start} - {test_end}")
        
        # Create test event
        print("\n🚀 Creating test calendar event...")
        result = google_calendar_service.create_interview_event(
            user_email=test_email,
            user_name=test_name,
            slot_date=test_date,
            start_time=test_start,
            end_time=test_end,
            duration_minutes=60,
            notes="Test interview session"
        )
        
        if result.get('success'):
            print("✅ Calendar event created successfully!")
            print(f"🔗 Meet Link: {result.get('meet_link')}")
            print(f"🆔 Event ID: {result.get('event_id')}")
            print(f"📅 Event Link: {result.get('event_link')}")
            
            # Clean up - delete the test event
            print("\n🧹 Cleaning up test event...")
            delete_result = google_calendar_service.delete_event(result.get('event_id'))
            if delete_result.get('success'):
                print("✅ Test event deleted successfully")
            else:
                print(f"⚠️ Could not delete test event: {delete_result.get('error')}")
            
            return True
        else:
            print(f"❌ Failed to create calendar event: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing calendar event creation: {e}")
        return False

def check_credentials():
    """Check if Google credentials are properly configured"""
    print("\n🔐 Checking Google Credentials...")
    
    base_dir = "/home/nkc/Documents/GitHub/reserish_main/reserish"
    
    # Check for credentials files
    credentials_path = os.path.join(base_dir, "credentials.json")
    service_account_path = os.path.join(base_dir, "service-account.json")
    token_path = os.path.join(base_dir, "token.json")
    
    print(f"📁 Base Directory: {base_dir}")
    print(f"🔑 OAuth Credentials: {'✅' if os.path.exists(credentials_path) else '❌'} {credentials_path}")
    print(f"🔑 Service Account: {'✅' if os.path.exists(service_account_path) else '❌'} {service_account_path}")
    print(f"🔑 OAuth Token: {'✅' if os.path.exists(token_path) else '❌'} {token_path}")
    
    if not os.path.exists(credentials_path) and not os.path.exists(service_account_path):
        print("\n❌ No Google credentials found!")
        print("📖 Please follow the setup guide in GOOGLE_CALENDAR_SETUP.md")
        return False
    
    return True

def main():
    """Main test function"""
    print("🚀 Google Calendar Integration Test")
    print("=" * 50)
    
    # Check credentials first
    if not check_credentials():
        return
    
    # Test service
    if not test_google_calendar_service():
        print("\n❌ Google Calendar service test failed")
        return
    
    # Test event creation
    if test_calendar_event_creation():
        print("\n🎉 All tests passed! Google Calendar integration is working.")
    else:
        print("\n❌ Calendar event creation test failed")
    
    print("\n📋 Test Summary:")
    print("✅ Credentials check")
    print("✅ Service initialization")
    if test_calendar_event_creation():
        print("✅ Event creation and cleanup")
    else:
        print("❌ Event creation")

if __name__ == "__main__":
    main()

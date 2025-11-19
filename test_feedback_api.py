#!/usr/bin/env python3
"""
Test script for the Feedback System API endpoints
Run this script to test if the backend feedback system is working correctly
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/reserish/api/feedback"

def test_submit_feedback():
    """Test submitting feedback"""
    print("🧪 Testing: Submit Feedback")
    
    feedback_data = {
        "feature_name": "Test Feature",
        "rating": 5,
        "detailed_feedback": "This is a test feedback from the test script!"
    }
    
    try:
        response = requests.post(f"{API_BASE}/submit/", json=feedback_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Feedback submitted successfully!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Failed to submit feedback: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    
    print("-" * 50)

def test_get_feedback_stats():
    """Test getting feedback statistics"""
    print("🧪 Testing: Get Feedback Stats")
    
    try:
        response = requests.get(f"{API_BASE}/stats/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Stats retrieved successfully!")
            stats = response.json()
            print(f"Total Feedback: {stats['stats']['total_feedback']}")
            print(f"Average Rating: {stats['stats']['average_rating']}")
        else:
            print(f"❌ Failed to get stats: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    
    print("-" * 50)

def test_schedule_reminder():
    """Test scheduling a feedback reminder"""
    print("🧪 Testing: Schedule Feedback Reminder")
    
    reminder_time = (datetime.now() + timedelta(hours=1)).isoformat()
    
    reminder_data = {
        "feature_name": "Test Feature",
        "reminder_time": reminder_time
    }
    
    try:
        response = requests.post(f"{API_BASE}/reminder/", json=reminder_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Reminder scheduled successfully!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Failed to schedule reminder: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    
    print("-" * 50)

def test_invalid_feedback():
    """Test submitting invalid feedback"""
    print("🧪 Testing: Invalid Feedback (should fail)")
    
    invalid_data = {
        "feature_name": "",  # Empty feature name
        "rating": 10,        # Invalid rating
        "detailed_feedback": "This should fail"
    }
    
    try:
        response = requests.post(f"{API_BASE}/submit/", json=invalid_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print("✅ Correctly rejected invalid feedback!")
            print(f"Errors: {response.json()}")
        else:
            print(f"❌ Should have failed but got: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    
    print("-" * 50)

def main():
    """Run all tests"""
    print("🚀 Starting Feedback System API Tests")
    print("=" * 50)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Server is running at {BASE_URL}")
        print(f"Server response: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Server is not running at {BASE_URL}")
        print(f"Error: {e}")
        print("Please start the Django server first:")
        print("cd reserish && python manage.py runserver")
        return
    
    print("-" * 50)
    
    # Run tests
    test_submit_feedback()
    test_get_feedback_stats()
    test_schedule_reminder()
    test_invalid_feedback()
    
    print("🎉 All tests completed!")
    print("\n📝 Next steps:")
    print("1. Check the Django admin panel for feedback entries")
    print("2. Test the frontend feedback components")
    print("3. Verify the feedback modal appears in the browser")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Test script for Interview Scheduling API endpoints
Run this after setting up the Django backend
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
API_ENDPOINTS = {
    'slots': f"{BASE_URL}/api/interview/slots/",
    'bookings': f"{BASE_URL}/api/interview/bookings/",
    'book': f"{BASE_URL}/api/interview/book/",
    'cancel': f"{BASE_URL}/api/interview/cancel/",
}

def test_get_slots():
    """Test getting available interview slots"""
    print("Testing GET /api/interview/slots/")
    try:
        response = requests.get(API_ENDPOINTS['slots'])
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            print(f"Slots found: {len(data.get('slots', []))}")
            if data.get('slots'):
                print("Sample slot:", json.dumps(data['slots'][0], indent=2, default=str))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
    print()

def test_get_bookings():
    """Test getting user bookings (requires authentication)"""
    print("Testing GET /api/interview/bookings/")
    try:
        response = requests.get(API_ENDPOINTS['bookings'])
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print("Expected: Authentication required")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
    print()

def test_book_slot():
    """Test booking an interview slot (requires authentication)"""
    print("Testing POST /api/interview/book/")
    try:
        data = {
            'slot_id': 1,
            'notes': 'Test booking'
        }
        response = requests.post(API_ENDPOINTS['book'], json=data)
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print("Expected: Authentication required")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
    print()

def test_slot_details():
    """Test getting slot details"""
    print("Testing GET /api/interview/slots/1/")
    try:
        response = requests.get(f"{BASE_URL}/api/interview/slots/1/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            print(f"Slot data: {json.dumps(data.get('slot', {}), indent=2, default=str)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
    print()

if __name__ == "__main__":
    print("Interview API Test Script")
    print("=" * 50)
    
    test_get_slots()
    test_get_bookings()
    test_book_slot()
    test_slot_details()
    
    print("Test completed!")

#!/usr/bin/env python3
"""
Test script to verify all required modules for Celery can be imported
Run this to check for missing dependencies before building the Docker image
"""

import sys
import os

# Add the reserish directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'reserish'))

def test_imports():
    """Test all required imports for Celery functionality"""
    
    print("🧪 Testing Celery imports...")
    
    # Core Django imports
    try:
        import django
        print("✅ Django imported successfully")
    except ImportError as e:
        print(f"❌ Django import failed: {e}")
        return False
    
    try:
        from django.conf import settings
        print("✅ Django settings imported successfully")
    except ImportError as e:
        print(f"❌ Django settings import failed: {e}")
        return False
    
    # Celery imports
    try:
        import celery
        print("✅ Celery imported successfully")
    except ImportError as e:
        print(f"❌ Celery import failed: {e}")
        return False
    
    try:
        from celery import Celery
        print("✅ Celery.Celery imported successfully")
    except ImportError as e:
        print(f"❌ Celery.Celery import failed: {e}")
        return False
    
    # Django Celery extensions
    try:
        import django_celery_beat
        print("✅ django_celery_beat imported successfully")
    except ImportError as e:
        print(f"❌ django_celery_beat import failed: {e}")
        return False
    
    try:
        import django_celery_results
        print("✅ django_celery_results imported successfully")
    except ImportError as e:
        print(f"❌ django_celery_results import failed: {e}")
        return False
    
    # Django REST framework
    try:
        import rest_framework
        print("✅ rest_framework imported successfully")
    except ImportError as e:
        print(f"❌ rest_framework import failed: {e}")
        return False
    
    try:
        import rest_framework_simplejwt
        print("✅ rest_framework_simplejwt imported successfully")
    except ImportError as e:
        print(f"❌ rest_framework_simplejwt import failed: {e}")
        return False
    
    # CORS headers
    try:
        import corsheaders
        print("✅ corsheaders imported successfully")
    except ImportError as e:
        print(f"❌ corsheaders import failed: {e}")
        return False
    
    # Channels
    try:
        import channels
        print("✅ channels imported successfully")
    except ImportError as e:
        print(f"❌ channels import failed: {e}")
        return False
    
    # WhiteNoise
    try:
        import whitenoise
        print("✅ whitenoise imported successfully")
    except ImportError as e:
        print(f"❌ whitenoise import failed: {e}")
        return False
    
    # Database connections
    try:
        import psycopg2
        print("✅ psycopg2 imported successfully")
    except ImportError as e:
        print(f"❌ psycopg2 import failed: {e}")
        return False
    
    try:
        import pymongo
        print("✅ pymongo imported successfully")
    except ImportError as e:
        print(f"❌ pymongo import failed: {e}")
        return False
    
    # Redis
    try:
        import redis
        print("✅ redis imported successfully")
    except ImportError as e:
        print(f"❌ redis import failed: {e}")
        return False
    
    # Web scraping
    try:
        import selenium
        print("✅ selenium imported successfully")
    except ImportError as e:
        print(f"❌ selenium import failed: {e}")
        return False
    
    try:
        import bs4
        print("✅ beautifulsoup4 imported successfully")
    except ImportError as e:
        print(f"❌ beautifulsoup4 import failed: {e}")
        return False
    
    # Test Django setup
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reserish.settings')
        django.setup()
        print("✅ Django setup completed successfully")
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return False
    
    print("\n🎉 All imports successful! Celery should work properly.")
    return True

if __name__ == "__main__":
    success = test_imports()
    if not success:
        print("\n❌ Some imports failed. Check the requirements file.")
        sys.exit(1)
    else:
        print("\n✅ All tests passed!")


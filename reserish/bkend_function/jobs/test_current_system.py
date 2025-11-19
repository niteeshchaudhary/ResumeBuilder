#!/usr/bin/env python3
"""
Test script for the current job scraping system
"""

import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_job_scraper import scrape_jobs_with_filters

def test_current_system():
    """Test the current job scraping system"""
    print("🧪 Testing Current Job Scraping System...")
    print("=" * 60)
    
    # Test filters
    test_filters = {
        'profession': 'Software',
        'discipline': 'Computer Science'
    }
    
    print(f"📋 Test Filters: {test_filters}")
    print("⏳ Starting job scraping...")
    
    try:
        # Scrape jobs
        jobs = scrape_jobs_with_filters(test_filters, 10)
        
        if jobs:
            print(f"✅ Successfully scraped {len(jobs)} jobs!")
            print("\n📊 Job Summary:")
            print("-" * 30)
            
            for i, job in enumerate(jobs, 1):
                print(f"{i}. {job['title']}")
                print(f"   Company: {job['company']}")
                print(f"   Location: {job['location']}")
                print(f"   Salary: {job['salary']}")
                print(f"   Source: {job['source']}")
                print()
                
        else:
            print("❌ No jobs were scraped")
            
    except Exception as e:
        print(f"❌ Error during scraping: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

def test_simple_scraper_only():
    """Test only the simple scraper"""
    print("\n🌐 Testing Simple Scraper Only...")
    print("=" * 50)
    
    try:
        # Import the simple scraper
        from simple_job_scraper import scrape_jobs_simple
        
        # Test filters
        test_filters = {
            'profession': 'Software',
            'discipline': 'Computer Science'
        }
        
        print(f"📋 Test Filters: {test_filters}")
        jobs = scrape_jobs_simple(test_filters, 10)
        
        if jobs:
            print(f"✅ Simple scraper found {len(jobs)} jobs!")
            print("\n📊 Simple Scraper Results:")
            print("-" * 30)
            
            for i, job in enumerate(jobs, 1):
                print(f"{i}. {job['title']}")
                print(f"   Company: {job['company']}")
                print(f"   Location: {job['location']}")
                print(f"   Source: {job['source']}")
                print()
                
        else:
            print("❌ Simple scraper found no jobs")
            
    except Exception as e:
        print(f"❌ Error with simple scraper: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Current Job Scraping System Test Suite")
    print("=" * 60)
    
    # Test the current system
    success = test_current_system()
    
    if success:
        print("\n🎉 Current system testing completed!")
    else:
        print("\n⚠️ Current system had issues")
    
    # Test simple scraper only
    simple_success = test_simple_scraper_only()
    
    if simple_success:
        print("\n✅ Simple scraper testing completed!")
    else:
        print("\n❌ Simple scraper testing failed!")
    
    print("\n🔍 Test session completed. Check the output above for any issues.")

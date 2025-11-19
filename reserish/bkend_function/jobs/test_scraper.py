#!/usr/bin/env python3
"""
Test script for the enhanced job scraper
"""

import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_job_scraper import scrape_jobs_with_filters

def test_basic_scraping():
    """Test basic job scraping functionality"""
    print("🧪 Testing Enhanced Job Scraper...")
    print("=" * 50)
    
    # Test filters
    test_filters = {
        'location': 'San Francisco',
        'jobType': 'Full-Time',
        'experience': '3-5 Years',
        'profession': 'Engineering',
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
            
            for i, job in enumerate(jobs[:5], 1):  # Show first 5 jobs
                print(f"{i}. {job['title']}")
                print(f"   Company: {job['company']}")
                print(f"   Location: {job['location']}")
                print(f"   Salary: {job['salary']}")
                print(f"   Source: {job['source']}")
                print()
            
            if len(jobs) > 5:
                print(f"... and {len(jobs) - 5} more jobs")
                
        else:
            print("❌ No jobs were scraped")
            
    except Exception as e:
        print(f"❌ Error during scraping: {e}")
        return False
    
    return True

def test_filter_variations():
    """Test different filter combinations"""
    print("\n🔍 Testing Filter Variations...")
    print("=" * 50)
    
    filter_combinations = [
        {
            'location': 'New York',
            'jobType': 'Contract',
            'experience': '1-3 Years'
        },
        {
            'profession': 'Design',
            'discipline': 'Graphic Design'
        },
        {
            'location': 'Remote',
            'jobType': 'Part-Time'
        }
    ]
    
    for i, filters in enumerate(filter_combinations, 1):
        print(f"\n📋 Test {i}: {filters}")
        try:
            jobs = scrape_jobs_with_filters(filters, 5)
            print(f"   ✅ Scraped {len(jobs)} jobs")
        except Exception as e:
            print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Enhanced Job Scraper Test Suite")
    print("=" * 50)
    
    # Run basic test
    success = test_basic_scraping()
    
    if success:
        # Run filter variation tests
        test_filter_variations()
        print("\n🎉 All tests completed!")
    else:
        print("\n💥 Basic test failed. Check the scraper setup.")
        sys.exit(1)

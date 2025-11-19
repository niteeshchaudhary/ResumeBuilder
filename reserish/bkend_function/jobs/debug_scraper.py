#!/usr/bin/env python3
"""
Debug script for the enhanced job scraper
"""

import sys
import os
import time

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_job_scraper import EnhancedJobScraper

def test_scraper_step_by_step():
    """Test the scraper step by step to identify issues"""
    print("🔍 Debug Mode: Testing Enhanced Job Scraper Step by Step")
    print("=" * 60)
    
    # Initialize scraper
    scraper = EnhancedJobScraper()
    
    # Test driver setup
    print("1️⃣ Testing driver setup...")
    if not scraper.setup_driver(headless=False):  # Set headless=False for debugging
        print("❌ Failed to setup driver")
        return False
    print("✅ Driver setup successful")
    
    # Test filters
    test_filters = {
        'location': 'San Francisco',
        'jobType': 'Full-Time',
        'experience': '3-5 Years',
        'profession': 'Engineering',
        'discipline': 'Computer Science'
    }
    
    print(f"\n2️⃣ Test filters: {test_filters}")
    
    try:
        # Test LinkedIn scraping
        print("\n3️⃣ Testing LinkedIn scraping...")
        linkedin_jobs = scraper.scrape_linkedin_jobs(test_filters, 3)
        print(f"LinkedIn results: {len(linkedin_jobs)} jobs")
        
        if linkedin_jobs:
            for i, job in enumerate(linkedin_jobs):
                print(f"   Job {i+1}: {job['title']} at {job['company']}")
        
        # Test Indeed scraping
        print("\n4️⃣ Testing Indeed scraping...")
        indeed_jobs = scraper.scrape_indeed_jobs(test_filters, 3)
        print(f"Indeed results: {len(indeed_jobs)} jobs")
        
        if indeed_jobs:
            for i, job in enumerate(indeed_jobs):
                print(f"   Job {i+1}: {job['title']} at {job['company']}")
        
        # Test Google Jobs as fallback
        print("\n5️⃣ Testing Google Jobs fallback...")
        google_jobs = scraper.scrape_google_jobs(test_filters, 3)
        print(f"Google Jobs results: {len(google_jobs)} jobs")
        
        if google_jobs:
            for i, job in enumerate(google_jobs):
                print(f"   Job {i+1}: {job['title']} at {job['company']}")
        
        # Test full scraping
        print("\n6️⃣ Testing full scraping...")
        all_jobs = scraper.scrape_all_sources(test_filters, 5)
        print(f"Total jobs scraped: {len(all_jobs)}")
        
        if all_jobs:
            print("\n📋 Final Results:")
            for i, job in enumerate(all_jobs):
                print(f"   {i+1}. {job['title']}")
                print(f"      Company: {job['company']}")
                print(f"      Location: {job['location']}")
                print(f"      Source: {job['source']}")
                print(f"      Salary: {job['salary']}")
                print()
        
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        scraper.close_driver()

def test_simple_scraping():
    """Test simple scraping without complex filters"""
    print("\n🧪 Testing Simple Scraping...")
    print("=" * 40)
    
    scraper = EnhancedJobScraper()
    
    try:
        if not scraper.setup_driver(headless=False):
            return False
        
        # Simple filters
        simple_filters = {
            'location': 'Remote',
            'profession': 'Software'
        }
        
        print("Testing with simple filters...")
        jobs = scraper.scrape_all_sources(simple_filters, 3)
        
        print(f"Simple scraping results: {len(jobs)} jobs")
        return len(jobs) > 0
        
    except Exception as e:
        print(f"❌ Simple scraping failed: {e}")
        return False
    finally:
        scraper.close_driver()

if __name__ == "__main__":
    print("🚀 Enhanced Job Scraper Debug Suite")
    print("=" * 60)
    
    # Test step by step
    success = test_scraper_step_by_step()
    
    if success:
        print("\n🎉 Step-by-step testing completed successfully!")
        
        # Test simple scraping
        simple_success = test_simple_scraping()
        if simple_success:
            print("✅ Simple scraping also successful!")
        else:
            print("⚠️ Simple scraping had issues")
    else:
        print("\n💥 Step-by-step testing failed!")
        sys.exit(1)
    
    print("\n🔍 Debug session completed. Check the output above for any issues.")

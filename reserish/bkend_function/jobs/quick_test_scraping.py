#!/usr/bin/env python3
"""
Quick test script to manually trigger job scraping
"""

import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_manual_scraping():
    """Test manual job scraping"""
    print("🧪 Testing Manual Job Scraping...")
    print("=" * 50)
    
    try:
        # Import the enhanced scraper
        from enhanced_job_scraper import scrape_jobs_with_filters
        
        # Test filters
        test_filters = {
            'profession': 'Software',
            'discipline': 'Computer Science'
        }
        
        print(f"📋 Test Filters: {test_filters}")
        print("⏳ Starting manual job scraping...")
        
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
                
            return jobs
        else:
            print("❌ No jobs were scraped")
            return []
            
    except Exception as e:
        print(f"❌ Error during scraping: {e}")
        import traceback
        traceback.print_exc()
        return []

def test_simple_scraper():
    """Test simple scraper only"""
    print("\n🌐 Testing Simple Scraper...")
    print("=" * 40)
    
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
                
            return jobs
        else:
            print("❌ Simple scraper found no jobs")
            return []
            
    except Exception as e:
        print(f"❌ Error with simple scraper: {e}")
        import traceback
        traceback.print_exc()
        return []

if __name__ == "__main__":
    print("🚀 Quick Job Scraping Test")
    print("=" * 50)
    
    # Test enhanced scraper
    enhanced_jobs = test_manual_scraping()
    
    # Test simple scraper
    simple_jobs = test_simple_scraper()
    
    # Summary
    print("\n📊 Test Summary:")
    print(f"   Enhanced Scraper: {len(enhanced_jobs)} jobs")
    print(f"   Simple Scraper: {len(simple_jobs)} jobs")
    print(f"   Total Jobs: {len(enhanced_jobs) + len(simple_jobs)}")
    
    if enhanced_jobs or simple_jobs:
        print("\n✅ Scraping is working! Jobs should appear in the UI soon.")
        print("💡 Check the 'External Jobs' tab in your frontend.")
    else:
        print("\n❌ No jobs were scraped. Check the error messages above.")
    
    print("\n�� Test completed!")

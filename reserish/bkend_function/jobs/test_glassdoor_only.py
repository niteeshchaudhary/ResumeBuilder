#!/usr/bin/env python3
"""
Test script for Glassdoor scraping only
"""

import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_job_scraper import EnhancedJobScraper

def test_glassdoor_only():
    """Test only Glassdoor scraping"""
    print("🏢 Testing Glassdoor Scraping Only")
    print("=" * 50)
    
    # Initialize scraper
    scraper = EnhancedJobScraper()
    
    # Test driver setup
    print("1️⃣ Testing driver setup...")
    if not scraper.setup_driver(headless=False):  # Set headless=False for debugging
        print("❌ Failed to setup driver")
        return False
    print("✅ Driver setup successful")
    
    # Simple filters
    test_filters = {
        'profession': 'Software',
        'discipline': 'Computer Science'
    }
    
    print(f"\n2️⃣ Test filters: {test_filters}")
    
    try:
        # Test Glassdoor scraping
        print("\n3️⃣ Testing Glassdoor scraping...")
        glassdoor_jobs = scraper.scrape_glassdoor_jobs(test_filters, 5)
        print(f"Glassdoor results: {len(glassdoor_jobs)} jobs")
        
        if glassdoor_jobs:
            print("\n📋 Glassdoor Jobs Found:")
            for i, job in enumerate(glassdoor_jobs):
                print(f"   {i+1}. {job['title']}")
                print(f"      Company: {job['company']}")
                print(f"      Location: {job['location']}")
                print(f"      Salary: {job['salary']}")
                print(f"      URL: {job['url']}")
                print()
        else:
            print("⚠️ No Glassdoor jobs found")
        
        return len(glassdoor_jobs) > 0
        
    except Exception as e:
        print(f"❌ Error during Glassdoor testing: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        scraper.close_driver()

def test_glassdoor_with_debug():
    """Test Glassdoor with more debugging information"""
    print("\n🔍 Testing Glassdoor with Debug Info...")
    print("=" * 50)
    
    scraper = EnhancedJobScraper()
    
    try:
        if not scraper.setup_driver(headless=False):
            return False
        
        # Build URL manually to see what we're hitting
        query_parts = ['Software', 'Computer Science']
        search_query = " ".join(query_parts)
        encoded_query = search_query.replace(' ', '+')
        
        url = f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={encoded_query}&locT=N&locId=1&jobType=&fromAge=-1&minSalary=0&includeNoSalaryJobs=true&radius=100&cityId=-1&minRating=0.0&industryId=-1&sgocId=-1&seniorityType=all&companyId=-1&employerSizes=0&applicationType=0&remoteWorkType=0"
        
        print(f"🔗 Testing URL: {url}")
        
        # Navigate to the page
        scraper.driver.get(url)
        
        # Wait and scroll
        import time
        time.sleep(5)
        
        # Scroll to load more jobs
        for i in range(3):
            scraper.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            print(f"   Scroll {i+1}/3 completed")
        
        # Try to find job cards
        print("\n🔍 Looking for job cards...")
        
        selectors_to_try = [
            "[data-test='job-link']",
            ".react-job-listing",
            ".job-listing",
            ".job-card",
            "[class*='job']",
            "[class*='listing']"
        ]
        
        for selector in selectors_to_try:
            try:
                elements = scraper.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    print(f"✅ Selector '{selector}' found {len(elements)} elements")
                    
                    # Show some details about the first few elements
                    for i, elem in enumerate(elements[:3]):
                        try:
                            text = elem.text.strip()
                            href = elem.get_attribute("href")
                            print(f"   Element {i+1}:")
                            print(f"      Text: {text[:100]}...")
                            print(f"      Href: {href}")
                            print(f"      Tag: {elem.tag_name}")
                            print()
                        except Exception as e:
                            print(f"      Error getting element {i+1} details: {e}")
                    
                    break
                else:
                    print(f"⚠️ Selector '{selector}' found no elements")
            except Exception as e:
                print(f"❌ Selector '{selector}' failed: {e}")
        
        # Get page source for debugging
        print("\n📄 Page source analysis...")
        page_source = scraper.driver.page_source
        
        if "job" in page_source.lower():
            print("✅ Page contains 'job' text")
        else:
            print("⚠️ Page doesn't contain 'job' text")
            
        if "glassdoor" in page_source.lower():
            print("✅ Page contains 'glassdoor' text")
        else:
            print("⚠️ Page doesn't contain 'glassdoor' text")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during debug testing: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        scraper.close_driver()

if __name__ == "__main__":
    print("🏢 Glassdoor Scraper Test Suite")
    print("=" * 60)
    
    # Test basic Glassdoor scraping
    success = test_glassdoor_only()
    
    if success:
        print("\n🎉 Basic Glassdoor testing completed successfully!")
    else:
        print("\n⚠️ Basic Glassdoor testing had issues")
    
    # Test with debug info
    debug_success = test_glassdoor_with_debug()
    
    if debug_success:
        print("\n✅ Debug testing completed!")
    else:
        print("\n❌ Debug testing failed!")
    
    print("\n🔍 Glassdoor test session completed. Check the output above for any issues.")

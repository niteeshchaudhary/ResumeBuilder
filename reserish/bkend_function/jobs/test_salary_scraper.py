#!/usr/bin/env python3
"""
Test script for the enhanced salary scraper
"""

import sys
import os
import time

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from salary_scraper import SalaryScraper, scrape_salary_for_job, scrape_salaries_for_jobs

def test_single_job_salary():
    """Test salary scraping for a single job"""
    print("🧪 Testing Single Job Salary Scraping")
    print("=" * 50)
    
    job_title = "Software Engineer"
    company_name = "Google"
    location = "Mountain View, CA"
    
    print(f"Job: {job_title}")
    print(f"Company: {company_name}")
    print(f"Location: {location}")
    print()
    
    try:
        salary_info = scrape_salary_for_job(job_title, company_name, location)
        
        if salary_info:
            print("✅ Salary information found:")
            print(f"   Average Base Salary: ${salary_info['average_base_salary']:,.2f}")
            print(f"   Average Total Comp: ${salary_info['average_total_comp']:,.2f}" if salary_info.get('average_total_comp') else "   Average Total Comp: Not available")
            print(f"   Salary Range: {salary_info.get('salary_range', 'Not available')}")
            print(f"   Confidence: {salary_info['confidence']}")
            print(f"   Sources: {len(salary_info['sources'])}")
            
            print("\n📊 Source Details:")
            for source in salary_info['sources']:
                print(f"   • {source['source']}: ${source.get('base_salary', 'N/A')} (Confidence: {source['confidence']})")
        else:
            print("❌ No salary information found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def test_multiple_jobs_salary():
    """Test salary scraping for multiple jobs"""
    print("\n🧪 Testing Multiple Jobs Salary Scraping")
    print("=" * 50)
    
    test_jobs = [
        {'title': 'Software Engineer', 'company': 'Microsoft', 'location': 'Seattle, WA'},
        {'title': 'Data Scientist', 'company': 'Amazon', 'location': 'Seattle, WA'},
        {'title': 'Product Manager', 'company': 'Apple', 'location': 'Cupertino, CA'},
        {'title': 'DevOps Engineer', 'company': 'Netflix', 'location': 'Los Gatos, CA'}
    ]
    
    print(f"Testing {len(test_jobs)} jobs...")
    print()
    
    try:
        enhanced_jobs = scrape_salaries_for_jobs(test_jobs)
        
        for i, job in enumerate(enhanced_jobs):
            print(f"Job {i+1}: {job['title']} at {job['company']}")
            
            if job.get('enhanced_salary'):
                salary_info = job['enhanced_salary']
                print(f"   💰 Base Salary: ${salary_info['average_base_salary']:,.2f}")
                print(f"   🎯 Confidence: {salary_info['confidence']}")
                print(f"   📊 Sources: {len(salary_info['sources'])}")
                
                # Show source details
                for source in salary_info['sources']:
                    print(f"      • {source['source']}: ${source.get('base_salary', 'N/A')}")
            else:
                print("   ❌ No salary information found")
            
            print()
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def test_glassdoor_only():
    """Test only Glassdoor salary scraping"""
    print("\n🏢 Testing Glassdoor Salary Scraping Only")
    print("=" * 50)
    
    scraper = SalaryScraper()
    
    try:
        if not scraper.setup_driver(headless=False):  # Set headless=False for debugging
            print("❌ Failed to setup driver")
            return False
        
        job_title = "Software Engineer"
        company_name = "Google"
        location = "Mountain View, CA"
        
        print(f"Testing: {job_title} at {company_name}")
        
        salary_data = scraper.scrape_glassdoor_salary(job_title, company_name, location)
        
        if salary_data:
            print("✅ Glassdoor salary found:")
            print(f"   Base Salary: ${salary_data.get('base_salary', 'N/A')}")
            print(f"   Total Compensation: ${salary_data.get('total_compensation', 'N/A')}")
            print(f"   Salary Range: {salary_data.get('salary_range', 'N/A')}")
            print(f"   Confidence: {salary_data['confidence']}")
            print(f"   URL: {salary_data['url']}")
        else:
            print("❌ No Glassdoor salary found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        scraper.cleanup()

def test_ambitionbox_only():
    """Test only AmbitionBox salary scraping"""
    print("\n📊 Testing AmbitionBox Salary Scraping Only")
    print("=" * 50)
    
    scraper = SalaryScraper()
    
    try:
        if not scraper.setup_driver(headless=False):  # Set headless=False for debugging
            print("❌ Failed to setup driver")
            return False
        
        job_title = "Software Engineer"
        company_name = "TCS"
        location = "Mumbai, India"
        
        print(f"Testing: {job_title} at {company_name}")
        
        salary_data = scraper.scrape_ambitionbox_salary(job_title, company_name, location)
        
        if salary_data:
            print("✅ AmbitionBox salary found:")
            print(f"   Base Salary: ₹{salary_data.get('base_salary', 'N/A')}")
            print(f"   Salary Range: {salary_data.get('salary_range', 'N/A')}")
            print(f"   Confidence: {salary_data['confidence']}")
            print(f"   URL: {salary_data['url']}")
        else:
            print("❌ No AmbitionBox salary found")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        scraper.cleanup()

def main():
    """Main test function"""
    print("🚀 Enhanced Salary Scraper Test Suite")
    print("=" * 60)
    
    # Test 1: Single job salary
    test_single_job_salary()
    
    # Add delay between tests
    time.sleep(2)
    
    # Test 2: Multiple jobs salary
    test_multiple_jobs_salary()
    
    # Add delay between tests
    time.sleep(2)
    
    # Test 3: Glassdoor only
    test_glassdoor_only()
    
    # Add delay between tests
    time.sleep(2)
    
    # Test 4: AmbitionBox only
    test_ambitionbox_only()
    
    print("\n🎯 All tests completed!")

if __name__ == "__main__":
    main()

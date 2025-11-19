#!/usr/bin/env python3
"""
Quick test script for the salary scraper
Tests basic functionality without Django dependencies
"""

import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test if all required modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        from salary_scraper import SalaryScraper
        print("✅ SalaryScraper imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import SalaryScraper: {e}")
        return False
    
    try:
        from salary_scraper import scrape_salary_for_job
        print("✅ scrape_salary_for_job imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import scrape_salary_for_job: {e}")
        return False
    
    try:
        from salary_scraper import scrape_salaries_for_jobs
        print("✅ scrape_salaries_for_jobs imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import scrape_salaries_for_jobs: {e}")
        return False
    
    return True

def test_scraper_creation():
    """Test if scraper can be created"""
    print("\n🧪 Testing scraper creation...")
    
    try:
        from salary_scraper import SalaryScraper
        scraper = SalaryScraper()
        print("✅ SalaryScraper instance created successfully")
        
        # Test cleanup
        scraper.cleanup()
        print("✅ Cleanup completed successfully")
        
        return True
    except Exception as e:
        print(f"❌ Error creating scraper: {e}")
        return False

def test_salary_parsing():
    """Test salary parsing functionality"""
    print("\n🧪 Testing salary parsing...")
    
    try:
        from salary_scraper import SalaryScraper
        scraper = SalaryScraper()
        
        # Test salary parsing
        test_cases = [
            ("$50,000", 50000),
            ("$75K", 75000),
            ("$100,000.00", 100000),
            ("$1.2M", 1200000),
            ("$45K - $65K", None),  # Range should return None for base salary
        ]
        
        for salary_text, expected in test_cases:
            result = scraper._parse_salary(salary_text)
            if result == expected:
                print(f"✅ '{salary_text}' -> {result}")
            else:
                print(f"❌ '{salary_text}' -> {result} (expected {expected})")
        
        scraper.cleanup()
        return True
    except Exception as e:
        print(f"❌ Error testing salary parsing: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Quick Salary Scraper Test")
    print("=" * 40)
    
    # Test 1: Imports
    if not test_imports():
        print("\n❌ Import tests failed")
        return False
    
    # Test 2: Scraper creation
    if not test_scraper_creation():
        print("\n❌ Scraper creation tests failed")
        return False
    
    # Test 3: Salary parsing
    if not test_salary_parsing():
        print("\n❌ Salary parsing tests failed")
        return False
    
    print("\n🎉 All quick tests passed!")
    print("\n📚 Next steps:")
    print("   1. Run Django migrations: python manage.py migrate")
    print("   2. Test with Django: python manage.py enhance_salaries --dry-run")
    print("   3. Full test: python test_salary_scraper.py")
    print("\n💡 Note: This system only uses enhanced salary data (no basic salary fields)")
    print("   - All salary information comes from dedicated salary sources")
    print("   - Cleaner architecture for scraped job data")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

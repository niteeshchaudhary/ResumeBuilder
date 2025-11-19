#!/usr/bin/env python3
"""
System Verification Script for Enhanced Salary Scraping
This script verifies all components are working correctly
"""

import sys
import os
import time

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def verify_imports():
    """Verify all required modules can be imported"""
    print("🔍 Verifying imports...")
    
    required_modules = [
        'selenium',
        'bs4',
        'requests',
        'webdriver'
    ]
    
    for module in required_modules:
        try:
            if module == 'webdriver':
                from selenium import webdriver
            else:
                __import__(module)
            print(f"   ✅ {module}")
        except ImportError as e:
            print(f"   ❌ {module}: {e}")
            return False
    
    return True

def verify_salary_scraper():
    """Verify the salary scraper module"""
    print("\n🔍 Verifying salary scraper...")
    
    try:
        from salary_scraper import SalaryScraper, scrape_salary_for_job, scrape_salaries_for_jobs
        print("   ✅ All salary scraper functions imported")
        
        # Test scraper creation
        scraper = SalaryScraper()
        print("   ✅ SalaryScraper instance created")
        
        # Test cleanup
        scraper.cleanup()
        print("   ✅ Cleanup completed")
        
        return True
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def verify_salary_parsing():
    """Verify salary parsing functionality"""
    print("\n🔍 Verifying salary parsing...")
    
    try:
        from salary_scraper import SalaryScraper
        scraper = SalaryScraper()
        
        test_cases = [
            ("$50,000", 50000),
            ("$75K", 75000),
            ("$100,000.00", 100000),
            ("$1.2M", 1200000),
            ("$45K - $65K", None),  # Range should return None
            ("$80K to $120K", None),  # Range should return None
        ]
        
        all_passed = True
        for salary_text, expected in test_cases:
            result = scraper._parse_salary(salary_text)
            if result == expected:
                print(f"   ✅ '{salary_text}' -> {result}")
            else:
                print(f"   ❌ '{salary_text}' -> {result} (expected {expected})")
                all_passed = False
        
        scraper.cleanup()
        return all_passed
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def verify_file_structure():
    """Verify all required files exist"""
    print("\n🔍 Verifying file structure...")
    
    required_files = [
        'salary_scraper.py',
        'test_salary_scraper.py',
        'quick_test_salary.py',
        'ENHANCED_SALARY_README.md',
        'install_enhanced_salary.sh'
    ]
    
    all_exist = True
    for file in required_files:
        if os.path.exists(file):
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file} - Missing")
            all_exist = False
    
    return all_exist

def verify_django_integration():
    """Verify Django integration files exist"""
    print("\n🔍 Verifying Django integration...")
    
    django_files = [
        '../../backend/models.py',
        '../../backend/tasks.py',
        '../../backend/management/commands/enhance_salaries.py',
        '../../backend/migrations/0002_add_enhanced_salary.py',
        '../../reserish/celery.py'
    ]
    
    all_exist = True
    for file in django_files:
        if os.path.exists(file):
            print(f"   ✅ {file}")
        else:
            print(f"   ❌ {file} - Missing")
            all_exist = False
    
    return all_exist

def verify_installation_script():
    """Verify installation script is executable"""
    print("\n🔍 Verifying installation script...")
    
    script_path = 'install_enhanced_salary.sh'
    if os.path.exists(script_path):
        if os.access(script_path, os.X_OK):
            print("   ✅ install_enhanced_salary.sh is executable")
            return True
        else:
            print("   ⚠️  install_enhanced_salary.sh exists but is not executable")
            print("   💡 Run: chmod +x install_enhanced_salary.sh")
            return False
    else:
        print("   ❌ install_enhanced_salary.sh not found")
        return False

def main():
    """Main verification function"""
    print("🚀 Enhanced Salary Scraping System Verification")
    print("=" * 55)
    
    all_tests_passed = True
    
    # Test 1: File structure
    if not verify_file_structure():
        all_tests_passed = False
    
    # Test 2: Imports
    if not verify_imports():
        all_tests_passed = False
    
    # Test 3: Salary scraper
    if not verify_salary_scraper():
        all_tests_passed = False
    
    # Test 4: Salary parsing
    if not verify_salary_parsing():
        all_tests_passed = False
    
    # Test 5: Django integration
    if not verify_django_integration():
        all_tests_passed = False
    
    # Test 6: Installation script
    if not verify_installation_script():
        all_tests_passed = False
    
    print("\n" + "=" * 55)
    
    if all_tests_passed:
        print("🎉 All verification tests passed!")
        print("\n📚 System is ready for use!")
        print("\n📋 Next steps:")
        print("   1. Run: ./install_enhanced_salary.sh")
        print("   2. Run Django migrations: python manage.py migrate")
        print("   3. Test: python manage.py enhance_salaries --dry-run")
        print("   4. Start Celery: celery -A reserish worker -l info")
        print("   5. Start Celery Beat: celery -A reserish beat -l info")
    else:
        print("❌ Some verification tests failed!")
        print("\n🔧 Please fix the issues above before proceeding")
    
    return all_tests_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

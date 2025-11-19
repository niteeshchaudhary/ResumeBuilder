import requests
import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import re
import json
from urllib.parse import quote_plus, urljoin
import logging

logger = logging.getLogger(__name__)

class SalaryScraper:
    """Dedicated salary scraper for extracting salary information from multiple sources"""
    
    def __init__(self):
        self.driver = None
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def setup_driver(self, headless=True):
        """Setup Chrome driver with options"""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            return True
        except Exception as e:
            logger.error(f"Error setting up driver: {e}")
            return False
    
    def close_driver(self):
        """Close the web driver"""
        if self.driver:
            self.driver.quit()
            self.driver = None
    
    def scrape_glassdoor_salary(self, job_title, company_name, location=None):
        """
        Scrape salary information from Glassdoor salary pages
        """
        try:
            if not self.driver:
                if not self.setup_driver():
                    return None
            
            # Build search query for salary
            search_query = f"{job_title} {company_name}"
            if location:
                search_query += f" {location}"
            
            encoded_query = quote_plus(search_query)
            url = f"https://www.glassdoor.com/Salaries/{encoded_query}-salary-SRCH_KO0,0_IP1.htm"
            
            logger.info(f"🔍 Scraping Glassdoor salary: {url}")
            self.driver.get(url)
            time.sleep(3)
            
            salary_data = {
                'source': 'Glassdoor',
                'url': url,
                'base_salary': None,
                'total_compensation': None,
                'salary_range': None,
                'currency': 'USD',
                'confidence': 'low'
            }
            
            try:
                # Look for salary information
                salary_selectors = [
                    "[data-test='salary-value']",
                    ".salary-value",
                    ".salary-amount",
                    "[class*='salary']",
                    ".css-1d8xoj1"  # Common Glassdoor salary class
                ]
                
                for selector in salary_selectors:
                    try:
                        salary_elem = self.driver.find_element(By.CSS_SELECTOR, selector)
                        if salary_elem and salary_elem.text.strip():
                            salary_text = salary_elem.text.strip()
                            salary_data['base_salary'] = self._parse_salary(salary_text)
                            salary_data['confidence'] = 'medium'
                            break
                    except:
                        continue
                
                # Look for salary range
                range_selectors = [
                    "[data-test='salary-range']",
                    ".salary-range",
                    "[class*='range']"
                ]
                
                for selector in range_selectors:
                    try:
                        range_elem = self.driver.find_element(By.CSS_SELECTOR, selector)
                        if range_elem and range_elem.text.strip():
                            range_text = range_elem.text.strip()
                            salary_data['salary_range'] = range_text
                            break
                    except:
                        continue
                
                # Look for total compensation
                comp_selectors = [
                    "[data-test='total-comp']",
                    ".total-compensation",
                    "[class*='compensation']"
                ]
                
                for selector in comp_selectors:
                    try:
                        comp_elem = self.driver.find_element(By.CSS_SELECTOR, selector)
                        if comp_elem and comp_elem.text.strip():
                            comp_text = comp_elem.text.strip()
                            salary_data['total_compensation'] = self._parse_salary(comp_text)
                            break
                    except:
                        continue
                
            except Exception as e:
                logger.warning(f"Error extracting salary details: {e}")
            
            return salary_data if salary_data['base_salary'] or salary_data['total_compensation'] else None
            
        except Exception as e:
            logger.error(f"Error scraping Glassdoor salary: {e}")
            return None
    
    def scrape_ambitionbox_salary(self, job_title, company_name, location=None):
        """
        Scrape salary information from AmbitionBox
        """
        try:
            if not self.driver:
                if not self.setup_driver():
                    return None
            
            # Build search query for AmbitionBox
            search_query = f"{job_title} {company_name}"
            if location:
                search_query += f" {location}"
            
            encoded_query = quote_plus(search_query)
            url = f"https://www.ambitionbox.com/salaries/{encoded_query}-salary"
            
            logger.info(f"🔍 Scraping AmbitionBox salary: {url}")
            self.driver.get(url)
            time.sleep(3)
            
            salary_data = {
                'source': 'AmbitionBox',
                'url': url,
                'base_salary': None,
                'total_compensation': None,
                'salary_range': None,
                'currency': 'INR',
                'confidence': 'low'
            }
            
            try:
                # Look for salary information on AmbitionBox
                salary_selectors = [
                    ".salary-value",
                    ".salary-amount",
                    "[class*='salary']",
                    ".css-1d8xoj1",
                    ".salary-text"
                ]
                
                for selector in salary_selectors:
                    try:
                        salary_elem = self.driver.find_element(By.CSS_SELECTOR, selector)
                        if salary_elem and salary_elem.text.strip():
                            salary_text = salary_elem.text.strip()
                            salary_data['base_salary'] = self._parse_salary(salary_text)
                            salary_data['confidence'] = 'medium'
                            break
                    except:
                        continue
                
                # Look for salary range
                range_selectors = [
                    ".salary-range",
                    "[class*='range']",
                    ".range-text"
                ]
                
                for selector in range_selectors:
                    try:
                        range_elem = self.driver.find_element(By.CSS_SELECTOR, selector)
                        if range_elem and range_elem.text.strip():
                            range_text = range_elem.text.strip()
                            salary_data['salary_range'] = range_text
                            break
                    except:
                        continue
                
            except Exception as e:
                logger.warning(f"Error extracting AmbitionBox salary details: {e}")
            
            return salary_data if salary_data['base_salary'] else None
            
        except Exception as e:
            logger.error(f"Error scraping AmbitionBox salary: {e}")
            return None
    
    def scrape_payscale_salary(self, job_title, company_name, location=None):
        """
        Scrape salary information from PayScale
        """
        try:
            if not self.driver:
                if not self.setup_driver():
                    return None
            
            # Build search query for PayScale
            search_query = f"{job_title} {company_name}"
            if location:
                search_query += f" {location}"
            
            encoded_query = quote_plus(search_query)
            url = f"https://www.payscale.com/research/US/Job={encoded_query}/Salary"
            
            logger.info(f"🔍 Scraping PayScale salary: {url}")
            self.driver.get(url)
            time.sleep(3)
            
            salary_data = {
                'source': 'PayScale',
                'url': url,
                'base_salary': None,
                'total_compensation': None,
                'salary_range': None,
                'currency': 'USD',
                'confidence': 'low'
            }
            
            try:
                # Look for salary information on PayScale
                salary_selectors = [
                    ".pay-value",
                    ".salary-value",
                    "[class*='pay']",
                    "[class*='salary']",
                    ".css-1d8xoj1"
                ]
                
                for selector in salary_selectors:
                    try:
                        salary_elem = self.driver.find_element(By.CSS_SELECTOR, selector)
                        if salary_elem and salary_elem.text.strip():
                            salary_text = salary_elem.text.strip()
                            salary_data['base_salary'] = self._parse_salary(salary_text)
                            salary_data['confidence'] = 'medium'
                            break
                    except:
                        continue
                
                # Look for salary range
                range_selectors = [
                    ".pay-range",
                    ".salary-range",
                    "[class*='range']"
                ]
                
                for selector in range_selectors:
                    try:
                        range_elem = self.driver.find_element(By.CSS_SELECTOR, selector)
                        if range_elem and range_elem.text.strip():
                            range_text = range_elem.text.strip()
                            salary_data['salary_range'] = range_text
                            break
                    except:
                        continue
                
            except Exception as e:
                logger.warning(f"Error extracting PayScale salary details: {e}")
            
            return salary_data if salary_data['base_salary'] else None
            
        except Exception as e:
            logger.error(f"Error scraping PayScale salary: {e}")
            return None
    
    def scrape_all_salary_sources(self, job_title, company_name, location=None):
        """
        Scrape salary information from all available sources
        """
        all_salaries = []
        
        try:
            # Scrape from Glassdoor
            logger.info(f"🏢 Scraping Glassdoor salary for: {job_title} at {company_name}")
            glassdoor_salary = self.scrape_glassdoor_salary(job_title, company_name, location)
            if glassdoor_salary:
                all_salaries.append(glassdoor_salary)
                logger.info(f"✅ Glassdoor salary found: {glassdoor_salary.get('base_salary', 'N/A')}")
            
            # Scrape from AmbitionBox
            logger.info(f"📊 Scraping AmbitionBox salary for: {job_title} at {company_name}")
            ambitionbox_salary = self.scrape_ambitionbox_salary(job_title, company_name, location)
            if ambitionbox_salary:
                all_salaries.append(ambitionbox_salary)
                logger.info(f"✅ AmbitionBox salary found: {ambitionbox_salary.get('base_salary', 'N/A')}")
            
            # Scrape from PayScale
            logger.info(f"💰 Scraping PayScale salary for: {job_title} at {company_name}")
            payscale_salary = self.scrape_payscale_salary(job_title, company_name, location)
            if payscale_salary:
                all_salaries.append(payscale_salary)
                logger.info(f"✅ PayScale salary found: {payscale_salary.get('base_salary', 'N/A')}")
            
            # Add random delay between requests
            time.sleep(random.uniform(1, 3))
            
        except Exception as e:
            logger.error(f"Error in multi-source salary scraping: {e}")
        
        return all_salaries
    
    def _parse_salary(self, salary_text):
        """
        Parse salary text and extract numerical value
        """
        try:
            # Check if it's a range (contains dash or "to")
            if '-' in salary_text or ' to ' in salary_text.lower():
                return None  # Ranges should not be parsed as single values
            
            # Remove common text and symbols
            cleaned = re.sub(r'[^\d,.]', '', salary_text)
            
            # Handle different formats
            if ',' in cleaned:
                # Format: 50,000 or 50,000.00
                cleaned = cleaned.replace(',', '')
            
            # Convert to float
            salary_value = float(cleaned)
            
            # Determine if it's in thousands, millions, etc.
            if 'K' in salary_text.upper() or 'THOUSAND' in salary_text.upper():
                salary_value *= 1000
            elif 'M' in salary_text.upper() or 'MILLION' in salary_text.upper():
                salary_value *= 1000000
            
            return salary_value
            
        except (ValueError, AttributeError):
            return None
    
    def get_consolidated_salary(self, job_title, company_name, location=None):
        """
        Get consolidated salary information from multiple sources
        """
        all_salaries = self.scrape_all_salary_sources(job_title, company_name, location)
        
        if not all_salaries:
            return None
        
        # Consolidate salary data
        consolidated = {
            'job_title': job_title,
            'company_name': company_name,
            'location': location,
            'sources': all_salaries,
            'average_base_salary': None,
            'average_total_comp': None,
            'salary_range': None,
            'confidence': 'low',
            'last_updated': time.time()
        }
        
        # Calculate averages
        base_salaries = [s.get('base_salary') for s in all_salaries if s.get('base_salary')]
        total_comps = [s.get('total_compensation') for s in all_salaries if s.get('total_compensation')]
        
        if base_salaries:
            consolidated['average_base_salary'] = sum(base_salaries) / len(base_salaries)
            consolidated['confidence'] = 'high' if len(base_salaries) > 1 else 'medium'
        
        if total_comps:
            consolidated['average_total_comp'] = sum(total_comps) / len(total_comps)
        
        # Get salary range if available
        ranges = [s.get('salary_range') for s in all_salaries if s.get('salary_range')]
        if ranges:
            consolidated['salary_range'] = ranges[0]  # Use first available range
        
        return consolidated
    
    def cleanup(self):
        """Clean up resources"""
        self.close_driver()
        self.session.close()


def scrape_salary_for_job(job_title, company_name, location=None):
    """
    Convenience function to scrape salary for a specific job
    """
    scraper = SalaryScraper()
    try:
        return scraper.get_consolidated_salary(job_title, company_name, location)
    finally:
        scraper.cleanup()


def scrape_salaries_for_jobs(jobs_list):
    """
    Scrape salaries for a list of jobs
    """
    scraper = SalaryScraper()
    results = []
    
    try:
        for job in jobs_list:
            try:
                salary_info = scraper.get_consolidated_salary(
                    job.get('title'),
                    job.get('company'),
                    job.get('location')
                )
                
                if salary_info:
                    job['enhanced_salary'] = salary_info
                    results.append(job)
                else:
                    job['enhanced_salary'] = None
                    results.append(job)
                
                # Add delay between requests
                time.sleep(random.uniform(2, 5))
                
            except Exception as e:
                logger.error(f"Error scraping salary for job {job.get('title', 'Unknown')}: {e}")
                job['enhanced_salary'] = None
                results.append(job)
                
    finally:
        scraper.cleanup()
    
    return results


if __name__ == "__main__":
    # Test the salary scraper
    test_jobs = [
        {'title': 'Software Engineer', 'company': 'Google', 'location': 'Mountain View, CA'},
        {'title': 'Data Scientist', 'company': 'Microsoft', 'location': 'Seattle, WA'}
    ]
    
    results = scrape_salaries_for_jobs(test_jobs)
    
    for job in results:
        print(f"\nJob: {job['title']} at {job['company']}")
        if job['enhanced_salary']:
            print(f"Average Base Salary: ${job['enhanced_salary']['average_base_salary']:,.2f}")
            print(f"Confidence: {job['enhanced_salary']['confidence']}")
            print(f"Sources: {len(job['enhanced_salary']['sources'])}")
        else:
            print("No salary information found")

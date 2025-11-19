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
from urllib.parse import quote_plus

class EnhancedJobScraper:
    def __init__(self):
        self.jobs = []
        self.driver = None
        
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
            print(f"Error setting up driver: {e}")
            return False
    
    def close_driver(self):
        """Close the web driver"""
        if self.driver:
            self.driver.quit()
            self.driver = None
    
    def scrape_linkedin_jobs(self, filters, max_jobs=10):
        """Scrape jobs from LinkedIn"""
        try:
            # Build search query
            query_parts = []
            if filters.get('profession'):
                query_parts.append(filters['profession'])
            if filters.get('discipline'):
                query_parts.append(filters['discipline'])
            if filters.get('location'):
                query_parts.append(f"in {filters['location']}")
            
            search_query = " ".join(query_parts) if query_parts else "software developer"
            encoded_query = quote_plus(search_query)
            
            url = f"https://www.linkedin.com/jobs/search/?keywords={encoded_query}&location={filters.get('location', '')}&f_E={self._get_linkedin_experience_filter(filters.get('experience', ''))}&f_JT={self._get_linkedin_job_type_filter(filters.get('jobType', ''))}"
            
            print(f"🔗 LinkedIn URL: {url}")
            self.driver.get(url)
            time.sleep(8)  # Increased wait time for LinkedIn
            
            # Wait for page to load and scroll to load more jobs
            try:
                # Try multiple approaches to find job cards
                job_cards = []
                
                # First, try to wait for any job-related element
                wait = WebDriverWait(self.driver, 15)
                
                # Try different selectors that might indicate jobs are loaded
                possible_selectors = [
                    "[data-job-id]",
                    ".job-search-card",
                    ".job-card-container", 
                    ".job-card",
                    ".job-search-card__container",
                    ".jobs-search__results-list li",
                    ".jobs-search-results__list-item",
                    "[class*='job']",
                    "[class*='search-result']"
                ]
                
                # Wait for any of these selectors to appear
                for selector in possible_selectors:
                    try:
                        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                        print(f"✅ Found elements with selector: {selector}")
                        break
                    except:
                        continue
                
                # Scroll to load more jobs
                print("📜 Scrolling to load more jobs...")
                for i in range(5):  # More scrolling attempts
                    self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    time.sleep(2)
                    print(f"   Scroll {i+1}/5 completed")
                
                # Try to find job cards with multiple approaches
                for selector in possible_selectors:
                    try:
                        job_cards = self.driver.find_elements(By.CSS_SELECTOR, selector)
                        if job_cards and len(job_cards) > 0:
                            print(f"✅ Found {len(job_cards)} job cards using selector: {selector}")
                            break
                    except Exception as e:
                        print(f"⚠️ Selector {selector} failed: {e}")
                        continue
                
                if not job_cards:
                    print("⚠️ No job cards found with any selector")
                    # Try to get page source to debug
                    page_source = self.driver.page_source
                    if "job" in page_source.lower() or "search" in page_source.lower():
                        print("ℹ️ Page contains job-related content, but selectors may have changed")
                    return []
                
            except TimeoutException:
                print("⚠️ Timeout waiting for job cards to load")
                return []
            except Exception as e:
                print(f"⚠️ Error during job card detection: {e}")
                return []
            
            scraped_jobs = []
            for i, card in enumerate(job_cards[:max_jobs]):
                try:
                    job_data = self._extract_linkedin_job_data(card)
                    if job_data:
                        scraped_jobs.append(job_data)
                        print(f"✅ Extracted job {i+1}: {job_data['title']}")
                except Exception as e:
                    print(f"❌ Error extracting job {i+1}: {e}")
                    continue
                
                if len(scraped_jobs) >= max_jobs:
                    break
            
            print(f"🎯 Successfully scraped {len(scraped_jobs)} jobs from LinkedIn")
            return scraped_jobs
            
        except Exception as e:
            print(f"❌ Error scraping LinkedIn: {e}")
            return []
    
    def scrape_indeed_jobs(self, filters, max_jobs=10):
        """Scrape jobs from Indeed"""
        try:
            # Build search query
            query_parts = []
            if filters.get('profession'):
                query_parts.append(filters['profession'])
            if filters.get('discipline'):
                query_parts.append(filters['discipline'])
            
            search_query = " ".join(query_parts) if query_parts else "software developer"
            encoded_query = quote_plus(search_query)
            
            url = f"https://www.indeed.com/jobs?q={encoded_query}&l={filters.get('location', '')}&jt={self._get_indeed_job_type_filter(filters.get('jobType', ''))}&explvl={self._get_indeed_experience_filter(filters.get('experience', ''))}"
            
            print(f"🔍 Indeed URL: {url}")
            self.driver.get(url)
            time.sleep(8)  # Increased wait time for Indeed
            
            try:
                # Try multiple approaches to find job cards
                job_cards = []
                
                # Wait for any job-related element
                wait = WebDriverWait(self.driver, 15)
                
                # Try different selectors that might indicate jobs are loaded
                possible_selectors = [
                    "[data-jk]",
                    ".job_seen_beacon",
                    ".jobsearch-ResultsList .job_seen_beacon",
                    ".job_seen_beacon",
                    ".jobsearch-ResultsList li",
                    "[class*='job']",
                    "[class*='result']",
                    ".job_seen_beacon"
                ]
                
                # Wait for any of these selectors to appear
                for selector in possible_selectors:
                    try:
                        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                        print(f"✅ Found elements with selector: {selector}")
                        break
                    except:
                        continue
                
                # Scroll to load more jobs
                print("📜 Scrolling to load more jobs...")
                for i in range(5):  # More scrolling attempts
                    self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    time.sleep(2)
                    print(f"   Scroll {i+1}/5 completed")
                
                # Try to find job cards with multiple approaches
                for selector in possible_selectors:
                    try:
                        job_cards = self.driver.find_elements(By.CSS_SELECTOR, selector)
                        if job_cards and len(job_cards) > 0:
                            print(f"✅ Found {len(job_cards)} job cards using selector: {selector}")
                            break
                    except Exception as e:
                        print(f"⚠️ Selector {selector} failed: {e}")
                        continue
                
                if not job_cards:
                    print("⚠️ No job cards found with any selector")
                    # Try to get page source to debug
                    page_source = self.driver.page_source
                    if "job" in page_source.lower() or "search" in page_source.lower():
                        print("ℹ️ Page contains job-related content, but selectors may have changed")
                    return []
                
            except TimeoutException:
                print("⚠️ Timeout waiting for job cards to load")
                return []
            except Exception as e:
                print(f"⚠️ Error during job card detection: {e}")
                return []
            
            scraped_jobs = []
            for i, card in enumerate(job_cards[:max_jobs]):
                try:
                    job_data = self._extract_indeed_job_data(card)
                    if job_data:
                        scraped_jobs.append(job_data)
                        print(f"✅ Extracted Indeed job {i+1}: {job_data['title']}")
                except Exception as e:
                    print(f"❌ Error extracting Indeed job {i+1}: {e}")
                    continue
                
                if len(scraped_jobs) >= max_jobs:
                    break
            
            print(f"🎯 Successfully scraped {len(scraped_jobs)} jobs from Indeed")
            return scraped_jobs
            
        except Exception as e:
            print(f"❌ Error scraping Indeed: {e}")
            return []
    
    def scrape_glassdoor_jobs(self, filters, max_jobs=10):
        """Scrape jobs from Glassdoor"""
        try:
            # Build search query
            query_parts = []
            if filters.get('profession'):
                query_parts.append(filters['profession'])
            if filters.get('discipline'):
                query_parts.append(filters['discipline'])
            
            search_query = " ".join(query_parts) if query_parts else "software developer"
            encoded_query = quote_plus(search_query)
            
            url = f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={encoded_query}&locT=N&locId=1&jobType={self._get_glassdoor_job_type_filter(filters.get('jobType', ''))}&fromAge=-1&minSalary=0&includeNoSalaryJobs=true&radius=100&cityId=-1&minRating=0.0&industryId=-1&sgocId=-1&seniorityType=all&companyId=-1&employerSizes=0&applicationType=0&remoteWorkType=0"
            
            print(f"🏢 Glassdoor URL: {url}")
            self.driver.get(url)
            time.sleep(5)
            
            try:
                # Wait for job cards to appear
                wait = WebDriverWait(self.driver, 10)
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-test='job-link']")))
                
                # Scroll to load more jobs
                for _ in range(3):
                    self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    time.sleep(2)
                
                # Try multiple selectors for job cards
                job_cards = []
                selectors = [
                    "[data-test='job-link']",
                    ".react-job-listing",
                    ".job-listing",
                    ".job-card"
                ]
                
                for selector in selectors:
                    try:
                        job_cards = self.driver.find_elements(By.CSS_SELECTOR, selector)
                        if job_cards:
                            print(f"✅ Found {len(job_cards)} job cards using selector: {selector}")
                            break
                    except:
                        continue
                
                if not job_cards:
                    print("⚠️ No job cards found with any selector")
                    return []
                
            except TimeoutException:
                print("⚠️ Timeout waiting for job cards to load")
                return []
            
            scraped_jobs = []
            for i, card in enumerate(job_cards[:max_jobs]):
                try:
                    job_data = self._extract_glassdoor_job_data(card)
                    if job_data:
                        scraped_jobs.append(job_data)
                        print(f"✅ Extracted Glassdoor job {i+1}: {job_data['title']}")
                except Exception as e:
                    print(f"❌ Error extracting Glassdoor job {i+1}: {e}")
                    continue
                
                if len(scraped_jobs) >= max_jobs:
                    break
            
            print(f"🎯 Successfully scraped {len(scraped_jobs)} jobs from Glassdoor")
            return scraped_jobs
            
        except Exception as e:
            print(f"❌ Error scraping Glassdoor: {e}")
            return []
    
    def scrape_google_jobs(self, filters, max_jobs=10):
        """Scrape jobs from Google Jobs as a fallback"""
        try:
            # Build search query
            query_parts = []
            if filters.get('profession'):
                query_parts.append(filters['profession'])
            if filters.get('discipline'):
                query_parts.append(filters['discipline'])
            if filters.get('location'):
                query_parts.append(f"in {filters['location']}")
            
            search_query = " ".join(query_parts) if query_parts else "software developer"
            encoded_query = quote_plus(search_query)
            
            url = f"https://www.google.com/search?q={encoded_query}+jobs&ibp=htl;jobs"
            
            print(f"🔍 Google Jobs URL: {url}")
            self.driver.get(url)
            time.sleep(5)
            
            try:
                # Wait for job cards to appear
                wait = WebDriverWait(self.driver, 10)
                wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-ved]")))
                
                # Scroll to load more jobs
                for _ in range(3):
                    self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                    time.sleep(2)
                
                # Find job cards
                job_cards = self.driver.find_elements(By.CSS_SELECTOR, "[data-ved]")
                
                if not job_cards:
                    print("⚠️ No job cards found on Google Jobs")
                    return []
                
                print(f"✅ Found {len(job_cards)} job cards on Google Jobs")
                
            except TimeoutException:
                print("⚠️ Timeout waiting for Google Jobs to load")
                return []
            
            scraped_jobs = []
            for i, card in enumerate(job_cards[:max_jobs]):
                try:
                    job_data = self._extract_google_job_data(card)
                    if job_data:
                        scraped_jobs.append(job_data)
                        print(f"✅ Extracted Google job {i+1}: {job_data['title']}")
                except Exception as e:
                    print(f"❌ Error extracting Google job {i+1}: {e}")
                    continue
                
                if len(scraped_jobs) >= max_jobs:
                    break
            
            print(f"🎯 Successfully scraped {len(scraped_jobs)} jobs from Google Jobs")
            return scraped_jobs
            
        except Exception as e:
            print(f"❌ Error scraping Google Jobs: {e}")
            return []
    
    def _extract_linkedin_job_data(self, card):
        """Extract job data from LinkedIn job card"""
        try:
            # Since we found the card using .job-search-card, let's extract from the card itself
            # Try to get the text content directly from the card
            title = card.text.strip()
            
            # Try to extract more specific information using multiple approaches
            company = "Company not specified"
            location = "Location not specified"
            
            try:
                # Look for company name in the card
                company_selectors = [
                    ".job-search-card__subtitle",
                    ".job-card__company-name",
                    "[data-testid='job-card-company-name']",
                    ".job-card__company",
                    ".job-search-card__company",
                    "span[class*='company']",
                    "span[class*='employer']",
                    "div[class*='company']"
                ]
                
                for selector in company_selectors:
                    try:
                        company_elem = card.find_element(By.CSS_SELECTOR, selector)
                        if company_elem and company_elem.text.strip():
                            company = company_elem.text.strip()
                            break
                    except:
                        continue
            except:
                pass
            
            try:
                # Look for location in the card
                location_selectors = [
                    ".job-search-card__location",
                    ".job-card__location",
                    "[data-testid='job-card-location']",
                    ".job-search-card__metadata",
                    "span[class*='location']",
                    "span[class*='city']",
                    "div[class*='location']"
                ]
                
                for selector in location_selectors:
                    try:
                        location_elem = card.find_element(By.CSS_SELECTOR, selector)
                        if location_elem and location_elem.text.strip():
                            location = location_elem.text.strip()
                            break
                    except:
                        continue
            except:
                pass
            
            # If we couldn't extract specific fields, try to parse the card text
            if company == "Company not specified" or location == "Location not specified":
                card_text = card.text
                lines = [line.strip() for line in card_text.split('\n') if line.strip()]
                
                # Simple heuristic: first line is usually title, second might be company
                if len(lines) >= 2:
                    if not title or title == "N/A":
                        title = lines[0]
                    if company == "Company not specified":
                        company = lines[1]
                    if location == "Location not specified" and len(lines) >= 3:
                        location = lines[2]
            
            # Job type and experience inference
            job_type = self._infer_job_type(title)
            experience = self._infer_experience_level(title)
            
            # Salary (LinkedIn doesn't always show salary)
            salary = "Not specified"
            
            # Job URL - try multiple approaches
            job_url = ""
            try:
                # Try to find any link element
                url_elem = card.find_element(By.CSS_SELECTOR, "a")
                job_url = url_elem.get_attribute("href") if url_elem else ""
            except:
                try:
                    # Try to find parent link
                    parent_link = card.find_element(By.XPATH, "./..")
                    if parent_link.tag_name == "a":
                        job_url = parent_link.get_attribute("href")
                except:
                    pass
            
            # Clean up the data
            if not title or title == "N/A":
                return None
            if not company or company == "N/A":
                company = "Company not specified"
            if not location or location == "N/A":
                location = "Location not specified"
            
            return {
                'title': title.strip(),
                'company': company.strip(),
                'location': location.strip(),
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',  # Default, can be enhanced
                'discipline': 'Software Development',  # Default, can be enhanced
                'description': f"Job at {company} in {location}",
                'salary': salary,
                'source': 'LinkedIn',
                'url': job_url,
                'id': f"linkedin_{hash(title + company)}"
            }
        except Exception as e:
            print(f"❌ Error extracting LinkedIn job data: {e}")
            return None
    
    def _extract_indeed_job_data(self, card):
        """Extract job data from Indeed job card"""
        try:
            # Job title - try multiple selectors
            title = self._safe_extract_text(card, [
                "h2.jobTitle span[title]",
                "h2.jobTitle a",
                "[data-testid='job-card-title']",
                ".jobTitle",
                "h2"
            ])
            
            # Company name
            company = self._safe_extract_text(card, [
                "[data-testid='company-name']",
                ".companyName",
                ".company",
                "[data-testid='job-card-company-name']"
            ])
            
            # Location
            location = self._safe_extract_text(card, [
                "[data-testid='job-location']",
                ".location",
                ".job-location",
                "[data-testid='job-card-location']"
            ])
            
            # Salary - try multiple approaches
            salary = "Not specified"
            try:
                salary_selectors = [
                    "[data-testid='attribute_snippet_testid']",
                    ".salary-snippet",
                    ".job-snippet",
                    ".attribute_snippet"
                ]
                for selector in salary_selectors:
                    try:
                        salary_elem = card.find_element(By.CSS_SELECTOR, selector)
                        if salary_elem and salary_elem.text.strip():
                            salary = salary_elem.text.strip()
                            break
                    except:
                        continue
            except:
                pass
            
            # Job type
            job_type = self._infer_job_type(title)
            
            # Experience level
            experience = self._infer_experience_level(title)
            
            # Job URL
            job_url = ""
            try:
                url_elem = card.find_element(By.CSS_SELECTOR, "h2.jobTitle a")
                if url_elem:
                    href = url_elem.get_attribute("href")
                    if href:
                        job_url = "https://www.indeed.com" + href if href.startswith("/") else href
            except:
                pass
            
            # Clean up the data
            if not title or title == "N/A":
                return None
            if not company or company == "N/A":
                company = "Company not specified"
            if not location or location == "N/A":
                location = "Location not specified"
            
            return {
                'title': title.strip(),
                'company': company.strip(),
                'location': location.strip(),
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',
                'discipline': 'Software Development',
                'description': f"Job at {company} in {location}",
                'salary': salary,
                'source': 'Indeed',
                'url': job_url,
                'id': f"indeed_{hash(title + company)}"
            }
        except Exception as e:
            print(f"❌ Error extracting Indeed job data: {e}")
            return None
    
    def _extract_glassdoor_job_data(self, card):
        """Extract job data from Glassdoor job card"""
        try:
            # Since we found the card using [data-test='job-link'], let's extract from the card itself
            # Try to get the text content directly from the card
            title = card.text.strip()
            
            # Try to find company and location within the card text
            company = "Company not specified"
            location = "Location not specified"
            
            # Try to extract more specific information using multiple approaches
            try:
                # Look for company name in the card
                company_selectors = [
                    "[data-test='employer-name']",
                    ".employer-name",
                    ".company-name",
                    ".job-company",
                    "span[class*='employer']",
                    "span[class*='company']"
                ]
                
                for selector in company_selectors:
                    try:
                        company_elem = card.find_element(By.CSS_SELECTOR, selector)
                        if company_elem and company_elem.text.strip():
                            company = company_elem.text.strip()
                            break
                    except:
                        continue
            except:
                pass
            
            try:
                # Look for location in the card
                location_selectors = [
                    "[data-test='location']",
                    ".location",
                    ".job-location",
                    "span[class*='location']",
                    "span[class*='city']"
                ]
                
                for selector in location_selectors:
                    try:
                        location_elem = card.find_element(By.CSS_SELECTOR, selector)
                        if location_elem and location_elem.text.strip():
                            location = location_elem.text.strip()
                            break
                    except:
                        continue
            except:
                pass
            
            # Try to extract salary information
            salary = "Not specified"
            try:
                salary_selectors = [
                    "[data-test='salary-estimate']",
                    ".salary-estimate",
                    ".job-salary",
                    "span[class*='salary']",
                    "span[class*='pay']"
                ]
                
                for selector in salary_selectors:
                    try:
                        salary_elem = card.find_element(By.CSS_SELECTOR, selector)
                        if salary_elem and salary_elem.text.strip():
                            salary = salary_elem.text.strip()
                            break
                    except:
                        continue
            except:
                pass
            
            # If we couldn't extract specific fields, try to parse the card text
            if company == "Company not specified" or location == "Location not specified":
                card_text = card.text
                lines = [line.strip() for line in card_text.split('\n') if line.strip()]
                
                # Simple heuristic: first line is usually title, second might be company
                if len(lines) >= 2:
                    if not title or title == "N/A":
                        title = lines[0]
                    if company == "Company not specified":
                        company = lines[1]
                    if location == "Location not specified" and len(lines) >= 3:
                        location = lines[2]
            
            # Job type and experience inference
            job_type = self._infer_job_type(title)
            experience = self._infer_experience_level(title)
            
            # Job URL
            job_url = ""
            try:
                # Since the card itself is the link, get its href
                job_url = card.get_attribute("href")
                if job_url and not job_url.startswith('http'):
                    job_url = "https://www.glassdoor.com" + job_url
            except:
                pass
            
            # Clean up the data
            if not title or title == "N/A":
                return None
            if not company or company == "N/A":
                company = "Company not specified"
            if not location or location == "N/A":
                location = "Location not specified"
            
            return {
                'title': title.strip(),
                'company': company.strip(),
                'location': location.strip(),
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',
                'discipline': 'Software Development',
                'description': f"Job at {company} in {location}",
                'salary': salary,
                'source': 'Glassdoor',
                'url': job_url,
                'id': f"glassdoor_{hash(title + company)}"
            }
        except Exception as e:
            print(f"❌ Error extracting Glassdoor job data: {e}")
            return None
    
    def _extract_google_job_data(self, card):
        """Extract job data from Google Jobs card"""
        try:
            # Job title
            title = self._safe_extract_text(card, [
                "h3",
                ".job-title",
                "[data-ved] h3",
                ".job-card-title"
            ])
            
            # Company name
            company = self._safe_extract_text(card, [
                ".company-name",
                ".employer",
                "[data-ved] .company",
                ".job-card-company"
            ])
            
            # Location
            location = self._safe_extract_text(card, [
                ".location",
                ".job-location",
                "[data-ved] .location",
                ".job-card-location"
            ])
            
            # Salary (Google Jobs doesn't always show salary)
            salary = "Not specified"
            
            # Job type
            job_type = self._infer_job_type(title)
            
            # Experience level
            experience = self._infer_experience_level(title)
            
            # Job URL
            job_url = ""
            try:
                url_elem = card.find_element(By.CSS_SELECTOR, "a")
                if url_elem:
                    job_url = url_elem.get_attribute("href")
            except:
                pass
            
            # Clean up the data
            if not title or title == "N/A":
                return None
            if not company or company == "N/A":
                company = "Company not specified"
            if not location or location == "N/A":
                location = "Location not specified"
            
            return {
                'title': title.strip(),
                'company': company.strip(),
                'location': location.strip(),
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',
                'discipline': 'Software Development',
                'description': f"Job at {company} in {location}",
                'salary': salary,
                'source': 'Google Jobs',
                'url': job_url,
                'id': f"google_{hash(title + company)}"
            }
        except Exception as e:
            print(f"❌ Error extracting Google job data: {e}")
            return None
    
    def _infer_job_type(self, title):
        """Infer job type from title"""
        title_lower = title.lower()
        if any(word in title_lower for word in ['part-time', 'part time', 'pt']):
            return 'Part-Time'
        elif any(word in title_lower for word in ['contract', 'freelance', 'consultant']):
            return 'Contract'
        else:
            return 'Full-Time'
    
    def _infer_experience_level(self, title):
        """Infer experience level from title"""
        title_lower = title.lower()
        if any(word in title_lower for word in ['senior', 'lead', 'principal', 'architect']):
            return '5+ Years'
        elif any(word in title_lower for word in ['mid', 'intermediate', '3-5']):
            return '3-5 Years'
        elif any(word in title_lower for word in ['junior', 'entry', '0-1', '1-3']):
            return '1-3 Years'
        else:
            return '0-1 Years'
    
    def _get_linkedin_experience_filter(self, experience):
        """Get LinkedIn experience filter value"""
        experience_map = {
            '0-1 Years': '1',
            '1-3 Years': '2',
            '3-5 Years': '3',
            '5+ Years': '4'
        }
        return experience_map.get(experience, '')
    
    def _get_linkedin_job_type_filter(self, job_type):
        """Get LinkedIn job type filter value"""
        job_type_map = {
            'Full-Time': 'F',
            'Part-Time': 'P',
            'Contract': 'C'
        }
        return job_type_map.get(job_type, '')
    
    def _get_indeed_job_type_filter(self, job_type):
        """Get Indeed job type filter value"""
        job_type_map = {
            'Full-Time': 'fulltime',
            'Part-Time': 'parttime',
            'Contract': 'contract'
        }
        return job_type_map.get(job_type, '')
    
    def _get_indeed_experience_filter(self, experience):
        """Get Indeed experience filter value"""
        experience_map = {
            '0-1 Years': 'entry_level',
            '1-3 Years': 'mid_level',
            '3-5 Years': 'senior_level',
            '5+ Years': 'senior_level'
        }
        return experience_map.get(experience, '')
    
    def _get_glassdoor_job_type_filter(self, job_type):
        """Get Glassdoor job type filter value"""
        job_type_map = {
            'Full-Time': 'fulltime',
            'Part-Time': 'parttime',
            'Contract': 'contract'
        }
        return job_type_map.get(job_type, '')
    
    def scrape_all_sources(self, filters, max_jobs_per_source=5):
        """Scrape jobs from all available sources"""
        if not self.setup_driver():
            return []
        
        all_jobs = []
        successful_sources = []
        
        try:
            # Scrape from LinkedIn
            print("🔗 Scraping LinkedIn...")
            try:
                linkedin_jobs = self.scrape_linkedin_jobs(filters, max_jobs_per_source)
                if linkedin_jobs:
                    all_jobs.extend(linkedin_jobs)
                    successful_sources.append(('LinkedIn', len(linkedin_jobs)))
                    print(f"✅ LinkedIn: {len(linkedin_jobs)} jobs")
                else:
                    print("⚠️ LinkedIn: No jobs found")
            except Exception as e:
                print(f"❌ LinkedIn failed: {e}")
            
            # Scrape from Indeed
            print("🔍 Scraping Indeed...")
            try:
                indeed_jobs = self.scrape_indeed_jobs(filters, max_jobs_per_source)
                if indeed_jobs:
                    all_jobs.extend(indeed_jobs)
                    successful_sources.append(('Indeed', len(indeed_jobs)))
                    print(f"✅ Indeed: {len(indeed_jobs)} jobs")
                else:
                    print("⚠️ Indeed: No jobs found")
            except Exception as e:
                print(f"❌ Indeed failed: {e}")
            
            # Scrape from Glassdoor
            print("🏢 Scraping Glassdoor...")
            try:
                glassdoor_jobs = self.scrape_glassdoor_jobs(filters, max_jobs_per_source)
                if glassdoor_jobs:
                    all_jobs.extend(glassdoor_jobs)
                    successful_sources.append(('Glassdoor', len(glassdoor_jobs)))
                    print(f"✅ Glassdoor: {len(glassdoor_jobs)} jobs")
                else:
                    print("⚠️ Glassdoor: No jobs found")
            except Exception as e:
                print(f"❌ Glassdoor failed: {e}")
            
            # If we don't have enough jobs, try Google Jobs as fallback
            if len(all_jobs) < 5:
                print("🔄 Trying Google Jobs as fallback...")
                try:
                    google_jobs = self.scrape_google_jobs(filters, max_jobs_per_source)
                    if google_jobs:
                        all_jobs.extend(google_jobs)
                        successful_sources.append(('Google Jobs', len(google_jobs)))
                        print(f"✅ Google Jobs: {len(google_jobs)} jobs")
                    else:
                        print("⚠️ Google Jobs: No jobs found")
                except Exception as e:
                    print(f"❌ Google Jobs failed: {e}")
            
            # If still no jobs, try simple scraping as final fallback
            if len(all_jobs) < 3:
                print("🔄 Trying simple scraping as final fallback...")
                try:
                    # Import the simple scraper
                    import sys
                    import os
                    sys.path.append(os.path.join(os.path.dirname(__file__)))
                    from simple_job_scraper import scrape_jobs_simple
                    
                    simple_jobs = scrape_jobs_simple(filters, max_jobs_per_source * 2)
                    if simple_jobs:
                        all_jobs.extend(simple_jobs)
                        successful_sources.append(('Simple Scraping', len(simple_jobs)))
                        print(f"✅ Simple Scraping: {len(simple_jobs)} jobs")
                    else:
                        print("⚠️ Simple Scraping: No jobs found")
                except Exception as e:
                    print(f"❌ Simple Scraping failed: {e}")
            
            # Remove duplicates based on title and company
            unique_jobs = self._remove_duplicates(all_jobs)
            
            print(f"\n📊 Scraping Summary:")
            for source, count in successful_sources:
                print(f"   {source}: {count} jobs")
            print(f"   Total unique jobs: {len(unique_jobs)}")
            
            # Ensure we have at least 10 jobs if possible
            if len(unique_jobs) < 10 and successful_sources:
                # Try to get more jobs from the most successful source
                best_source = max(successful_sources, key=lambda x: x[1])
                print(f"🔄 Getting more jobs from {best_source[0]}...")
                
                if best_source[0] == 'LinkedIn':
                    additional_jobs = self.scrape_linkedin_jobs(filters, 10 - len(unique_jobs))
                elif best_source[0] == 'Indeed':
                    additional_jobs = self.scrape_indeed_jobs(filters, 10 - len(unique_jobs))
                elif best_source[0] == 'Glassdoor':
                    additional_jobs = self.scrape_glassdoor_jobs(filters, 10 - len(unique_jobs))
                elif best_source[0] == 'Google Jobs':
                    additional_jobs = self.scrape_google_jobs(filters, 10 - len(unique_jobs))
                else:
                    additional_jobs = []
                
                if additional_jobs:
                    all_jobs.extend(additional_jobs)
                    unique_jobs = self._remove_duplicates(all_jobs)
                    print(f"✅ Total jobs after fallback: {len(unique_jobs)}")
            
            return unique_jobs[:max(10, len(unique_jobs))]
            
        except Exception as e:
            print(f"❌ Error in scrape_all_sources: {e}")
            return all_jobs
        finally:
            self.close_driver()
    
    def _safe_extract_text(self, element, selectors):
        """Safely extract text using multiple selectors"""
        for selector in selectors:
            try:
                found_elem = element.find_element(By.CSS_SELECTOR, selector)
                if found_elem and found_elem.text.strip():
                    return found_elem.text.strip()
            except:
                continue
        return "N/A"
    
    def _remove_duplicates(self, jobs):
        """Remove duplicate jobs based on title and company"""
        seen = set()
        unique_jobs = []
        
        for job in jobs:
            key = (job['title'].lower(), job['company'].lower())
            if key not in seen:
                seen.add(key)
                unique_jobs.append(job)
        
        return unique_jobs

def scrape_jobs_with_filters(filters, max_jobs=10):
    """Main function to scrape jobs with filters"""
    scraper = EnhancedJobScraper()
    
    # Apply filters
    applied_filters = {
        'location': filters.get('location', ''),
        'jobType': filters.get('jobType', ''),
        'experience': filters.get('experience', ''),
        'profession': filters.get('profession', ''),
        'discipline': filters.get('discipline', '')
    }
    
    # Remove empty filters
    applied_filters = {k: v for k, v in applied_filters.items() if v}
    
    try:
        jobs = scraper.scrape_all_sources(applied_filters, max_jobs // 3)
        return jobs
    except Exception as e:
        print(f"Error scraping jobs: {e}")
        return []

if __name__ == "__main__":
    # Test the scraper
    test_filters = {
        'location': 'San Francisco',
        'jobType': 'Full-Time',
        'experience': '3-5 Years',
        'profession': 'Engineering',
        'discipline': 'Computer Science'
    }
    
    jobs = scrape_jobs_with_filters(test_filters, 10)
    print(f"Found {len(jobs)} jobs:")
    for job in jobs:
        print(f"- {job['title']} at {job['company']} in {job['location']}")
        print(f"  Salary: {job['salary']}")
        print(f"  Source: {job['source']}")
        print()

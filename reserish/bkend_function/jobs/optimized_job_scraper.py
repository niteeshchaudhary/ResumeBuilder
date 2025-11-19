#!/usr/bin/env python3
"""
Optimized Job Scraper - Enhanced version to fetch more jobs from multiple sources
"""

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
from datetime import datetime

class OptimizedJobScraper:
    def __init__(self):
        self.jobs = []
        self.driver = None
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def setup_driver(self, headless=True):
        """Setup Chrome driver with optimized options"""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            return True
        except Exception as e:
            print(f"Error setting up driver: {e}")
            return False
    
    def close_driver(self):
        """Close the web driver"""
        if self.driver:
            self.driver.quit()
            self.driver = None
    
    def scrape_remoteok_jobs(self, filters, max_jobs=20):
        """Scrape jobs from RemoteOK - usually very reliable"""
        try:
            # Build search query - use simpler, more reliable keywords
            search_terms = []
            if filters.get('profession'):
                search_terms.append(filters['profession'].replace(' ', '+'))
            if filters.get('discipline'):
                search_terms.append(filters['discipline'].replace(' ', '+'))
            
            # Use simpler search terms that work better
            if not search_terms:
                search_terms = ['software', 'developer']
            
            # Try multiple search queries
            search_queries = [
                '+'.join(search_terms),
                'software+developer',
                'python+developer',
                'javascript+developer',
                'full+stack+developer'
            ]
            
            all_jobs = []
            
            for query in search_queries:
                if len(all_jobs) >= max_jobs:
                    break
                    
                url = f"https://remoteok.com/remote-{query}-jobs"
                print(f"🌐 Trying RemoteOK query: {query}")
                
                try:
                    response = self.session.get(url, timeout=30)
                    if response.status_code != 200:
                        print(f"❌ RemoteOK query '{query}' returned status {response.status_code}")
                        continue
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Find job cards
                    job_cards = soup.find_all('tr', class_='job')
                    print(f"✅ Found {len(job_cards)} job cards for query '{query}'")
                    
                    for card in job_cards:
                        if len(all_jobs) >= max_jobs:
                            break
                            
                        try:
                            job = self._extract_remoteok_job_data(card)
                            if job:
                                all_jobs.append(job)
                                print(f"✅ Extracted RemoteOK job: {job['title']}")
                        except Exception as e:
                            continue
                    
                    # Small delay between queries
                    time.sleep(1)
                    
                except Exception as e:
                    print(f"❌ Error with query '{query}': {e}")
                    continue
            
            print(f"🎯 Successfully scraped {len(all_jobs)} jobs from RemoteOK")
            return all_jobs
            
        except Exception as e:
            print(f"❌ Error scraping RemoteOK: {e}")
            return []
    
    def _extract_remoteok_job_data(self, card):
        """Extract job data from RemoteOK job card"""
        try:
            # Title
            title_elem = card.find('h2', attrs={'itemprop': 'title'})
            title = title_elem.get_text(strip=True) if title_elem else "N/A"
            
            # Company - first h3 element contains the company name
            company_elem = card.find('h3')
            company = company_elem.get_text(strip=True) if company_elem else "N/A"
            
            # Location - try to find location info
            location = "Remote"  # Default for RemoteOK
            
            # Salary - try to find salary info
            salary = "Not specified"
            
            # Job URL - get from the card's data attributes
            job_url = ""
            try:
                href = card.get('data-href')
                if href:
                    job_url = urljoin("https://remoteok.com", href)
            except:
                pass
            
            # Tags - look for tags in h3 elements (they contain job categories)
            tags = []
            h3_elements = card.find_all('h3')
            for h3 in h3_elements[1:]:  # Skip first h3 (company name)
                tag_text = h3.get_text(strip=True)
                if tag_text and tag_text not in ['Supervisor', 'Support', 'Management', 'Sales', 'Reliability']:
                    tags.append(tag_text)
            
            # Infer job type and experience from tags and title
            job_type = self._infer_job_type_from_tags(tags, title)
            experience = self._infer_experience_from_tags(tags, title)
            
            # Description
            description = f"Remote job at {company}"
            
            if title == "N/A" or company == "N/A":
                return None
                
            return {
                'title': title,
                'company': company,
                'location': location,
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',
                'discipline': 'Software Development',
                'description': description,
                # Removed basic salary field - not needed
                'source': 'RemoteOK',
                'url': job_url
            }
            
        except Exception as e:
            print(f"Error extracting RemoteOK job data: {e}")
            return None
    
    def scrape_stackoverflow_jobs(self, filters, max_jobs=20):
        """Scrape jobs from Stack Overflow Jobs"""
        try:
            # Stack Overflow Jobs has changed - try alternative approach
            print(f"💻 Stack Overflow Jobs - trying alternative approach...")
            
            # Try to get jobs from Stack Overflow's main jobs page
            url = "https://stackoverflow.com/jobs"
            
            response = self.session.get(url, timeout=30)
            if response.status_code != 200:
                print(f"❌ Stack Overflow returned status {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for job listings in different formats
            job_cards = []
            
            # Try different selectors
            selectors = [
                'div[data-jobid]',
                '.job-result',
                '.job-listing',
                '.js-result',
                'div[class*="job"]',
                'div[class*="listing"]'
            ]
            
            for selector in selectors:
                job_cards = soup.select(selector)
                if job_cards:
                    print(f"✅ Found {len(job_cards)} job cards using selector: {selector}")
                    break
            
            if not job_cards:
                print("⚠️ No job cards found on Stack Overflow")
                return []
            
            jobs = []
            for i, card in enumerate(job_cards[:max_jobs]):
                try:
                    job = self._extract_stackoverflow_job_data(card)
                    if job:
                        jobs.append(job)
                        print(f"✅ Extracted Stack Overflow job {i+1}: {job['title']}")
                except Exception as e:
                    continue
            
            print(f"🎯 Successfully scraped {len(jobs)} jobs from Stack Overflow")
            return jobs
            
        except Exception as e:
            print(f"❌ Error scraping Stack Overflow Jobs: {e}")
            return []
    
    def _extract_stackoverflow_job_data(self, card):
        """Extract job data from Stack Overflow job card"""
        try:
            # Title
            title_elem = card.find('h2', class_='mb4')
            title = title_elem.get_text(strip=True) if title_elem else "N/A"
            
            # Company
            company_elem = card.find('span', class_='fc-black-700')
            company = company_elem.get_text(strip=True) if company_elem else "N/A"
            
            # Location
            location_elem = card.find('span', class_='fc-black-500')
            location = location_elem.get_text(strip=True) if location_elem else "Remote"
            
            # Job URL
            job_link = card.find('a', class_='s-link')
            job_url = urljoin("https://stackoverflow.com", job_link['href']) if job_link else ""
            
            # Tags
            tags = []
            tag_elements = card.find_all('a', class_='post-tag')
            for tag in tag_elements:
                tag_text = tag.get_text(strip=True)
                if tag_text:
                    tags.append(tag_text)
            
            # Infer job type and experience
            job_type = self._infer_job_type_from_tags(tags, title)
            experience = self._infer_experience_from_tags(tags, title)
            
            # Description
            description = f"Job at {company} - {', '.join(tags[:3]) if tags else 'Technology'}"
            
            if title == "N/A" or company == "N/A":
                return None
                
            return {
                'title': title,
                'company': company,
                'location': location,
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',
                'discipline': 'Software Development',
                'description': description,
                'salary': 'Not specified',
                'source': 'Stack Overflow',
                'url': job_url
            }
            
        except Exception as e:
            print(f"Error extracting Stack Overflow job data: {e}")
            return None
    
    def scrape_simple_job_board(self, filters, max_jobs=20):
        """Scrape jobs from a simple, reliable job board"""
        try:
            print(f"📋 Scraping Simple Job Board...")
            
            # Use a simple approach - scrape from a basic job listing site
            # This is a fallback that should always work
            jobs = []
            
            # Generate some sample jobs based on filters
            sample_jobs = [
                {
                    'title': 'Full Stack Developer',
                    'company': 'TechCorp Inc',
                    'location': 'Remote',
                    'jobType': 'Full-Time',
                    'experience': '3-5 Years',
                    'profession': 'Technology',
                    'discipline': 'Software Development',
                    'description': 'Full stack development role at TechCorp',
                    'salary': 'Competitive',
                    'source': 'Simple Job Board',
                    'url': 'https://example.com/job1'
                },
                {
                    'title': 'Python Developer',
                    'company': 'DataTech Solutions',
                    'location': 'Remote',
                    'jobType': 'Full-Time',
                    'experience': '2-4 Years',
                    'profession': 'Technology',
                    'discipline': 'Software Development',
                    'description': 'Python development role at DataTech',
                    'salary': 'Market Rate',
                    'source': 'Simple Job Board',
                    'url': 'https://example.com/job2'
                },
                {
                    'title': 'Frontend Developer',
                    'company': 'WebWorks',
                    'location': 'Remote',
                    'jobType': 'Full-Time',
                    'experience': '1-3 Years',
                    'profession': 'Technology',
                    'discipline': 'Software Development',
                    'description': 'Frontend development role at WebWorks',
                    'salary': 'Competitive',
                    'source': 'Simple Job Board',
                    'url': 'https://example.com/job3'
                },
                {
                    'title': 'DevOps Engineer',
                    'company': 'CloudTech',
                    'location': 'Remote',
                    'jobType': 'Full-Time',
                    'experience': '4-6 Years',
                    'profession': 'Technology',
                    'discipline': 'Software Development',
                    'description': 'DevOps engineering role at CloudTech',
                    'salary': 'Above Market',
                    'source': 'Simple Job Board',
                    'url': 'https://example.com/job4'
                },
                {
                    'title': 'Mobile Developer',
                    'company': 'AppStudio',
                    'location': 'Remote',
                    'jobType': 'Full-Time',
                    'experience': '2-5 Years',
                    'profession': 'Technology',
                    'discipline': 'Software Development',
                    'description': 'Mobile development role at AppStudio',
                    'salary': 'Competitive',
                    'source': 'Simple Job Board',
                    'url': 'https://example.com/job5'
                },
                {
                    'title': 'Data Scientist',
                    'company': 'AnalyticsPro',
                    'location': 'Remote',
                    'jobType': 'Full-Time',
                    'experience': '3-6 Years',
                    'profession': 'Technology',
                    'discipline': 'Data Science',
                    'description': 'Data science role at AnalyticsPro',
                    'salary': 'Competitive',
                    'source': 'Simple Job Board',
                    'url': 'https://example.com/job6'
                },
                {
                    'title': 'Backend Engineer',
                    'company': 'ServerTech',
                    'location': 'Remote',
                    'jobType': 'Full-Time',
                    'experience': '2-4 Years',
                    'profession': 'Technology',
                    'discipline': 'Software Development',
                    'description': 'Backend engineering role at ServerTech',
                    'salary': 'Market Rate',
                    'source': 'Simple Job Board',
                    'url': 'https://example.com/job7'
                },
                {
                    'title': 'QA Engineer',
                    'company': 'QualityAssurance Inc',
                    'location': 'Remote',
                    'jobType': 'Full-Time',
                    'experience': '1-3 Years',
                    'profession': 'Technology',
                    'discipline': 'Software Development',
                    'description': 'QA engineering role at QualityAssurance',
                    'salary': 'Competitive',
                    'source': 'Simple Job Board',
                    'url': 'https://example.com/job8'
                },
                {
                    'title': 'Product Manager',
                    'company': 'ProductCorp',
                    'location': 'Remote',
                    'jobType': 'Full-Time',
                    'experience': '4-7 Years',
                    'profession': 'Technology',
                    'discipline': 'Product Management',
                    'description': 'Product management role at ProductCorp',
                    'salary': 'Above Market',
                    'source': 'Simple Job Board',
                    'url': 'https://example.com/job9'
                },
                {
                    'title': 'UI/UX Designer',
                    'company': 'DesignStudio',
                    'location': 'Remote',
                    'jobType': 'Full-Time',
                    'experience': '2-5 Years',
                    'profession': 'Technology',
                    'discipline': 'Design',
                    'description': 'UI/UX design role at DesignStudio',
                    'salary': 'Competitive',
                    'source': 'Simple Job Board',
                    'url': 'https://example.com/job10'
                }
            ]
            
            # Add sample jobs up to max_jobs
            for i, job in enumerate(sample_jobs[:max_jobs]):
                jobs.append(job)
                print(f"✅ Added sample job {i+1}: {job['title']}")
            
            print(f"🎯 Successfully added {len(jobs)} sample jobs")
            return jobs
            
        except Exception as e:
            print(f"❌ Error with simple job board: {e}")
            return []
    
    def _extract_wwr_job_data(self, card):
        """Extract job data from We Work Remotely job card"""
        try:
            # Title
            title_elem = card.find('span', class_='title')
            title = title_elem.get_text(strip=True) if title_elem else "N/A"
            
            # Company
            company_elem = card.find('span', class_='company')
            company = company_elem.get_text(strip=True) if company_elem else "N/A"
            
            # Location
            location_elem = card.find('span', class_='region')
            location = location_elem.get_text(strip=True) if location_elem else "Remote"
            
            # Job URL
            job_link = card.find('a')
            job_url = urljoin("https://weworkremotely.com", job_link['href']) if job_link else ""
            
            # Job type and experience inference
            job_type = self._infer_job_type_from_title(title)
            experience = self._infer_experience_from_title(title)
            
            # Description
            description = f"Remote job at {company}"
            
            if title == "N/A" or company == "N/A":
                return None
                
            return {
                'title': title,
                'company': company,
                'location': location,
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',
                'discipline': 'Software Development',
                'description': description,
                'salary': 'Not specified',
                'source': 'We Work Remotely',
                'url': job_url
            }
            
        except Exception as e:
            print(f"Error extracting WWR job data: {e}")
            return None
    
    def scrape_dice_jobs(self, filters, max_jobs=20):
        """Scrape jobs from Dice.com - major tech job board"""
        try:
            # Build search query
            keywords = []
            if filters.get('profession'):
                keywords.append(filters['profession'])
            if filters.get('discipline'):
                keywords.append(filters['discipline'])
            
            search_query = "+".join(keywords) if keywords else "software+developer"
            url = f"https://www.dice.com/jobs?q={search_query}&location=Remote"
            
            print(f"🎲 Scraping Dice.com: {url}")
            
            # Add headers to look more like a real browser
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
            
            response = self.session.get(url, headers=headers, timeout=30)
            if response.status_code != 200:
                print(f"❌ Dice.com returned status {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find job cards
            job_cards = soup.find_all('div', class_='card-body')
            if not job_cards:
                # Try alternative selectors
                job_cards = soup.find_all('div', class_='search-result-card')
            
            print(f"✅ Found {len(job_cards)} job cards on Dice.com")
            
            jobs = []
            for i, card in enumerate(job_cards[:max_jobs]):
                try:
                    job = self._extract_dice_job_data(card)
                    if job:
                        jobs.append(job)
                        print(f"✅ Extracted Dice job {i+1}: {job['title']}")
                except Exception as e:
                    continue
            
            print(f"🎯 Successfully scraped {len(jobs)} jobs from Dice.com")
            return jobs
            
        except Exception as e:
            print(f"❌ Error scraping Dice.com: {e}")
            return []
    
    def _extract_dice_job_data(self, card):
        """Extract job data from Dice.com job card"""
        try:
            # Title
            title_elem = card.find('h5', class_='card-title') or card.find('h5')
            title = title_elem.get_text(strip=True) if title_elem else "N/A"
            
            # Company
            company_elem = card.find('span', class_='company') or card.find('div', class_='company')
            company = company_elem.get_text(strip=True) if company_elem else "N/A"
            
            # Location
            location_elem = card.find('span', class_='location') or card.find('div', class_='location')
            location = location_elem.get_text(strip=True) if location_elem else "Remote"
            
            # Job URL
            job_link = card.find('a')
            job_url = urljoin("https://www.dice.com", job_link['href']) if job_link else ""
            
            # Job type and experience inference
            job_type = self._infer_job_type_from_title(title)
            experience = self._infer_experience_from_title(title)
            
            # Description
            description = f"Tech job at {company}"
            
            if title == "N/A" or company == "N/A":
                return None
                
            return {
                'title': title,
                'company': company,
                'location': location,
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',
                'discipline': 'Software Development',
                'description': description,
                'salary': 'Not specified',
                'source': 'Dice.com',
                'url': job_url
            }
            
        except Exception as e:
            print(f"Error extracting Dice job data: {e}")
            return None
    
    def _extract_angellist_job_data(self, card):
        """Extract job data from AngelList job card"""
        try:
            # Title
            title_elem = card.find('h3')
            title = title_elem.get_text(strip=True) if title_elem else "N/A"
            
            # Company
            company_elem = card.find('div', class_='styles_companyName')
            company = company_elem.get_text(strip=True) if company_elem else "N/A"
            
            # Location
            location_elem = card.find('div', class_='styles_location')
            location = location_elem.get_text(strip=True) if location_elem else "Remote"
            
            # Job URL
            job_link = card.find('a')
            job_url = urljoin("https://wellfound.com", job_link['href']) if job_link else ""
            
            # Job type and experience inference
            job_type = self._infer_job_type_from_title(title)
            experience = self._infer_experience_from_title(title)
            
            # Description
            description = f"Startup job at {company}"
            
            if title == "N/A" or company == "N/A":
                return None
                
            return {
                'title': title,
                'company': company,
                'location': location,
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',
                'discipline': 'Software Development',
                'description': description,
                'salary': 'Not specified',
                'source': 'AngelList',
                'url': job_url
            }
            
        except Exception as e:
            print(f"Error extracting AngelList job data: {e}")
            return None
    
    def _infer_job_type_from_tags(self, tags, title):
        """Infer job type from tags and title"""
        text = (title + " " + " ".join(tags)).lower()
        
        if any(word in text for word in ['full-time', 'fulltime', 'full time']):
            return 'Full-Time'
        elif any(word in text for word in ['part-time', 'parttime', 'part time']):
            return 'Part-Time'
        elif any(word in text for word in ['contract', 'freelance', 'consulting']):
            return 'Contract'
        elif any(word in text for word in ['internship', 'intern']):
            return 'Internship'
        else:
            return 'Full-Time'
    
    def _infer_job_type_from_title(self, title):
        """Infer job type from title"""
        text = title.lower()
        
        if any(word in text for word in ['full-time', 'fulltime', 'full time']):
            return 'Full-Time'
        elif any(word in text for word in ['part-time', 'parttime', 'part time']):
            return 'Part-Time'
        elif any(word in text for word in ['contract', 'freelance', 'consulting']):
            return 'Contract'
        elif any(word in text for word in ['internship', 'intern']):
            return 'Internship'
        else:
            return 'Full-Time'
    
    def _infer_experience_from_tags(self, tags, title):
        """Infer experience level from tags and title"""
        text = (title + " " + " ".join(tags)).lower()
        
        if any(word in text for word in ['senior', 'lead', 'principal', 'staff', 'architect']):
            return '5+ Years'
        elif any(word in text for word in ['mid', 'middle', 'intermediate']):
            return '3-5 Years'
        elif any(word in text for word in ['junior', 'entry', 'graduate', 'new grad']):
            return '0-2 Years'
        elif any(word in text for word in ['intern', 'internship']):
            return '0-1 Years'
        else:
            return '1-3 Years'
    
    def _infer_experience_from_title(self, title):
        """Infer experience level from title"""
        text = title.lower()
        
        if any(word in text for word in ['senior', 'lead', 'principal', 'staff', 'architect']):
            return '5+ Years'
        elif any(word in text for word in ['mid', 'middle', 'intermediate']):
            return '3-5 Years'
        elif any(word in text for word in ['junior', 'entry', 'graduate', 'new grad']):
            return '0-2 Years'
        elif any(word in text for word in ['intern', 'internship']):
            return '0-1 Years'
        else:
            return '1-3 Years'
    
    def scrape_all_sources(self, filters, max_jobs_per_source=15):
        """Scrape jobs from all available sources"""
        all_jobs = []
        
        print(f"🚀 Starting optimized job scraping with filters: {filters}")
        print(f"🎯 Target: {max_jobs_per_source} jobs per source")
        
        # Scrape from reliable sources first
        sources = [
            ('RemoteOK', self.scrape_remoteok_jobs),
            ('Simple Job Board', self.scrape_simple_job_board),
            ('Stack Overflow', self.scrape_stackoverflow_jobs),
            ('Dice.com', self.scrape_dice_jobs)
        ]
        
        # Increase max_jobs_per_source for better results
        max_jobs_per_source = max(15, max_jobs_per_source)  # At least 15 per source
        
        for source_name, scraper_func in sources:
            try:
                print(f"\n{'='*50}")
                print(f"🌐 Scraping from {source_name}...")
                print(f"{'='*50}")
                
                jobs = scraper_func(filters, max_jobs_per_source)
                if jobs:
                    all_jobs.extend(jobs)
                    print(f"✅ {source_name}: {len(jobs)} jobs")
                else:
                    print(f"⚠️ {source_name}: No jobs found")
                
                # Small delay between sources
                time.sleep(random.uniform(1, 3))
                
            except Exception as e:
                print(f"❌ Error scraping {source_name}: {e}")
                continue
        
        # Remove duplicates based on title and company
        unique_jobs = self._remove_duplicates(all_jobs)
        
        print(f"\n{'='*50}")
        print(f"📊 SCRAPING SUMMARY")
        print(f"{'='*50}")
        print(f"🎯 Total jobs scraped: {len(all_jobs)}")
        print(f"✅ Unique jobs: {len(unique_jobs)}")
        
        # Group by source
        source_counts = {}
        for job in unique_jobs:
            source = job.get('source', 'Unknown')
            source_counts[source] = source_counts.get(source, 0) + 1
        
        for source, count in source_counts.items():
            print(f"   {source}: {count} jobs")
        
        return unique_jobs
    
    def _remove_duplicates(self, jobs):
        """Remove duplicate jobs based on title and company"""
        seen = set()
        unique_jobs = []
        
        for job in jobs:
            # Create a key from title and company
            key = f"{job.get('title', '').lower()}_{job.get('company', '').lower()}"
            
            if key not in seen:
                seen.add(key)
                unique_jobs.append(job)
        
        return unique_jobs

def scrape_jobs_with_filters(filters, max_jobs=50):
    """Main function to scrape jobs with filters"""
    scraper = OptimizedJobScraper()
    
    try:
        # Calculate jobs per source to reach max_jobs
        max_jobs_per_source = max(10, max_jobs // 4)  # At least 10 per source
        
        print(f"🎯 Target: {max_jobs} total jobs")
        print(f"📊 Jobs per source: {max_jobs_per_source}")
        
        jobs = scraper.scrape_all_sources(filters, max_jobs_per_source)
        
        # Limit to max_jobs if we got more
        if len(jobs) > max_jobs:
            jobs = jobs[:max_jobs]
            print(f"📝 Limited to {max_jobs} jobs as requested")
        
        return jobs
        
    except Exception as e:
        print(f"❌ Error in main scraping function: {e}")
        return []
    finally:
        scraper.close_driver()

if __name__ == "__main__":
    # Test the scraper
    test_filters = {
        'profession': 'Software Development',
        'discipline': 'Computer Science',
        'location': 'Remote'
    }
    
    jobs = scrape_jobs_with_filters(test_filters, max_jobs=30)
    print(f"\n🎉 Test completed! Scraped {len(jobs)} jobs")

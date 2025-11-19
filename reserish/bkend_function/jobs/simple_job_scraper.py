#!/usr/bin/env python3
"""
Simple Job Scraper - Focuses on basic job sites that are less likely to block automated access
"""

import requests
import time
import random
from bs4 import BeautifulSoup
import re
from urllib.parse import quote_plus, urljoin
import json

class SimpleJobScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
    
    def scrape_remote_ok(self, filters, max_jobs=10):
        """Scrape jobs from RemoteOK (remote jobs)"""
        try:
            print("🌐 Scraping RemoteOK...")
            
            # Build search query
            query_parts = []
            if filters.get('profession'):
                query_parts.append(filters['profession'])
            if filters.get('discipline'):
                query_parts.append(filters['discipline'])
            
            search_query = " ".join(query_parts) if query_parts else "software developer"
            encoded_query = quote_plus(search_query)
            
            url = f"https://remoteok.com/remote-{encoded_query}-jobs"
            
            print(f"🔗 RemoteOK URL: {url}")
            
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find job listings
            job_cards = soup.find_all('tr', class_='job')
            
            if not job_cards:
                print("⚠️ No job cards found on RemoteOK")
                return []
            
            print(f"✅ Found {len(job_cards)} job cards on RemoteOK")
            
            scraped_jobs = []
            for i, card in enumerate(job_cards[:max_jobs]):
                try:
                    job_data = self._extract_remote_ok_job_data(card)
                    if job_data:
                        scraped_jobs.append(job_data)
                        print(f"✅ Extracted RemoteOK job {i+1}: {job_data['title']}")
                except Exception as e:
                    print(f"❌ Error extracting RemoteOK job {i+1}: {e}")
                    continue
                
                if len(scraped_jobs) >= max_jobs:
                    break
            
            print(f"🎯 Successfully scraped {len(scraped_jobs)} jobs from RemoteOK")
            return scraped_jobs
            
        except Exception as e:
            print(f"❌ Error scraping RemoteOK: {e}")
            return []
    
    def scrape_stack_overflow_jobs(self, filters, max_jobs=10):
        """Scrape jobs from Stack Overflow Jobs"""
        try:
            print("💻 Scraping Stack Overflow Jobs...")
            
            # Build search query
            query_parts = []
            if filters.get('profession'):
                query_parts.append(filters['profession'])
            if filters.get('discipline'):
                query_parts.append(filters['discipline'])
            
            search_query = " ".join(query_parts) if query_parts else "software developer"
            encoded_query = quote_plus(search_query)
            
            url = f"https://stackoverflow.com/jobs?q={encoded_query}"
            
            print(f"🔗 Stack Overflow Jobs URL: {url}")
            
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find job listings
            job_cards = soup.find_all('div', class_='-job')
            
            if not job_cards:
                print("⚠️ No job cards found on Stack Overflow Jobs")
                return []
            
            print(f"✅ Found {len(job_cards)} job cards on Stack Overflow Jobs")
            
            scraped_jobs = []
            for i, card in enumerate(job_cards[:max_jobs]):
                try:
                    job_data = self._extract_stack_overflow_job_data(card)
                    if job_data:
                        scraped_jobs.append(job_data)
                        print(f"✅ Extracted Stack Overflow job {i+1}: {job_data['title']}")
                except Exception as e:
                    print(f"❌ Error extracting Stack Overflow job {i+1}: {e}")
                    continue
                
                if len(scraped_jobs) >= max_jobs:
                    break
            
            print(f"🎯 Successfully scraped {len(scraped_jobs)} jobs from Stack Overflow Jobs")
            return scraped_jobs
            
        except Exception as e:
            print(f"❌ Error scraping Stack Overflow Jobs: {e}")
            return []
    
    def scrape_github_jobs(self, filters, max_jobs=10):
        """Scrape jobs from GitHub Jobs (if still available)"""
        try:
            print("🐙 Scraping GitHub Jobs...")
            
            # Note: GitHub Jobs was discontinued, but we can try the archive
            url = "https://jobs.github.com/positions.json"
            
            params = {}
            if filters.get('profession') or filters.get('discipline'):
                search_query = " ".join([filters.get('profession', ''), filters.get('discipline', '')]).strip()
                if search_query:
                    params['search'] = search_query
            
            if filters.get('location'):
                params['location'] = filters['location']
            
            print(f"🔗 GitHub Jobs URL: {url}")
            print(f"📋 Parameters: {params}")
            
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            jobs_data = response.json()
            
            if not jobs_data:
                print("⚠️ No jobs found on GitHub Jobs")
                return []
            
            print(f"✅ Found {len(jobs_data)} jobs on GitHub Jobs")
            
            scraped_jobs = []
            for i, job_data in enumerate(jobs_data[:max_jobs]):
                try:
                    transformed_job = self._transform_github_job_data(job_data)
                    if transformed_job:
                        scraped_jobs.append(transformed_job)
                        print(f"✅ Extracted GitHub job {i+1}: {transformed_job['title']}")
                except Exception as e:
                    print(f"❌ Error extracting GitHub job {i+1}: {e}")
                    continue
                
                if len(scraped_jobs) >= max_jobs:
                    break
            
            print(f"🎯 Successfully scraped {len(scraped_jobs)} jobs from GitHub Jobs")
            return scraped_jobs
            
        except Exception as e:
            print(f"❌ Error scraping GitHub Jobs: {e}")
            return []
    
    def _extract_remote_ok_job_data(self, card):
        """Extract job data from RemoteOK job card"""
        try:
            # Job title
            title_elem = card.find('h2', itemprop='title')
            title = title_elem.get_text(strip=True) if title_elem else "N/A"
            
            # Company name
            company_elem = card.find('h3', itemprop='name')
            company = company_elem.get_text(strip=True) if company_elem else "Company not specified"
            
            # Location
            location_elem = card.find('div', class_='location')
            location = location_elem.get_text(strip=True) if location_elem else "Remote"
            
            # Salary
            salary_elem = card.find('div', class_='salary')
            salary = salary_elem.get_text(strip=True) if salary_elem else "Not specified"
            
            # Job URL
            job_url = ""
            link_elem = card.find('a', class_='preventLink')
            if link_elem:
                job_url = urljoin('https://remoteok.com', link_elem.get('href', ''))
            
            # Job type and experience inference
            job_type = self._infer_job_type(title)
            experience = self._infer_experience_level(title)
            
            # Clean up the data
            if not title or title == "N/A":
                return None
            
            return {
                'title': title.strip(),
                'company': company.strip(),
                'location': location.strip(),
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',
                'discipline': 'Software Development',
                'description': f"Remote job at {company}",
                'salary': salary,
                'source': 'RemoteOK',
                'url': job_url,
                'id': f"remoteok_{hash(title + company)}"
            }
        except Exception as e:
            print(f"❌ Error extracting RemoteOK job data: {e}")
            return None
    
    def _extract_stack_overflow_job_data(self, card):
        """Extract job data from Stack Overflow job card"""
        try:
            # Job title
            title_elem = card.find('h2', class_='mb4')
            title = title_elem.get_text(strip=True) if title_elem else "N/A"
            
            # Company name
            company_elem = card.find('h3', class_='mb4')
            company = company_elem.get_text(strip=True) if company_elem else "Company not specified"
            
            # Location
            location_elem = card.find('span', class_='fc-black-500')
            location = location_elem.get_text(strip=True) if location_elem else "Location not specified"
            
            # Salary (Stack Overflow doesn't always show salary)
            salary = "Not specified"
            
            # Job URL
            job_url = ""
            link_elem = card.find('a', class_='s-link')
            if link_elem:
                job_url = urljoin('https://stackoverflow.com', link_elem.get('href', ''))
            
            # Job type and experience inference
            job_type = self._infer_job_type(title)
            experience = self._infer_experience_level(title)
            
            # Clean up the data
            if not title or title == "N/A":
                return None
            
            return {
                'title': title.strip(),
                'company': company.strip(),
                'location': location.strip(),
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',
                'discipline': 'Software Development',
                'description': f"Job at {company}",
                'salary': salary,
                'source': 'Stack Overflow',
                'url': job_url,
                'id': f"stackoverflow_{hash(title + company)}"
            }
        except Exception as e:
            print(f"❌ Error extracting Stack Overflow job data: {e}")
            return None
    
    def _transform_github_job_data(self, job_data):
        """Transform GitHub Jobs API data to our format"""
        try:
            title = job_data.get('title', 'N/A')
            company = job_data.get('company', 'Company not specified')
            location = job_data.get('location', 'Location not specified')
            job_url = job_data.get('url', '')
            
            # Job type and experience inference
            job_type = self._infer_job_type(title)
            experience = self._infer_experience_level(title)
            
            if not title or title == "N/A":
                return None
            
            return {
                'title': title.strip(),
                'company': company.strip(),
                'location': location.strip(),
                'jobType': job_type,
                'experience': experience,
                'profession': 'Technology',
                'discipline': 'Software Development',
                'description': f"Job at {company} in {location}",
                'salary': "Not specified",
                'source': 'GitHub Jobs',
                'url': job_url,
                'id': f"github_{hash(title + company)}"
            }
        except Exception as e:
            print(f"❌ Error transforming GitHub job data: {e}")
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
    
    def scrape_all_sources(self, filters, max_jobs_per_source=5):
        """Scrape jobs from all simple sources"""
        all_jobs = []
        successful_sources = []
        
        try:
            # Scrape from RemoteOK
            try:
                remoteok_jobs = self.scrape_remote_ok(filters, max_jobs_per_source)
                if remoteok_jobs:
                    all_jobs.extend(remoteok_jobs)
                    successful_sources.append(('RemoteOK', len(remoteok_jobs)))
                    print(f"✅ RemoteOK: {len(remoteok_jobs)} jobs")
                else:
                    print("⚠️ RemoteOK: No jobs found")
            except Exception as e:
                print(f"❌ RemoteOK failed: {e}")
            
            # Scrape from Stack Overflow Jobs
            try:
                stackoverflow_jobs = self.scrape_stack_overflow_jobs(filters, max_jobs_per_source)
                if stackoverflow_jobs:
                    all_jobs.extend(stackoverflow_jobs)
                    successful_sources.append(('Stack Overflow', len(stackoverflow_jobs)))
                    print(f"✅ Stack Overflow: {len(stackoverflow_jobs)} jobs")
                else:
                    print("⚠️ Stack Overflow: No jobs found")
            except Exception as e:
                print(f"❌ Stack Overflow failed: {e}")
            
            # Scrape from GitHub Jobs
            try:
                github_jobs = self.scrape_github_jobs(filters, max_jobs_per_source)
                if github_jobs:
                    all_jobs.extend(github_jobs)
                    successful_sources.append(('GitHub Jobs', len(github_jobs)))
                    print(f"✅ GitHub Jobs: {len(github_jobs)} jobs")
                else:
                    print("⚠️ GitHub Jobs: No jobs found")
            except Exception as e:
                print(f"❌ GitHub Jobs failed: {e}")
            
            print(f"\n📊 Simple Scraping Summary:")
            for source, count in successful_sources:
                print(f"   {source}: {count} jobs")
            print(f"   Total jobs: {len(all_jobs)}")
            
            return all_jobs
            
        except Exception as e:
            print(f"❌ Error in simple scraping: {e}")
            return all_jobs

def scrape_jobs_simple(filters, max_jobs=10):
    """Main function to scrape jobs using simple methods"""
    scraper = SimpleJobScraper()
    
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
        print(f"Error in simple job scraping: {e}")
        return []

if __name__ == "__main__":
    # Test the simple scraper
    test_filters = {
        'location': 'Remote',
        'profession': 'Software',
        'discipline': 'Computer Science'
    }
    
    print("🧪 Testing Simple Job Scraper...")
    jobs = scrape_jobs_simple(test_filters, 10)
    
    if jobs:
        print(f"\n✅ Found {len(jobs)} jobs:")
        for job in jobs:
            print(f"- {job['title']} at {job['company']}")
            print(f"  Location: {job['location']}")
            print(f"  Source: {job['source']}")
            print()
    else:
        print("❌ No jobs found")

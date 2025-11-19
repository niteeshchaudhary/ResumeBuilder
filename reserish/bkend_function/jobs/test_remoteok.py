#!/usr/bin/env python3
"""
Test script to debug RemoteOK extraction
"""

import requests
from bs4 import BeautifulSoup

def test_remoteok():
    url = "https://remoteok.com/remote-software+developer-jobs"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find job cards
        job_cards = soup.find_all('tr', class_='job')
        print(f"Found {len(job_cards)} job cards")
        
        if job_cards:
            # Look at the first job card
            first_card = job_cards[0]
            print("\nFirst job card HTML:")
            print(first_card.prettify()[:1000])
            
            # Try to extract data
            print("\nTrying to extract data...")
            
            # Title
            title_elem = first_card.find('h2', attrs={'itemprop': 'title'})
            print(f"Title element: {title_elem}")
            if title_elem:
                print(f"Title text: {title_elem.get_text(strip=True)}")
            
            # Company
            company_elem = first_card.find('h3', attrs={'itemprop': 'hiringOrganization'})
            print(f"Company element: {company_elem}")
            if company_elem:
                print(f"Company text: {company_elem.get_text(strip=True)}")
            
            # Try alternative selectors
            print("\nTrying alternative selectors...")
            
            # Look for any h2 or h3
            all_h2 = first_card.find_all('h2')
            all_h3 = first_card.find_all('h3')
            print(f"All h2 elements: {len(all_h2)}")
            print(f"All h3 elements: {len(all_h3)}")
            
            for i, h2 in enumerate(all_h2):
                print(f"H2 {i}: {h2.get_text(strip=True)}")
            
            for i, h3 in enumerate(all_h3):
                print(f"H3 {i}: {h3.get_text(strip=True)}")
            
            # Look for any links
            links = first_card.find_all('a')
            print(f"Found {len(links)} links")
            for i, link in enumerate(links[:3]):
                print(f"Link {i}: {link.get('href', 'No href')} - Text: {link.get_text(strip=True)}")

if __name__ == "__main__":
    test_remoteok()

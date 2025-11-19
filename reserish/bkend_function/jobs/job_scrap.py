import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def scrape_job_openings(query):
        
    # Initialize the WebDriver with the options
    driver = webdriver.Chrome()

    url = f"https://www.google.com/search?q={query}&oq={query}&aqs=chrome..69i57j69i59j0i512j0i22i30i625l4j69i60.4543j0j7&sourceid=chrome&ie=UTF-8&ibp=htl;jobs&sa=X&ved=2ahUKEwjXsv-_iZP9AhVPRmwGHX5xDEsQutcGKAF6BAgPEAU&sxsrf=AJOqlzWGHNISzgpAUCZBmQA1mWXXt3I7gA:1676311105893#htivrt=jobs&htidocid=GS94rKdYQqQAAAAAAAAAAA%3D%3D&fpstate=tldetail"
    lst=[]
    try:
        # Open the target webpage
        driver.get(url)  # Replace with the actual URL
        # Set Chrome options to run in headless mode
        
        
        # Wait for the element to load (optional, if the element is dynamic)
        wait = WebDriverWait(driver, 10)
        element = wait.until(EC.presence_of_element_located((By.XPATH, '//div[@jscontroller="b11o3b"]')))

        # Locate the element
        div_elements = driver.find_elements(By.XPATH, '//div[@jscontroller="b11o3b"]')
        for id,div_element in enumerate(div_elements):
            jsn={}
            jsn['id']=id
            # print(div_element)
            image_source = div_element.find_element(By.TAG_NAME, 'img').get_attribute('src')
            # print("Image Source:", image_source)
            jsn['imagesource']=image_source
            # Locate the job title element
            job_title_element = div_element.find_element(By.XPATH, './/div[@class="tNxQIb PUpOsf"]')
            job_title = job_title_element.text
            jsn['jobtitle']=job_title

            # Print the job title
            # print("Job Title:", job_title)

            # Locate the company name element
            company_name_element = div_element.find_element(By.XPATH, './/div[@class="wHYlTd MKCbgd a3jPc"]')
            company_name = company_name_element.text
            jsn['companyname']=company_name

            # Print the company name
            # print("Company Name:", company_name)

            # Locate the location element
            location_element = div_element.find_element(By.XPATH, './/div[@class="wHYlTd FqK3wc MKCbgd"]')
            location = location_element.text
            jsn['location']=location

            # Print the location
            # print("Location:", location)

            # Locate the posting details element
            posting_details_element = div_element.find_elements(By.XPATH, './/span[@class="Yf9oye"]')
            posting_details = posting_details_element[0].get_attribute('aria-label')
            jsn['postingdetails']=posting_details

            # Print the posting details
            # print("Posting Details:", posting_details)

            # Locate the job type element
            job_type_element = div_element.find_elements(By.XPATH, './/span[@class="Yf9oye"]')
            
            job_type = job_type_element[1].get_attribute('aria-label') if len(job_type_element)>=2 else "Unknown"
            jsn['jobtype']=job_type

            # Print the job type
            # print("Job Type:", job_type)
            # Extract the data-share-url attribute
            share_url = div_element.get_attribute("data-share-url")
            jsn['shareurl']=share_url
            lst.append(jsn)
            # Print the URL
            # print("Share URL:", share_url)
            print(lst)
            return lst
    finally:
        # pass
        driver.quit()

        
    return lst

if __name__ == "__main__":
    # Replace with the URL of the job website
    jobs = scrape_job_openings("Software+developer+jobs")
    
    if jobs:
        print("Job Openings Found:")
        # print(jobs)
        for job in jobs:
            try:
                print(f"Title: {job['jobtitle']}")
                print(f"Company: {job['companyname']}")
                print(f"Location: {job['location']}")
                print(f"Link: {job['shareurl']}")
                print("-" * 50)
            except Exception as e:
                print("Error:", e)
    else:
        print("No job openings found.")

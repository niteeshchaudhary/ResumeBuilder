import fitz  # PyMuPDF
import re

def extract_text_from_pdf(pdf_path):
    document = fitz.open(pdf_path)
    extracted_text = ""
    
    for page_num in range(len(document)):
        page = document.load_page(page_num)
        text = page.get_text()
        extracted_text += text
    
    return extracted_text

def parse_skills_text(skills_text): 
    skills_dict = {}
    current_category = "Skills"  # Default category if none is found

    # Split the text by new lines or commas for better flexibility
    lines = re.split(r'\n|,', skills_text)

    for line in lines:
        line = line.strip()

        # Check if the line contains a category followed by a colon
        if ':' in line:
            # Split by the first occurrence of ':' to separate category from skills
            category, skills = line.split(':', 1)
            current_category = category.strip()  # Get the category name
            skills_list = [skill.strip() for skill in skills.split(',')]  # Get skills as a list
            skills_dict[current_category] = [skill for skill in skills_list if skill]  # Add to dict, ignore empty skills
        elif line:  # Add skills to the current category if the line is not empty
            # Ensure the current category is initialized
            if current_category not in skills_dict:
                skills_dict[current_category] = []
            skills_dict[current_category].append(line.strip())

    return skills_dict

def parse_education_entries(education_text):
    education_data = []
    
    # Patterns for detecting key information
    degree_pattern = re.compile(r'(B\.?Tech|M\.?Tech|PhD|Bachelor|Master|Higher Secondary|Secondary|Diploma)', re.IGNORECASE)
    year_pattern = re.compile(r'(\d{4})')  # Matches any 4-digit year
    score_type_pattern = re.compile(r'(CGPA|Percentage|GPA)', re.IGNORECASE)
    score_pattern = re.compile(r'(CGPA|Percentage|GPA):\s*([\d\.]+)', re.IGNORECASE)
    #re.compile(r'CGPA:\s*([\d\.]+)', re.IGNORECASE)
    coursework_pattern = re.compile(r'Coursework:\s*(.*)', re.IGNORECASE)
    
    # Split into sections by two or more newlines to separate different entries
    sections = re.split(r'\n\s*\n', education_text.strip())

    for section in sections:
        # Initialize all fields as empty
        degree = ""
        field = ""
        institution = ""
        university_or_board = ""
        from_year = ""
        to_year = ""
        score_type=""
        cgpa = ""
        coursework = []

        lines = section.split('\n')

        for line in lines:
            line = line.strip()

            # Try to find degree
            if not degree and re.search(degree_pattern, line):
                degree = line
                continue
            
            # Try to find CGPA
            if re.search(score_pattern, line):
                cgpa_match = re.search(score_pattern, line)
                if cgpa_match:
                    cgpa = cgpa_match.group(1)
                continue
            
            #Try to find score type
            if re.search(score_type_pattern, line):
                score_type_match = re.search(score_type_pattern, line)
                if score_type_match:
                    score_type = score_type_match.group(1)
                continue
            # Try to find coursework
            if re.search(coursework_pattern, line):
                coursework_match = re.search(coursework_pattern, line)
                if coursework_match:
                    coursework = coursework_match.group(1).split(", ")
                continue

            # Trytofind dates
            if re.search(year_pattern, line):
                years = re.findall(year_pattern, line)
                if len(years) >= 2:
                    from_year, to_year = years[0], years[1]
                elif len(years) == 1:
                    from_year = years[0]
                continue

            # If not any of the above, consider it as institution or university
            if not institution:
                institution = line
            else:
                university_or_board = line

        # If we have sufficient data, add to the education list
        education_data.append({
            "degree": degree,
            "field": field,
            "institution": institution,
            "university_or_board": university_or_board.strip(),
            "from_date": from_year,
            "to_date": to_year,
            "scoreType":  score_type if score_type!=""  else "CGPA",
            "score": cgpa,
            "coursework": coursework
        })

    return education_data

import re
import json

def parse_projects_data(projects_text):
    projects_data = []
    
    # Split the text into different projects based on multiple newlines or new project titles
    project_sections = re.split(r'\n(?=[A-Z])', projects_text.strip())
    
    for project_section in project_sections:
        # Initialize fields
        name = ""
        technologies = []
        from_date = ""
        to_date = ""
        description = []
        link = ""

        # Split each section into lines
        lines = project_section.split("\n")

        # Process each line
        for i, line in enumerate(lines):
            line = line.strip()

            # Extract project name and technologies
            if i == 0:
                # Use regex to capture project name and technologies used
                match = re.match(r'^(.+)\s\|\s(.+?)\s\d+', line)
                if match:
                    name = match.group(1).strip()
                    technologies = [tech.strip() for tech in match.group(2).split(",")]

            # Extract dates
            date_match = re.search(r'(\w+ \d{4})\s*–\s*(\w+ \d{4})', line)
            if date_match:
                from_date, to_date = date_match.groups()

            # Extract descriptions
            if line.startswith("•"):
                description.append(line[1:].strip())
        
        # Add the parsed data into the projects list
        projects_data.append({
            "name": name,
            "technologies": technologies,
            "from_date": from_date,
            "to_date": to_date,
            "description": description,
            "link": link
        })
    
    return projects_data




def organize_resume_sections(text):
    sections = {
        "contact information": "",
        "summary": "",
        "experience": "",
        "education": "",
        "skills": "",
        "certifications": "",
        "projects": "",
        "others": "",
        "achievements": "",
        "publications": "",
    }
    
    section_order = list(sections.keys())
    current_section = "others"
    
    lines = text.split('\n')

    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
        if re.search(r'\b(contact information|summary|education|skills|certifications|work experience|experience|POSITION OF RESPONSIBILITY|INTERNSHIPS|publicaions|projects|awards)\b', line_stripped, re.IGNORECASE):
            current_section = re.findall(r'\b(contact information|summary|education|skills|certifications|work experience|experience|POSITION OF RESPONSIBILITY|INTERNSHIPS|projects|publicaions|awards)\b', line_stripped, re.IGNORECASE)[0]
        
            if current_section.lower() in ["experience", "work experience","internships", "position of responsibility"]:
                current_section = "experience"
            elif current_section.lower() in ["achievements","awards"]:
                current_section = "achievements"
        else:
            sections[current_section.lower()] += line + "\n"
    
    return sections

def classify_other_details(text):
    details = {
        "name": "",
        "phonenumber": "",
        "email": "",
        "linkedIn": "",
        "gitHub": "",
        "portfolio": "",
        "other": ""
    }
    
    phone_pattern = re.compile(r'\+?\d{1,4}[\s-]?\(?\d{1,3}?\)?[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}')
    email_pattern = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
    linkedin_pattern = re.compile(r'(linkedin\.com/in/|linkedin\.com/pub/|^[a-zA-Z0-9-]+$)')
    github_pattern = re.compile(r'(github\.com/[a-zA-Z0-9-]+|^[a-zA-Z0-9-]+$)')
    portfolio_pattern = re.compile(r'\bPortfolio\b', re.IGNORECASE)
    name_pattern = re.compile(r'^[a-zA-Z]+(?:[-\s][a-zA-Z]+)*$')
    
    lines = text.split('\n')
    
    for ln in lines:
        for line in ln.split("|"):
            line_stripped = line.strip()
            if not line_stripped:
                continue
            
            if phone_pattern.search(line_stripped):
                details["phonenumber"] = phone_pattern.search(line_stripped).group()
            elif email_pattern.search(line_stripped):
                details["email"] = email_pattern.search(line_stripped).group()
                details["emailthumbnail"] = email_pattern.search(line_stripped).group()
            elif linkedin_pattern.search(line_stripped):
                details["linkedin"] = line_stripped if "linkedin" in line_stripped else details["linkedIn"]
                details["linkedinthumbnail"] = email_pattern.search(line_stripped).group()
            elif github_pattern.search(line_stripped):
                details["github"] = line_stripped if "github" in line_stripped else details["gitHub"]
                details["githubthumbnail"] = line_stripped if "github" in line_stripped else details["gitHub"]
            elif portfolio_pattern.search(line_stripped):
                details["portfolio"] = line_stripped
                details["portfoliothumbnail"] = line_stripped if "github" in line_stripped else details["gitHub"]
            elif name_pattern.search(line_stripped) and not details["name"]:
                details["name"] = line_stripped
            else:
                details["other"] += line_stripped + "\n"
    
    return details

def parse_certifications_data(certifications_text):
    certifications_data = []
    
    # Split the text by newlines
    lines = certifications_text.split("\n")
    
    for line in lines:
        line = line.strip()

        # Initialize fields
        name = ""
        details = ""
        link = ""

        # Use regex to separate name and details
        match = re.match(r'^(.+?)\s*:\s*(.+)', line)
        if match:
            name = match.group(1).strip()
            details = match.group(2).strip()

        # Add parsed data to certifications list
        certifications_data.append({
            "name": name,
            "details": details,
            "link": link
        })
    
    return certifications_data

def parse_publications_data(publications_text):
    publications_data = []
    
    # Split the text by newlines
    lines = publications_text.split("\n")
    
    for line in lines:
        line = line.strip()

        # Initialize fields
        name = ""
        details = ""
        link = ""

        # Use regex to separate name and details
        match = re.match(r'^(.+?)\s*:\s*(.+)', line)
        if match:
            name = match.group(1).strip()
            details = match.group(2).strip()

        # Add parsed data to publications list
        publications_data.append({
            "name": name,
            "details": details,
            "link": link
        })
    
    return publications_data

def parse_achievements_data(achievements_text):
    achievements_data = []
    
    # Split the text by newlines
    lines = achievements_text.split("\n")
    
    for line in lines:
        line = line.strip()

        # Initialize fields
        name = ""
        details = ""
        link = ""

        # Use regex to separate name and details
        match = re.match(r'^(.+?)\s*:\s*(.+)', line)
        if match:
            name = match.group(1).strip()
            details = match.group(2).strip()

        # Add parsed data to achievements list
        achievements_data.append({
            "name": name,
            "details": details,
            "link": link
        })
    
    return achievements_data


def extract_resume_details(pdf_path):
    text = extract_text_from_pdf(pdf_path)
    organized_sections = organize_resume_sections(text)
    classified_otr_details = classify_other_details(organized_sections["others"])
    organized_sections.update(classified_otr_details)
    organized_sections["skills"]=parse_skills_text(organized_sections["skills"])
    organized_sections["education"]=parse_education_entries(organized_sections["education"])
    organized_sections["projects"]=parse_projects_data(organized_sections["projects"])
    organized_sections["certifications"]=parse_certifications_data(organized_sections["certifications"])
    organized_sections["publications"]=parse_publications_data(organized_sections["publications"])
    organized_sections["achievements"]=parse_achievements_data(organized_sections["achievements"])
    return organized_sections

# classified_details = classify_details(organized_sections["others"])

# # Example usage
# pdf_path = 'NiteeshResume.pdf'
# text = extract_text_from_pdf(pdf_path)
# organized_sections = organize_resume_sections(text)
# for section, content in organized_sections.items():
#     print(f"{section}:\n{content}\n")

# for category, info in classified_details.items():
#     print(f"{category}: {info}")



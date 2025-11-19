import re
import json

def parse_education_entries(education_text):
    education_data = []
    
    # Patterns for detecting key information
    degree_pattern = re.compile(r'(B\.?Tech|M\.?Tech|PhD|Bachelor|Master|Higher Secondary|Secondary|Diploma)', re.IGNORECASE)
    year_pattern = re.compile(r'(\d{4})')  # Matches any 4-digit year
    cgpa_pattern = re.compile(r'CGPA:\s*([\d\.]+)', re.IGNORECASE)
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
            if re.search(cgpa_pattern, line):
                cgpa_match = re.search(cgpa_pattern, line)
                if cgpa_match:
                    cgpa = cgpa_match.group(1)
                continue

            # Try to find coursework
            if re.search(coursework_pattern, line):
                coursework_match = re.search(coursework_pattern, line)
                if coursework_match:
                    coursework = coursework_match.group(1).split(", ")
                continue

            # Try to find dates
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
            "cgpa": cgpa,
            "coursework": coursework
        })

    return education_data

# Example unordered input text with education details
education_text = """
B.Tech, Computer science and Engineering
Indian Institute of Technology, Dharwad
CGPA: 8.63/10
Coursework: Data Structures & Algorithms (DSA), Design & Analysis of Algorithm (DAA), Software Systems Lab, Database
Management System, Operating Systems, Computer Networks, Introduction to Blockchains, Compilers, Artificial Intelligence
November 2020 – April 2024
"""

# Convert to structured JSON format
parsed_education = parse_education_entries(education_text)

# Output the structured JSON
print(json.dumps(parsed_education, indent=2))

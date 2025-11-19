import reserish.bkend_function.lataxtemplates.nitpx as nitpx
sample_resume_json = {
    "name": "Mr. Abhay Soni",
    "phonenumber": "+91-7073167942",
    "email": "abhay55soni@gmail.com",
    "linkedin": "",
    "github": "",
    "portfolio": "",
    "summary": "I have 2+ years of experience on multiple projects with a wide range of work & intend to build a career and be an integral part of a dynamic organization and contributing with lead line technologies where I can apply & enhance my knowledge and skill to serve the firm to the best of my efforts.",
    "skills": {
        "Programming Languages": [
            "Core PHP",
            "JavaScript",
            "jQuery",
            "HTML",
            "CSS",
            "Bootstrap",
            "Core Java"
        ],
        "Tools & Frameworks": [],
        "Soft Skills": [
            "Adaptable",
            "Responsible",
            "Analysis Power",
            "Positive Thinking",
            "Possess leadership qualities"
        ]
    },
    "experiences": [
        {
            "company": "Dev Information Technology",
            "role": "Junior PLSQL Developer",
            "from_date": "March 2023",
            "to_date": "Till Date",
            "location": "",
            "currentlyWorking": "true",
            "details": [
                "IFMS 3.0 Government of Rajasthan"
            ]
        },
        {
            "company": "CSM Technologies",
            "role": "Junior Software Engineer",
            "from_date": "April 2022",
            "to_date": "March 2023",
            "location": "",
            "currentlyWorking": "false",
            "details": [
                "Jan Aadhaar Yojana 2.0 Government of Rajasthan"
            ]
        }
    ],
    "education": [
        {
            "institution": "Apex Institute Of Management & Science",
            "from_date": "2022",
            "to_date": "",
            "degree": "Bachelor of Computer Application",
            "fieldOfStudy": "Computer Application",
            "cgpa": "",
            "coursework": []
        },
        {
            "institution": "St. Anselm\u2019s blue City Sr.Sec. School, Jaipur",
            "from_date": "2019",
            "to_date": "",
            "degree": "Higher Secondary (XII)",
            "fieldOfStudy": "Physics, Chemistry, Bio, English, IP",
            "cgpa": "",
            "coursework": []
        },
        {
            "institution": "Warren Academy",
            "from_date": "2017",
            "to_date": "",
            "degree": "Secondary(X)",
            "fieldOfStudy": "Math, Social Science, Science, English, Hindi",
            "cgpa": "",
            "coursework": []
        }
    ],
    "projects": [
        {
            "title": "IFMS",
            "technologies": "Oracle & Core PwC Team",
            "from_date": "March 2023",
            "to_date": "Till Date",
            "details": [
                "Integrated Financial Management System (Government of Rajasthan)"
            ],
            "projectLink": "https://ifms.rajasthan.gov.in/ifmssso/#/home"
        },
        {
            "title": "Jan Aadhaar Yojana",
            "technologies": "",
            "from_date": "April 2022",
            "to_date": "March 2023",
            "details": [
                "Government of Rajasthan"
            ],
            "projectLink": "https://janaadhaar.rajasthan.gov.in/content/raj/janaadhaar/en/home.html#"
        }
    ],
    "certifications": [
        {
            "name": "Certification of Completion of 6 Months Training",
            "link": ""
        }
    ],
    "publications": [],
    "achievements": [
        {
            "title": "Completed HTML, CSS, Bootstrap, JavaScript, jQuery, MySQL, Core PHP, C, C++, Core Java training in Technoglobe Institute, Jaipur",
            "link": ""
        },
        {
            "title": "Won many medals for college in inter college competitions",
            "link": ""
        }
    ]
}
print(nitpx.nitp(sample_resume_json))
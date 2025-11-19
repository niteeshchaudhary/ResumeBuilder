import json

# LaTeX Template
latex_template = r"""
\documentclass[a4paper]{resume}
\usepackage[left=0.4in,top=0.6in,right=0.4in,bottom=0.6in]{geometry}

\name{{{name}}}
\contactInfo{Phone: {phonenumber} | Email: {email} | LinkedIn: {linkedin} | GitHub: {github} | Portfolio: {portfolio}}

\begin{document}

\section*{Summary}
{summary}

\section*{Skills}
\begin{itemize}
\item Programming Languages: {programming_languages}
\item Soft Skills: {soft_skills}
\end{itemize}

\section*{Work Experience}
{experiences}

\section*{Education}
{education}

\section*{Projects}
{projects}

\section*{Certifications}
{certifications}

\section*{Achievements}
{achievements}

\end{document}
"""

# Helper functions to format each section
def format_experiences(experiences):
    experience_str = ""
    for exp in experiences:
        details = '\n'.join([f"- {detail}" for detail in exp['details']])
        experience_str += f"\textbf{{{exp['role']}}} at {exp['company']} ({exp['from_date']} - {exp['to_date']})\n{details}\n\n"
    return experience_str.strip()

def format_education(education):
    education_str = ""
    for edu in education:
        education_str += f"\textbf{{{edu['degree']}}} in {edu['fieldOfStudy']} from {edu['institution']} ({edu['from_date']})\n\n"
    return education_str.strip()

def format_projects(projects):
    project_str = ""
    for proj in projects:
        details = '\n'.join([f"- {detail}" for detail in proj['details']])
        project_str += f"\textbf{{{proj['title']}}} ({proj['from_date']} - {proj['to_date']})\nTechnologies: {proj.get('technologies', '')}\n{details}\n\n"
    return project_str.strip()

def format_certifications(certifications):
    return '\n'.join([f"- {cert['name']}" for cert in certifications])

def format_achievements(achievements):
    return '\n'.join([f"- {ach['title']}" for ach in achievements])


# Filling the template with data from JSON
def sb2(sample_resume_json):
    filled_latex = latex_template.format(
    name=sample_resume_json['name'],
    phonenumber=sample_resume_json['phonenumber'],
    email=sample_resume_json['email'],
    linkedin=sample_resume_json.get('linkedin', ''),
    github=sample_resume_json.get('github', ''),
    portfolio=sample_resume_json.get('portfolio', ''),
    summary=sample_resume_json['summary'],
    programming_languages=', '.join(sample_resume_json['skills']['Programming Languages']),
    soft_skills=', '.join(sample_resume_json['skills']['Soft Skills']),
    experiences=format_experiences(sample_resume_json['experiences']),
    education=format_education(sample_resume_json['education']),
    projects=format_projects(sample_resume_json['projects']),
    certifications=format_certifications(sample_resume_json['certifications']),
    achievements=format_achievements(sample_resume_json['achievements'])
    )
    return filled_latex 



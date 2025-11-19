from datetime import datetime

class NitpResumeGenerator:
    def __init__(self, data,user):
        self.user=user
        self.data = data
        self.content = []
        self._load_template_parts()
        
    def _load_template_parts(self):
        self.header = r"""\documentclass[a4paper,11pt]{article}

% Package imports and template styling
[PACKAGE_IMPORTS]

% Define personal information
\newcommand{\name}{[NAME]}
\newcommand{\course}{[COURSE]}
\newcommand{\roll}{[ROLL]}
\newcommand{\phone}{[PHONE]}
\newcommand{\emaila}{[EMAIL1]}
\newcommand{\emailb}{[EMAIL2]}
\newcommand{\github}{[GITHUB]}
\newcommand{\website}{[WEBSITE]}
\newcommand{\linkedin}{[LINKEDIN]}

\begin{document}
\fontfamily{cmr}\selectfont

%----------HEADING-----------------
\parbox{2.35cm}{%
\includegraphics[width=2cm,height=2.5cm,clip]{../../[logo]}
}
\parbox{\dimexpr\linewidth-2.8cm\relax}{
\begin{tabularx}{\linewidth}{L r}
  \textbf{\LARGE \name} & \phone \\
  \course & \href{mailto:\emaila}{\emaila} \\
  [DEPARTMENT] & \href{https://\linkedin}{\linkedin} \\
  [INSTITUTE]
  & \href{https://\github}{\github} \\
\end{tabularx}
}
\vspace{-2mm}
"""
        
        self.packages = r"""
% Package imports
\usepackage{latexsym}
\usepackage{xcolor}
\usepackage{float}
\usepackage{ragged2e}
\usepackage[empty]{fullpage}
\usepackage{wrapfig}
\usepackage{tabularx}
\usepackage{titlesec}
\usepackage{geometry}
\usepackage{marvosym}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage{fancyhdr}
\usepackage{multicol}
\usepackage{graphicx}
\usepackage{cfr-lm}
\usepackage[T1]{fontenc}
\usepackage{fontawesome5}
\usepackage[hidelinks]{hyperref}
\usepackage{microtype}
\usepackage{tabularx} % Required for tables that stretch to page width
\usepackage{array} % Required for vertical centering in tables
% Color definitions
\definecolor{darkblue}{RGB}{0,0,139}

% Page layout
\geometry{left=1.4cm, top=0.8cm, right=1.2cm, bottom=1cm}
\setlength{\multicolsep}{0pt} 
\pagestyle{fancy}
\fancyhf{} % clear all header and footer fields
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\setlength{\footskip}{4.08pt}

% Hyperlink setup
\hypersetup{
    colorlinks=true,
    linkcolor=darkblue,
    filecolor=darkblue,
    urlcolor=darkblue,
}

% Custom box settings
\usepackage[most]{tcolorbox}
\tcbset{
    frame code={},
    center title,
    left=0pt,
    right=0pt,
    top=0pt,
    bottom=0pt,
    colback=gray!20,
    colframe=white,
    width=\dimexpr\textwidth\relax,
    enlarge left by=-2mm,
    boxsep=4pt,
    arc=0pt,outer arc=0pt,
}

% URL style
\urlstyle{same}

% Text alignment
\raggedright
\setlength{\tabcolsep}{0in}

% Section formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large\bfseries
}{}{0em}{}[\color{black}\titlerule \vspace{-7pt}]

% Custom commands
\newcommand{\resumeItem}[2]{
  \item{
    \textbf{#1}{\hspace{0.5mm}#2 \vspace{-0.5mm}}
  }
}

\newcommand{\resumePOR}[3]{
\vspace{0.5mm}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
        \textbf{#1}\hspace{0.3mm}#2 & \textit{\small{#3}} 
    \end{tabular*}
    \vspace{-2mm}
}

\newcommand{\resumeSubheading}[4]{
\vspace{0.5mm}\item
    \begin{tabular*}{0.98\textwidth}[t]{l@{\extracolsep{\fill}}r}
        \textbf{#1} & \textit{\footnotesize{#4}} \\
        \textit{\footnotesize{#3}} &  \footnotesize{#2}\\
    \end{tabular*}
    \vspace{-2.4mm}
}

\newcommand{\resumeProject}[4]{
\vspace{0.5mm}\item
    \begin{tabular*}{0.98\textwidth}[t]{l@{\extracolsep{\fill}}r}
        \textbf{#1} & \textit{\footnotesize{#3}} \\
        \footnotesize{\textit{#2}} & \footnotesize{#4}
    \end{tabular*}
    \vspace{-2.4mm}
}

\newcommand{\resumeSubItem}[2]{\resumeItem{#1}{#2}\vspace{-4pt}}

\renewcommand{\labelitemi}{$\vcenter{\hbox{\tiny$\bullet$}}$}
\renewcommand{\labelitemii}{$\vcenter{\hbox{\tiny$\circ$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=*,labelsep=1mm]}
\newcommand{\resumeHeadingSkillStart}{\begin{itemize}[leftmargin=*,itemsep=1.7mm, rightmargin=2ex]}
\newcommand{\resumeItemListStart}{\begin{itemize}[leftmargin=*,labelsep=1mm,itemsep=0.5mm]}

\newcommand{\resumeSubHeadingListEnd}{\end{itemize}\vspace{2mm}}
\newcommand{\resumeHeadingSkillEnd}{\end{itemize}\vspace{-2mm}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-2mm}}
\newcommand{\cvsection}[1]{%
\vspace{2mm}
\begin{tcolorbox}
    \textbf{\large #1}
\end{tcolorbox}
    \vspace{-4mm}
}

\newcolumntype{L}{>{\raggedright\arraybackslash}X}%
\newcolumntype{R}{>{\raggedleft\arraybackslash}X}%
\newcolumntype{C}{>{\centering\arraybackslash}X}%

% Commands for icon sizing and positioning
\newcommand{\socialicon}[1]{\raisebox{-0.05em}{\resizebox{!}{1em}{#1}}}
\newcommand{\ieeeicon}[1]{\raisebox{-0.3em}{\resizebox{!}{1.3em}{#1}}}

% Font options
\newcommand{\headerfonti}{\fontfamily{phv}\selectfont} % Helvetica-like (similar to Arial/Calibri)
\newcommand{\headerfontii}{\fontfamily{ptm}\selectfont} % Times-like (similar to Times New Roman)
\newcommand{\headerfontiii}{\fontfamily{ppl}\selectfont} % Palatino (elegant serif)
\newcommand{\headerfontiv}{\fontfamily{pbk}\selectfont} % Bookman (readable serif)
\newcommand{\headerfontv}{\fontfamily{pag}\selectfont} % Avant Garde-like (similar to Trebuchet MS)
\newcommand{\headerfontvi}{\fontfamily{cmss}\selectfont} % Computer Modern Sans Serif
\newcommand{\headerfontvii}{\fontfamily{qhv}\selectfont} % Quasi-Helvetica (another Arial/Calibri alternative)
\newcommand{\headerfontviii}{\fontfamily{qpl}\selectfont} % Quasi-Palatino (another elegant serif option)
\newcommand{\headerfontix}{\fontfamily{qtm}\selectfont} % Quasi-Times (another Times New Roman alternative)
\newcommand{\headerfontx}{\fontfamily{bch}\selectfont} % Charter (clean serif font)
"""
        
        self.footer = r"\end{document}"

    def _format_date(self, date_str):
        if not date_str: return ""
        try:
            date = datetime.fromisoformat(date_str)
            return date.strftime("%b %Y")
        except  ValueError:
            try:
                date = datetime.strptime(date_str, "%B %Y")
                return date.strftime("%b %Y")
            except ValueError:
                print("error in date format: ",date_str)
                pass
        return date_str
        

    def _add_education(self):
        education = []
        education.append(r"\section{\textbf{Education}}")
        education.append(r"\vspace{1mm}")
        education.append(r"\setlength{\tabcolsep}{5pt}")
        education.append(r"\begin{tabularx}{\textwidth}{|>{\centering\arraybackslash}X|>{\centering\arraybackslash}p{8cm}|>{\centering\arraybackslash}p{3cm}|>{\centering\arraybackslash}p{2.5cm}|}")
        education.append(r"  \hline")
        education.append(r"  \textbf{Degree/Certificate} & \textbf{Institute/Board} & \textbf{CGPA/Percentage} & \textbf{Year} \\")
        education.append(r"  \hline")
        
        for edu in self.data["education"]:
            degree=edu['degree'].replace("&", "\&")
            flds=edu['fieldOfStudy'].replace("&", "\&")
            degree = f"{degree}, {flds}"
            institute = edu['institution']
            score = f"{edu.get('scoreType','CGPA')}: {edu['score']}"
            year = f"{self._format_date(edu['from_date'])} - {self._format_date(edu['to_date'])}"
            
            education.append(f"  {degree} & {institute} & {score} & {year} \\\\")
            education.append(r"  \hline")
        
        education.append(r"\end{tabularx}")
        education.append(r"\vspace{-4mm}")
        self.content.append("\n".join(education))

    def _add_experience(self):
        if not self.data["experiences"]: return
        
        exp = [r"\section{\textbf{Experience}}", r"\vspace{-0.4mm}", r"\resumeSubHeadingListStart"]
        
        for job in self.data["experiences"]:
            company = f"{job['company']} [\\href{{{job.get('companyUrl', '')}}}{{\\faIcon{{globe}}}}]" 
            location = job['location']
            role = job['role']
            dates = f"{self._format_date(job['from_date'])} - {self._format_date(job['to_date'])}"
            
            exp.append(r"\resumeSubheading")
            exp.append(f"    {{{company}}}{{{location}}}")
            exp.append(f"    {{{role}}}{{{dates}}}")
            exp.append(r"    \resumeItemListStart")
            
            for detail in job["details"]:
                exp.append(f"      \\item {detail}")
            
            exp.append(r"    \resumeItemListEnd")
        
        exp.append(r"\resumeSubHeadingListEnd")
        exp.append(r"\vspace{-6mm}")
        self.content.append("\n".join(exp))

    def _add_projects(self):
        if not self.data["projects"]: return
        
        projects = [r"\section{\textbf{Projects}}", r"\vspace{-0.4mm}", r"\resumeSubHeadingListStart"]
        
        for proj in self.data["projects"]:
            title = f"{proj['title']}: {proj.get('description', '')}"
            tools = f"Tools: {proj['technologies']}"
            dates = self._format_date(proj['from_date'])
            if proj['to_date']:
                dates += f" - {self._format_date(proj['to_date'])}"
            
            projects.append(r"\resumeProject")
            projects.append(f"    {{{title}}}")
            projects.append(f"    {{{tools}}}")
            projects.append(f"    {{{dates}}}")
            projects.append(" {{} [\\href{"+proj['projectLink']+"}{\\textcolor{darkblue}{\\faGithub}}]}")
            
            pro_details = proj.get("details", [])
            if pro_details:
                projects.append(r"\resumeItemListStart")
                for detail in pro_details:
                    projects.append(f"    \\item {detail}")
            
                projects.append(r"\resumeItemListEnd")
        
        projects.append(r"\resumeSubHeadingListEnd")
        projects.append(r"\vspace{-8mm}")
        self.content.append("\n".join(projects))

    def _add_skills(self):
        skills = [r"\section{\textbf{Skills}}", r"\vspace{-0.4mm}", r"\resumeHeadingSkillStart"]
        
        for category, items in self.data["skills"].items():
            category = category.replace("&", "\&")
            skills.append(f"\\resumeSubItem{{{category}}}{{: {', '.join(items)}}}")
        
        skills.append(r"\resumeHeadingSkillEnd")
        skills.append(r"\vspace{-2mm}")
        self.content.append("\n".join(skills))

    def _add_certifications(self):
        if not self.data["certifications"]: return
        
        certs = [r"\section{\textbf{Certifications}}", r"\vspace{-0.4mm}", r"\resumeSubHeadingListStart"]
        
        for cert in self.data["certifications"]:
            certs.append(r"\resumePOR")
            cert_name=cert['name'].replace("&", "\&")
            certs.append(f"    {{{cert_name}}}")
            if cert['link']:
                certs.append("{}{\\href{"+cert['link']+"}{\\faIcon{globe}}}")
            else:
                certs.append("{}{\\href{https:\\blank}{\\faIcon{globe}}}}")
            certs.append("{"+self._format_date(cert.get('date', ''))+"}")
        
        certs.append(r"\resumeSubHeadingListEnd")
        certs.append(r"\vspace{-6mm}")
        self.content.append("\n".join(certs))

    def _add_achievements(self):
        if not self.data.get("achievements"): return
        
        achievements = [
            r"\section{\textbf{Achievements}}",
            r"\vspace{-0.2mm}",
            r"\resumeSubHeadingListStart"
        ]
        
        for achievement in self.data["achievements"]:
            achievements.append(
                "\\resumePOR{}{\\href{"+achievement['link']+"}{"+achievement['title']+"}}{}"
            )
        
        achievements.extend([
            r"\resumeSubHeadingListEnd",
            r"\vspace{-6mm}"
        ])
        self.content.append("\n".join(achievements))

    def _add_positions(self):
        if not self.data.get("positions"): return
        
        positions = [
            r"\section{\textbf{Positions of Responsibility}}",
            r"\vspace{-0.4mm}",
            r"\resumeSubHeadingListStart"
        ]
        
        for position in self.data["positions"]:
            start_date = self._format_date(position["from_date"])
            end_date = self._format_date(position["to_date"]) if position.get("to_date") else "Present"
            
            positions.append(
                "\\resumePOR{\\href{"+position['link']+"}{"+position['title']+"}, }{"+position['organization']+"}{"+start_date+"} - {"+end_date+"} }"
            )
        
        positions.extend([
            r"\resumeSubHeadingListEnd",
            r"\vspace{-5mm}"
        ])
        self.content.append("\n".join(positions))

    def generate(self):
        # Replace header placeholders
        header = self.header.replace("[PACKAGE_IMPORTS]", self.packages)
        institute=self.data.get("education",[{"institution":""}])[-1]["institution"]
        department=self.data.get("education",[{"fieldOfStudy":""}])[-1]["fieldOfStudy"]
        department=department.replace("&", "\&")
        replacements = {
            "[NAME]": self.data.get("name",""),
            "[COURSE]": self.data.get("course", "Bachelor of Technology"),
            "[ROLL]": self.data.get("roll", ""),
            "[PHONE]": self.data.get("phonenumber",""),
            "[EMAIL1]": self.data.get("email",""),
            "[EMAIL2]": self.data.get("email2", ""),
            "[GITHUB]": self.data.get("github",""),
            "[GITHUBTHUMB]": self.data.get("githubthumbnail",""),
            "[WEBSITE]": self.data.get("portfolio", ""),
            "[WEBSITETHUMB]": self.data.get("portfoliothumbnail",""),
            "[LINKEDIN]": self.data.get("linkedin",""),
            "[LINKEDINTHUMB]": self.data.get("linkedinthumbnail",""),
            "[DEPARTMENT]": department,
            "[INSTITUTE]": institute,
            "[logo]":  self.user.profile_picture
        }
        
        for placeholder, value in replacements.items():
            header = header.replace(placeholder, str(value))
        
        # Generate sections
        sections = [
            self._add_education,
            self._add_experience,
            self._add_projects,
            self._add_skills,
            self._add_certifications,
            self._add_achievements,
            self._add_positions
        ]
        
        for section in sections:
            section()
        
        # Combine all parts
        return "\n".join([header] + self.content + [self.footer])

def nitp(data,user={"name":"User"}):
    print(user.profile_picture,"****")
    generator = NitpResumeGenerator(data,user)
    return generator.generate()
# Usage Example
# if __name__ == "__main__":
#     resume_data = { # Your JSON data here }
#     generator = NitpResumeGenerator(resume_data)
#     latex_output = generator.generate()
    
#     with open("nitp_resume.tex", "w") as f:
#         f.write(latex_output)
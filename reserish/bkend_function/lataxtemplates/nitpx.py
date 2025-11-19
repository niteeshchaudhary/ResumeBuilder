def nitp(data):
    beginning=r"""
            \documentclass[a4paper,11pt]{article}

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

            % Define personal information
            \newcommand{\name}{"""+data["name"]+r"""} % Your Name
            \newcommand{\course}{Bachelor of Technology} % Your Course
            \newcommand{\phone}{"""+data["phonenumber"]+r"""} % Your Phone Number
            \newcommand{\emaila}{"""+data["email"]+r"""} % Email 1
            \newcommand{\github}{"""+data["github"]+r"""} % Github
            \newcommand{\website}{"""+data["portfolio"]+r"""} % Website
            \newcommand{\linkedin}{"""+data["linkedin"]+r"""} % LinkedIn

            \begin{document}
            \fontfamily{cmr}\selectfont

            %----------HEADING-----------------
            \parbox{2.35cm}{%
            \includegraphics[width=2cm,clip]{logo.png}
            }
            \parbox{\dimexpr\linewidth-2.8cm\relax}{
            \begin{tabularx}{\linewidth}{L r}
            \textbf{\LARGE \name} & +91-\phone \\
            \course & \href{mailto:\emailb}{\emailb} \\
            Your Department & \href{https://www.linkedin.com/in/\linkedin}{linkedin.com/in/\linkedin} \\
            National Institute of Technology, Patna
            & \href{https://github.com/\github}{github.com/\github} \\
            \end{tabularx}
            }
            \vspace{-2mm}"""
    education=""
    if data["education"]:
        education+=r"""\section{\textbf{Education}}"""
        for i in data["education"]:
            education+=r"""
            \vspace{1mm}
            \setlength{\tabcolsep}{5pt}
            \begin{tabularx}{\textwidth}{|>{\centering\arraybackslash}X|>{\centering\arraybackslash}p{8cm}|>{\centering\arraybackslash}p{3cm}|>{\centering\arraybackslash}p{2.5cm}|}
            \hline
            \textbf{Degree/Certificate} & \textbf{Institute/Board} & \textbf{CGPA/Percentage} & \textbf{Year} \\
            \hline
            B.Tech., CSE & National Institute of Technology, Patna & [CGPA] & [Month Year] \\ 
            \hline
            Senior Secondary & [Institute/Board] & [CGPA] & [Month Year] \\
            \hline
            Secondary & [Institute/Board] & [CGPA] & [Month Year] \\
            \hline
            \end{tabularx}
            \vspace{-4mm}"""

    experience=""
    if data["experiences"]:
        experience+=r"""\section{\textbf{Experience}}
        \vspace{-0.4mm}
        \resumeSubHeadingListStart"""
        for i in data["experiences"]:
            experience+=r"""\resumeSubheading
            {"""+i["company"]+r""" [\href{https://www.companya.com}{\faIcon{globe}}]}{"""+i["location"]+r"""}
            {"""+i["role"]+"""}{"""+i["from_date"]+""" - """+i["to_date"]+r"""}
            \resumeItemListStart"""
            for j in i["details"]:
                experience+=r"""\item """+j
            experience+=r"""\resumeItemListEnd"""
        experience+=r"""\resumeSubHeadingListEnd
        \vspace{-6mm}"""
    
    project=""
    if data["projects"]:
        project+=r"""\section{\textbf{Projects}}
        \vspace{-0.4mm}
        \resumeSubHeadingListStart"""
        for i in data["projects"]:
            project+=r"""\resumeProject
            {"""+i["title"]+""": [Brief Description]}
            {Tools: [List of tools and technologies used]}
            {"""+i["from_date"]+" - "+i["to_date"]+r"""}
            {{}[\href{"""+i["projectLink"]+r"""}{\textcolor{darkblue}{\faGithub}}]}
            \resumeItemListStart"""
            for j in i["details"]:
                project+=r"""\item """+j
            project+=r"""\resumeItemListEnd"""
        project+=r"""\resumeSubHeadingListEnd
        \vspace{-8mm}"""

    skills=""
    if data["skills"]:
        skills+=r"""\section{\textbf{Skills}}
        \vspace{-0.4mm}
        \resumeHeadingSkillStart"""
        if data["skills"].get("skills"):
            for i in data["skills"]:
                skills+=r"""\resumeSubItem{"""+i+"""}{: [List of skills]}"""
        else:
            for i in data["skills"].keys():
                if(len(data["skills"][i])>0):
                    skills+=r"""\resumeSubItem{"""+i+"}{: "
                    skills+=",".join(data["skills"][i])
                    skills+=r""" }"""
        skills+=r"""\resumeHeadingSkillEnd
        \vspace{-2mm}"""
    
    certification=""
    if data["certifications"]:
        certification+=r"""\section{\textbf{Certifications}}
        \vspace{-0.4mm}
        \resumeSubHeadingListStart"""
        for i in data["certifications"]:
            certification+=r"""\resumePOR
            {"""+i["name"]+r"""}{, \href{"""+i["link"]+"""}{"""+i["link"]+"""}}{Month Year}"""
        certification+=r"""\resumeSubHeadingListEnd
        \vspace{-6mm}"""

    publication=""
    if data["publications"]:
        publication+=r"""\section{\textbf{Publications}}
        \vspace{-0.4mm}
        \resumeSubHeadingListStart"""
        for i in data["publications"]:
            publication+=r"""\resumePOR
            {"""+i["title"]+r"""}{, \href{"""+i["link"]+"""}{"""+i["link"]+"""}}{Month Year}"""
        publication+=r"""\resumeSubHeadingListEnd
        \vspace{-6mm}"""
    
    achievement=""
    if data["achievements"]:
        achievement+=r"""\section{\textbf{Achievements}}
        \vspace{-0.2mm}
        \resumeSubHeadingListStart"""
        for i in data["achievements"]:
            achievement+=r"""\resumePOR{}{\href{"""+i["link"]+"""}{"""+i["title"]+"""}}{}"""
        achievement+=r"""\resumeSubHeadingListEnd
        \vspace{-6mm}"""
    
    position=""
    # if data["positions"]:
    #     position+=r"""\section{\textbf{Positions of Responsibility}}
    #     \vspace{-0.4mm}
    #     \resumeSubHeadingListStart"""
    #     for i in data["positions"]:
    #         position+=r"""\resumePOR{\href{"""+i["link"]+"""}{"""+i["position"]+""", }}{"""+i["club"]+"""}{"""+i["tenure"]+"""}"""
    #     position+=r"""\resumeSubHeadingListEnd
    #     \vspace{-5mm}"""

    end_=r"""
    \end{document}"""
    return beginning+education+experience+project+skills+certification+publication+achievement+position+end_
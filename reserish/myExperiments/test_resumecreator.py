def generate_resume_latex(data):
    template = r"""
    \documentclass[10pt, letterpaper]{article}

    % Packages:
    \usepackage[
 
    ignoreheadfoot, % set margins without considering header and footer
    top=2 cm, % seperation between body and page edge from the top
    bottom=2 cm, % seperation between body and page edge from the bottom
    left=2 cm, % seperation between body and page edge from the left
    right=2 cm, % seperation between body and page edge from the right
    footskip=1.0 cm, % seperation between body and footer
    %% showframe %% for debugging 
    ]{geometry}
    \usepackage{titlesec}
    \usepackage{tabularx}
    \usepackage{array}
    \usepackage[dvipsnames]{xcolor}
    \definecolor{primaryColor}{RGB}{0, 79, 144}
    \usepackage{enumitem}
    \usepackage{fontawesome5}
    \usepackage{amsmath}
    \usepackage[
        pdftitle={%(name)s's CV},
        pdfauthor={%(name)s},
        pdfcreator={LaTeX with RenderCV},
        colorlinks=true,
        urlcolor=primaryColor
    ]{hyperref}
    \usepackage[pscoord]{eso-pic}
    \usepackage{calc}
    \usepackage{bookmark}
    \usepackage{lastpage}
    \usepackage{changepage}
    \usepackage{paracol}
    \usepackage{ifthen}
    \usepackage{needspace}
    \usepackage{iftex}

    % Some settings:
    \AtBeginEnvironment{adjustwidth}{\partopsep0pt}
    \pagestyle{empty}
    \setcounter{secnumdepth}{0}
    \setlength{\parindent}{0pt}
    \setlength{\topskip}{0pt}
    \setlength{\columnsep}{0cm}
    \makeatletter
    \let\ps@customFooterStyle\ps@plain
    \patchcmd{\ps@customFooterStyle}{\thepage}{
        \color{gray}\textit{\small %(name)s - Page \thepage{} of \pageref*{LastPage}}
    }{}{}
    \makeatother
    \pagestyle{customFooterStyle}

    \titleformat{\section}{\needspace{4\baselineskip}\bfseries\large}{}{0pt}{}[\vspace{1pt}\titlerule]

    \titlespacing{\section}{-1pt}{0.3 cm}{0.2 cm}

    \renewcommand\labelitemi{$\circ$}

    \newenvironment{highlights}{
        \begin{itemize}[
            topsep=0.10 cm,
            parsep=0.10 cm,
            partopsep=0pt,
            itemsep=0pt,
            leftmargin=0.4 cm + 10pt
        ]
    }{
        \end{itemize}
    }

    \newenvironment{onecolentry}{
        \begin{adjustwidth}{0.2 cm + 0.00001 cm}{0.2 cm + 0.00001 cm}
    }{
        \end{adjustwidth}
    }

    \newenvironment{twocolentry}[2][]{
        \onecolentry
        \def\secondColumn{#2}
        \setcolumnwidth{\fill, 4.5 cm}
        \begin{paracol}{2}
    }{
        \switchcolumn \raggedleft \secondColumn
        \end{paracol}
        \endonecolentry
    }

    \newenvironment{header}{
        \setlength{\topsep}{0pt}\par\kern\topsep\centering\linespread{1.5}
    }{
        \par\kern\topsep
    }

    \begin{document}

    \placelastupdatedtext
    \begin{header}
        \textbf{\fontsize{24 pt}{24 pt}\selectfont %(name)s}

        \vspace{0.3 cm}

        \normalsize
        \mbox{{\color{black}\footnotesize\faMapMarker*}\hspace*{0.13cm}%(location)s}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{mailto:%(email)s}{\color{black}{\footnotesize\faEnvelope[regular]}\hspace*{0.13cm}%(email)s}}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{tel:+%(mobile)s}{\color{black}{\footnotesize\faPhone*}\hspace*{0.13cm}%(mobile)s}}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{%(website)s}{\color{black}{\footnotesize\faLink}\hspace*{0.13cm}%(website)s}}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{https://linkedin.com/in/%(linkedin)s}{\color{black}{\footnotesize\faLinkedinIn}\hspace*{0.13cm}%(linkedin)s}}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{https://github.com/%(github)s}{\color{black}{\footnotesize\faGithub}\hspace*{0.13cm}%(github)s}}%
    \end{header}

    \vspace{0.3 cm}

    \section{Education} 
        \begin{twocolentry}{   
        \textit{%(edudate1)s}}
            \textbf{%(eduuniv1)s}

            \textit{%(edudegree1)s, %(edufield1)s}
        \end{twocolentry}

        \vspace{0.10 cm}
        \begin{onecolentry}
            \begin{highlights}
                \item GPA: %(edugpa1)s (\href{%(edulink1)s}{%(edulink1)s})
                \item \textbf{Coursework:} %(educourse1)s
            \end{highlights}
        \end{onecolentry}

    \section{Experience}
        \begin{twocolentry}{
        \textit{%(explocation1)s}    
        \textit{%(expdate1)s}}
            \textbf{%(expposition1)s}
            \textit{%(expcompany1)s}
        \end{twocolentry}

        \vspace{0.10 cm}
        \begin{onecolentry}
            \begin{highlights}
                \item %(exp1p1)s
                \item %(exp1p2)s
                \item %(exp1p3)s
            \end{highlights}
        \end{onecolentry}

    \end{document}
    """

    # Generate the LaTeX file
    latex_code = template % data

    # Write the LaTeX code to a file
    with open("generated_resume.tex", "w") as f:
        f.write(latex_code)
    print("Resume LaTeX file generated successfully!")

# Example Data
data = {
    'name': "John Doe",
    'location': "New York, USA",
    'email': "johndoe@example.com",
    'mobile': "1234567890",
    'website': "www.johndoe.com",
    'linkedin': "johndoe",
    'github': "johndoe",
    'edudate1': "2015 - 2019",
    'eduuniv1': "IIT Dharwad",
    'edudegree1': "B.Tech",
    'edufield1': "Computer Science",
    'edugpa1': "9.0",
    'edulink1': "https:iitdh.ac.in",
    'educourse1': "Data Structures, Algorithms, Databases",
    'explocation1': "Remote",
    'expdate1': "2021 - Present",
    'expposition1': "Software Engineer",
    'expcompany1': "XYZ Corp",
    'exp1p1': "Developed features in Django backend",
    'exp1p2': "Integrated APIs with React frontend",
    'exp1p3': "Optimized database queries"
}

generate_resume_latex(data)

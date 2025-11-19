def sb2(data,user): 
    import os 
    print(data,"data")  
    template=""
    template+=r"""\documentclass[10pt, letterpaper]{article}
        % Packages:
        \usepackage[
            ignoreheadfoot, % set margins without considering header and footer
            top="""+str(data["margin"]["vertical"])+r""" cm, % seperation between body and page edge from the top
            bottom="""+str(data["margin"]["vertical"])+r""" cm, % seperation between body and page edge from the bottom
            left="""+str(data["margin"]["horizontal"])+r""" cm, % seperation between body and page edge from the left
            right="""+str(data["margin"]["horizontal"])+r""" cm, % seperation between body and page edge from the right
            footskip=1.0 cm, % seperation between body and footer
            % showframe % for debugging 
        ]{geometry} % for adjusting page geometry
        \usepackage{titlesec} % for customizing section titles
        \usepackage{multicol} % for multiple columns
        \usepackage{tabularx} % for making tables with fixed width columns
        \usepackage{array} % tabularx requires this
        \usepackage[dvipsnames]{xcolor} % for coloring text
        \definecolor{primaryColor}{RGB}{0, 79, 144} % define primary color
        \usepackage{enumitem} % for customizing lists
        \usepackage{fontawesome5} % for using icons
        \usepackage{amsmath} % for math
        \usepackage[
            pdftitle={"""+data["name"]+r"""},
            pdfauthor={"""+data["name"]+r"""},
            pdfcreator={Reserish},
            colorlinks=true,
            urlcolor=primaryColor
        ]{hyperref} % for links, metadata and bookmarks
        \usepackage[pscoord]{eso-pic} % for floating text on the page
        \usepackage{calc} % for calculating lengths
        \usepackage{bookmark} % for bookmarks
        \usepackage{lastpage} % for getting the total number of pages
        \usepackage{changepage} % for one column entries (adjustwidth environment)
        \usepackage{paracol} % for two and three column entries
        \usepackage{ifthen} % for conditional statements
        \usepackage{needspace} % for avoiding page brake right after the section title
        \usepackage{iftex} % check if engine is pdflatex, xetex or luatex

        % Ensure that generate pdf is machine readable/ATS parsable:
        \ifPDFTeX
            \input{glyphtounicode}
            \pdfgentounicode=1
            % \usepackage[T1]{fontenc} % this breaks sb2nov
            \usepackage[utf8]{inputenc}
            \usepackage{lmodern}
        \fi



        % Some settings:
        \AtBeginEnvironment{adjustwidth}{\partopsep0pt} % remove space before adjustwidth environment
        \pagestyle{empty} % no header or footer
        \setcounter{secnumdepth}{0} % no section numbering
        \setlength{\parindent}{0pt} % no indentation
        \setlength{\topskip}{0pt} % no top skip
        \setlength{\columnsep}{0cm} % set column seperation
        \makeatletter
        \let\ps@customFooterStyle\ps@plain % Copy the plain style to customFooterStyle
        \makeatother
        \pagestyle{customFooterStyle}

        \titleformat{\section}{\needspace{4\baselineskip}\bfseries\large}{}{0pt}{}[\vspace{1pt}\titlerule]

        \titlespacing{\section}{
            % left space:
            -1pt
        }{
            % top space:
            0.3 cm
        }{
            % bottom space:
            0.2 cm
        } % section title spacing

        \renewcommand\labelitemi{$\circ$} % custom bullet points
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
        } % new environment for highlights

        \newenvironment{highlightsforbulletentries}{
            \begin{itemize}[
                topsep=0.10 cm,
                parsep=0.10 cm,
                partopsep=0pt,
                itemsep=0pt,
                leftmargin=10pt
            ]
        }{
            \end{itemize}
        } % new environment for highlights for bullet entries


        \newenvironment{onecolentry}{
            \begin{adjustwidth}{
                0.2 cm + 0.00001 cm
            }{
                0.2 cm + 0.00001 cm
            }
        }{
            \end{adjustwidth}
        } % new environment for one column entries

        \newenvironment{twocolentry}[2][]{
            \onecolentry
            \def\secondColumn{#2}
            \setcolumnwidth{\fill, 4.5 cm}
            \begin{paracol}{2}
        }{
            \switchcolumn \raggedleft \secondColumn
            \end{paracol}
            \endonecolentry
        } % new environment for two column entries

        \newenvironment{header}{
            \setlength{\topsep}{0pt}\par\kern\topsep\centering\linespread{1.5}
        }{
            \par\kern\topsep
        } % new environment for the header

        % save the original href command in a new command:
        \let\hrefWithoutArrow\href

        % new command for external links:
        \renewcommand{\href}[2]{\hrefWithoutArrow{#1}{\ifthenelse{\equal{#2}{}}{ }{#2 }\raisebox{.15ex}{\footnotesize \faExternalLink*}}}


        \begin{document}
            \newcommand{\AND}{\unskip
                \cleaders\copy\ANDbox\hskip\wd\ANDbox
                \ignorespaces
            }
            \newsavebox\ANDbox
            \sbox\ANDbox{}

            \placelastupdatedtext
            \begin{header}
                \textbf{\fontsize{24 pt}{24 pt}\selectfont """+data["name"]+r"""}

                \vspace{0.1 cm}

                \normalsize"""
    if data.get("email","") != "" and data["email"] != None:
        if not data.get("emailthumbnail") or data["emailthumbnail"] == "":
            data["emailthumbnail"]=data["email"]
        template+=r"""
                \mbox{\hrefWithoutArrow{mailto:"""+data["email"]+r"""}{\color{black}{\footnotesize\faEnvelope[regular]}\hspace*{0.13cm}"""+data["emailthumbnail"]+r"""}}%
                \kern 0.25 cm%
                \AND%
                \kern 0.25 cm%"""
    if data.get("phonenumber","") != "":
        template+=r"""
                \mbox{\hrefWithoutArrow{tel:+91-"""+data["phonenumber"]+r"""}{\color{black}{\footnotesize\faPhone*}\hspace*{0.13cm}"""+data["phonenumber"]+r"""}}%
                \kern 0.25 cm%
                \AND%
                \kern 0.25 cm%"""
    if data.get("portfolio","") != "" and data["portfolio"] != None:
        if data.get("portfoliothumbnail",None) == None or data["portfoliothumbnail"] == "":
            data["portfoliothumbnail"]=data["portfolio"].split("/")[-1]
        template+=r"""
                \mbox{\hrefWithoutArrow{"""+data["portfolio"]+r"""}{\color{black}{\footnotesize\faLink}\hspace*{0.13cm}"""+data["portfoliothumbnail"]+r"""}}%
                \kern 0.25 cm%
                \AND%
                \kern 0.25 cm%"""
    if data.get("linkedin","") != "" and data["linkedin"] != None:
        if data.get("linkedinthumbnail",None) == None or data["linkedinthumbnail"] == "":
            data["linkedinthumbnail"]=data["linkedin"].split("/")[-1]
        template+=r"""
                \mbox{\hrefWithoutArrow{https://linkedin.com/in/"""+data["linkedin"]+r"""}{\color{black}{\footnotesize\faLinkedinIn}\hspace*{0.13cm}"""+data["linkedinthumbnail"]+r"""}}%
                \kern 0.25 cm%
                \AND%"""
    if data.get("github","") != "" and data["github"] != None:
        if data.get("githubthumbnail",None) == None or data["githubthumbnail"] == "":
            data["githubthumbnail"]=data["github"].split("/")[-1]
        template+=r"""
                \kern 0.25 cm%
                \mbox{\hrefWithoutArrow{https://github.com/"""+data["github"]+r"""}{\color{black}{\footnotesize\faGithub}\hspace*{0.13cm}"""+data["githubthumbnail"]+r"""}}%"""
    template+=r"""
            \end{header}

            \vspace{0.3 cm - 0.3 cm}"""
    
    if data.get("summary") and data["summary"] != "":
        template+=r"""
            \section{Summary}
                \begin{onecolentry}
                    """+data["summary"]+r"""
                \end{onecolentry}"""
    
    if data.get("education",[]):
        template+=r"""
            \section{Education}"""
        print(data["education"],"edu")
        for edu in data["education"]:
            for i in edu.keys():
                if edu[i] == None:
                    if i == "to_date":
                        edu[i]="Present"
                    else:
                        edu[i]=""
                if edu[i] == "Currently Studying":
                    edu[i]="Present"
            template+=r"""
                \begin{twocolentry}{

                \textit{"""+str(edu.get("from_date",""))+r" - "+str(edu.get("to_date",""))+r"""}}
                    \textbf{"""+edu.get("institution","None")+r"""}

                    \textit{"""+edu.get("degree","None")+""
            
            
            if edu.get("fieldOfStudy"):
                template+=" in "+edu.get("fieldOfStudy","None")+r"""}"""
            else:
                template+=r"""}"""
            
            template+=r"""
                
                \end{twocolentry}

                \vspace{0.10 cm}
                """
            cleaned_coursework = [x for x in edu.get("coursework",[]) if x]
            if edu.get("score") or len(cleaned_coursework)>0 or edu.get("link"):
                template+=r"""
                \begin{onecolentry}
                    \begin{highlights}"""
                if edu.get("score"):
                    
                    template+=r"""\item \textbf{"""+edu.get("scoreType","GPA")+"""} """+edu.get("score","0")+ ("\%" if(edu.get("scoreType","GPA").lower().strip()=="percentage") else "")+""
                if edu.get("link"):
                    template+=r""" (\href{"""+edu.get("link","")+"""}{"""+edu.get("link","")+"""})"""
                if len(cleaned_coursework)>0:
                    template+=r"""\item \textbf{Coursework:}""" +", ".join(cleaned_coursework)
            
            template+=r"""
                        \end{highlights}
                    \end{onecolentry}\vspace{0.1 cm}"""
        
    if data.get("experiences",[]) != []:
        template+=r"""\section{Experience}"""
        for exp in data["experiences"]:
            for i in exp.keys():
                if exp[i] == None:
                    if i == "to_date":
                        exp[i]="Present"
                    else:
                        exp[i]=""
                if exp[i] == "Currently Working":
                    exp[i]="Present"
            template+=r"""
                \begin{twocolentry}{
                \textit{"""+exp.get("location","")+r"""}    
                    
                \textit{"""+str(exp.get("from_date",""))+r""" - """+str(exp.get("to_date",""))+r"""}}
                    \textbf{"""+exp.get("role","None")+r"""}
                    
                    \textit{"""+exp.get("company","None")+r"""}
                \end{twocolentry}

                \vspace{0.10 cm}"""
            if exp.get("details",[]) != []:
                template+=r"""
                \begin{onecolentry}
                    \begin{highlights}
                        """
                print(exp.get("details"),"details")
                for detail in exp.get("details",[]):
                    print(detail)
                    template+=r"""\item """+detail+""

                template+=r"""\end{highlights}
                \end{onecolentry}"""
            template+=r"""
            \vspace{0.1 cm}"""

    if data.get("publications",[]) != []:
        template+=r"""\section{Publications}"""
        for pub in data["publications"]:
            for i in pub.keys():
                # \mbox{Frodo Baggins}, 
                # \mbox{Samwise Gamgee}
                # \vspace{0.10 cm}
                if pub[i] == None:
                    pub[i]=""
            template+=r"""
                \begin{samepage} \begin{twocolentry}{
                """+str(pub.get("publish_date",""))+r"""}
                \textbf{"""+pub.get("title","None")+r"""}
                        \href{"""+pub.get("link","")+r"""}{"""+""+r"""}
                    \end{twocolentry}
                    \begin{onecolentry}
                
                \textit{"""+pub.get("journel","TY")+r"""}
                    \end{onecolentry}
                \end{samepage}"""

    if data.get("projects",[]) != []:
        template+=r"""\section{Projects}"""
        for proj in data["projects"]:
            # proj["projectLink"].split("/")[-1]
            for i in proj.keys():
                if proj[i] == None:
                    proj[i]=""
            template+=r"""
                \begin{twocolentry}{
                \textit{\href{"""+proj.get("projectLink","")+r"""}
                {"""+" "+r"""}}}
                    \textbf{"""+proj.get("title","None")+r"""} $|$ \emph{ """+proj.get("technologies","")+r"""}
                \end{twocolentry}

                \vspace{0.10 cm}"""
            if proj.get("details",[]):
                template+=r"""
                \begin{onecolentry}
                    \begin{highlights}"""
                for detail in proj.get("details",[]):
                    # print(detail)
                    template+=r"""\item """+detail+""
                template+=r"""\end{highlights}
                    \end{onecolentry}"""
            template+=r"""
                \vspace{0.1 cm}"""

    skills=""
    if data.get("skills"):
        skills+=r"""\section{Skills}"""
        if data["skills"].get("skills"):
            skills+=r"""\textbf{Languages:} """+",".join(data["skills"]["skills"])
        else:
            for i in data["skills"].keys():
                # for j in range(len(data["skills"][i])):
                data["skills"][i]=list(filter(lambda x: x!=None,data["skills"][i])) or []
                if(len(data["skills"][i])>0):
                    skills+=r"""\textbf{"""+i+"""}: """
                    print(data["skills"][i])
                    skills+=", ".join(data["skills"][i] if data["skills"][i]  else []) or  ""
                    skills+=r""""""
                    # if i != len(data["skills"].keys())-1:
                    #     skills+=r"""\vspace{-1 cm}"""
                skills+=r"""

                """
    print(skills,")*"*5)
    template+=skills+r"""\vspace{0.1 cm}"""

    if data.get("certifications",[]) != []:
        template+=r"""\vspace{-0.2 cm}\section{Certifications}"""
        for cert in data["certifications"]:
            for i in cert.keys():
                # \vspace{0.10 cm}
                if cert[i] == None:
                    cert[i]=""
            template+=r"""
                \begin{samepage} 
                    \begin{twocolentry}{}\textbf{"""+cert.get("name","?Name?")+r"""}
                        \href{"""+cert.get("link","")+r"""}{"""+""+r"""}
                    \end{twocolentry}
                \end{samepage}"""
        template+=r""" """ #\vspace{0.1 cm}   

    template+=r"""\end{document}"""
    # write templatetofile

    with open(os.path.join(os.getcwd(),"sb2.tex"),"w+") as os:
        os.write(template)

    return template
    


            # \section{Quick Guide}

            # \begin{onecolentry}
            #     \begin{highlightsforbulletentries}


            #     \item Each section title is arbitrary and each section contains a list of entries.

            #     \item There are 7 unique entry types: \textit{BulletEntry}, \textit{TextEntry}, \textit{EducationEntry}, \textit{ExperienceEntry}, \textit{NormalEntry}, \textit{PublicationEntry}, and \textit{OneLineEntry}.

            #     \item Select a section title, pick an entry type, and start writing your section!

            #     \item \href{https://docs.rendercv.com/user_guide/}{Here}, you can find a comprehensive user guide for RenderCV.


            #     \end{highlightsforbulletentries}
            # \end{onecolentry}
                # \mbox{{\color{black}\footnotesize\faMapMarker*}\hspace*{0.13cm}"""+data["location"]+r"""}%
                # \kern 0.25 cm%
                # \AND%
                # \kern 0.25 cm%
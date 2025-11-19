import React, { useEffect, useState, memo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "../../assets/AxiosConfig";
import emptydoc from "../../assets/ABC.pdf";
import Dropdown from '../../components/DropDown';
import MonthYearPicker from '../../components/MonthYearPicker';
import TemplateSelector from '../../components/TemplateSelector';
import { MdExpandMore, MdExpandLess, MdEdit, MdSave, MdDelete, MdAdd, MdRefresh, MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';

// Collapsible section component defined outside to preserve identity across renders
const CollapsibleSection = memo(({ title, icon, collapsed, onToggle, children }) => (
  <div className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle?.(); }}
      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-left flex items-center justify-between hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
    >
      <div className="flex items-center">
        {icon}
        <span className="ml-3">{title}</span>
      </div>
      {collapsed ? (
        <MdExpandMore className="w-6 h-6" />
      ) : (
        <MdExpandLess className="w-6 h-6" />
      )}
    </button>
    {!collapsed && (
      <div className="p-6">
        {children}
      </div>
    )}
  </div>
));

const host = import.meta.env.VITE_HOST;
const ResumeEditor = () => {
  const location=useLocation();
  const navigator=useNavigate();
  const [isSubmitting,setIsSubmitting] = useState(false);
  const {results}=location.state;
  const useUserData=location.state?.useUserData??true;
  console.log(results);
  if(!results?.skills){
    console.log(results?.skills,"*********________________**********\n");
    results.skills={
      "Technical Skills":[],
      "Soft Skills":[],
    }
  }
  if(!results?.margin){
    results.margin={
      "horizontal":2,
      "vertical":2
    }
  }

  const [template, setTemplate] = useState("sb2");
  const [dateFormat, setDateFormat] = useState("MMM yyyy"); // Add date format state
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [pdfData, setPdfData] = useState(`${emptydoc}#toolbar=0&navpanes=0&scrollbar=100&view=FitH`);
  
  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState({
    contact: false,
    summary: false,
    skills: false,
    experience: false,
    education: false,
    projects: false,
    certifications: false,
    publications: false,
    achievements: false,
    settings: false,
    preview: false
  });
  //const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  // Initial data from JSON
  const [resumeData, setResumeData] = useState(results);

  function from_MDS_to_int(MDS){
    if(MDS=="None" || MDS=="" || MDS==null){
      return null;
    }
    console.log(MDS,"*********________________**********\n");
    
    if(typeof(MDS)==typeof(new Date())){
      return MDS;
    }

    if(typeof(MDS)==typeof("")){
      var [month,year]=MDS.split(" ");
      if(MDS.split(" ").length==1){
        year=month;
        if (year.length==4)
          return new Date(year)
        return null;
      }
      if(months=="None" || year=="None" || months.indexOf(month.slice(0,3))<0){
        return null;
      }
      else
      {
      console.log(new Date(year,months.indexOf(month.slice(0,3))),months.indexOf(month.slice(0,3)),"*******************");
      }
      return new Date(year,months.indexOf(month.slice(0,3)));
    }
    else{
      return new Date(2025,"Jan");
    }
  }

  // Function to format all dates in resume data consistently
  const formatAllDates = (data) => {
    const formattedData = { ...data };
    
    // Format experience dates
    if (formattedData.experiences) {
      formattedData.experiences = formattedData.experiences.map(exp => ({
        ...exp,
        from_date: exp.from_date ? formatDate(new Date(exp.from_date)) : "",
        to_date: exp.currentlyWorking ? "Present" : (exp.to_date ? formatDate(new Date(exp.to_date)) : "")
      }));
    }
    
    // Format education dates
    if (formattedData.education) {
      formattedData.education = formattedData.education.map(edu => ({
        ...edu,
        from_date: edu.from_date ? formatDate(new Date(edu.from_date)) : "",
        to_date: edu.currentlyStudying ? "Present" : (edu.to_date ? formatDate(new Date(edu.to_date)) : "")
      }));
    }
    
    // Format project dates
    if (formattedData.projects) {
      formattedData.projects = formattedData.projects.map(project => ({
        ...project,
        from_date: project.from_date ? formatDate(new Date(project.from_date)) : "",
        to_date: project.to_date ? formatDate(new Date(project.to_date)) : ""
      }));
    }
    
    return formattedData;
  };

  // Function to compile the resume data
  const compileCode = () => {
    console.log(resumeData);
    setIsSubmitting(true);
    
    // Sort the data by dates
    resumeData.experiences.sort((a, b) => new Date(b.from_date) - new Date(a.from_date));
    resumeData.education.sort((a, b) => new Date(b.from_date) - new Date(a.from_date));
    resumeData.projects.sort((a, b) => new Date(b.from_date) - new Date(a.from_date));
    
    // Format all dates consistently before sending to API
    const formattedResumeData = formatAllDates(resumeData);
    
    axios.post(`/compile-latex/`,{"resume":formattedResumeData,"useUserData":useUserData,"template":template}).then((res)=>{
        
      console.log(res.data,res?.status);
      if(res?.status===200){
        setPdfData(`${host}/reserish/${res.data?.pdf_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`);
      }
      else{
        alert("Error in compiling the resume",res?.status,res?.data);
      }
      setIsSubmitting(false);
    }).catch((err)=>{
      console.log(err);
      alert("Error in compiling the resume",err?.status,err?.data);
      setIsSubmitting(false);
    });
  };

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  // Handling input changes for summary
  const handleSummaryChange = (e) => {
    setResumeData({ ...resumeData, summary: e.target.value });
  };


      // Handling skill change
  const handleSkillChange = (category, index, value) => {
    const updatedSkills = { ...resumeData.skills };
    updatedSkills[category][index] = value;
    setResumeData({ ...resumeData, skills: updatedSkills });
  };

  // Add new skill to category
  const addSkill = (category) => {
    const updatedSkills = { ...resumeData.skills };
    updatedSkills[category].push("");
    setResumeData({ ...resumeData, skills: updatedSkills });
  };

  // Remove skill from category
  const removeSkill = (category, index) => {
    const updatedSkills = { ...resumeData.skills };
    updatedSkills[category] = updatedSkills[category].filter((_, i) => i !== index);
    setResumeData({ ...resumeData, skills: updatedSkills });
  };

    // Handling input changes for experience details
  const handleExperienceChange = (e, index, field) => {
    const updatedExperiences = resumeData.experiences.map((exp, i) =>
      i === index ? { ...exp, [field]: e.target.value } : exp
    );
    setResumeData({ ...resumeData, experiences: updatedExperiences });
  };

  // Handling Date Picker changes for from/to dates
  const handleDateChange = (date, index, field) => {
    const updatedExperiences = resumeData.experiences.map((exp, i) =>
      i === index ? { ...exp, [field]: formatDate(date) } : exp
    );
    setResumeData({ ...resumeData, experiences: updatedExperiences });
  };

  // Handling Currently Working checkbox change
  const handleCurrentlyWorkingChange = (index) => {
    const updatedExperiences = resumeData.experiences.map((exp, i) => {
      if (i === index) {
        return {
          ...exp,
          currentlyWorking: !exp.currentlyWorking,
          to_date: !exp.currentlyWorking ? "Present" : formatDate(new Date())
        };
      }
      return exp;
    });
    setResumeData({ ...resumeData, experiences: updatedExperiences });
  };


  const handleCurrentlyStudyingChange = (index) => {
    const updatedEducation = resumeData.education.map((edu, i) => {
      if (i === index) {
        return {
          ...edu,
          currentlyStudying: !edu.currentlyStudying,
          to_date: !edu.currentlyStudying ? "Present" : formatDate(new Date())
        };
      }
      return edu;
    });
    setResumeData({ ...resumeData, education: updatedEducation });
  };

  // Handling changes for individual detail points
  const handleDetailChange = (e, expIndex, detailIndex) => {
    const updatedDetails = resumeData.experiences[expIndex].details.map((detail, i) =>
      i === detailIndex ? e.target.value : detail
    );

    const updatedExperiences = resumeData.experiences.map((exp, i) =>
      i === expIndex ? { ...exp, details: updatedDetails } : exp
    );

    setResumeData({ ...resumeData, experiences: updatedExperiences });
  };

  // Function to add a new detail field
  const addDetailField = (expIndex) => {
    const updatedExperiences = resumeData.experiences.map((exp, i) =>{
      if (i === expIndex && (!exp.details || exp.details.length === 0)) {
        return { ...exp, details: [""] };
      }
      // If the experience already has details, add a new empty detail
     return i === expIndex ? { ...exp, details: [...exp?.details, ""] } : exp
    }
    );
    setResumeData({ ...resumeData, experiences: updatedExperiences });
  };

  // Function to remove a detail field
  const removeDetailField = (expIndex, detailIndex) => {
    const updatedDetails = resumeData.experiences[expIndex].details.filter(
      (detail, i) => i !== detailIndex
    );

    const updatedExperiences = resumeData.experiences.map((exp, i) =>
      i === expIndex ? { ...exp, details: updatedDetails } : exp
    );

    setResumeData({ ...resumeData, experiences: updatedExperiences });
  };

  const formatIt = (text) => {
    // Convert numbered items into list format
    console.log("text",text);
    const formattedText = text!=''?text.replace(/\*\*/g, '').trim().split(/\d+\.\s/).filter(Boolean) : [];
    //.match(/\d\.\s\*\*[^.]+/g)
    console.log("formattedText",formattedText); 
    return formattedText;
  };

  // Function to remove a detail field
  const rephrase_exp = async (expIndex, detailIndex) => {
      var client_prompt=""

      if(resumeData.experiences[expIndex].details[detailIndex]==""){
        client_prompt="Write down a job description for resume for job i worked  role: "+resumeData.experiences[expIndex].role+". don't provide any extra text just print description as response";
      }
      const res=await axios.post(`/get_rephrase/`,{"client_prompt":client_prompt,"text": resumeData.experiences[expIndex].details[detailIndex],"pasttext":resumeData.experiences[expIndex].role});
      console.log(res.data,res?.status);
      const updatedDetails=[...resumeData.experiences[expIndex].details];
      updatedDetails[detailIndex]=formatIt(res.data?.data)[0];

      const updatedExperiences = resumeData.experiences.map((exp, i) =>
        i === expIndex ? { ...exp, details: updatedDetails } : exp
      );
      console.log(updatedExperiences);
  
      setResumeData({ ...resumeData, experiences: updatedExperiences });
  };

  const rephrase_proj = async (projIndex, detailIndex) => {
    var client_prompt="";

    if(resumeData.projects[projIndex].details[detailIndex]==""){
      client_prompt="Write down a project description for  project: "+resumeData.projects[projIndex].title+". don't provide any extra text just print description as response";
    }
      
    const res=await axios.post(`/get_rephrase/`,{"client_prompt":client_prompt,"text": resumeData.projects[projIndex].details[detailIndex],"pasttext":resumeData.projects[projIndex].title});
    console.log(res.data,res?.status);
    const updatedDetails=[...resumeData.projects[projIndex].details];
    updatedDetails[detailIndex]=formatIt(res.data?.data)[0];

    const updatedprojects = resumeData.projects.map((proj, i) =>
      i === projIndex ? { ...proj, details: updatedDetails } : proj
    );
    console.log(updatedprojects);

    setResumeData({ ...resumeData, projects: updatedprojects });
};

  // Function to remove an experience entry
  const removeExperience = (index) => {
    const updatedExperiences = resumeData.experiences.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, experiences: updatedExperiences });
  };

  // Function to add a new experience
  const addNewExperience = () => {
    setResumeData({
      ...resumeData,
      experiences: [
        ...resumeData.experiences,
        {
          company: "",
          role: "",
          from_date: new Date(),
          to_date: new Date(),
          location: "",
          currentlyWorking: false,
          details: ["", ""]
        }
      ]
    });
  };

  const handleEducationChange_type = (option, index, field) => {
    
    const updatedEducation = resumeData.education.map((edu, i) =>
      i === index ? { ...edu, [field]: option } : edu
    );
    setResumeData({ ...resumeData, education: updatedEducation });
  };

  
  // Handling input changes for education details
  const handleEducationChange = (e, index, field) => {
    
    const updatedEducation = resumeData.education.map((edu, i) =>
      i === index ? { ...edu, [field]: e.target.value } : edu
    );
    setResumeData({ ...resumeData, education: updatedEducation });
  };
  const formatDate = (date) => {
    if (!date) return "";
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    switch (dateFormat) {
      case "MMM yyyy":
        return `${months[month]} ${year}`;
      case "MM/yyyy":
        return `${String(month + 1).padStart(2, '0')}/${year}`;
      case "MMM dd, yyyy":
        return `${months[month]} ${String(day).padStart(2, '0')}, ${year}`;
      case "dd/MM/yyyy":
        return `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
      case "yyyy-MM-dd":
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      case "MMMM yyyy":
        return `${months[month]} ${year}`;
      case "yyyy":
        return `${year}`;
      default:
        return `${months[month]} ${year}`;
    }
  };

  // Handling Date Picker changes for education from/to dates
  const handleEducationDateChange = (date, index, field) => {
    const updatedEducation = resumeData.education.map((edu, i) =>
      i === index ? { ...edu, [field]: formatDate(date) } : edu
    );
    setResumeData({ ...resumeData, education: updatedEducation });
  };

  // Handling coursework change
  const handleCourseworkChange = (e, eduIndex, courseworkIndex) => {
    const updatedCoursework = resumeData.education[eduIndex].coursework.map((course, i) =>
      i === courseworkIndex ? e.target.value : course
    );

    const updatedEducation = resumeData.education.map((edu, i) =>
      i === eduIndex ? { ...edu, coursework: updatedCoursework } : edu
    );

    setResumeData({ ...resumeData, education: updatedEducation });
  };

  // Add new coursework field
  const addCourseworkField = (eduIndex) => {
    const updatedEducation = resumeData.education.map((edu, i) =>{
      if (i === eduIndex && (!edu.coursework || edu.coursework.length === 0)) {
        return { ...edu, coursework: [""] };
      }
      // If the education already has coursework, add a new empty coursework
     return  i === eduIndex ? { ...edu, coursework: [...edu.coursework, ""] } : edu
    }
    );
    setResumeData({ ...resumeData, education: updatedEducation });
  };

  // Remove coursework field
  const removeCourseworkField = (eduIndex, courseworkIndex) => {
    const updatedCoursework = resumeData.education[eduIndex].coursework.filter(
      (course, i) => i !== courseworkIndex
    );

    const updatedEducation = resumeData.education.map((edu, i) =>
      i === eduIndex ? { ...edu, coursework: updatedCoursework } : edu
    );

    setResumeData({ ...resumeData, education: updatedEducation });
  };

  // Function to add a new education
  const addNewEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          institution: "",
          from_date: formatDate(new Date()),
          to_date: formatDate(new Date()),
          degree: "",
          fieldOfStudy: "",
          currentlyStudying: false,
          scoreType:"",
          score: "",
          coursework: ["", ""]
        }
      ]
    });
  };

  // Function to remove an education entry
  const removeEducation = (index) => {
    const updatedEducation = resumeData.education.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, education: updatedEducation });
  };

   // Handling input changes for project details
   const handleProjectChange = (e, index, field) => {
    const updatedProjects = resumeData.projects.map((project, i) =>
      i === index ? { ...project, [field]: e.target.value } : project
    );
    setResumeData({ ...resumeData, projects: updatedProjects });
  };

  // Handling Date Picker changes for project from/to dates
  const handleProjectDateChange = (date, index, field) => {
    const updatedProjects = resumeData.projects.map((project, i) =>
      i === index ? { ...project, [field]: formatDate(date) } : project
    );
    setResumeData({ ...resumeData, projects: updatedProjects });
  };

  // Handling project details change
  const handleProjectDetailsChange = (e, projectIndex, detailIndex) => {
    const updatedDetails = resumeData.projects[projectIndex].details.map((detail, i) =>
      i === detailIndex ? e.target.value : detail
    );

    const updatedProjects = resumeData.projects.map((project, i) =>
      i === projectIndex ? { ...project, details: updatedDetails } : project
    );

    setResumeData({ ...resumeData, projects: updatedProjects });
  };

  // Add new detail field
  const addProjectDetailField = (projectIndex) => {

    const updatedProjects = resumeData.projects.map((project, i) =>{
      if (i === projectIndex && (!project.details || project.details.length === 0)) {
        return { ...project, details: [""] };
      }
     return i === projectIndex ? { ...project, details: [...project.details, ""] } : project
    }
    );
    setResumeData({ ...resumeData, projects: updatedProjects });
  };

  // Remove detail field
  const removeProjectDetailField = (projectIndex, detailIndex) => {
    const updatedDetails = resumeData.projects[projectIndex].details.filter(
      (detail, i) => i !== detailIndex
    );

    const updatedProjects = resumeData.projects.map((project, i) =>
      i === projectIndex ? { ...project, details: updatedDetails } : project
    );

    setResumeData({ ...resumeData, projects: updatedProjects });
  };

  // Function to add a new project
  const addNewProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        {
          title: "",
          technologies: "",
          from_date: formatDate(new Date()),
          to_date: formatDate(new Date()),
          details: ["", ""],
          projectLink: ""
        }
      ]
    });
  };

  // Function to remove a project entry
  const removeProject = (index) => {
    const updatedProjects = resumeData.projects.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, projects: updatedProjects });
  };
      // Handling input changes for certification name
  const handleCertificationChange = (e, index) => {
    const updatedCertifications = resumeData.certifications.map((cert, i) =>
      i === index ? { ...cert, name: e.target.value } : cert
    );
    setResumeData({ ...resumeData, certifications: updatedCertifications });
  };

  // Handling input changes for certification link
  const handleCertificationLinkChange = (e, index) => {
    const updatedCertifications = resumeData.certifications.map((cert, i) =>
      i === index ? { ...cert, link: e.target.value } : cert
    );
    setResumeData({ ...resumeData, certifications: updatedCertifications });
  };

  // Handling input changes for certification authority
  const handleCertificationAuthorityChange = (e, index) => {
    const updatedCertifications = resumeData.certifications.map((cert, i) =>
      i === index ? { ...cert, authority: e.target.value } : cert
    );
    setResumeData({ ...resumeData, certifications: updatedCertifications });
  };

  // Handling input changes for certification issue date
  const handleCertificationIssueDateChange = (e, index) => {
    const updatedCertifications = resumeData.certifications.map((cert, i) =>
      i === index ? { ...cert, issue_date: e.target.value } : cert
    );
    setResumeData({ ...resumeData, certifications: updatedCertifications });
  };

  // Handling input changes for certification expiry date
  const handleCertificationExpiryDateChange = (e, index) => {
    const updatedCertifications = resumeData.certifications.map((cert, i) =>
      i === index ? { ...cert, expiry_date: e.target.value } : cert
    );
    setResumeData({ ...resumeData, certifications: updatedCertifications });
  };

  // Handling input changes for certification credential ID
  const handleCertificationCredentialIdChange = (e, index) => {
    const updatedCertifications = resumeData.certifications.map((cert, i) =>
      i === index ? { ...cert, credential_id: e.target.value } : cert
    );
    setResumeData({ ...resumeData, certifications: updatedCertifications });
  };

  // Handling input changes for certification credential URL
  const handleCertificationCredentialUrlChange = (e, index) => {
    const updatedCertifications = resumeData.certifications.map((cert, i) =>
      i === index ? { ...cert, credential_url: e.target.value } : cert
    );
    setResumeData({ ...resumeData, certifications: updatedCertifications });
  };

  // Handling input changes for publication title
  const handlePublicationChange = (e, index) => {
    const updatedPublications = resumeData.publications.map((pub, i) =>
      i === index ? { ...pub, title: e.target.value } : pub
    );
    setResumeData({ ...resumeData, publications: updatedPublications });
  };

  // Handling input changes for publication link
  const handlePublicationLinkChange = (e, index) => {
    const updatedPublications = resumeData.publications.map((pub, i) =>
      i === index ? { ...pub, link: e.target.value } : pub
    );
    setResumeData({ ...resumeData, publications: updatedPublications });
  };
  const handlePublicationJournelChange = (e, index) => {
    const updatedPublications = resumeData.publications.map((pub, i) =>
      i === index ? { ...pub, journel: e.target.value } : pub
    );
    setResumeData({ ...resumeData, publications: updatedPublications });
  };
  const handlePublicationDateChange = (e, index) => {
    const updatedPublications = resumeData.publications.map((pub, i) =>
      i === index ? { ...pub, publish_date: e.target.value } : pub
    );
    setResumeData({ ...resumeData, publications: updatedPublications });
  };

  // Handling input changes for publication description
  const handlePublicationDescriptionChange = (e, index) => {
    const updatedPublications = resumeData.publications.map((pub, i) =>
      i === index ? { ...pub, description: e.target.value } : pub
    );
    setResumeData({ ...resumeData, publications: updatedPublications });
  };

  // Function to add new certification
  const addNewCertification = () => {
    setResumeData({
      ...resumeData,
      certifications: [...resumeData.certifications, { 
        name: "", 
        authority: "",
        issue_date: "",
        expiry_date: "",
        credential_id: "",
        link: "",
        credential_url: ""
      }]
    });
  };

  // Function to remove a certification entry
  const removeCertification = (index) => {
    const updatedCertifications = resumeData.certifications.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, certifications: updatedCertifications });
  };

  // Function to add new publication
  const addNewPublication = () => {
    setResumeData({
      ...resumeData,
      publications: [...resumeData.publications, { 
        title: "", 
        link: "",
        journel: "",
        publish_date: "",
        description: ""
      }]
    });
  };

  // Function to remove a publication entry
  const removePublication = (index) => {
    const updatedPublications = resumeData.publications.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, publications: updatedPublications });
  };
    // Handling input changes for achievement description
    const handleAchievementChange = (e, index) => {
      const updatedAchievements = resumeData.achievements.map((ach, i) =>
        i === index ? { ...ach, title: e.target.value } : ach
      );
      setResumeData({ ...resumeData, achievements: updatedAchievements });
    };
  
    // Handling input changes for achievement link
    const handleAchievementLinkChange = (e, index) => {
      const updatedAchievements = resumeData.achievements.map((ach, i) =>
        i === index ? { ...ach, link: e.target.value } : ach
      );
      setResumeData({ ...resumeData, achievements: updatedAchievements });
    };
  
    // Function to add new achievement
    const addNewAchievement = () => {
      setResumeData({
        ...resumeData,
        achievements: [...resumeData.achievements, { 
          title: "", 
          date: "",
          description: "",
          link: "" 
        }]
      });
    };
  
    // Function to remove an achievement entry
    const removeAchievement = (index) => {
      const updatedAchievements = resumeData.achievements.filter((_, i) => i !== index);
      setResumeData({ ...resumeData, achievements: updatedAchievements });
    };

    // Handling input changes for achievement date
    const handleAchievementDateChange = (e, index) => {
      const updatedAchievements = resumeData.achievements.map((ach, i) =>
        i === index ? { ...ach, date: e.target.value } : ach
      );
      setResumeData({ ...resumeData, achievements: updatedAchievements });
    };

    // Handling input changes for achievement description
    const handleAchievementDescriptionChange = (e, index) => {
      const updatedAchievements = resumeData.achievements.map((ach, i) =>
        i === index ? { ...ach, description: e.target.value } : ach
      );
      setResumeData({ ...resumeData, achievements: updatedAchievements });
    };


    
    const toggleSection = (section) => {
      setCollapsedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

    const handleEnterKeyCapture = (e) => {
      if (e.key === 'Enter') {
        const tag = e.target?.tagName?.toLowerCase();
        const type = (e.target?.type || '').toLowerCase();
        if (tag === 'input' && !['checkbox','radio','button','submit','file'].includes(type)) {
          e.preventDefault();
        }
      }
    };

    // Using the memoized CollapsibleSection defined outside

  // Scroll buttons state
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Scroll functions
  const scrollToTop = () => {
    console.log('Scroll to top clicked');
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      console.log('Scroll to top executed');
    } catch (error) {
      console.error('Scroll to top error:', error);
      // Fallback to instant scroll
      window.scrollTo(0, 0);
    }
  };

  const scrollToBottom = () => {
    console.log('Scroll to bottom clicked');
    try {
      const documentHeight = document.documentElement.scrollHeight;
      console.log('Document height:', documentHeight);
      window.scrollTo({
        top: documentHeight,
        behavior: 'smooth'
      });
      console.log('Scroll to bottom executed');
    } catch (error) {
      console.error('Scroll to bottom error:', error);
      // Fallback to instant scroll
      window.scrollTo(0, document.documentElement.scrollHeight);
    }
  };

  // Handle scroll events to show/hide scroll buttons
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Check if page is actually scrollable
      const isScrollable = documentHeight > windowHeight;
      
      if (isScrollable) {
        // Show top button when scrolled down more than 100px
        setShowScrollTop(scrollTop > 100);
        
        // Show bottom button when not at the bottom (with 100px threshold)
        setShowScrollBottom(scrollTop + windowHeight < documentHeight - 100);
      } else {
        // If page is not scrollable, hide both buttons
        setShowScrollTop(false);
        setShowScrollBottom(false);
      }
      
      console.log('Scroll Debug:', { 
        scrollTop, 
        windowHeight, 
        documentHeight, 
        isScrollable,
        showScrollTop: isScrollable && scrollTop > 100,
        showScrollBottom: isScrollable && scrollTop + windowHeight < documentHeight - 100
      });
    };

    // Call handleScroll once on mount to set initial state
    setTimeout(handleScroll, 100); // Delay to ensure DOM is ready
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              type="button"
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Resume Editor</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" onKeyDown={handleEnterKeyCapture}>
      
        
        {/* Contact Information */}
        <CollapsibleSection 
          title="Contact Information" 
          collapsed={collapsedSections.contact}
          onToggle={() => toggleSection('contact')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                value={resumeData?.name}
                onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="flex space-x-3">
                <div className="w-32">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={resumeData?.phone_code || "+91"}
                    onChange={(e) => setResumeData({ ...resumeData, phone_code: e.target.value })}
                    placeholder="+91"
                  />
                </div>
                <input 
                  type="tel"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  value={resumeData?.phonenumber}
                  onChange={(e) => setResumeData({ ...resumeData, phonenumber: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
              <input 
                type="email" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                value={resumeData?.email}
                onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Display Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                value={resumeData?.emailthumbnail}
                onChange={(e) => setResumeData({ ...resumeData, emailthumbnail: e.target.value })}
                placeholder="How to display your email"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                value={resumeData?.address}
                onChange={(e) => setResumeData({ ...resumeData, address: e.target.value })}
                placeholder="Enter your address"
              />
            </div>
{/* 
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                value={resumeData?.bio}
                onChange={(e) => setResumeData({ ...resumeData, bio: e.target.value })}
                placeholder="Write a compelling professional summary that highlights your key strengths, experience, and career objectives..."
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-2">Write 3-4 sentences that summarize your professional background and career goals.</p>
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
              <input 
                type="url" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                value={resumeData?.linkedin}
                onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                placeholder="Your LinkedIn profile URL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Display Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                value={resumeData?.linkedinthumbnail}
                onChange={(e) => setResumeData({ ...resumeData, linkedinthumbnail: e.target.value })}
                placeholder="How to display your LinkedIn"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Profile</label>
              <input 
                type="url" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                value={resumeData?.github}
                onChange={(e) => setResumeData({ ...resumeData, github: e.target.value })}
                placeholder="Your GitHub profile URL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Display Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                value={resumeData?.githubthumbnail}
                onChange={(e) => setResumeData({ ...resumeData, githubthumbnail: e.target.value })}
                placeholder="How to display your GitHub"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Website</label>
              <input 
                type="url" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                value={resumeData?.portfolio}
                onChange={(e) => setResumeData({ ...resumeData, portfolio: e.target.value })}
                placeholder="Your portfolio website URL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Display Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                value={resumeData?.portfoliothumbnail}
                onChange={(e) => setResumeData({ ...resumeData, portfoliothumbnail: e.target.value })}
                placeholder="How to display your portfolio"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Summary Section */}
        <CollapsibleSection 
          title="Professional Summary" 
          collapsed={collapsedSections.summary}
          onToggle={() => toggleSection('summary')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              value={resumeData?.summary}
              onChange={handleSummaryChange}
              placeholder="Write a compelling professional summary that highlights your key strengths, experience, and career objectives..."
              rows={6}
            />
            <p className="text-sm text-gray-500 mt-2">Write 3-4 sentences that summarize your professional background and career goals.</p>
          </div>
        </CollapsibleSection>

        {/* Skills Section */}
        <CollapsibleSection 
          title="Skills & Competencies" 
          collapsed={collapsedSections.skills}
          onToggle={() => toggleSection('skills')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>}
        >
          <div className="space-y-6">
            {Object.keys(resumeData?.skills).map((category) => (
              <div key={category} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">{category}</h3>
                <div className="space-y-3">
                  {resumeData?.skills[category]?.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input 
                        type="text" 
                        value={skill} 
                        onChange={(e) => handleSkillChange(category, index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder={`Enter ${category.toLowerCase()}`}
                      />
                      <button
                        type="button"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        onClick={() => removeSkill(category, index)}
                        title="Remove skill"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => addSkill(category)}
                  >
                    <MdAdd className="w-5 h-5 mr-1" />
                    Add {category}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Experience Section */}
        <CollapsibleSection 
          title="Work Experience" 
          collapsed={collapsedSections.experience}
          onToggle={() => toggleSection('experience')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
          </svg>}
        >
          <div className="space-y-6">
            {resumeData?.experiences?.map((exp, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      value={exp?.role}
                      onChange={(e) => handleExperienceChange(e, index, 'role')}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      value={exp?.company}
                      onChange={(e) => handleExperienceChange(e, index, 'company')}
                      placeholder="e.g., Google Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      value={exp?.location}
                      onChange={(e) => handleExperienceChange(e, index, 'location')}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <DatePicker 
                      selected={dateRegex.test(exp?.from_date)?exp?.from_date:from_MDS_to_int(exp?.from_date)} 
                      dateFormat={dateFormat}
                      showMonthYearPicker
                      onChange={(date) => handleDateChange(date, index, 'from_date')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <DatePicker 
                      selected={exp?.currentlyWorking ? null :dateRegex.test(exp?.to_date)?exp?.to_date:from_MDS_to_int(exp?.to_date)?from_MDS_to_int(exp?.to_date):new Date()} 
                      onChange={(date) => handleDateChange(date, index, 'to_date')}
                      dateFormat={dateFormat}
                      showMonthYearPicker
                      disabled={exp?.currentlyWorking}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <input 
                    type="checkbox" 
                    checked={exp?.currentlyWorking}
                    onChange={() => handleCurrentlyWorkingChange(index)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">Currently Working</label>
                </div>

                {/* Experience Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Job Responsibilities</label>
                  <div className="space-y-3">
                    {exp?.details?.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center space-x-3">
                        <input 
                          type="text" 
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          value={detail}
                          onChange={(e) => handleDetailChange(e, index, detailIndex)}
                          placeholder="Describe your responsibility..."
                        />
                        <button 
                          type="button"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          onClick={() => rephrase_exp(index, detailIndex)}
                          title="AI Rephrase"
                        >
                          <MdRefresh className="w-5 h-5" />
                        </button>
                        <button 
                          type="button"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          onClick={() => removeDetailField(index, detailIndex)}
                          title="Remove detail"
                        >
                          <MdDelete className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => addDetailField(index)}
                    >
                      <MdAdd className="w-5 h-5 mr-1" />
                      Add Responsibility
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <button 
                      type="button"
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                      onClick={() => removeExperience(index)}
                      title="Remove experience"
                    >
                      Remove Experience
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button 
              type="button"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center"
              onClick={addNewExperience}
            >
              <MdAdd className="w-5 h-5 mr-2" />
              Add New Experience
            </button>
          </div>
        </CollapsibleSection>

        {/* Education Section */}
        <CollapsibleSection
          title="Education"
          collapsed={collapsedSections.education}
          onToggle={() => toggleSection('education')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          </svg>}
        >
          <div className="space-y-6">
            {resumeData?.education?.map((edu, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      value={edu?.institution}
                      onChange={(e) => handleEducationChange(e, index, 'institution')}
                      placeholder="e.g., MIT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      value={edu?.degree}
                      onChange={(e) => handleEducationChange(e, index, 'degree')}
                      placeholder="e.g., B.Sc. Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      value={edu?.fieldOfStudy}
                      onChange={(e) => handleEducationChange(e, index, 'fieldOfStudy')}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                    <div className="flex items-center space-x-3">
                      <Dropdown
                        options={["CGPA","Percentage","GPA"]}
                        onSelect={(option) => handleEducationChange_type(option, index, 'scoreType')}
                        label="Select"
                        def={edu?.scoreType || 'CGPA'}
                      />
                      <input
                        type="text"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        value={edu?.score}
                        onChange={(e) => handleEducationChange(e, index, 'score')}
                        placeholder="e.g., 8.5/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <DatePicker 
                      selected={dateRegex.test(edu?.from_date)?edu?.from_date:from_MDS_to_int(edu?.from_date)?from_MDS_to_int(edu?.from_date):new Date()} 
                      dateFormat={dateFormat}
                      showMonthYearPicker
                      onChange={(date) => handleEducationDateChange(date, index, 'from_date')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <DatePicker 
                      dateFormat={dateFormat}
                      showMonthYearPicker
                      disabled={edu?.currentlyStudying}
                      selected={edu?.currentlyStudying ? null :dateRegex.test(edu?.to_date)?edu?.to_date:from_MDS_to_int(edu?.to_date)?from_MDS_to_int(edu?.to_date):new Date()} 
                      onChange={(date) => handleEducationDateChange(date, index, 'to_date')}
                      className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex items-center mt-4">
                  <input 
                    type="checkbox" 
                    checked={edu?.currentlyStudying}
                    onChange={() => handleCurrentlyStudyingChange(index)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">Currently Studying</label>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coursework</label>
                  <div className="space-y-3">
                    {edu?.coursework?.map((course, courseworkIndex) => (
                      <div key={courseworkIndex} className="flex items-center space-x-3">
                        <input
                          type="text"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          value={course}
                          onChange={(e) => handleCourseworkChange(e, index, courseworkIndex)}
                          placeholder="Add a course"
                        />
                        <button 
                          type="button"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          onClick={() => removeCourseworkField(index, courseworkIndex)}
                          title="Remove course"
                        >
                          <MdDelete className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                      onClick={() => addCourseworkField(index)}
                    >
                      <MdAdd className="w-5 h-5 mr-1" />
                      Add Coursework
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <button 
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                    onClick={() => removeEducation(index)}
                  >
                    Remove Education
                  </button>
                </div>
              </div>
            ))}

            <button 
              type="button"
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium flex items-center justify-center"
              onClick={addNewEducation}
            >
              <MdAdd className="w-5 h-5 mr-2" />
              Add New Education
            </button>
          </div>
        </CollapsibleSection>

        {/* Projects Section */}
        <CollapsibleSection
          title="Projects"
          collapsed={collapsedSections.projects}
          onToggle={() => toggleSection('projects')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>}
        >
          <div className="space-y-6">
            {resumeData?.projects?.map((project, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200" 
                      value={project?.title}
                      onChange={(e) => handleProjectChange(e, index, 'title')}
                      placeholder="e.g., E-commerce Platform"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200" 
                      value={project?.technologies}
                      onChange={(e) => handleProjectChange(e, index, 'technologies')}
                      placeholder="e.g., React, Node.js, MongoDB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <DatePicker 
                      dateFormat={dateFormat}
                      showMonthYearPicker
                      selected={dateRegex.test(project?.from_date)?project?.from_date:from_MDS_to_int(project?.from_date)?from_MDS_to_int(project?.from_date):new Date()} 
                      onChange={(date) => handleProjectDateChange(date, index, 'from_date')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <DatePicker 
                      showMonthYearPicker
                      dateFormat={dateFormat}
                      selected={dateRegex.test(project?.to_date)?project?.to_date:from_MDS_to_int(project?.to_date)?from_MDS_to_int(project?.to_date):new Date()} 
                      onChange={(date) => handleProjectDateChange(date, index, 'to_date')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Link</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200" 
                    value={project?.projectLink}
                    onChange={(e) => handleProjectChange(e, index, 'projectLink')}
                    placeholder="https://github.com/username/project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Project Features</label>
                  <div className="space-y-3">
                    {project?.details?.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center space-x-3">
                        <input 
                          type="text" 
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          value={detail}
                          onChange={(e) => handleProjectDetailsChange(e, index, detailIndex)}
                          placeholder="Add a feature or responsibility..."
                        />
                        <button 
                          type="button"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          onClick={() => rephrase_proj(index, detailIndex)}
                          title="AI Rephrase"
                        >
                          <MdRefresh className="w-5 h-5" />
                        </button>
                        <button 
                          type="button"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          onClick={() => removeProjectDetailField(index, detailIndex)}
                          title="Remove feature"
                        >
                          <MdDelete className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      className="flex items-center text-teal-600 hover:text-teal-800 font-medium"
                      onClick={() => addProjectDetailField(index)}
                    >
                      <MdAdd className="w-5 h-5 mr-1" />
                      Add Feature
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <button 
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                    onClick={() => removeProject(index)}
                  >
                    Remove Project
                  </button>
                </div>
              </div>
            ))}

            <button 
              type="button"
              className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-all duration-200 font-medium flex items-center justify-center"
              onClick={addNewProject}
            >
              <MdAdd className="w-5 h-5 mr-2" />
              Add New Project
            </button>
          </div>
        </CollapsibleSection>

        {/* Certifications Section */}
        <CollapsibleSection
          title="Certifications"
          collapsed={collapsedSections.certifications}
          onToggle={() => toggleSection('certifications')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>}
        >
          <div className="space-y-6">
            {resumeData?.certifications?.map((certification, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      value={certification?.name}
                      onChange={(e) => handleCertificationChange(e, index)}
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Authority</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      value={certification?.authority}
                      onChange={(e) => handleCertificationAuthorityChange(e, index)}
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      value={certification?.issue_date}
                      onChange={(e) => handleCertificationIssueDateChange(e, index)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      value={certification?.expiry_date}
                      onChange={(e) => handleCertificationExpiryDateChange(e, index)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credential ID</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      value={certification?.credential_id}
                      onChange={(e) => handleCertificationCredentialIdChange(e, index)}
                      placeholder="e.g., AWS-12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Link</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      value={certification?.link}
                      onChange={(e) => handleCertificationLinkChange(e, index)}
                      placeholder="https://example.com/certificate"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credential URL</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      value={certification?.credential_url}
                      onChange={(e) => handleCertificationCredentialUrlChange(e, index)}
                      placeholder="https://credly.com/badges/example"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                    onClick={() => removeCertification(index)}
                  >
                    Remove Certification
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center justify-center"
              onClick={addNewCertification}
            >
              <MdAdd className="w-5 h-5 mr-1" />
              Add New Certification
            </button>
          </div>
        </CollapsibleSection>

        {/* Publications Section */}
        <CollapsibleSection
          title="Publications"
          collapsed={collapsedSections.publications}
          onToggle={() => toggleSection('publications')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
          </svg>}
        >
          <div className="space-y-6">
            {resumeData?.publications?.map((publication, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                      value={publication?.title}
                      onChange={(e) => handlePublicationChange(e, index)}
                      placeholder="e.g., Machine Learning in Healthcare"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                      value={publication?.link}
                      onChange={(e) => handlePublicationLinkChange(e, index)}
                      placeholder="https://doi.org/10.1000/example"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Journal</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                      value={publication?.journel}
                      onChange={(e) => handlePublicationJournelChange(e, index)}
                      placeholder="e.g., Nature, IEEE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Publication Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                      value={publication?.publish_date}
                      onChange={(e) => handlePublicationDateChange(e, index)}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 resize-none"
                    value={publication?.description}
                    onChange={(e) => handlePublicationDescriptionChange(e, index)}
                    placeholder="Brief description of the publication..."
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-2">Provide a brief overview of the publication content and its significance</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                    onClick={() => removePublication(index)}
                  >
                    Remove Publication
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="w-full bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-all duration-200 font-medium flex items-center justify-center"
              onClick={addNewPublication}
            >
              <MdAdd className="w-5 h-5 mr-2" />
              Add New Publication
            </button>
          </div>
        </CollapsibleSection>

        {/* Achievements Section */}
        <CollapsibleSection
          title="Achievements"
          collapsed={collapsedSections.achievements}
          onToggle={() => toggleSection('achievements')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          </svg>}
        >
          <div className="space-y-6">
            {resumeData?.achievements?.map((achievement, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      value={achievement?.title}
                      onChange={(e) => handleAchievementChange(e, index)}
                      placeholder="e.g., Best Student Award"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      value={achievement?.date}
                      onChange={(e) => handleAchievementDateChange(e, index)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
                      value={achievement?.description}
                      onChange={(e) => handleAchievementDescriptionChange(e, index)}
                      placeholder="Describe your achievement..."
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                      value={achievement?.link}
                      onChange={(e) => handleAchievementLinkChange(e, index)}
                      placeholder="https://example.com/achievement"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                    onClick={() => removeAchievement(index)}
                  >
                    Remove Achievement
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="w-full bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-all duration-200 font-medium flex items-center justify-center"
              onClick={addNewAchievement}
            >
              <MdAdd className="w-5 h-5 mr-1" />
              Add New Achievement
            </button>
          </div>
        </CollapsibleSection>

        {/* Settings & Generate */}
        <CollapsibleSection
          title="Settings & Generate PDF"
          collapsed={collapsedSections.settings}
          onToggle={() => toggleSection('settings')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Margins</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Horizontal</span>
                  <input type="number" min={0} max={3} value={resumeData?.margin?.horizontal}
                    onChange={(e) => setResumeData({ ...resumeData, margin: { ...resumeData?.margin, horizontal: e.target.value } })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"/>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Vertical</span>
                  <input type="number" min={0} max={3} value={resumeData?.margin?.vertical}
                    onChange={(e) => setResumeData({ ...resumeData, margin: { ...resumeData?.margin, vertical: e.target.value } })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"/>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <Dropdown
                options={[
                  "MMM yyyy",
                  "MM/yyyy", 
                  "MMM dd, yyyy",
                  "dd/MM/yyyy",
                  "yyyy-MM-dd",
                  "MMMM yyyy",
                  "yyyy"
                ]}
                onSelect={(option) => setDateFormat(option)}
                label="Select Date Format"
                def={dateFormat}
              />
              <p className="text-sm text-gray-500 mt-2">Choose how dates will be displayed in your resume</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
              <TemplateSelector options={["sb2", "nitp1"]} selected={template} onSelect={setTemplate}/>
            </div>

            <div>
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium"
                  onClick={compileCode}
                >
                  Generate PDF
                </button>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* Preview & Download */}
        <CollapsibleSection
          title="Preview & Download"
          collapsed={collapsedSections.preview}
          onToggle={() => toggleSection('preview')}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553 2.276A2 2 0 0121 14.118V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.882a2 2 0 011.447-1.842L9 10m6 0V6a3 3 0 10-6 0v4" />
          </svg>}
        >
          {pdfData ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">Resume PDF Preview</h3>
              <div className="border p-4 bg-gray-100 rounded-md" style={{ height: "80vh" }}>
                <iframe
                  src={pdfData}
                  className="w-full h-full border-none"
                  title="Resume Preview"
                  frameBorder="0"
                  scrolling="no"
                />
              </div>
              <div className="mt-4 text-center">
                <a
                  href={pdfData}
                  download="resume.pdf"
                  className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Download PDF
                </a>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Generate your PDF to preview and download it here.</p>
          )}
        </CollapsibleSection>

        {/* Add spacer to make page scrollable for testing */}
        {/* <div className="h-screen bg-transparent"></div> */}

      </div>

      {/* Scroll to Top Button */}
      {/* <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          showScrollTop 
            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
            : 'bg-gray-400 text-gray-700 hover:bg-gray-500'
        }`}
        title="Scroll to Top"
      >
        <MdKeyboardArrowUp className="w-7 h-7" />
      </button> */}

      {/* Scroll to Bottom Button */}
      {/* <button
        onClick={scrollToBottom}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          showScrollBottom 
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500' 
            : 'bg-gray-400 text-gray-700 hover:bg-gray-500'
        }`}
        title="Scroll to Bottom"
      >
        <MdKeyboardArrowDown className="w-7 h-7" />
      </button> */}

      {/* Debug Info - Remove this later */}
      {/* <div className="fixed top-20 right-6 z-50 bg-white p-3 rounded-lg shadow-lg border text-xs">
        <div>Top: {showScrollTop ? 'ON' : 'OFF'}</div>
        <div>Bottom: {showScrollBottom ? 'ON' : 'OFF'}</div>
        <div>Scrollable: {document.documentElement.scrollHeight > window.innerHeight ? 'Yes' : 'No'}</div>
        <div>Height: {document.documentElement.scrollHeight}px</div>
        <div>Window: {window.innerHeight}px</div>
        <button 
          onClick={() => {
            console.log('Manual scroll test');
            console.log('Window scrollY:', window.scrollY);
            console.log('Document height:', document.documentElement.scrollHeight);
            console.log('Window height:', window.innerHeight);
          }}
          className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
        >
          Debug
        </button>
        <button 
          onClick={() => {
            setShowScrollTop(true);
            setShowScrollBottom(true);
            console.log('Forced buttons ON');
          }}
          className="mt-2 px-2 py-1 bg-green-500 text-white text-xs rounded ml-1"
        >
          Force ON
        </button>
        <button 
          onClick={() => {
            console.log('Test scroll methods');
            // Test different scroll methods
            window.scrollBy(0, 100);
            console.log('scrollBy executed');
          }}
          className="mt-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded ml-1"
        >
          Test Scroll
        </button>
        <button 
          onClick={() => {
            console.log('Page scroll info:');
            console.log('scrollY:', window.scrollY);
            console.log('pageYOffset:', window.pageYOffset);
            console.log('documentElement.scrollTop:', document.documentElement.scrollTop);
            console.log('body.scrollTop:', document.body.scrollTop);
            console.log('Is scrollable:', document.documentElement.scrollHeight > window.innerHeight);
          }}
          className="mt-2 px-2 py-1 bg-purple-500 text-white text-xs rounded ml-1"
        >
          Scroll Info
        </button>
      </div> */}
    </div>
  );
};

export default ResumeEditor;


/*
{
    name: "",
    phonenumber: "",
    email: "",
    linkedin: "",
    github: "",
    portfolio: "",
    summary: "",
    skills: {
      "Programming Languages": [],
      "Web Technologies": [],
      "Frameworks": [],
      "Databases": [],
      "Tools": []
    },
    experiences: [
      {
        company: "",
        role: "",
        from_date: new Date(),
        to_date: new Date(),
        location: "",
        currentlyWorking: false,
        details: ["", ""]
      }
    ],
    education: [
      {
        institution: "",
        from_date: new Date(),
        to_date: new Date(),
        degree: "",
        fieldOfStudy: "",
        scoreType:"",
        score: "",
        coursework: ["", ""]
      }
    ],
    projects: [
      {
        title: "",
        technologies: "",
        from_date: new Date(),
        to_date: new Date(),
        details: ["", ""],
        projectLink: ""
      }
    ],
    certifications: [
      { name: "", link: "" }
    ],
    publications: [
      { title: "", link: "" }
    ],
    achievements: [
      { title: "", link: "" }
    ]
}
    */

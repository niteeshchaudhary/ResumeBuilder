import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation,useNavigate } from 'react-router-dom';
import axios from "../../assets/AxiosConfig";
import emptydoc from "../../assets/ABC.pdf";
import Dropdown from '../../components/DropDown';
import MonthYearPicker from '../../components/MonthYearPicker';
import TemplateSelector from '../../components/TemplateSelector';

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
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [pdfData, setPdfData] = useState(`${emptydoc}#toolbar=0&navpanes=0&scrollbar=100&view=FitH`);
  //const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  // Initial data from JSON
  const [resumeData, setResumeData] = useState(results);

  function parseDateFromString(dateString) {
    if (!dateString || dateString === "None" || dateString === "") {
      return null;
    }

    // If it's already a Date object, return it
    if (dateString instanceof Date) {
      return dateString;
    }

    // If it's not a string, return null
    if (typeof dateString !== "string") {
      return null;
    }

    const trimmedDate = dateString.trim();

    // Handle ISO date format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      return new Date(trimmedDate);
    }

    // Handle year-only format (YYYY)
    if (/^\d{4}$/.test(trimmedDate)) {
      return new Date(parseInt(trimmedDate), 0, 1); // January 1st of that year
    }

    // Handle "Month Year" format (e.g., "Jan 2023", "January 2023")
    const monthYearPattern = /^([A-Za-z]+)\s+(\d{4})$/;
    const monthYearMatch = trimmedDate.match(monthYearPattern);
    
    if (monthYearMatch) {
      const monthStr = monthYearMatch[1];
      const year = parseInt(monthYearMatch[2]);
      
      // Try to find month in the months array (case-insensitive)
      const monthIndex = months.findIndex(month => 
        month.toLowerCase() === monthStr.toLowerCase() || 
        month.toLowerCase() === monthStr.slice(0, 3).toLowerCase()
      );
      
      if (monthIndex !== -1) {
        return new Date(year, monthIndex, 1);
      }
    }

    // Handle "DD Month YYYY" format (e.g., "15 Jan 2023")
    const dayMonthYearPattern = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/;
    const dayMonthYearMatch = trimmedDate.match(dayMonthYearPattern);
    
    if (dayMonthYearMatch) {
      const day = parseInt(dayMonthYearMatch[1]);
      const monthStr = dayMonthYearMatch[2];
      const year = parseInt(dayMonthYearMatch[3]);
      
      const monthIndex = months.findIndex(month => 
        month.toLowerCase() === monthStr.toLowerCase() || 
        month.toLowerCase() === monthStr.slice(0, 3).toLowerCase()
      );
      
      if (monthIndex !== -1) {
        return new Date(year, monthIndex, day);
      }
    }

    // If no pattern matches, return null
    console.warn(`Could not parse date: ${dateString}`);
    return null;
  }


  // Function to compile the resume data
  const compileCode = async() => {
    console.log(resumeData);
    setIsSubmitting(true);
    resumeData.experiences.sort((a, b) => new Date(b.from_date) - new Date(a.from_date));
    resumeData.education.sort((a, b) => new Date(b.from_date) - new Date(a.from_date));
    resumeData.projects.sort((a, b) => new Date(b.from_date) - new Date(a.from_date));
    const res=await axios.post(`/compile-latex/`,{"resume":resumeData,"useUserData":useUserData,"template":template});
    console.log(res.data,res?.status);
    if(res?.status===200){
      setPdfData(`${host}/reserish/${res.data?.pdf_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`);
    }
    else{
      alert("Error in compiling the resume",res?.status,res?.data);
    }
    setIsSubmitting(false);
  };



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
    const year = date.getFullYear();
    const month = months[date.getMonth()].padStart(2, '0'); // Add 1 to month as it's 0-indexed
    // const day = String(date.getDate()).padStart(2, '0');
    return `${month} ${year}`;
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

  // Function to add new certification
  const addNewCertification = () => {
    setResumeData({
      ...resumeData,
      certifications: [...resumeData.certifications, { name: "", link: "" }]
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
      publications: [...resumeData.publications, { title: "", link: "" }]
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
        achievements: [...resumeData.achievements, { title: "", link: "" }]
      });
    };
  
    // Function to remove an achievement entry
    const removeAchievement = (index) => {
      const updatedAchievements = resumeData.achievements.filter((_, i) => i !== index);
      setResumeData({ ...resumeData, achievements: updatedAchievements });
    };

    console.log("certification error:",resumeData?.experiences);
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Resume Editor</h1>
      
        
      {/* Contact Information */}
      <div className="mb-4">
        <label className="block text-lg font-semibold">Name:</label>
        <input 
          type="text" 
          className="border border-gray-300 rounded p-2 w-full" 
          value={resumeData?.name}
          onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <label className="block text-lg font-semibold">Phone Number:</label>
        <input 
          type="tel"
          className="border border-gray-300 rounded p-2 w-full" 
          value={resumeData?.phonenumber}
          onChange={(e) => setResumeData({ ...resumeData, phonenumber: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <label className="block text-lg font-semibold">Email:</label>
        <div className="flex gap-2">
        <input 
          type="email" 
          placeholder='Email'
          className="border border-gray-300 rounded p-2 w-full" 
          value={resumeData?.email}
          onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
        />
        <input 
          type="emailthumbnail" 
          placeholder='Email Thumbnail'
          className="border border-gray-300 rounded p-2 w-full" 
          value={resumeData?.emailthumbnail}
          onChange={(e) => setResumeData({ ...resumeData, emailthumbnail: e.target.value })}
        />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-lg font-semibold">Linkedin:</label>
        <div className="flex gap-2">
        <input 
          type="url" 
          className="border border-gray-300 rounded p-2 w-full" 
          placeholder='linkedin link'
          value={resumeData?.linkedin}
          onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
        />
        <input 
          type="text" 
          className="border border-gray-300 rounded p-2 w-full" 
          placeholder='linkedin id thumbnail'
          value={resumeData?.linkedinthumbnail}
          onChange={(e) => setResumeData({ ...resumeData, linkedinthumbnail: e.target.value })}
        />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-lg font-semibold">Github:</label>
        <div className="flex gap-2">
        <input 
          type="url" 
          className="border border-gray-300 rounded p-2 w-full" 
          placeholder="github link"
          value={resumeData?.github}
          onChange={(e) => setResumeData({ ...resumeData, github: e.target.value })}
        />
        <input 
          type="text" 
          className="border border-gray-300 rounded p-2 w-full" 
          placeholder="github id thumbnail"
          value={resumeData?.githubthumbnail}
          onChange={(e) => setResumeData({ ...resumeData, githubthumbnail: e.target.value })}
        />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-lg font-semibold">Portfolio:</label>
        <div className="flex gap-2">
        <input 
          type="url" 
          className="border border-gray-300 rounded p-2 w-full" 
          placeholder='portfolio link'
          value={resumeData?.portfolio}
          onChange={(e) => setResumeData({ ...resumeData, portfolio: e.target.value })}
        />
        <input 
          type="text" 
          className="border border-gray-300 rounded p-2 w-full" 
          placeholder='portfolio link thumbnail'
          value={resumeData?.portfoliothumbnail}
          onChange={(e) => setResumeData({ ...resumeData, portfoliothumbnail: e.target.value })}
        />
        </div>
      </div>

        {/* Summary Section */}
      <h2 className="text-2xl font-semibold mb-4">Summary</h2>
      <div className="mb-4 p-4 border border-gray-300 rounded shadow">
        <textarea
          className="border border-gray-300 rounded p-2 w-full"
          value={resumeData?.summary}
          onChange={handleSummaryChange}
          placeholder="Write your summary here..."
          rows={5}
        />
      </div>

      {/* Skills Section */}
      <h2 className="text-2xl font-semibold mb-4">Skills</h2>
      {Object.keys(resumeData?.skills).map((category) => (
        <div key={category} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{category}:</h3>
          <div className="flex flex-wrap space-x-2">
            
            {resumeData?.skills[category]?.map((skill, index) => (
              <div key={index} className="flex items-center mb-2 space-x-2">
                <input 
                  type="text" 
                  value={skill} 
                  onChange={(e) => handleSkillChange(category, index, e.target.value)}
                  className="border border-gray-300 rounded p-2 w-full"
                />
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => removeSkill(category, index)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
          <button
            className="bg-green-500 text-white px-4 py-1 rounded"
            onClick={() => addSkill(category)}
          >
            + Add Skill
          </button>
        </div>
      ))}

      {/* Experience Cards */}
      <h2 className="text-2xl font-semibold mb-4">Experience</h2>
      {resumeData?.experiences?.map((exp, index) => (
        <div key={index} className="mb-6 p-4 border border-gray-300 rounded shadow">
          <div className="mb-4">
            <label className="block text-lg font-semibold">Role:</label>
            <input 
              type="text" 
              className="border border-gray-300 rounded p-2 w-full" 
              value={exp?.role}
              onChange={(e) => handleExperienceChange(e, index, 'role')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold">Company:</label>
            <input 
              type="text" 
              className="border border-gray-300 rounded p-2 w-full" 
              value={exp?.company}
              onChange={(e) => handleExperienceChange(e, index, 'company')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold">from_date:</label>
            
                       <DatePicker 
              selected={parseDateFromString(exp?.from_date)} 
              dateFormat="MM/yyyy"
              showMonthYearPicker
              onChange={(date) => handleDateChange(date, index, 'from_date')}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold">to:</label>
            {/* <MonthYearPicker/> */}
            <DatePicker 
              selected={exp?.currentlyWorking ? null : parseDateFromString(exp?.to_date)} 
              onChange={(date) => handleDateChange(date, index, 'to_date')}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              disabled={exp?.currentlyWorking}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold">Currently Working:</label>
            <input 
              type="checkbox" 
              checked={exp?.currentlyWorking}
              onChange={() => handleCurrentlyWorkingChange(index)}
            />
          </div>

          {/* Experience Details */}
          <div className="mb-4">
            <label className="block text-lg font-semibold">Details:</label>
            {exp?.details?.map((detail, detailIndex) => (
              <div key={detailIndex} className="flex items-center space-x-2 mb-2">
                <input 
                  type="text" 
                  className="border border-gray-300 rounded p-2 w-full"
                  value={detail}
                  onChange={(e) => handleDetailChange(e, index, detailIndex)}
                />
                <button 
                  className="bg-white-500 text-white px-2 py-1 rounded border border-2 border-gray-500 rounded-lg"
                  onClick={() => rephrase_exp(index, detailIndex)}
                >
                  🔃
                </button>
                <button 
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => removeDetailField(index, detailIndex)}
                >
                  -
                </button>
              </div>
            ))}
            <button 
              className="bg-green-500 text-white px-4 py-1 rounded"
              onClick={() => addDetailField(index)}
            >
              + Add Detail
            </button>
          </div>
        </div>
      ))}

      {/* Button to add a new experience */}
      <div className="mb-4">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addNewExperience}
        >
          Add More Experience
        </button>
      </div>




      {/* Education Cards */}
      <h2 className="text-2xl font-semibold mb-4">Education</h2>
      {resumeData?.education?.map((edu, index) => (
        <div key={index} className="mb-6 p-4 border border-gray-300 rounded shadow">
          <div className="mb-4">
            <label className="block text-lg font-semibold">Institution:</label>
            <input 
              type="text" 
              className="border border-gray-300 rounded p-2 w-full"
              value={edu?.institution}
              onChange={(e) => handleEducationChange(e, index, 'institution')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold">Degree:</label>
            <input 
              type="text" 
              className="border border-gray-300 rounded p-2 w-full"
              value={edu?.degree}
              onChange={(e) => handleEducationChange(e, index, 'degree')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold">Field of Study:</label>
            <input 
              type="text" 
              className="border border-gray-300 rounded p-2 w-full"
              value={edu?.fieldOfStudy}
              onChange={(e) => handleEducationChange(e, index, 'fieldOfStudy')}
            />
          </div>

          <div className="mb-4">  
            
            
            <label className="block text-lg font-semibold">
              <Dropdown
                options={["CGPA","Percentage","GPA"]}
                onSelect={(option) => handleEducationChange_type(option, index, 'scoreType')}
                label="Select an option"
                def="CGPA"
              />
            </label>
            <input 
              type="text" 
              className="border border-gray-300 rounded p-2 w-full"
              value={edu?.score}
              onChange={(e) => handleEducationChange(e, index, 'score')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold">from_date:</label>
            <DatePicker 
              selected={parseDateFromString(edu?.from_date)} 
              dateFormat="MM/yyyy"
              showMonthYearPicker
              onChange={(date) => handleEducationDateChange(date, index, 'from_date')}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold">to:</label>
            <DatePicker 
              dateFormat="MM/yyyy"
              showMonthYearPicker
              disabled={edu?.currentlyStudying}
              selected={edu?.currentlyStudying ? null : parseDateFromString(edu?.to_date)} 
              onChange={(date) => handleEducationDateChange(date, index, 'to_date')}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-lg font-semibold">Currently Studying:</label>
            <input 
              type="checkbox" 
              checked={edu?.currentlyStudying}
              onChange={() => handleCurrentlyStudyingChange(index)}
            />
          </div>


          {/* Coursework Section */}
          <div className="mb-4">
            <label className="block text-lg font-semibold">Coursework:</label>
            {edu?.coursework?.map((course, courseworkIndex) => (
              <div key={courseworkIndex} className="flex items-center space-x-2 mb-2">
                <input 
                  type="text" 
                  className="border border-gray-300 rounded p-2 w-full"
                  value={course}
                  onChange={(e) => handleCourseworkChange(e, index, courseworkIndex)}
                />
                <button 
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => removeCourseworkField(index, courseworkIndex)}
                >
                  -
                </button>
              </div>
            ))}
            <button 
              className="bg-green-500 text-white px-4 py-1 rounded"
              onClick={() => addCourseworkField(index)}
            >
              + Add Coursework
            </button>
          </div>

          <div className="mb-4">
            <button 
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => removeEducation(index)}
            >
              Remove Education
            </button>
          </div>
        </div>
      ))}

      {/* Button to add new education */}
      <div className="mb-4">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addNewEducation}
        >
          Add More Education
        </button>
      </div>


      {/* Projects Cards */}
      <h2 className="text-2xl font-semibold mb-4">Projects</h2>
      {resumeData?.projects?.map((project, index) => (
        <div key={index} className="mb-6 p-4 border border-gray-300 rounded shadow">
          <div className="mb-4">
            <label className="block text-lg font-semibold">Project Title:</label>
            <input 
              type="text" 
              className="border border-gray-300 rounded p-2 w-full"
              value={project?.title}
              onChange={(e) => handleProjectChange(e, index, 'title')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold">Technologies Used:</label>
            <input 
              type="text" 
              className="border border-gray-300 rounded p-2 w-full"
              value={project?.technologies}
              onChange={(e) => handleProjectChange(e, index, 'technologies')}
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold">from_date:</label>
            <DatePicker 
            dateFormat="MM/yyyy"
            showMonthYearPicker
              selected={parseDateFromString(project?.from_date)} 
              onChange={(date) => handleProjectDateChange(date, index, 'from_date')}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-semibold">To:</label>
            <DatePicker 
            showMonthYearPicker
            dateFormat="MM/yyyy"
              selected={parseDateFromString(project?.to_date)} 
              onChange={(date) => handleProjectDateChange(date, index, 'to_date')}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>

           {/* Project Link */}
           <div className="mb-4">
            <label className="block text-lg font-semibold">Project Link:</label>
            <input 
              type="text" 
              className="border border-gray-300 rounded p-2 w-full"
              value={project?.projectLink}
              onChange={(e) => handleProjectChange(e, index, 'projectLink')}
            />
          </div>

          {/* Project Details Section */}
          <div className="mb-4">
            <label className="block text-lg font-semibold">Details:</label>
            {project?.details?.map((detail, detailIndex) => (
              <div key={detailIndex} className="flex items-center space-x-2 mb-2">
                <input 
                  type="text" 
                  className="border border-gray-300 rounded p-2 w-full"
                  value={detail}
                  onChange={(e) => handleProjectDetailsChange(e, index, detailIndex)}
                />
                <button 
                  className="bg-white-500 text-white px-2 py-1 rounded border border-2 border-gray-500 rounded-lg"
                  onClick={() => rephrase_proj(index, detailIndex)}
                >
                  🔃
                </button>
                <button 
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => removeProjectDetailField(index, detailIndex)}
                >
                  -
                </button>
              </div>
            ))}
            <button 
              className="bg-green-500 text-white px-4 py-1 rounded"
              onClick={() => addProjectDetailField(index)}
            >
              + Add Detail
            </button>
          </div>


          <div className="mb-4">
            <button 
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => removeProject(index)}
            >
              Remove Project
            </button>
          </div>
        </div>
      ))}

      {/* Button to add new project */}
      <div className="mb-4">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addNewProject}
        >
          Add More Project
        </button>
      </div>


      {/* Certifications Section */}
      <h2 className="text-2xl font-semibold mb-4">Certifications</h2>
      {resumeData?.certifications?.map((certification, index) => (
        <div key={index} className="mb-4 p-4 border border-gray-300 rounded shadow">
          <label className="block text-lg font-semibold">Certification:</label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full"
              value={certification?.name}
              onChange={(e) => handleCertificationChange(e, index)}
              placeholder="Certification name"
            />
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => removeCertification(index)}
            >
              -
            </button>
          </div>
          <label className="block text-lg font-semibold">Certification Link (Optional):</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full"
            value={certification?.link}
            onChange={(e) => handleCertificationLinkChange(e, index)}
            placeholder="Certification link"
          />
        </div>
      ))}
      {/* Button to add more certifications */}
      <div className="mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addNewCertification}
        >
          Add More Certification
        </button>
      </div>


      {/* Publications Section */}
      <h2 className="text-2xl font-semibold mb-4">Publications</h2>
      {resumeData?.publications?.map((publication, index) => (
        <div key={index} className="mb-4 p-4 border border-gray-300 rounded shadow">
          <label className="block text-lg font-semibold">Publication Title:</label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full"
              value={publication?.title}
              onChange={(e) => handlePublicationChange(e, index)}
              placeholder="Publication title"
            />
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => removePublication(index)}
            >
              -
            </button>
          </div>
          <label className="block text-lg font-semibold">Publication Link (Optional):</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full"
            value={publication?.link}
            onChange={(e) => handlePublicationLinkChange(e, index)}
            placeholder="Publication link"
          />
          <label className="block text-lg font-semibold">Journel (Optional):</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full"
            value={publication?.journel}
            onChange={(e) => handlePublicationJournelChange(e, index)}
            placeholder="Publication Journel"
          />
          <label className="block text-lg font-semibold">Publication date (Optional):</label>
          <input
            type="date"
            className="border border-gray-300 rounded p-2 w-full"
            value={publication?.publish_date}
            onChange={(e) => handlePublicationDateChange(e, index)}
            placeholder="Publication date"
          />
        </div>
      ))}

      {/* Button to add more publications */}
      <div className="mb-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={addNewPublication}
        >
          Add More Publication
        </button>
      </div>

      {/* Achievements Section */}
      <h2 className="text-2xl font-semibold mb-4">Achievements</h2>
      {resumeData?.achievements?.map((achievement, index) => (
        <div key={index} className="mb-4 p-4 border border-gray-300 rounded shadow">
          <label className="block text-lg font-semibold">Achievement:</label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              className="border border-gray-300 rounded p-2 w-full"
              value={achievement?.title}
              onChange={(e) => handleAchievementChange(e, index)}
              placeholder="Achievement title"
            />
            <button
              className="bg-red-500 text-white px-2 py-1 rounded"
              onClick={() => removeAchievement(index)}
            >
              -
            </button>
          </div>
          <label className="block text-lg font-semibold">Achievement Link (Optional):</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full"
            value={achievement?.link}
            onChange={(e) => handleAchievementLinkChange(e, index)}
            placeholder="Achievement link"
          />
        </div>
      ))}

      {/* Button to add more achievements */}
      <div className="mb-4">
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={addNewAchievement}
        >
          Add More Achievement
        </button>
      </div>
      <div className="mb-4">
        <label className="text-2xl font-semibold mb-4">Margin:</label>
        <label className="block text-lg font-semibold">Horizontal:</label>
        <input type="number" value={resumeData?.margin?.horizontal} min={0} max={3} onChange={(e) => setResumeData({ ...resumeData, margin: {...resumeData?.margin,horizontal:e.target.value} })} />
        <label className="block text-lg font-semibold">Vertical:</label>
        <input type="number" value={resumeData?.margin?.vertical} min={0} max={3} onChange={(e) => setResumeData({ ...resumeData, margin: {...resumeData?.margin,vertical:e.target.value} })} />
      </div>

      <div className="">
        {/* options, onSelect, label,def  */}
        {/* <Dropdown options={["sb2", "nitp1"]} def={"sb2"} onSelect={setTemplate} /> */}
        

      </div>
      <TemplateSelector options={["sb2", "nitp1"]} selected={template} onSelect={setTemplate}/>

      {/* Compile Button */}
      <div className="mb-4">
      {isSubmitting ==true ? <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>:
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={compileCode}
        >
          Generate PDF
        </button>}
      </div>

        {/* PDF Preview */}
        {pdfData && (
          <div className="mt-6 h-full" >
            <h3 className="text-xl font-semibold mb-2">Resume PDF Preview:</h3>
            <div className="border p-4 bg-gray-100 rounded-md"  style={{height:"300vh"}}>
              {/* Iframe without side panel or toolbar */}
              <iframe
                src={pdfData}
                className="w-full h-full border-none"
                title="Resume Preview"
                frameBorder="0"
                scrolling="no"
                // style={{ pointerEvents: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Download Button */}
        {pdfData && (
          <div className="mt-6 text-center">
            <a
              href={pdfData}
              download="resume.pdf"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Download PDF
            </a>
          </div>
        )}
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

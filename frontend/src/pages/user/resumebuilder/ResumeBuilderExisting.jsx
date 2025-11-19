import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import Select from 'react-select';
import Latex from 'react-latex-next';
import 'tailwindcss/tailwind.css';
import axios from "../../../assets/AxiosConfig";
import 'katex/dist/katex.min.css';
import { Document, Page, pdfjs } from "react-pdf";
import { BlockMath } from 'react-katex';
import {minimalSetup, EditorView} from "codemirror";
import ProcessingPage from '../../../components/ProcessingPage';
import FileUpload from '../../../components/FileUpload';
import { useLocation, useNavigate } from 'react-router-dom';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const host = import.meta.env.VITE_HOST;

const emptyData = {
  name: "",
  phonenumber: "",
  email: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  skills: {
    "Programming Languages": [],
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
// Fetch templates list from Django backend
const ResumeBuilderExisting = () => {
  const [resumeData, setResumeData] = useState(null); 
  const [processing,setProcessing]=useState(false);
  const navigator = useNavigate();
  const fetchResults=async()=>{
    try {
      setProcessing(true);
      console.log("called");
      const resp = await axios.post(`/resume-parser/`);
      console.log("yewala hi apna h",resp.data);
      if (resp.status === 200) {
        setResumeData(resp.data);
        console.log(resp.data);
        if(Object.keys(resp.data).length==0){
          alert("Resume din't parse correctly, Please try again.Ensure no vpn and correct file.");
        }
        //resp.data?.skills?.map((skill)=>{s.split("Strengths:")[1]?.split("Weaknesses:")[0]?.trim();});
        navigator("/u/resumeeditor", { state: { results: resp.data } });
      } else {
        console.log("not 200");
      }
  } catch (error) {
   console.log("error",error);
  } finally {
    setProcessing(false);
    console.log("finally");
  }
  };

  const mycallback=()=>{
    fetchResults();
  }

  if(processing==true){
    return <ProcessingPage/>
  }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {
      resumeData!=null?
      <>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Resume Data</h2>
        <pre className="text-left whitespace-pre-wrap">
          {JSON.stringify(resumeData, null, 2)}
        </pre>
      </div>
        <div className="mb-4">
        <button onClick={()=>setResumeData(null)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4">Upload Another File</button>
        </div>
      </>
      :
      <>
      <h1 className="text-2xl font-bold mb-6">Upload Your File</h1>
      <p className="text-lg text-gray-700 mb-4">Please select a file to upload:</p>
      <div className="flex flex-col items-center space-y-4">
        
       <FileUpload callbk={mycallback}/>
       {/* <button onClick={()=>{navigator("/u/resumeeditor", { state: { results: emptyData } });}} className="text-white font-bold py-2 px-4 rounded mt-4"><p style={{color:"black"}}>skip</p></button> */}
      </div>
       
      </>}
     
    </div>
  );
};

export default ResumeBuilderExisting;

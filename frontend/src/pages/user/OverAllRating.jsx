
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import FileUpload from '../../components/FileUpload';
import { AuthContext } from "../../auth/AuthContext";
import axios from '../../assets/AxiosConfig';

// Mock components since they're not available in this context
// const FileUpload = ({ callbk }) => {
//   return (
//     <div className="w-full max-w-md mx-auto">
//       <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-300">
//         <div className="text-center">
//           <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
//             <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//           <p className="text-xl font-semibold text-gray-700 mb-2">Upload Your Resume</p>
//           <p className="text-gray-500 mb-4">Drag and drop your file here, or click to browse</p>
//           <button
//             onClick={() => callbk()}
//             className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
//           >
//             Choose File
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

const ProcessingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
      <div className="bg-white p-12 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Analyzing Your Resume</h3>
          <p className="text-gray-600 text-center max-w-md">Our AI is carefully reviewing your resume and generating comprehensive insights...</p>
        </div>
      </div>
    </div>
  );
};

const OverAllRating = () => {
  const { authState, refreshToken, logout } = useContext(AuthContext);
  const navigator = useNavigate();
  const [resumeData, setResumeData] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [formattedData, setFormattedData] = useState({
    formattedStrengths: [],
    formattedWeaknesses: [],
    formattedJobRoles: [],
    formattedCoursenCertificates: [],
    formattedResumeTipsnIdeas: []
  });

  // Mock data for demonstration
  const mockData = {
    "Overall Resume Score (out of 10)": "8.5/10. Strengths: 1. **Strong technical skills** in software development. 2. **Excellent project portfolio** showcasing diverse abilities. 3. **Clear career progression** demonstrated through roles. Weaknesses: 1. **Limited leadership experience** shown in resume. 2. **Lacks specific metrics** in achievements. 3. **Missing relevant certifications** for target roles.",
    "Job Role and Skills": "1. **Software Engineer** - Focus on full-stack development. 2. **Frontend Developer** - Specialize in React and modern frameworks. 3. **Backend Developer** - Concentrate on API development and databases.",
    "Courses and Certificates": "1. **AWS Cloud Practitioner** - Enhance cloud computing knowledge. 2. **React Advanced Patterns** - Improve frontend development skills. 3. **System Design Fundamentals** - Build scalable architecture knowledge.",
    "Resume Tips and Ideas": "1. **Add quantifiable achievements** with specific numbers and percentages. 2. **Include leadership examples** from projects or volunteer work. 3. **Highlight relevant technologies** that match job requirements.",
    "Interview Tips Video": {
      "Software Engineer": ["https://youtube.com/watch?v=example1", "https://youtube.com/watch?v=example2"],
      "Frontend Developer": ["https://youtube.com/watch?v=example3"]
    }
  };

  const fetchResults = async () => {
    try {
      setProcessing(true);
      console.log("called");
      const resp = await axios.post(`/over-all-rating/`, { analysis: isChecked ? 'Detailed' : 'Brief' });
      console.log("yewala bhi apna h", resp.data);
      if (resp.status === 200) {
        setResumeData(resp.data);
        console.log(resp.data);

      } else {
        console.log("not 200");
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setProcessing(false);
      console.log("finally");
    }
  };
  const mycallback = () => {
    fetchResults();
  }

  const formatIt = (text) => {
    // Convert numbered items into list format
    const formattedJobRoles = text != '' ? text.replace(/\*\*/g, '').trim().split(/\d+\.\s/).filter(Boolean) : [];
    //.match(/\d\.\s\*\*[^.]+/g)
    console.log("formattedJobRoles", formattedJobRoles);
    return formattedJobRoles;
  };

  // Helper function to convert paragraph to list
  const formatStrengthsAndWeaknesses = (text) => {
    // Split the text into parts based on the keywords "Strengths:" and "Weaknesses:"
    const strengths = text.split("Strengths:")[1]?.split("Weaknesses:")[0]?.trim();
    const weaknesses = text.split("Weaknesses:")[1]?.trim();
    console.log("strengths", strengths);
    console.log("weaknesses", weaknesses);

    const strengthsMatch = strengths != null ? strengths.match(/\d\.\s\*\*[^.]+/g) : [];
    const weaknessesMatch = weaknesses != null ? weaknesses.match(/\d\.\s\*\*[^.]+/g) : [];

    console.log("strengthsm", strengthsMatch);
    console.log("weaknessesm", weaknessesMatch);

    // Convert numbered items into list format
    const formattedStrengths = strengths?.replace(/\*\*/g, '').trim().split(/\d+\.\s/).filter(Boolean);
    const formattedWeaknesses = weaknesses?.replace(/\*\*/g, '').trim().split(/\d+\.\s/).filter(Boolean);
    console.log("fstrengths", formattedStrengths);
    console.log("fweaknesses", formattedWeaknesses);
    return { formattedStrengths, formattedWeaknesses };
  };
  if (resumeData != null) {
    console.log(typeof resumeData["Interview Tips Video"]);
  }

  // const formatIt = (text) => {
  //   const formatted = text != '' ? text.replace(/\*\*/g, '').trim().split(/\d+\.\s/).filter(Boolean) : [];
  //   return formatted;
  // };

  // const formatStrengthsAndWeaknesses = (text) => {
  //   const strengths = text.split("Strengths:")[1]?.split("Weaknesses:")[0]?.trim();
  //   const weaknesses = text.split("Weaknesses:")[1]?.trim();

  //   const formattedStrengths = strengths?.replace(/\*\*/g, '').trim().split(/\d+\.\s/).filter(Boolean);
  //   const formattedWeaknesses = weaknesses?.replace(/\*\*/g, '').trim().split(/\d+\.\s/).filter(Boolean);

  //   return { formattedStrengths, formattedWeaknesses };
  // };

  useEffect(() => {
    if (resumeData != null) {
      const { formattedStrengths, formattedWeaknesses } = formatStrengthsAndWeaknesses(resumeData["Overall Resume Score (out of 10)"]);
      const formattedJobRoles = formatIt(resumeData["Job Role and Skills"]);
      const formattedCoursenCertificates = formatIt(resumeData["Courses and Certificates"]);
      const formattedResumeTipsnIdeas = formatIt(resumeData["Resume Tips and Ideas"]);

      setFormattedData({
        formattedStrengths,
        formattedWeaknesses,
        formattedJobRoles,
        formattedCoursenCertificates,
        formattedResumeTipsnIdeas
      });
    }
  }, [resumeData]);

  if (processing === true) {
    return <ProcessingPage />;
  }

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 8) return 'text-green-600';
    if (numScore >= 6) return 'text-yellow-600';
    if (numScore >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 8) return 'from-green-500 to-green-600';
    if (numScore >= 6) return 'from-yellow-500 to-yellow-600';
    if (numScore >= 4) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {resumeData != null ? (
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Back Button */}
            <div className="flex justify-start mb-6">
              <button
                onClick={() => navigator("/u/")}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
            </div>
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Resume Analysis Report</h1>
            <p className="text-gray-600 text-lg">Comprehensive insights and recommendations for your career journey</p>
          </div>

          {/* Score Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <div className="flex flex-col lg:flex-col items-center justify-between space-y-6 lg:space-y-0">
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Overall Resume Score</h2>
                  <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r ${getScoreBgColor(resumeData["Overall Resume Score (out of 10)"].split("/")[0])} text-white font-bold text-2xl shadow-lg`}>
                    {resumeData["Overall Resume Score (out of 10)"].split(".")[0] || "0/10"}
                  </div>
                </div>

                {/* Strengths and Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6 flex-1 lg:ml-8">
                  <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-r-xl">
                    <h3 className="font-bold text-green-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Strengths
                    </h3>
                    {formattedData.formattedStrengths && formattedData.formattedStrengths.length > 0 ? (
                      <ul className="space-y-2">
                        {formattedData.formattedStrengths.map((item, index) => (
                          <li key={index} className="text-green-700 flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            <span dangerouslySetInnerHTML={{ __html: item }}></span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-green-700">Analyzing strengths...</p>
                    )}
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-xl">
                    <h3 className="font-bold text-red-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Areas for Improvement
                    </h3>
                    {formattedData.formattedWeaknesses && formattedData.formattedWeaknesses.length > 0 ? (
                      <ul className="space-y-2">
                        {formattedData.formattedWeaknesses.map((item, index) => (
                          <li key={index} className="text-red-700 flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span dangerouslySetInnerHTML={{ __html: item }}></span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-red-700">Analyzing areas for improvement...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 mb-8">
            {/* Job Roles and Skills */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Recommended Job Roles</h2>
              </div>
              {formattedData.formattedJobRoles && formattedData.formattedJobRoles.length > 0 ? (
                <div className="space-y-4">
                  {formattedData.formattedJobRoles.map((item, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400">
                      <span className="font-medium text-blue-800" dangerouslySetInnerHTML={{ __html: item }}></span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No job roles found.</p>
              )}
            </div>

            {/* Courses and Certificates */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Recommended Learning</h2>
              </div>
              {formattedData.formattedCoursenCertificates && formattedData.formattedCoursenCertificates.length > 0 ? (
                <div className="space-y-4">
                  {formattedData.formattedCoursenCertificates.map((item, index) => (
                    <div key={index} className="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-400">
                      <span className="font-medium text-purple-800" dangerouslySetInnerHTML={{ __html: item }}></span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No courses found.</p>
              )}
            </div>
          </div>

          {/* Resume Tips */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Resume Enhancement Tips</h2>
              </div>
              {formattedData.formattedResumeTipsnIdeas && formattedData.formattedResumeTipsnIdeas.length > 0 ? (
                <div className="grid gap-4">
                  {formattedData.formattedResumeTipsnIdeas.map((item, index) => (
                    <div key={index} className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400 flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.94l1-4H9.03z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-yellow-800" dangerouslySetInnerHTML={{ __html: item }}></span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tips found.</p>
              )}
            </div>
          </div>

          {/* Interview Tips Videos */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Interview Preparation Videos</h2>
              </div>
              {typeof resumeData["Interview Tips Video"] == "string" ? (
                <p className="text-gray-500">No interview tips videos found.</p>
              ) : (
                <div className="space-y-6">
                  {Object.keys(resumeData["Interview Tips Video"]).length > 0 && Object.keys(resumeData["Interview Tips Video"]).map((role, index) => (
                    <div key={index} className="p-6 bg-red-50 rounded-xl border border-red-200">
                      <h3 className="font-bold text-red-800 mb-4 text-lg">{role}</h3>
                      <div className="grid gap-3">
                        {resumeData["Interview Tips Video"][role].map((link, i) => (
                          <a
                            key={i}
                            href={link}
                            className="flex items-center p-3 bg-white rounded-lg border border-red-200 hover:border-red-400 transition-all duration-200 group"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-red-700 font-medium group-hover:text-red-800 transition-colors">
                              Interview Tips Video {i + 1}
                            </span>
                            <svg className="w-4 h-4 text-red-400 ml-auto group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={() => setResumeData(null)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold px-8 py-4 rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Analyze Another Resume</span>
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              {/* Back Button */}
              <div className="flex justify-start mb-8">
                <button
                  onClick={() => navigator("/u/")}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-8 shadow-2xl">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-5xl font-bold text-gray-800 mb-4">AI Resume Analyzer</h1>
                <p className="text-xl text-gray-600 mb-8">Get comprehensive insights and personalized recommendations for your career growth</p>
              </div>

              {/* Analysis Type Selection */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Analysis Type</h2>

                <div className="mb-8">
                  {authState.userDetails.active_plan == 1 ? <>
                    <label className="flex items-center justify-center p-6 bg-gray-200 rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-200 transition-all duration-200">
                      <input
                        type="checkbox"
                        name="detailed"
                        className="form-checkbox h-6 w-6 text-gray-600 rounded mr-4"
                        checked={false}
                        disabled={true}
                        onChange={(e) => setIsChecked(e.target.checked)}
                      />
                      <div className="text-left">
                        <span className="text-lg font-semibold text-gray-800">Detailed Analysis (upgrade your plan to access detailed mode)</span>
                        <p className="text-gray-600 text-sm mt-1">
                          Get comprehensive insights including job recommendations, learning paths, and interview preparation
                        </p>
                      </div>
                    </label>
                  </> :
                    <label className="flex items-center justify-center p-6 bg-blue-50 rounded-xl border-2 border-blue-200 cursor-pointer hover:bg-blue-100 transition-all duration-200">
                      <input
                        type="checkbox"
                        name="detailed"
                        className="form-checkbox h-6 w-6 text-blue-600 rounded mr-4"
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                      />
                      <div className="text-left">
                        <span className="text-lg font-semibold text-blue-800">Detailed Analysis</span>
                        <p className="text-blue-600 text-sm mt-1">
                          Get comprehensive insights including job recommendations, learning paths, and interview preparation
                        </p>
                      </div>
                    </label>}
                </div>

                <FileUpload callbk={mycallback} />
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">AI-Powered Analysis</h3>
                  <p className="text-gray-600 text-sm">Advanced algorithms analyze your resume for strengths and opportunities</p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Instant Results</h3>
                  <p className="text-gray-600 text-sm">Get comprehensive feedback and recommendations in seconds</p>
                </div>

                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Career Guidance</h3>
                  <p className="text-gray-600 text-sm">Personalized job recommendations and skill development paths</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverAllRating;

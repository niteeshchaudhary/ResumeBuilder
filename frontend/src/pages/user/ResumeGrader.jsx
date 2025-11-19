import React, { useState } from 'react';
import FileUpload from '../../components/FileUpload';  // Assuming FileUpload is in the same directory[]
import { AuthContext } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
const host = import.meta.env.VITE_HOST;
const ResumeGrader = () => {
  const [resumeData, setResumeData] = useState(null);
  const navigator = useNavigate();
  const setResume = () => {
    // setResumeData(data);
    navigator("/u/additionalinfo");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigator("/u/")}
            className="flex items-center text-white hover:text-blue-100 transition-colors duration-200 bg-black bg-opacity-20 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <div className="relative text-center text-white pt-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Upload Your Resume</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Get instant AI-powered analysis and feedback on your resume
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-8 px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Upload Section */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Ready to Analyze Your Resume?
                </h2>
                <p className="text-gray-600">
                  Upload your resume and get detailed insights to improve your job prospects
                </p>
              </div>

              {/* File Upload Component */}
              <div className="mb-8">
                <FileUpload callbk={setResume} />
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Get detailed AI-powered feedback on your resume content and structure
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Instant Results</h3>
                  <p className="text-sm text-gray-600">
                    Receive immediate scoring and recommendations to improve your resume
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Expert Tips</h3>
                  <p className="text-sm text-gray-600">
                    Get professional tips and best practices to make your resume stand out
                  </p>
                </div>
              </div>

              {/* Supported Formats */}
              <div className="mt-12 p-6 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">Supported File Formats</h3>
                <div className="flex justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-bold text-xs">PDF</span>
                    </div>
                    <span className="text-sm text-gray-600">PDF Files</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">DOC</span>
                    </div>
                    <span className="text-sm text-gray-600">Word Documents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold text-xs">TXT</span>
                    </div>
                    <span className="text-sm text-gray-600">Text Files</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Maximum file size: 10MB
                </p>
              </div>

              {/* Process Steps */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-900 text-center mb-8">How It Works</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                      1
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Upload</h4>
                    <p className="text-sm text-gray-600">Select and upload your resume file</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                      2
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Analyze</h4>
                    <p className="text-sm text-gray-600">AI processes and analyzes your content</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                      3
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Score</h4>
                    <p className="text-sm text-gray-600">Get detailed scoring and feedback</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                      4
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Improve</h4>
                    <p className="text-sm text-gray-600">Apply suggestions to enhance your resume</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Your files are processed securely and never stored permanently</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Data Display (when file is uploaded) */}
      {resumeData && (
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Resume Analysis Results</h2>
              <button
                onClick={() => setResumeData(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Upload Another File</span>
              </button>
            </div>

            {/* Display resume data here - you can replace this with your ResumeDisplay component */}
            <div className="bg-gray-50 rounded-lg p-6">
              <pre className="text-sm text-gray-800 overflow-auto max-h-96">
                {JSON.stringify(resumeData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeGrader;
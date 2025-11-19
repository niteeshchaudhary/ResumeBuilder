import React, { useState } from "react";
import axios from "../../assets/AxiosConfig";
import { useNavigate } from "react-router-dom";
import { aiload } from "../../assets/Images";

function ResumeWithAi() {
  const [jobDescription, setJobDescription] = useState("");
  const [useUserData, setUseUserData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const navigator = useNavigate();  

  // UI helpers
  const maxChars = 2000;
  const charCount = jobDescription.length;
  const remainingChars = maxChars - charCount;
  const isOverLimit = charCount > maxChars;
  const progressPercent = Math.min(100, Math.round((charCount / maxChars) * 100));

  const sampleJDs = [
    {
      title: "Frontend Engineer",
      text:
        "We are seeking a Frontend Engineer with strong React and TypeScript skills to build accessible, responsive web applications. Experience with state management (Redux/Zustand), API integration, testing, and performance optimization required.",
    },
    {
      title: "Data Analyst",
      text:
        "Looking for a Data Analyst proficient in SQL, Python, and dashboarding (Tableau/Power BI). Responsibilities include data cleaning, exploratory analysis, KPI reporting, and translating business questions into actionable insights.",
    },
    {
      title: "Backend Developer",
      text:
        "Hiring a Backend Developer experienced with Node.js/Express, REST APIs, databases (PostgreSQL/MongoDB), caching, authentication, and cloud deployment. Familiarity with CI/CD and unit/integration testing is a plus.",
    },
    {
      title: "Product Manager",
      text:
        "Seeking a Product Manager to define roadmaps, write PRDs, analyze user feedback, and collaborate with design and engineering. Experience with Agile workflows and metrics-driven decision making preferred.",
    },
  ];

  const processFinalJSON = (data) => {
    const formData = data;
    const formDataKeys = Object.keys(data);
    const result = {};
    console.log(formDataKeys,formData,"data");
    formDataKeys.forEach((section) => {
      console.log(section,formData[section]);
      if(section==="skills"){
        const skl={}
        formData[section].forEach((item, index) =>{
          if(skl[item["category"]]==undefined){
            skl[item["category"]]=[item["skill_name"]];
          }
          else{
          skl[item["category"]]=[...skl[item["category"]],item["skill_name"]]
          }
        });
        console.log(skl);
        result["skills"]=skl;
        console.log(result);
      } else {
        console.log("c1");
        result[section] = formData[section];
        console.log(result,section,"*");
      }
    });
    console.log("d1");
    const ans={...result,...result["personal"]}
    delete ans?.personal
    navigator("/u/resumeeditor", { state: { results: ans } });
    console.log(ans);
    return ans;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setError(null);

    axios.post("/resume-with-ai/",{useUserData, job_description: jobDescription }).then((response) => {
        console.log(response.data);
        if (response.status !== 200) {
          throw new Error("Failed to generate resume. Please check the inputs.");
        }
        const data = response.data;
        if (useUserData==true){
          processFinalJSON(data);
        }
        else{
          navigator("/u/resumeeditor", { state: { results: data,useUserData:false } });
        } 
      // setResponse(data.resume);
    }).catch((error) => {
        console.error("Error generating resume:", error);
      setError(error.response?.data?.error || "An error occurred while generating the resume."+error);
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleUseUserDataToggle = () => setUseUserData((prev) => !prev);
  const handleApplySample = (text) => setJobDescription(text.trim());
  const handleClear = () => setJobDescription("");

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="w-full min-h-screen p-4 sm:p-8 relative">
        {/* Header */}
        <div className="mb-6">
          {/* Back Button */}
          <div className="mb-4">
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
          
          <div className="flex items-center gap-4">
            <img
              src={aiload}
              alt="AI Assistant"
              className="w-14 h-14 rounded-full ring-2 ring-indigo-100 object-cover"
              style={{ mixBlendMode: "multiply" }}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generate Tailored Resume</h1>
              <p className="text-sm text-gray-600">Paste a job description and let AI tailor your resume. Optionally blend with your saved profile data.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Use User Data Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center">
              <button
                type="button"
                role="switch"
                aria-checked={useUserData}
                onClick={handleUseUserDataToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${useUserData ? "bg-indigo-600" : "bg-gray-300"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${useUserData ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
              <span className="ml-3 text-sm font-medium text-gray-800">Use my saved profile data</span>
            </div>
            <span className="text-xs text-gray-500 italic">If off, a sample resume will be created with realistic placeholder data.</span>
          </div>

          {/* Sample JD quick-fill */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="jobDescription" className="block text-sm font-semibold text-gray-800">
                Job Description <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={loading || charCount === 0}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap -m-1 mb-3">
              {sampleJDs.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => handleApplySample(s.text)}
                  className="m-1 text-xs px-3 py-1.5 rounded-full border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                  disabled={loading}
                  title={`Use sample: ${s.title}`}
                >
                  {s.title}
                </button>
              ))}
            </div>

            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              placeholder="Paste the job description here. Include responsibilities, required skills, and qualifications."
              rows="10"
              className={`mt-1 p-3 border rounded-md w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400 ${
                isOverLimit ? "border-red-300" : "border-gray-300"
              }`}
              disabled={loading}
            />

            {/* Character counter + progress */}
            <div className="mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{charCount.toLocaleString()} / {maxChars.toLocaleString()} characters</span>
                <span className={isOverLimit ? "text-red-600" : "text-gray-500"}>
                  {isOverLimit ? `${Math.abs(remainingChars).toLocaleString()} over limit` : `${remainingChars.toLocaleString()} left`}
                </span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${isOverLimit ? "bg-red-500" : progressPercent > 80 ? "bg-amber-500" : "bg-indigo-500"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {isOverLimit && (
                <p className="mt-1 text-xs text-red-600">Please shorten the description to {maxChars.toLocaleString()} characters.</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-600 text-white py-2.5 px-5 rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading || isOverLimit || charCount === 0}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89-5.26a2 2 0 012.22 0L21 8m-9 4v9m-4-9v9m8-9v9" />
                  </svg>
                  Generate Resume
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto border border-gray-300 text-gray-800 py-2.5 px-5 rounded-md hover:bg-gray-50 disabled:opacity-60"
              disabled={loading || charCount === 0}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          </div>
        </form>

        {/* Response Section */}
        {response && (
          <div className="mt-6 p-4 rounded-md border border-green-200 bg-green-50 text-green-800">
            <h2 className="font-semibold">Generated Resume</h2>
            <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 rounded-md border border-red-200 bg-red-50 text-red-800 flex items-start gap-2">
            <svg className="h-5 w-5 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm"><span className="font-semibold">Error:</span> {error}</p>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl grid place-items-center">
            <div className="flex items-center gap-3 text-indigo-700">
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span className="font-medium">Generating your tailored resume...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeWithAi;

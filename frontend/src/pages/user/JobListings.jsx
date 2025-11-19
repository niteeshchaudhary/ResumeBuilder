import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import axios from "../../assets/AxiosConfig";
import JobCard from "../../components/JobCard";
import { useNavigate } from "react-router-dom";

const dum = [
  {
    id: 1,
    title: "Software Engineer",
    company: "Google",
    location: "San Francisco, CA",
    jobType: "Full-Time",
    experience: "3-5 Years",
    profession: "Engineering",
    discipline: "Computer Science",
    description: "Develop scalable web applications.",
  },
  {
    id: 2,
    title: "Data Analyst",
    company: "Amazon",
    location: "Seattle, WA",
    jobType: "Contract",
    experience: "1-3 Years",
    profession: "Analytics",
    discipline: "Statistics",
    description: "Analyze large datasets and create reports.",
  },
  {
    id: 3,
    title: "UX Designer",
    company: "Facebook",
    location: "Remote",
    jobType: "Part-Time",
    experience: "0-1 Years",
    profession: "Design",
    discipline: "Graphic Design",
    description: "Create user-centric designs for our platform.",
  },
];


const host = import.meta.env.VITE_HOST;
const JobPostingsPage = () => {
  const [filters, setFilters] = useState({
    location: "",
    jobType: "",
    experience: "",
    profession: "",
    discipline: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const [jobData, setJobData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrapedJobs, setShowScrapedJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigator = useNavigate();
  
  useEffect(() => {
    document.getElementsByClassName("App")[0].scrollTo(0, 0);
    window.scrollTo(0, 0); 
  },[]);

  // Fetch jobs from the new backend endpoint
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Fetching jobs...");
      console.log("🔗 Axios baseURL:", axios.defaults.baseURL);
      console.log("🔗 Full URL will be:", axios.defaults.baseURL + "/joblistings");
      
      const response = await axios.post("/joblistings", {
        filters: filters
      });
      
      console.log("📡 Response received:", response);
      
      if (response.data.success) {
        setJobData(response.data.jobs);
        console.log("✅ Jobs fetched successfully:", response.data);
        console.log("📊 Total jobs:", response.data.total_jobs);
        console.log("🏢 Local jobs:", response.data.local_jobs);
        console.log("🌐 Scraped jobs:", response.data.scraped_jobs);
      } else {
        console.error("❌ Failed to fetch jobs:", response.data.message);
        setJobData([]);
      }
    } catch (error) {
      console.error("💥 Error fetching jobs:", error);
      console.error("💥 Error details:", error.response?.data || error.message);
      setJobData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Refetch jobs when filters change
  useEffect(() => {
    fetchJobs();
  }, [filters]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search is handled by the filteredJobs logic, no need to refetch
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // useEffect(() => {
  //   axios.post(`${host}/reserish/api/joblistings`,{query:'all'})
  //   .then((res)=>{
  //     console.log(res.data);
  //     setJobData(res?.data?.jobs||dum);
  //   })
  // }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
  };

  const handleJobCardClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  // Filter jobs based on current view (local vs external) and search query
  const filteredJobs = jobData.filter((job) => {
    // First filter by view type
    if (showScrapedJobs && !job.is_scraped) return false;
    if (!showScrapedJobs && job.is_scraped) return false;
    
    // Then apply search query (search across multiple fields)
    console.log("🔍 Filtering job:", job);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableFields = [
        job.title,
        job.company,
        job.location,
        job.jobType,
        job.experience,
        job.profession,
        job.discipline,
        job.description,
        job.salary
      ].filter(Boolean); // Remove null/undefined values
      
      const hasMatch = searchableFields.some(field => 
        field.toLowerCase().includes(query)
      );
      
      if (!hasMatch) return false;
    }
    
    // Then apply user filters
    return (
      (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.jobType || job.jobType === filters.jobType) &&
      (!filters.experience || job.experience === filters.experience) &&
      (!filters.profession || job.profession === filters.profession) &&
      (!filters.discipline || job.discipline === filters.discipline)
    );
  });

  // Debug logging for filtered jobs
  useEffect(() => {
    console.log("🔍 Debug - Current state:");
    console.log("📊 Total jobData:", jobData.length);
    console.log("🎯 showScrapedJobs:", showScrapedJobs);
    console.log("🔍 searchQuery:", searchQuery);
    console.log("📋 Filters:", filters);
    console.log("✅ Filtered jobs count:", filteredJobs.length);
    
    if (filteredJobs.length > 0) {
      console.log("📋 First filtered job:", filteredJobs[0]);
    }
  }, [jobData, showScrapedJobs, searchQuery, filters, filteredJobs]);

  return (
    <>
    <div className="min-h-screen w-full bg-gray-100 flex flex-col md:flex-row">
      {/* Responsive Filter Panel */}
      <div className="w-full md:w-1/4 bg-white shadow-md p-4 md:h-screen md:overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        {/* Location Filter */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Location</label>
          <input
            type="text"
            placeholder="Enter location"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          />
        </div>

        {/* Job Type Filter */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Job Type</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.jobType}
            onChange={(e) => handleFilterChange("jobType", e.target.value)}
          >
            <option value="">All</option>
            <option value="Full-Time">Full-Time</option>
            <option value="Part-Time">Part-Time</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        {/* Experience Filter */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Experience</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.experience}
            onChange={(e) => handleFilterChange("experience", e.target.value)}
          >
            <option value="">All</option>
            <option value="0-1 Years">0-1 Years</option>
            <option value="1-3 Years">1-3 Years</option>
            <option value="3-5 Years">3-5 Years</option>
            <option value="5+ Years">5+ Years</option>
          </select>
        </div>

        {/* Profession Filter */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Profession</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.profession}
            onChange={(e) => handleFilterChange("profession", e.target.value)}
          >
            <option value="">All</option>
            <option value="Engineering">Engineering</option>
            <option value="Analytics">Analytics</option>
            <option value="Design">Design</option>
          </select>
        </div>

        {/* Discipline Filter */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Discipline</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={filters.discipline}
            onChange={(e) => handleFilterChange("discipline", e.target.value)}
          >
            <option value="">All</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Statistics">Statistics</option>
            <option value="Graphic Design">Graphic Design</option>
          </select>
        </div>
      </div>

      {/* Main Job Listings */}
      <div className="flex-1 p-4">
        <header className="mb-6">
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
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Job Postings</h1>
              <p className="text-gray-600">Explore opportunities and apply for your next role.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowScrapedJobs(false)}
                className={`px-4 py-2 rounded-md font-medium ${
                  !showScrapedJobs
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Local Jobs
              </button>
              <button
                onClick={() => setShowScrapedJobs(true)}
                className={`px-4 py-2 rounded-md font-medium ${
                  showScrapedJobs
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                External Jobs
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for jobs, companies, skills, or keywords..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                🔍 Searching for: <span className="font-medium text-blue-600">"{searchQuery}"</span>
              </p>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            <p> </p>
          </div>
        </header>

        {/* Job Listings Content */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : (
          <div>
            {/* Search Results Counter */}
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {searchQuery ? (
                  <span>
                    🔍 Found <span className="font-semibold text-blue-600">{filteredJobs.length}</span> jobs matching "<span className="font-medium">{searchQuery}</span>"
                  </span>
                ) : (
                  <span>
                    📋 Showing <span className="font-semibold text-blue-600">{filteredJobs.length}</span> {showScrapedJobs ? 'external' : 'local'} jobs
                  </span>
                )}
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear Search
                </button>
              )}
            </div>
            
            {/* Job Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`bg-white p-6 shadow-md rounded-lg hover:shadow-lg transition-shadow border-l-4 cursor-pointer ${
                      job.is_scraped ? 'border-green-500' : 'border-blue-500'
                    }`}
                    onClick={() => handleJobCardClick(job)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        job.is_scraped 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-blue-600 bg-blue-100'
                      }`}>
                        {job.is_scraped ? job.source : 'Local'}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium">{job.company}</p>
                    <p className="text-gray-500">{job.location}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                        {job.jobType}
                      </span>
                      <span className="inline-block px-2 py-1 text-sm font-medium text-purple-600 bg-purple-100 rounded-full">
                        {job.experience}
                      </span>
                    </div>
                    {job.is_scraped && job.salary && job.salary !== 'Not specified' && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                        <p className="text-sm font-medium text-yellow-800">
                          💰 Expected Salary: {job.salary}
                        </p>
                      </div>
                    )}
                    <p className="mt-4 text-gray-700 text-sm line-clamp-2 overflow-hidden">
                      {job.description}
                    </p>
                    <div className="mt-4 flex gap-2">
                      {job.is_scraped && job.url ? (
                        <button 
                          className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(job.url, '_blank');
                          }}
                        >
                          View Job
                        </button>
                      ) : (
                        <button 
                          className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator(`/u/jobapplicationform/${job.id}`, { state: { job } });
                          }}
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  {searchQuery ? (
                    <div>
                      <p className="text-gray-600 mb-2">
                        🔍 No jobs found matching "<span className="font-medium text-blue-600">{searchQuery}</span>"
                      </p>
                      <p className="text-sm text-gray-500">
                        Try adjusting your search terms or filters to find more jobs.
                      </p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-3 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                      >
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600">
                        {showScrapedJobs 
                          ? 'No external jobs available yet. Jobs are automatically updated every 2 hours.' 
                          : 'No local jobs match the selected filters.'
                        }
                      </p>
                      {showScrapedJobs && (
                        <p className="text-sm text-gray-500 mt-2">
                          
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Job Details Modal */}
    {isModalOpen && selectedJob && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedJob.title}</h2>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="font-semibold">{selectedJob.company}</span>
                  <span>•</span>
                  <span>{selectedJob.location}</span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Job Type and Experience */}
            <div className="flex gap-2 mb-4">
              <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                {selectedJob.jobType}
              </span>
              <span className="inline-block px-2 py-1 text-sm font-medium text-purple-600 bg-purple-100 rounded-full">
                {selectedJob.experience}
              </span>
              {selectedJob.profession && (
                <span className="inline-block px-2 py-1 text-sm font-medium text-green-600 bg-green-100 rounded-full">
                  {selectedJob.profession}
                </span>
              )}
              {selectedJob.discipline && (
                <span className="inline-block px-2 py-1 text-sm font-medium text-orange-600 bg-orange-100 rounded-full">
                  {selectedJob.discipline}
                </span>
              )}
            </div>

            {/* Salary Information */}
            {selectedJob.is_scraped && selectedJob.salary && selectedJob.salary !== 'Not specified' && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-md">
                <p className="text-sm font-medium text-yellow-800">
                  💰 Expected Salary: {selectedJob.salary}
                </p>
              </div>
            )}

            {/* Job Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Job Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedJob.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {selectedJob.is_scraped && selectedJob.url ? (
                <button 
                  className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
                  onClick={() => window.open(selectedJob.url, '_blank')}
                >
                  View Original Job Posting
                </button>
              ) : (
                <button 
                  className="px-6 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md font-medium"
                  onClick={() => {
                    closeModal();
                    navigator(`/u/jobapplicationform/${selectedJob.id}`, { state: { job: selectedJob } });
                  }}
                >
                  Apply Now
                </button>
              )}
              <button
                onClick={closeModal}
                className="px-6 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default JobPostingsPage;

import React from "react";
import { useNavigate } from "react-router-dom";

const JobCard = ({ job }) => {
  const navigator = useNavigate();
  const handleApply = () => {
    navigator(`/u/jobapplicationform/${job.id}`, { state: { job } });
  };
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-lg">
      {/* Job Title */}
      <h2 className="text-xl font-bold text-gray-800">{job.title}</h2>

      {/* Company Name & Location */}
      <div className="flex justify-between text-sm text-gray-500 mt-1">
        <span className="font-semibold">{job?.company?.split("@")[0] || "Unknown Company"}</span>
        <span>{job.location || "Remote"}</span>
      </div>

      {/* Job Type & Experience */}
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span className="px-3 py-1 bg-gray-100 rounded-full">{job.job_type}</span>
        <span className="px-3 py-1 bg-gray-100 rounded-full">{job.experience}</span>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm mt-3 line-clamp-3">{job.description}</p>

      {/* Skills */}
      <div className="mt-3 flex flex-wrap gap-2">
        {job?.skills?.split(",").map((skill, index) => (
          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-lg">
            {skill.trim()}
          </span>
        ))}
      </div>

      {/* Apply Button */}
      <button onClick={handleApply} className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl transition">
        Apply Now
      </button>
    </div>
  );
};

export default JobCard;

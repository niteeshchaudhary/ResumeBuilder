import React from 'react';

const ResumeDisplay = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">{data.Name}</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
        <p className="text-gray-700">{data["contact information"] || 'Not provided'}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Summary</h2>
        <p className="text-gray-700">{data.summary || 'Not provided'}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Experience</h2>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800">{data.experience || 'Not provided'}</pre>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Education</h2>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800">{data.education || 'Not provided'}</pre>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Skills</h2>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800">{data.skills || 'Not provided'}</pre>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Certifications</h2>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800">{data.certifications || 'Not provided'}</pre>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Projects</h2>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800">{data.projects || 'Not provided'}</pre>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Awards</h2>
        <p className="text-gray-700">{data.awards || 'Not provided'}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Position of Responsibility</h2>
        <p className="text-gray-700">{data["position of responsibility"] || 'Not provided'}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Internships</h2>
        <p className="text-gray-700">{data.internships || 'Not provided'}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Certification / Achievement</h2>
        <p className="text-gray-700">{data["certification / achievement"] || 'Not provided'}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Others</h2>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800">{data.others || 'Not provided'}</pre>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Contact Details</h2>
        <p className="text-gray-700"><strong>Phone Number:</strong> {data["Phone Number"] || 'Not provided'}</p>
        <p className="text-gray-700"><strong>Email:</strong> {data.Email || 'Not provided'}</p>
        <p className="text-gray-700"><strong>LinkedIn:</strong> {data.LinkedIn || 'Not provided'}</p>
        <p className="text-gray-700"><strong>GitHub:</strong> {data.GitHub || 'Not provided'}</p>
        <p className="text-gray-700"><strong>Portfolio:</strong> {data.Portfolio || 'Not provided'}</p>
        <p className="text-gray-700"><strong>Other:</strong> {data.Other || 'Not provided'}</p>
      </div>
    </div>
  );
};

export default ResumeDisplay;

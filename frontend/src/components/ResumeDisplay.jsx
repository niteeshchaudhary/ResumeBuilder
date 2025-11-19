import React from 'react';

const formatProjects = (projectsString) => {
    const regex = /([^\n]+)\n([^\n]+)\n([\s\S]+?)(?=\n[A-Z]|$)/g;
    const projects = [];
    let match;
  
    while ((match = regex.exec(projectsString)) !== null) {
      projects.push({
        title: match[1],
        duration: match[2],
        details: match[3].trim().split('\n')
          .map(item => item.replace(/^\s*•\s*/, '').trim()) // Remove bullet points and trim each line
      });
    }
  
    return projects;
  };

// Helper function to format experience details
const formatExperience = (experienceString) => {
    const regex = /([^\n]+)\n([^\n]+)\n([^\n]+)\n([^\n]+)\n([\s\S]+?)(?=\n[A-Z]|$)/g;
    const experiences = [];
    let match;
  
    while ((match = regex.exec(experienceString)) !== null) {
      experiences.push({
        company: match[1],
        duration: match[2],
        position: match[3],
        location: match[4],
        details: match[5].trim().split('\n').map(item => item.replace(/^\s*•\s*/, '').trim())
      });
    }
  
    return experiences;
  };
// Helper function to format education details
const formatEducation = (educationString) => {
  const lines = educationString.split('\n').filter(line => line.trim() !== '');
  const institution = lines[0];
  const duration = lines[1];
  const degree = lines[2];
  const cgpa = lines[3];
  const coursework = lines.slice(4).join(', ');

  return {
    institution,
    duration,
    degree,
    cgpa,
    coursework
  };
};

// Helper function to format skills into chips
const formatSkills = (skillsString) => {
  const sections = skillsString.split('\n');
  const skills = sections.reduce((acc, section) => {
    const [category, items] = section.split(':');
    if (items) {
      acc[category.trim()] = items.split(',').map(skill => skill.trim());
    }
    return acc;
  }, {});

  return skills;
};
const formatCertifications = (certificationsString) => {
    // Split certifications by new lines
    return certificationsString.split('\n').filter(cert => cert.trim() !== '');
  };

const ResumeDisplay = ({ data }) => {
  const projects = formatProjects(data.projects || '');
  const education = formatEducation(data.education || '');
  const skills = formatSkills(data.skills || '');
  const experiences = formatExperience(data.experience || '');
  const certifications = formatCertifications(data.certifications || '');
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">{data.Name}</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
        {data["contact information"] && <p className="text-gray-700">{data["contact information"] || 'Not provided'}</p>}
        <p className="text-gray-700"><strong>Phone Number:</strong> {data["Phone Number"] || 'Not provided'}</p>
        <p className="text-gray-700"><strong>Email:</strong> {data.Email || 'Not provided'}</p>
        <p className="text-gray-700"><strong>LinkedIn:</strong> {data.LinkedIn || 'Not provided'}</p>
        <p className="text-gray-700"><strong>GitHub:</strong> {data.GitHub || 'Not provided'}</p>
        <p className="text-gray-700"><strong>Portfolio:</strong> {data.Portfolio || 'Not provided'}</p>
        <p className="text-gray-700"><strong>Other:</strong> {data.Other || 'Not provided'}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Summary</h2>
        <p className="text-gray-700">{data.summary || 'Not provided'}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Experience</h2>
        {experiences.length > 0 ? (
          experiences.map((exp, index) => (
            <div key={index} className="relative bg-gray-100 p-6 mb-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{exp.company}</h3>
                <div className="absolute top-0 right-0 bg-gray-200 text-sm text-gray-600 p-2 rounded-bl-lg">{exp.duration}</div>
              </div>
              <p className="text-lg font-medium">{exp.position}</p>
              <p className="text-gray-700">{exp.location}</p>
              <ul className="list-disc pl-5 mt-2 text-gray-700">
                {exp.details.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-700">Not provided</p>
        )}
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Education</h2>
        <div className="relative bg-gray-100 p-6 mb-4 rounded-lg shadow-sm">
          <div className="absolute top-0 right-0 bg-gray-200 text-sm text-gray-600 p-2 rounded-bl-lg">
            {education.duration}
          </div>
          <h3 className="text-xl font-semibold">{education.institution}</h3>
          <p className="text-lg font-medium">{education.degree}</p>
          <p className="text-gray-700">{education.scoreType} :{education.score}</p>
          <p className="text-gray-700 mt-2"><strong>Coursework:</strong> {education.coursework}</p>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Technical Skills</h2>
        {Object.entries(skills).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {items.map((item, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full border border-blue-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Certifications</h2>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800">
        <div className="mb-6">
        {certifications.length > 0 ? (
          <ul className="list-disc pl-5 text-gray-700">
            {certifications.map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">Not provided</p>
        )}
      </div>
        </pre>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Projects</h2>
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <div key={index} className="relative bg-gray-100 p-6 mb-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <div className="absolute top-0 right-0 bg-gray-200 text-sm text-gray-600 p-2 rounded-bl-lg">{project.duration}</div>
              </div>
              <ul className="list-disc pl-5 mt-2 text-gray-700">
                {project.details.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-700">Not provided</p>
        )}
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Others</h2>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800">{data.others || 'Not provided'}</pre>
      </div>
    </div>
  );
};

export default ResumeDisplay;

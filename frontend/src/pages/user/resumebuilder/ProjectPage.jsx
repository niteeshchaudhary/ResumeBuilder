import React, { useState, useEffect } from "react";
import axios from "../../../assets/AxiosConfig";
import { MdOutlineSave, MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";

const ProjectPage = () => {
  const [projectData, setProjectData] = useState([
    {
      title: "",
      technologies: "",
      from_date: new Date().toISOString().split("T")[0],
      to_date: new Date().toISOString().split("T")[0],
      details: [],
      projectLink: "",
      isEditing: false,
    },
  ]);
  const [loading, setLoading] = useState(true);

  const handleInputChange = (index, field, value) => {
    const updatedData = [...projectData];
    updatedData[index][field] = value;
    setProjectData(updatedData);
  };

  const handledetailsChange = (index, value) => {
    const updatedData = [...projectData];
    updatedData[index].details = value;
    setProjectData(updatedData);
  };

  const toggleEdit = async (index) => {
    const updatedData = [...projectData];
    updatedData[index].isEditing = !updatedData[index].isEditing;
    try {
      const response = await axios.post("/setuserdata/project/", updatedData[index]);
      updatedData[index].id = response.data.id;
      setProjectData(updatedData);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to save project");
    }
  };

  const addNewCard = () => {
    setProjectData([
      ...projectData,
      {
        title: "",
        technologies: "",
        from_date: new Date().toISOString().split("T")[0],
        to_date: new Date().toISOString().split("T")[0],
        details: [],
        projectLink: "",
        isEditing: true,
      },
    ]);
  };

  const deleteCard = async (index, id) => {
    const updatedData = projectData.filter((_, i) => i !== index);
    if (id === undefined) {
      setProjectData(updatedData);
      return;
    }
    try {
      await axios.post("/deluserdata/project/", { id });
      setProjectData(updatedData);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete project");
    }
  };

  const rephrase_proj = async (projIndex, detailIndex) => {
    var client_prompt = "";
    const ele = document.getElementById("details" + projIndex.toString());
    if (ele.value.trim() == "") {
      client_prompt = "Write down a project description for  project: " + projectData[projIndex].title + ". don't provide any extra text just print description as response";
    }
    try {
      const res = await axios.post(`/get_rephrase/`, { "client_prompt": client_prompt, "text": ele.value.trim(), "pasttext": projectData[projIndex] });
      ele.value = res.data?.data;
    } catch (error) {
      console.error("Failed to rephrase:", error);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.post("/userdata/project/");
        const rfdata = response.data.map(dt => {
          if (!dt?.details) {
            const newdt = { ...dt, details: [] };
            return newdt;
          } else {
            return dt;
          }
        });
        setProjectData(rfdata);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Projects</h2>
                <p className="text-teal-100">Showcase your technical projects and achievements</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {projectData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500">Start by adding your first project!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {projectData.map((data, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                  >
                    {data.isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={data.title}
                            onChange={(e) => handleInputChange(index, "title", e.target.value)}
                            placeholder="e.g., E-commerce Platform"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                              type="date"
                              value={data?.from_date}
                              onChange={(e) => handleInputChange(index, "from_date", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                              type="date"
                              value={data.to_date}
                              onChange={(e) => handleInputChange(index, "to_date", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
                          <input
                            type="text"
                            value={data?.technologies}
                            onChange={(e) => handleInputChange(index, "technologies", e.target.value)}
                            placeholder="e.g., React, Node.js, MongoDB"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Project Link (Optional)</label>
                          <input
                            type="url"
                            value={data.projectLink}
                            onChange={(e) => handleInputChange(index, "projectLink", e.target.value)}
                            placeholder="https://github.com/username/project"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {data?.details?.map((detail, chipIndex) => (
                              <div
                                key={chipIndex}
                                className="flex items-center bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm"
                              >
                                <span>{detail}</span>
                                <button
                                  onClick={() => {
                                    const updateddetails = data.details.filter(
                                      (_, i) => i !== chipIndex
                                    );
                                    handledetailsChange(index, updateddetails);
                                  }}
                                  className="ml-2 text-teal-600 hover:text-teal-800"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              id={"details" + index.toString()}
                              placeholder="Add project feature (press Enter)"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && e.target.value.trim() !== "") {
                                  const updateddetails = [
                                    ...data.details,
                                    e.target.value.trim(),
                                  ];
                                  handledetailsChange(index, updateddetails);
                                  e.target.value = "";
                                }
                              }}
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                            />
                            <button 
                              className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200"
                              onClick={() => rephrase_proj(index, 0)}
                              title="AI Rephrase"
                            >
                              🔄
                            </button>
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={() => toggleEdit(index)}
                            className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-all duration-200 font-medium flex items-center justify-center"
                          >
                            <MdOutlineSave className="w-5 h-5 mr-2" />
                            Save
                          </button>
                          <button
                            onClick={() => deleteCard(index, data.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                          >
                            <MdDeleteOutline className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">{data?.title || "Untitled Project"}</h3>
                            </div>
                            
                            <div className="ml-11 space-y-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-medium">From:</span>
                                  <span className="ml-1">{data?.from_date ? new Date(data.from_date).toLocaleDateString() : "Not specified"}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-medium">To:</span>
                                  <span className="ml-1">{data?.to_date ? new Date(data.to_date).toLocaleDateString() : "Not specified"}</span>
                                </div>
                              </div>
                              
                              {data?.technologies && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                  </svg>
                                  <span className="font-medium">Technologies:</span>
                                  <span className="ml-1">{data.technologies}</span>
                                </div>
                              )}
                              
                              {data?.projectLink && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                  <a href={data.projectLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    View Project
                                  </a>
                                </div>
                              )}
                              
                              {data?.details && data.details.length > 0 && (
                                <div>
                                  <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span className="font-medium">Features:</span>
                                  </div>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                    {data.details.map((detail, ind) => (
                                      <li key={ind} className="ml-4">{detail}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleEdit(index)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Edit project"
                            >
                              <MdOutlineEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteCard(index, data.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete project"
                            >
                              <MdDeleteOutline className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add New Project Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={addNewCard}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <FaPlusCircle className="w-5 h-5 mr-2" />
                Add New Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;

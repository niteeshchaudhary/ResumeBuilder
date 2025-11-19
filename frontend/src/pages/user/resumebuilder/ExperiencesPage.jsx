import React, { useState, useEffect } from "react";
import axios from "../../../assets/AxiosConfig";
import { MdOutlineSave, MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";

const ExperiencePage = () => {
  const [experienceData, setExperienceData] = useState([
    {
      company: "",
      role: "",
      from_date: new Date().toISOString().split("T")[0],
      to_date: new Date().toISOString().split("T")[0],
      location: "",
      currentlyWorking: false,
      details: [],
      isEditing: false,
    },
  ]);
  const [loading, setLoading] = useState(true);

  const handleInputChange = (index, field, value) => {
    const updatedData = [...experienceData];
    updatedData[index][field] = value;
    setExperienceData(updatedData);
  };

  const handledetailsChange = (index, value) => {
    const updatedData = [...experienceData];
    updatedData[index].details = value;
    setExperienceData(updatedData);
  };

  const toggleEdit = async (index) => {
    const updatedData = [...experienceData];
    if (updatedData[index].isEditing) {
      updatedData[index].isEditing = !updatedData[index].isEditing;
      if (!updatedData[index].to_date) {
        updatedData[index].currentlyWorking = true;
      }
      try {
        const response = await axios.post("/setuserdata/experience/", updatedData[index]);
        updatedData[index].id = response.data.id;
        setExperienceData(updatedData);
      } catch (error) {
        alert(error.response?.data?.error || "Failed to save experience");
      }
    } else {
      updatedData[index].isEditing = !updatedData[index].isEditing;
      setExperienceData(updatedData);
    }
  };

  const addNewCard = () => {
    setExperienceData([
      ...experienceData,
      {
        company: "",
        role: "",
        from_date: new Date().toISOString().split("T")[0],
        to_date: new Date().toISOString().split("T")[0],
        location: "",
        currentlyWorking: false,
        details: [],
        isEditing: true,
      },
    ]);
  };

  const deleteCard = async (index, id) => {
    const updatedData = experienceData.filter((_, i) => i !== index);
    if (id === undefined) {
      setExperienceData(updatedData);
      return;
    }
    try {
      await axios.post("/deluserdata/experience/", { id });
      setExperienceData(updatedData);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete experience");
    }
  };

  const rephrase_proj = async (expIndex, detailIndex) => {
    var client_prompt = "";
    const ele = document.getElementById("details" + expIndex.toString());
    if (ele.value.trim() == "") {
      client_prompt = "Write down a job description for resume for job i worked  role: " + experienceData[expIndex].role + ". don't provide any extra text just print description as response";
    }
    try {
      const res = await axios.post(`/get_rephrase/`, { "client_prompt": client_prompt, "text": ele.value.trim(), "pasttext": experienceData[expIndex].role });
      ele.value = res.data?.data;
    } catch (error) {
      console.error("Failed to rephrase:", error);
    }
  };

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const response = await axios.post("/userdata/experience/");
        setExperienceData(response.data);
      } catch (error) {
        console.error("Failed to fetch experience:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperience();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your experience...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Experience</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Experience</h2>
                <p className="text-red-100">Manage your work history and professional experience</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {experienceData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No experience entries yet</h3>
                <p className="text-gray-500">Start by adding your first work experience!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {experienceData.map((data, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                  >
                    {data.isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={data.company}
                            onChange={(e) => handleInputChange(index, "company", e.target.value)}
                            placeholder="e.g., Google Inc."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={data.role}
                            onChange={(e) => handleInputChange(index, "role", e.target.value)}
                            placeholder="e.g., Senior Software Engineer"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                              type="date"
                              value={data?.from_date}
                              onChange={(e) => handleInputChange(index, "from_date", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                              type="date"
                              value={data.to_date}
                              onChange={(e) => handleInputChange(index, "to_date", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                              disabled={data.currentlyWorking}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={data.currentlyWorking}
                            onChange={(e) => {
                              handleInputChange(index, "currentlyWorking", e.target.checked);
                              if (e.target.checked) {
                                handleInputChange(index, "to_date", null);
                              } else {
                                handleInputChange(index, "to_date", new Date().toISOString().split("T")[0]);
                              }
                            }}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <label className="text-sm font-medium text-gray-700">Currently Working</label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={data.location}
                            onChange={(e) => handleInputChange(index, "location", e.target.value)}
                            placeholder="e.g., San Francisco, CA"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {data.details.map((detail, chipIndex) => (
                              <div
                                key={chipIndex}
                                className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                              >
                                <span>{detail}</span>
                                <button
                                  onClick={() => {
                                    const updateddetails = data.details.filter(
                                      (_, i) => i !== chipIndex
                                    );
                                    handledetailsChange(index, updateddetails);
                                  }}
                                  className="ml-2 text-red-600 hover:text-red-800"
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
                              placeholder="Add job responsibility (press Enter)"
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
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                            />
                            <button 
                              className="px-4 py-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all duration-200"
                              onClick={() => {
                                const ele = document.getElementById("details" + index.toString());
                                if (ele.value.trim() !== "") {
                                  const updateddetails = [
                                    ...data.details,
                                    ele.value.trim(),
                                  ];
                                  handledetailsChange(index, updateddetails);
                                  ele.value = "";
                                }
                              }}
                              title="Add responsibility"
                            >
                              ✓
                            </button>
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
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium flex items-center justify-center"
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
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">{data?.role || "Untitled Position"}</h3>
                            </div>
                            
                            <div className="ml-11 space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-medium">Company:</span>
                                <span className="ml-1">{data?.company || "Not specified"}</span>
                              </div>
                              
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
                                  <span className="ml-1">{data?.currentlyWorking ? "Currently Working" : (data.to_date ? new Date(data.to_date).toLocaleDateString() : "Not specified")}</span>
                                </div>
                              </div>
                              
                              {data?.location && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="font-medium">Location:</span>
                                  <span className="ml-1">{data.location}</span>
                                </div>
                              )}
                              
                              {data?.details && data.details.length > 0 && (
                                <div>
                                  <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span className="font-medium">Responsibilities:</span>
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
                              title="Edit experience"
                            >
                              <MdOutlineEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteCard(index, data.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete experience"
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

            {/* Add New Experience Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={addNewCard}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <FaPlusCircle className="w-5 h-5 mr-2" />
                Add New Experience
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperiencePage;

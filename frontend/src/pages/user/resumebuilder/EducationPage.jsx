import React, { useState, useEffect } from "react";
import axios from "../../../assets/AxiosConfig";
import { MdOutlineSave, MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";

const EducationPage = () => {
  const [educationData, setEducationData] = useState([
    {
      institution: "IIT Dharwad",
      from_date: "2020-11-20",
      to_date: "2024-05-10",
      degree: "BTech",
      fieldOfStudy: "Computer Science",
      currentlyStudying: false,
      scoreType: "CGPA",
      score: "8.67",
      coursework: ["Automata","Data Structures","Algorithms","Operating Systems","Computer Networks","Database Management Systems","Software Engineering","Computer Architecture","Compiler Design","Machine Learning","Artificial Intelligence","Computer Vision","Natural Language Processing","Deep Learning","Reinforcement Learning","Robotics","Computer Graphics","Computer Vision","Natural Language Processing","Deep Learning","Reinforcement Learning","Robotics","Computer Graphics"],
      isEditing: false,
    },
  ]);
  const [loading, setLoading] = useState(true);

  const handleInputChange = (index, field, value) => {
    const updatedData = [...educationData];
    updatedData[index][field] = value;
    setEducationData(updatedData);
  };

  const handleCourseworkChange = (index, value) => {
    const updatedData = [...educationData];
    updatedData[index].coursework = value;
    setEducationData(updatedData);
  };

  const toggleEdit = async (index) => {
    const updatedData = [...educationData];
    if (updatedData[index].isEditing) {
      updatedData[index].isEditing = !updatedData[index].isEditing;

      if (!updatedData[index].to_date) {
        updatedData[index].currentlyStudying = true;
      }
      try {
        const response = await axios.post("/setuserdata/education/", updatedData[index]);
        updatedData[index].id = response.data.id;
        setEducationData(updatedData);
      } catch (error) {
        alert(error.response?.data?.error || "Failed to save education");
      }
    } else {
      updatedData[index].isEditing = !updatedData[index].isEditing;
      setEducationData(updatedData);
    }
  };

  const addNewCard = () => {
    setEducationData([
      ...educationData,
      {
        institution: "",
        from_date: new Date().toISOString().split("T")[0],
        to_date: new Date().toISOString().split("T")[0],
        degree: "",
        fieldOfStudy: "",
        currentlyStudying: false,
        scoreType: "",
        score: "",
        coursework: [],
        isEditing: true,
      },
    ]);
  };

  const deleteCard = async (index, id) => {
    const updatedData = educationData.filter((_, i) => i !== index);
    if (id) {
      try {
        await axios.post("/deluserdata/education/", { id });
        setEducationData(updatedData);
      } catch (error) {
        alert(error.response?.data?.error || "Failed to delete education");
      }
    } else {
      setEducationData(updatedData);
    }
  };

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const response = await axios.post("/userdata/education/");
        setEducationData(response.data);
      } catch (error) {
        console.error("Failed to fetch education:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEducation();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your education...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Education</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Education</h2>
                <p className="text-indigo-100">Manage your academic background and qualifications</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {educationData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No education entries yet</h3>
                <p className="text-gray-500">Start by adding your first education entry!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {educationData.map((data, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                  >
                    {data.isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Institution Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={data.institution}
                            onChange={(e) => handleInputChange(index, "institution", e.target.value)}
                            placeholder="e.g., Massachusetts Institute of Technology"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                              type="date"
                              value={data?.from_date}
                              onChange={(e) => handleInputChange(index, "from_date", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                              type="date"
                              value={data.to_date || ""}
                              onChange={(e) => handleInputChange(index, "to_date", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                              disabled={data.currentlyStudying}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={data.currentlyStudying}
                            onChange={(e) => {
                              handleInputChange(index, "currentlyStudying", e.target.checked);
                              if (e.target.checked) {
                                handleInputChange(index, "to_date", null);
                              } else {
                                handleInputChange(index, "to_date", new Date().toISOString().split("T")[0]);
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <label className="text-sm font-medium text-gray-700">Currently Studying</label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                            <input
                              type="text"
                              value={data.degree}
                              onChange={(e) => handleInputChange(index, "degree", e.target.value)}
                              placeholder="e.g., Bachelor of Science"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
                            <input
                              type="text"
                              value={data.fieldOfStudy}
                              onChange={(e) => handleInputChange(index, "fieldOfStudy", e.target.value)}
                              placeholder="e.g., Computer Science"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Score Type</label>
                            <input
                              type="text"
                              value={data.scoreType}
                              onChange={(e) => handleInputChange(index, "scoreType", e.target.value)}
                              placeholder="e.g., GPA, Percentage"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                            <input
                              type="text"
                              value={data.score}
                              onChange={(e) => handleInputChange(index, "score", e.target.value)}
                              placeholder="e.g., 3.8/4.0"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Coursework</label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {data.coursework.map((course, chipIndex) => (
                              <div
                                key={chipIndex}
                                className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                              >
                                <span>{course}</span>
                                <button
                                  onClick={() => {
                                    const updatedCoursework = data.coursework.filter(
                                      (_, i) => i !== chipIndex
                                    );
                                    handleCourseworkChange(index, updatedCoursework);
                                  }}
                                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="Add coursework (press Enter)"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.target.value.trim() !== "") {
                                const updatedCoursework = [
                                  ...data.coursework,
                                  e.target.value.trim(),
                                ];
                                handleCourseworkChange(index, updatedCoursework);
                                e.target.value = "";
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={() => toggleEdit(index)}
                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium flex items-center justify-center"
                          >
                            <MdOutlineSave className="w-5 h-5 mr-2" />
                            Save
                          </button>
                          <button
                            onClick={() => deleteCard(index, data?.id)}
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
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">{data.institution || "Untitled Institution"}</h3>
                            </div>
                            
                            <div className="ml-11 space-y-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-medium">From:</span>
                                  <span className="ml-1">{data.from_date ? new Date(data.from_date).toLocaleDateString() : "Not specified"}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-medium">To:</span>
                                  <span className="ml-1">{data.currentlyStudying ? "Currently Studying" : (data.to_date ? new Date(data.to_date).toLocaleDateString() : "Not specified")}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="font-medium">Degree:</span>
                                  <span className="ml-1">{data.degree || "Not specified"}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span className="font-medium">Field:</span>
                                  <span className="ml-1">{data.fieldOfStudy || "Not specified"}</span>
                                </div>
                              </div>
                              
                              {(data.scoreType || data.score) && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                  <span className="font-medium">Score:</span>
                                  <span className="ml-1">{data.scoreType && data.score ? `${data.scoreType}: ${data.score}` : (data.score || "Not specified")}</span>
                                </div>
                              )}
                              
                              {data.coursework && data.coursework.length > 0 && (
                                <div>
                                  <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span className="font-medium">Coursework:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {data.coursework.slice(0, 5).map((course, chipIndex) => (
                                      <span
                                        key={chipIndex}
                                        className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs"
                                      >
                                        {course}
                                      </span>
                                    ))}
                                    {data.coursework.length > 5 && (
                                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                        +{data.coursework.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleEdit(index)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Edit education"
                            >
                              <MdOutlineEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteCard(index, data?.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete education"
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

            {/* Add New Education Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={addNewCard}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <FaPlusCircle className="w-5 h-5 mr-2" />
                Add New Education
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationPage;

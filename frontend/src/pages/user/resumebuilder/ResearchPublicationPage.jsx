import React, { useState, useEffect } from "react";
import axios from "../../../assets/AxiosConfig";
import { MdOutlineSave, MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";

const PublicationPage = () => {
  const [publicationData, setPublicationData] = useState([
    {
      title: "",
      journel: "",
      publish_date: new Date().toISOString().split("T")[0],
      link: "",
      description: "",
      isEditing: false,
    },
  ]);
  const [loading, setLoading] = useState(true);

  const handleInputChange = (index, field, value) => {
    const updatedData = [...publicationData];
    updatedData[index][field] = value;
    setPublicationData(updatedData);
  };

  const toggleEdit = async (index) => {
    const updatedData = [...publicationData];
    if (updatedData[index].isEditing) {
      updatedData[index].isEditing = !updatedData[index].isEditing;
      try {
        const response = await axios.post("/setuserdata/publication/", updatedData[index]);
        updatedData[index].id = response.data.id;
        setPublicationData(updatedData);
      } catch (error) {
        alert(error.response?.data?.error || "Failed to save publication");
      }
    } else {
      updatedData[index].isEditing = !updatedData[index].isEditing;
      setPublicationData(updatedData);
    }
  };

  const addNewCard = () => {
    setPublicationData([
      ...publicationData,
      {
        title: "",
        journel: "",
        publish_date: new Date().toISOString().split("T")[0],
        link: "",
        description: "",
        isEditing: true,
      },
    ]);
  };

  const deleteCard = async (index, id) => {
    const updatedData = publicationData.filter((_, i) => i !== index);
    if (id === undefined) {
      setPublicationData(updatedData);
      return;
    }
    try {
      await axios.post("/deluserdata/publication/", { id });
      setPublicationData(updatedData);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete publication");
    }
  };

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const response = await axios.post("/userdata/publication/");
        setPublicationData(response.data);
      } catch (error) {
        console.error("Failed to fetch publications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your publications...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Publications</h2>
                <p className="text-violet-100">Manage your research publications and academic work</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {publicationData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No publications yet</h3>
                <p className="text-gray-500">Start by adding your first publication!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {publicationData.map((data, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                  >
                    {data.isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Publication Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={data.title}
                            onChange={(e) => handleInputChange(index, "title", e.target.value)}
                            placeholder="e.g., Machine Learning Applications in Healthcare"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Journal/Conference <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={data.role}
                            onChange={(e) => handleInputChange(index, "journel", e.target.value)}
                            placeholder="e.g., Nature, IEEE Transactions"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Publication Date</label>
                          <input
                            type="date"
                            value={data?.publish_date}
                            onChange={(e) => handleInputChange(index, "publish_date", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Publication Link (Optional)</label>
                          <input
                            type="url"
                            value={data.publicationLink}
                            onChange={(e) => handleInputChange(index, "link", e.target.value)}
                            placeholder="https://doi.org/10.1000/example"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={data.description}
                            onChange={(e) => handleInputChange(index, "description", e.target.value)}
                            placeholder="Brief description of the publication content and its significance..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 resize-none"
                          />
                          <p className="text-sm text-gray-500 mt-2">Provide a brief overview of the publication content and its significance</p>
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={() => toggleEdit(index)}
                            className="flex-1 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-all duration-200 font-medium flex items-center justify-center"
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
                              <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">{data?.title || "Untitled Publication"}</h3>
                            </div>
                            
                            <div className="ml-11 space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-medium">Journal:</span>
                                <span className="ml-1">{data?.journel || "Not specified"}</span>
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium">Published:</span>
                                <span className="ml-1">{data?.publish_date ? new Date(data.publish_date).toLocaleDateString() : "Not specified"}</span>
                              </div>
                              
                              {data?.link && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                  <a href={data.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    View Publication
                                  </a>
                                </div>
                              )}
                              
                              {data?.description && (
                                <div className="flex items-start text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <div>
                                    <span className="font-medium">Description:</span>
                                    <p className="ml-1 text-gray-700 leading-relaxed">{data.description}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleEdit(index)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Edit publication"
                            >
                              <MdOutlineEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteCard(index, data.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete publication"
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

            {/* Add New Publication Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={addNewCard}
                className="w-full bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <FaPlusCircle className="w-5 h-5 mr-2" />
                Add New Publication
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationPage;

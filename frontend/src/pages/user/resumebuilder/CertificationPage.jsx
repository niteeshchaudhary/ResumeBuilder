import React, { useState, useEffect } from "react";
import axios from "../../../assets/AxiosConfig";
import { MdOutlineSave, MdDeleteOutline, MdOutlineEdit } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";

const CertificationPage = () => {
  const [certificationData, setCertificationData] = useState([
    {
      name: "",
      link: "",
      authority: "",
      issue_date: new Date().toISOString().split("T")[0],
      expiry_date: new Date().toISOString().split("T")[0],
      credential_id: "",
      credential_url: "",
      isEditing: false,
    },
  ]);
  const [loading, setLoading] = useState(true);

  const handleInputChange = (index, field, value) => {
    const updatedData = [...certificationData];
    updatedData[index][field] = value;
    setCertificationData(updatedData);
  };

  const handledetailsChange = (index, value) => {
    const updatedData = [...certificationData];
    updatedData[index].details = value;
    setCertificationData(updatedData);
  };

  const toggleEdit = async (index) => {
    const updatedData = [...certificationData];
    updatedData[index].isEditing = !updatedData[index].isEditing;
    
    if (!updatedData[index].isEditing) {
      try {
        const response = await axios.post("/setuserdata/certification/", updatedData[index]);
        updatedData[index].id = response.data.id;
        setCertificationData(updatedData);
      } catch (error) {
        alert(error.response?.data?.error || "Failed to save certification");
      }
    } else {
      setCertificationData(updatedData);
    }
  };

  const addNewCard = () => {
    setCertificationData([
      ...certificationData,
      {
        name: "",
        link: "",
        authority: "",
        issue_date: new Date().toISOString().split("T")[0],
        expiry_date: new Date().toISOString().split("T")[0],
        credential_id: "",
        credential_url: "",
        isEditing: true,
      },
    ]);
  };

  const deleteCard = async (index, id) => {
    const updatedData = certificationData.filter((_, i) => i !== index);
    if (id === undefined) {
      setCertificationData(updatedData);
      return;
    }
    try {
      await axios.post("/deluserdata/certification/", { id });
      setCertificationData(updatedData);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete certification");
    }
  };

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const response = await axios.post("/userdata/certification/");
        setCertificationData(response.data);
      } catch (error) {
        console.error("Failed to fetch certifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertifications();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your certifications...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Certifications</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Certifications</h2>
                <p className="text-green-100">Manage your professional certifications and credentials</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {certificationData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No certifications yet</h3>
                <p className="text-gray-500">Start by adding your first certification!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {certificationData.map((data, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                  >
                    {data.isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certification Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={data?.name}
                            onChange={(e) => handleInputChange(index, "name", e.target.value)}
                            placeholder="e.g., AWS Certified Solutions Architect"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Issuing Authority <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={data?.authority}
                            onChange={(e) => handleInputChange(index, "authority", e.target.value)}
                            placeholder="e.g., Amazon Web Services"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                            <input
                              type="date"
                              value={data?.issue_date}
                              onChange={(e) => handleInputChange(index, "issue_date", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                            <input
                              type="date"
                              value={data?.expiry_date}
                              onChange={(e) => handleInputChange(index, "expiry_date", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Credential ID (Optional)</label>
                          <input
                            type="text"
                            value={data?.credential_id}
                            onChange={(e) => handleInputChange(index, "credential_id", e.target.value)}
                            placeholder="e.g., AWS-123456789"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Link (Optional)</label>
                          <input
                            type="url"
                            value={data.certificationLink}
                            onChange={(e) => handleInputChange(index, "link", e.target.value)}
                            placeholder="https://example.com/certificate"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={() => toggleEdit(index)}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center justify-center"
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
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">{data?.name || "Untitled Certification"}</h3>
                            </div>
                            
                            <div className="ml-11 space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="font-medium">Authority:</span>
                                <span className="ml-1">{data?.authority || "Not specified"}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-medium">Issued:</span>
                                  <span className="ml-1">{data?.issue_date ? new Date(data.issue_date).toLocaleDateString() : "Not specified"}</span>
                                </div>
                                
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-medium">Expires:</span>
                                  <span className="ml-1">{data?.expiry_date ? new Date(data.expiry_date).toLocaleDateString() : "No expiry"}</span>
                                </div>
                              </div>
                              
                              {data?.credential_id && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                  </svg>
                                  <span className="font-medium">ID:</span>
                                  <span className="ml-1">{data.credential_id}</span>
                                </div>
                              )}
                              
                              {data?.link && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                  <a href={data.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    View Certificate
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleEdit(index)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Edit certification"
                            >
                              <MdOutlineEdit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => deleteCard(index, data.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete certification"
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

            {/* Add New Certification Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={addNewCard}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <FaPlusCircle className="w-5 h-5 mr-2" />
                Add New Certification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationPage;

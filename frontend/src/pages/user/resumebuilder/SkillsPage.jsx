import React, { useState, useEffect } from "react";
import axios from "../../../assets/AxiosConfig";

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ skill_name: "", category: "" });
  const [skillTypes, setSkillTypes] = useState([]);
  const [newSkillType, setNewSkillType] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleSkillChange = (e) => {
    const { name, value } = e.target;
    setNewSkill({ ...newSkill, [name]: value });
  };

  const handleSkillTypeChange = (e) => {
    setNewSkillType(e.target.value);
  };

  const addSkill = async () => {
    if (newSkill.skill_name.trim() && newSkill.category) {
      setIsAddingSkill(true);
      try {
        const response = await axios.post("/setuserdata/skill/", {
          skill_name: newSkill.skill_name.trim(),
          category: newSkill.category
        });
        setSkills([...skills, { 
          id: response.data.id, 
          category: newSkill.category, 
          skill_name: newSkill.skill_name.trim() 
        }]);
        setNewSkill({ skill_name: "", category: newSkill.category });
      } catch (error) {
        alert(error.response?.data?.error || "Failed to add skill");
      } finally {
        setIsAddingSkill(false);
      }
    }
  };

  const deleteSkill = async (index, id) => {
    const updatedSkills = skills.filter((skill, i) => skill.id !== id);
    if (id === undefined) {
      setSkills(updatedSkills);
      return;
    }
    try {
      await axios.post("/deluserdata/skill/", { id });
      setSkills(updatedSkills);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete skill");
    }
  };

  const addSkillType = () => {
    if (newSkillType.trim() && !skillTypes.includes(newSkillType.trim())) {
      setSkillTypes([...skillTypes, newSkillType.trim()]);
      setNewSkillType("");
    }
  };

  const deleteSkillType = async (type) => {
    const updatedSkillTypes = skillTypes.filter((skillType) => skillType !== type);
    const updatedSkills = skills.filter((skill) => skill.category !== type);

    if (type === undefined) {
      setSkillTypes(updatedSkillTypes);
      setSkills(updatedSkills);
      return;
    }
    try {
      await axios.post("/deluserdata/skilltype/", { id: type });
      setSkillTypes(updatedSkillTypes);
      setSkills(updatedSkills);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete category");
    }
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.post("/userdata/skill/");
        const mydata = [];
        const skillTypes = {};
        response.data.forEach((skill) => {
          if (mydata[skill?.category] === undefined) {
            mydata[skill?.category] = [];
          }
          skillTypes[skill?.category] = 1;
          mydata[skill?.category].push(skill?.skill_name);
        });
        setSkills(response.data);
        setSkillTypes(Object.keys(skillTypes));
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your skills...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Add Skills */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Skill Category */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Add Category</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="e.g., Programming Languages"
                    value={newSkillType}
                    onChange={handleSkillTypeChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <button
                  onClick={addSkillType}
                  disabled={!newSkillType.trim()}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  Add Category
                </button>
              </div>
            </div>

            {/* Add New Skill */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Add Skill</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="skill_name"
                    placeholder="Skill name"
                    value={newSkill?.skill_name}
                    onChange={handleSkillChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <select
                    name="category"
                    value={newSkill?.category}
                    onChange={handleSkillChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Category</option>
                    {skillTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addSkill}
                  disabled={!newSkill.skill_name.trim() || !newSkill.category || isAddingSkill}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center"
                >
                  {isAddingSkill ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    "Add Skill"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Skills Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Your Skills</h2>
              </div>

              {skillTypes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No skills yet</h3>
                  <p className="text-gray-500">Start by adding a skill category and then your first skill!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {skillTypes.map((type) => (
                    <div key={type} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-900">{type}</h3>
                          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {skills.filter((skill) => skill.category === type).length} skills
                          </span>
                        </div>
                        <button
                          onClick={() => deleteSkillType(type)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                          title="Delete category"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {skills.filter((skill) => skill.category === type).length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <p className="text-gray-500">No skills in this category yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {skills
                            .filter((skill) => skill.category === type)
                            .map((skill, index) => (
                              <div
                                key={skill?.id ?? index}
                                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 group"
                              >
                                <span className="text-gray-700 font-medium truncate">{skill.skill_name}</span>
                                <button
                                  onClick={() => deleteSkill(index, skill.id)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                  title="Delete skill"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsPage;

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthContext';
import { edit_storeImage, resume_existingImage, resume_scratchImage, resume_storedImage, ai_job_descImage } from '../../assets/Images';


// Images are used directly for richer visuals

const emptyData = {
  name: "",
  phonenumber: "",
  email: "",
  linkedin: "",
  github: "",
  portfolio: "",
  emailthumbnail: "",
  linkedinthumbnail: "",
  githubthumbnail: "",
  portfoliothumbnail: "",
  summary: "",
  skills: {
    "Programming Languages": [],
    "Tools": []
  },
  experiences: [
    {
      company: "",
      role: "",
      from_date: new Date(),
      to_date: new Date(),
      location: "",
      currentlyWorking: false,
      details: ["", ""]
    }
  ],
  education: [
    {
      institution: "",
      from_date: new Date(),
      to_date: new Date(),
      degree: "",
      fieldOfStudy: "",
      currentlyStuding: false,
      scoreType: "",
      score: "",
      coursework: ["", ""]
    }
  ],
  projects: [
    {
      title: "",
      technologies: "",
      from_date: new Date(),
      to_date: new Date(),
      details: ["", ""],
      projectLink: ""
    }
  ],
  certifications: [
    { name: "", link: "" }
  ],
  publications: [
    { title: "", link: "" }
  ],
  achievements: [
    { title: "", link: "" }
  ]
}

const NewResumeBuilderOptionsPage = () => {
  const { authState } = useContext(AuthContext);
  const navigator = useNavigate();
  const activePlan = authState?.userDetails?.active_plan || 1;

  const options = [
    {
      id: 1,
      image: resume_scratchImage,
      title: "Create from Scratch",
      description: "Build your resume step by step with our guided builder",
      link: "resumeeditor",
      subscription: 1,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      id: 2,
      image: resume_existingImage,
      title: "Import Existing Resume",
      description: "Upload your current resume and enhance it",
      link: "/u/resumebuilder/existing",
      subscription: 1,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      id: 3,
      image: resume_storedImage,
      title: "Use Stored Data",
      description: "Create resume from your saved profile information",
      link: "/u/resumebuilder/storeddata",
      subscription: 2,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      id: 5,
      image: edit_storeImage,
      title: "Edit Profile Data",
      description: "Update and manage your stored information",
      link: "/u/edit/options",
      subscription: 2,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700"
    }, {
      id: 4,
      image: ai_job_descImage,
      title: "AI-Powered Builder",
      description: "Let AI create a tailored resume for specific jobs",
      link: "/u/resumebuilder/resumewithai",
      subscription: 3,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    }
  ];

  const subscriptions = {
    1: "Basic",
    2: "Pro",
    3: "Premium"
  };

  const subscriptionColors = {
    1: "text-blue-600",
    2: "text-purple-600",
    3: "text-orange-600"
  };

  const navigate = (e, link) => {
    e.preventDefault();
    if (link === "resumeeditor") {
      navigator("/u/resumeeditor", { state: { results: emptyData } }); // emptyData placeholder
    } else {
      navigator(link);
    }
  };

  const canAccess = (subscription) => activePlan >= subscription;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
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
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Resume Builder</h1>
              <p className="mt-2 text-gray-600 max-w-3xl">Choose how you'd like to create your professional resume. Our tools make it easy to build, customize, and optimize your resume for any opportunity.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
                <span className="text-sm text-gray-600">Your plan</span>
                <span className="text-sm font-medium text-gray-900">{subscriptions[activePlan] || 'Basic'}</span>
              </div>
              {/* <button onClick={() => navigator('/u/pricing')} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                View Plans
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Options Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {options.map((option) => {
            const accessible = canAccess(option.subscription);

            return (
              <div key={option.id} className="group relative">
                {accessible ? (
                  <button
                    onClick={(e) => navigate(e, option.link)}
                    className="w-full h-full p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-left"
                  >
                    <div className="flex flex-col items-center text-center space-y-6">
                      {/* Image Container */}
                      <div className={`w-20 h-20 ${option.bgColor} rounded-2xl flex items-center justify-center shadow-inner ring-1 ring-inset ring-gray-100 group-hover:scale-110 transition-transform duration-300`}>
                        <img src={option.image} alt={option.title} className="w-12 h-12 object-contain" />
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {option.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {option.description}
                        </p>
                      </div>

                      {/* Plan Badge */}
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${option.bgColor} ${option.textColor}`}>
                        {subscriptions[option.subscription]} Plan
                      </div>

                      {/* Call to action */}
                      <div>
                        <span className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition group-hover:bg-blue-700">
                          Start now
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="w-full h-full p-8 bg-gray-50 rounded-2xl shadow-lg border-2 border-dashed border-gray-300 relative overflow-hidden">
                    {/* Upgrade Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100/90 to-gray-200/90 flex flex-col items-center justify-center gap-4">
                      <div className="text-center space-y-2">
                        <div className="mx-auto w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <p className="font-semibold text-gray-800">Upgrade Required</p>
                        <p className={`text-sm font-semibold ${subscriptionColors[option.subscription]}`}>{subscriptions[option.subscription]} Plan</p>
                      </div>
                      {/* <button onClick={() => navigator('/u/pricing')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                        View Plans
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 10H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button> */}
                    </div>

                    {/* Faded Content */}
                    <div className="flex flex-col items-center text-center space-y-6 opacity-30">
                      <div className={`w-20 h-20 ${option.bgColor} rounded-2xl flex items-center justify-center shadow-inner`}>
                        <img src={option.image} alt={option.title} className="w-12 h-12 object-contain" />
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {option.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Optional global upgrade CTA - enable if needed */}
      </div>
    </div>
  );
};

export default NewResumeBuilderOptionsPage;

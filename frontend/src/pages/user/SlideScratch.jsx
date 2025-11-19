import { useState } from 'react';
import { format } from 'date-fns';

const emptyData = { /* your structure here */ };

const sectionOrder = [
  'personal',
  'contact',
  'social',
  'summary',
  'skills',
  'experience',
  'education',
  'projects',
  'certifications',
  'publications',
  'achievements'
];

const sectionConfig = {
  personal: {
    title: 'Personal Information',
    fields: ['name']
  },
  contact: {
    title: 'Contact Details',
    fields: ['phonenumber', 'email']
  },
  social: {
    title: 'Social Links',
    fields: ['linkedin', 'github', 'portfolio']
  },
  summary: {
    title: 'Professional Summary',
    fields: ['summary']
  },
  skills: {
    title: 'Skills',
    fields: ['skills']
  },
  experience: {
    title: 'Work Experience',
    fields: ['experiences']
  },
  education: {
    title: 'Education',
    fields: ['education']
  },
  projects: {
    title: 'Projects',
    fields: ['projects']
  },
  certifications: {
    title: 'Certifications',
    fields: ['certifications']
  },
  publications: {
    title: 'Publications',
    fields: ['publications']
  },
  achievements: {
    title: 'Achievements',
    fields: ['achievements']
  }
};

export default function ResumeBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(emptyData);
  const [showOutput, setShowOutput] = useState(false);

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = Array.isArray(current[keys[i]]) 
          ? [...current[keys[i]]] 
          : { ...current[keys[i]] };
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addArrayItem = (path) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      const template = getTemplate(keys[keys.length - 1]);
      current[keys[keys.length - 1]] = [...current[keys[keys.length - 1]], template];
      return newData;
    });
  };

  const getTemplate = (field) => {
    const templates = {
      experiences: {
        company: "",
        role: "",
        from_date: new Date(),
        to_date: new Date(),
        location: "",
        currentlyWorking: false,
        details: [""]
      },
      education: {
        institution: "",
        from_date: new Date(),
        to_date: new Date(),
        degree: "",
        fieldOfStudy: "",
        currentlyStudying: false,
        scoreType: "",
        score: "",
        coursework: [""]
      },
      projects: {
        title: "",
        technologies: "",
        from_date: new Date(),
        to_date: new Date(),
        details: [""],
        projectLink: ""
      },
      certifications: { name: "", link: "" },
      publications: { title: "", link: "" },
      achievements: { title: "", link: "" }
    };
    return templates[field];
  };

  const renderField = (path, value) => {
    const type = typeof value;
    
    if (type === 'object') {
      if (Array.isArray(value)) {
        return (
          <div className="space-y-4">
            {value.map((item, index) => (
              <div key={index} className="border p-4 rounded-lg">
                {Object.entries(item).map(([key, val]) => (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {renderField(`${path}.${index}.${key}`, val)}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {/* Implement remove logic */}}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem(path)}
              className="bg-gray-100 px-4 py-2 rounded-lg"
            >
              Add More
            </button>
          </div>
        );
      }
      return null;
    }

    if (value instanceof Date) {
      return (
        <input
          type="date"
          value={format(value, 'yyyy-MM-dd')}
          onChange={(e) => handleInputChange(path, new Date(e.target.value))}
          className="w-full p-2 border rounded-lg"
        />
      );
    }

    if (typeof value === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => handleInputChange(path, e.target.checked)}
          className="h-5 w-5"
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(path, e.target.value)}
        className="w-full p-2 border rounded-lg"
      />
    );
  };

  const renderSection = () => {
    const currentSection = sectionOrder[currentStep];
    const config = sectionConfig[currentSection];

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">{config.title}</h2>
        <div className="space-y-6">
          {config.fields.map(field => (
            <div key={field}>
              <label className="block text-sm font-medium mb-2">
                {field.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              {renderField(field, formData[field])}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {!showOutput ? (
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between">
              {sectionOrder.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-full mx-1 rounded-full ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {renderSection()}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
              disabled={currentStep === 0}
              className="bg-gray-200 px-6 py-2 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            
            {currentStep < sectionOrder.length - 1 ? (
              <button
                onClick={() => setCurrentStep(p => p + 1)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setShowOutput(true)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
              >
                Generate Resume
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Your Resume JSON</h2>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(formData, (key, value) => {
              if (value instanceof Date) return format(value, 'yyyy-MM-dd');
              return value;
            }, 2)}
          </pre>
          <button
            onClick={() => setShowOutput(false)}
            className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Edit Again
          </button>
        </div>
      )}
    </div>
  );
}
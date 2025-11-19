import { useEffect, useState } from 'react';
import axios from '../../assets/AxiosConfig';
import { useNavigate } from 'react-router-dom';

const mockData = {
  "personal": {
    "name": "abcv",
    "email": "adf@df.cm",
    "address": "34sdsda",
    "phonenumber": "243254",
    "linkedin": "ldsjfdjsg",
    "linkedin_link": "www.sdfsd.sdf",
    "github": "dfasdf",
    "github_link": "wwq.cdfdsf.cv",
    "portfolio": "sfdsfdsf",
    "portfolio_link": "www.dsfds.dfsdf"
  },
  "education": [
    { "clg": "B.Tech, IIT" },
    { "clg": "M.Tech, MIT" }
  ],
  "experiences": [
    { "role": "DevOps Engineer at XYZ" },
    { "role": "Intern at ABC" }
  ],
  "projects": [
    { "project": "Project A" },
    { "project": "Project B" },
    { "project": "Project C" },
    { "project": "Project D" }
  ],
  "skills": [
    { "category": "React" },
    { "category": "Django" },
    { "category": "PostgreSQL" }
  ],
  "certifications": [
    { "category": "React" },
    { "category": "Django" },
    { "category": "PostgreSQL" }
  ],
  "publications": [
    { "category": "React" },
    { "category": "Django" },
    { "category": "PostgreSQL" }
  ],
  "achievements": [
    { "category": "React" },
    { "category": "Django" },
    { "category": "PostgreSQL" }
  ]
};

const sectionOrder = Object.keys(mockData);

// Helper: initialize inclusion state for all sections
const getInitialIncludedFields = (data) => {
  const initial = {};
  Object.keys(data).forEach((section) => {
    if (Array.isArray(data[section])) {
      // For each array item, default inclusiontotrue.
      initial[section] = data[section].map(() => true);
    } else if (typeof data[section] === 'object') {
      initial[section] = Object.keys(data[section]).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
    }
  });
  return initial;
};

export default function TimelineJSONBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [showOutput, setShowOutput] = useState(false);
  const [includedFields, setIncludedFields] = useState(getInitialIncludedFields(mockData));
  const navigator = useNavigate();

  useEffect(() => {
    axios.post("/userdata/all/").then((response) => {
      console.log(response.data);
      setFormData(response.data);
      setIncludedFields(getInitialIncludedFields(response.data));
    }).catch((error) => {
      console.error("Error fetching data:", error);
      setError(error.response?.data?.error || "An error occurred while fetching data"+error);
      // setFormData(mockData); // Fallback to mock data in case of error
      // setIncludedFields(getInitialIncludedFields(mockData));
    });
  }, []);

  if(error){
    return (
      <div className="flex min-h-screen justify-between bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md mb-4" role="alert">
            <strong>Error:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  // Toggle inclusion for a field (object) or an item (array)
  const toggleFieldInclusion = (section, keyOrIndex) => {
    setIncludedFields(prev => {
      if (Array.isArray(prev[section])) {
        const newArr = [...prev[section]];
        newArr[keyOrIndex] = !newArr[keyOrIndex];
        return { ...prev, [section]: newArr };
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [keyOrIndex]: !prev[section][keyOrIndex]
          }
        };
      }
    });
  };

  // Create the final JSON output by filtering out excluded fields/items
  const processFinalJSON = () => {
    const result = {};
    for (const section in formData) {
      if(section==="skills"){
        const skl={}
        formData[section].forEach((item, index) =>{
          if(skl[item["category"]]==undefined){
            skl[item["category"]]=[item["skill_name"]];
          }
          else{
          skl[item["category"]]=[...skl[item["category"]],item["skill_name"]]
          }
        });
        console.log(skl);
        result["skills"]=skl;
      
      }
      else if (Array.isArray(formData[section])) {
        result[section] = formData[section].filter((item, index) => includedFields[section][index]);
      } else if (typeof formData[section] === 'object') {
        result[section] = Object.entries(formData[section]).reduce((acc, [key, value]) => {
          if (includedFields[section][key]) {
            acc[key] = value;
          }
          return acc;
        }, {});
      } else {
        result[section] = formData[section];
      }
    }
    const ans={...result,...result["personal"]}
    delete ans?.personal
    navigator("/u/resumeeditor", { state: { results: ans } });
    return ans;
  };

  const currentSection = sectionOrder[currentStep];
  if(Object.keys(formData).length==0){
    return (
    <div  className="flex min-h-screen justify-between bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500 border-solid"></div>
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    </div>);
  }
  return (
    <div className="relative min-h-screen bg-gray-50 p-8">
      <div className="lg:absolute top-1 left-3 sm:relative p-2">
          <button className="bg-gray-400  text-white px-2 py-1 rounded-full hover:bg-gray-200 transition" on onClick={() => window.history.back()}>
            ⬅
          </button>
      </div>
      {!showOutput ? (
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between">
              {sectionOrder.map((_, index) => (
                <div 
                  key={index}
                  className={`h-2 w-full mx-1 rounded-full ${index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-8 flex justify-between">
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
                  onClick={() => {
                    // processFinalJSON();
                    setShowOutput(true)
                  }}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                >
                  Generate
                </button>
              )}
            </div>

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {currentSection}
            </h2>
            

            {typeof formData[currentSection] === 'object' && !Array.isArray(formData[currentSection]) ? (
              // Object section (for example, "personal")
              <div className="space-y-4">
                {Object.entries(formData[currentSection]).map(([key, value]) => (
                  <div key={key} onClick={() => toggleFieldInclusion(currentSection, key)} className="relative flex justify-between items-center border p-4 rounded-lg cursor-pointer">
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div className="text-gray-500">{value}</div>
                    </div>
                    <button
                      
                      className={`absolute right-5 px-3 py-1 rounded-lg ${includedFields[currentSection][key] ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                    >
                      {includedFields[currentSection][key] ? '' : ''}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              // Array section (for example, "education", "experience", etc.)
              <div className="space-y-4">
                {formData[currentSection].map((item, index) => {
                  let keyIndex = "";
                  // Adjust key names as needed to match your data structure.
                  switch (currentSection) {
                    case "education":
                      keyIndex = "degree"; 
                      break;
                    case "experiences":
                      keyIndex = "role";
                      break;
                    case "projects":
                      keyIndex = "title";
                      break;
                    case "skills":
                      keyIndex = "skill_name";
                      break;
                    case "certifications":
                      keyIndex = "name";
                      break;
                    case "publications":
                      keyIndex = "title";
                      break;
                    case "achievements":
                      keyIndex = "title";
                      break;
                    default:
                      keyIndex = Object.keys(item)[0];
                  }
                  const value = item[keyIndex];
                  return (
                    <div key={index} onClick={() => toggleFieldInclusion(currentSection, index)} className="relative flex justify-between items-center border p-4 rounded-lg cursor-pointer">
                      <div className="text-gray-700">{value}</div>
                      <button
                        
                        className={`absolute right-5 px-3 py-1 rounded-lg ${includedFields[currentSection][index] ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                      >
                        {includedFields[currentSection][index] ? '' : ''}
                      </button>
                    </div>
                  );
                })}
                {/* Optionally, you could allow adding new items if desired */}
                {/* <button
                  onClick={() => { Add new item logic here }
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Add New
                </button>  */}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Final JSON Output
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Final JSON Output</h2>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(processFinalJSON(), null, 2)}
          </pre>
          <button
            onClick={() => setShowOutput(false)}
            className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Edit Again
          </button>
        </div>
      )}
    </div>
  );
}




// import { useEffect, useState } from 'react';
// import axios from '../../assets/AxiosConfig';

// const mockData = {
//   "personal": {
//     "name": "abcv",
//     "email": "adf@df.cm",
//     "address": "34sdsda",
//     "phone": "243254",
//     "linkedin": "ldsjfdjsg",
//     "linkedin_link": "www.sdfsd.sdf",
//     "github": "dfasdf",
//     "github_link": "wwq.cdfdsf.cv",
//     "portfolio": "sfdsfdsf",
//     "portfolio_link": "www.dsfds.dfsdf"
//   },
//   "education": [
//     { "clg": "B.Tech, IIT" },
//     { "clg": "M.Tech, MIT" }
//   ],
//   "experience": [
//     { "role": "DevOps Engineer at XYZ" },
//     { "role": "Intern at ABC" }
//   ],
//   "project": [
//     { "project": "Project A" },
//     { "project": "Project B" },
//     { "project": "Project C" },
//     { "project": "Project D" }
//   ],
//   "skill": [
//     { "category": "React" },
//     { "category": "Django" },
//     { "category": "PostgreSQL" }
//   ],
//   "certification": [
//     { "category": "React" },
//     { "category": "Django" },
//     { "category": "PostgreSQL" }
//   ],
//   "publication": [
//     { "category": "React" },
//     { "category": "Django" },
//     { "category": "PostgreSQL" }
//   ],
//   "achievement": [
//     { "category": "React" },
//     { "category": "Django" },
//     { "category": "PostgreSQL" }
//   ]
// };

// const sectionOrder = Object.keys(mockData);

// // Helper to initialize inclusion state for all sections
// const getInitialIncludedFields = (data) => {
//   const initial = {};
//   Object.keys(data).forEach((section) => {
//     if (Array.isArray(data[section])) {
//       // For each array item, default inclusion to true
//       initial[section] = data[section].map(() => true);
//     } else if (typeof data[section] === 'object') {
//       initial[section] = Object.keys(data[section]).reduce((acc, key) => {
//         acc[key] = true;
//         return acc;
//       }, {});
//     }
//   });
//   return initial;
// };

// export default function TimelineJSONBuilder() {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [formData, setFormData] = useState(mockData);
//   const [showOutput, setShowOutput] = useState(false);
//   const [includedFields, setIncludedFields] = useState(getInitialIncludedFields(mockData));

//   useEffect(() => {
//     axios.post("/userdata/all/").then((response) => {
//       console.log(response.data);
//       setFormData(response.data);
//       // Update the inclusion state to match the structure of the fetched data
//       setIncludedFields(getInitialIncludedFields(response.data));
//     });
//   }, []);

//   const handleInputChange = (section, key, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [section]: Array.isArray(prev[section])
//         ? prev[section].map((item, i) =>
//             i === key ? { ...item, [Object.keys(item)[0]]: value } : item
//           )
//         : { ...prev[section], [key]: value }
//     }));
//   };

//   // Updated toggle function to handle both objects and arrays
//   const toggleFieldInclusion = (section, keyOrIndex) => {
//     setIncludedFields(prev => {
//       if (Array.isArray(prev[section])) {
//         const newArr = [...prev[section]];
//         newArr[keyOrIndex] = !newArr[keyOrIndex];
//         return { ...prev, [section]: newArr };
//       } else {
//         return {
//           ...prev,
//           [section]: {
//             ...prev[section],
//             [keyOrIndex]: !prev[section][keyOrIndex]
//           }
//         };
//       }
//     });
//   };

//   // Process final JSON to filter out unchecked fields/items
//   const processFinalJSON = () => {
//     const result = {};
//     for (const section in formData) {
//       if (Array.isArray(formData[section])) {
//         result[section] = formData[section].filter((item, index) => includedFields[section][index]);
//       } else if (typeof formData[section] === 'object') {
//         result[section] = Object.entries(formData[section]).reduce((acc, [key, value]) => {
//           if (includedFields[section][key]) {
//             acc[key] = value;
//           }
//           return acc;
//         }, {});
//       } else {
//         result[section] = formData[section];
//       }
//     }
//     return result;
//   };

//   const addArrayItem = (section) => {
//     const template = { [Object.keys(formData[section][0])[0]]: "" };
//     setFormData(prev => ({
//       ...prev,
//       [section]: [...prev[section], template]
//     }));
//     setIncludedFields(prev => ({
//       ...prev,
//       [section]: [...prev[section], true]
//     }));
//   };

//   const currentSection = sectionOrder[currentStep];

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       {!showOutput ? (
//         <div className="max-w-2xl mx-auto">
//           <div className="mb-8">
//             <div className="flex justify-between">
//               {sectionOrder.map((_, index) => (
//                 <div 
//                   key={index}
//                   className={`h-2 w-full mx-1 rounded-full ${index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
//                 />
//               ))}
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-2xl font-bold mb-6 text-gray-800">
//               {currentSection}
//             </h2>

//             {typeof formData[currentSection] === 'object' && !Array.isArray(formData[currentSection]) ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {Object.entries(formData[currentSection]).map(([key, value]) => (
//                   <div key={key} className="space-y-2">
//                     <div className="flex items-center gap-2">
//                       <input
//                         type="checkbox"
//                         checked={includedFields[currentSection][key]}
//                         onChange={() => toggleFieldInclusion(currentSection, key)}
//                         className="h-4 w-4"
//                       />
//                       <label className="block text-sm font-medium text-gray-700">
//                         {key.replace(/_/g, ' ').toUpperCase()}
//                       </label>
//                     </div>
//                     <input
//                       type="text"
//                       value={value}
//                       onChange={(e) => handleInputChange(currentSection, key, e.target.value)}
//                       className="w-full p-2 border rounded-lg"
//                       disabled={!includedFields[currentSection][key]}
//                     />
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {formData[currentSection].map((item, index) => {
//                   // Determine which key to use for updating the item.
//                   // Adjust the key names as needed to match your data.
//                   let keyIndex = "";
//                   switch (currentSection) {
//                     case "education":
//                       keyIndex = "degree"; // change if needed
//                       break;
//                     case "experience":
//                       keyIndex = "role";
//                       break;
//                     case "project":
//                       keyIndex = "title";
//                       break;
//                     case "skill":
//                       keyIndex = "skill_name";
//                       break;
//                     case "certification":
//                       keyIndex = "name";
//                       break;
//                     case "publication":
//                       keyIndex = "title";
//                       break;
//                     case "achievement":
//                       keyIndex = "title";
//                       break;
//                     default:
//                       keyIndex = Object.keys(item)[0];
//                   }
//                   const value = item[keyIndex];
//                   return (
//                     <div key={index} className="flex items-center gap-4">
//                       {/* Checkboxtotoggle inclusion */}
//                       <input
//                         type="checkbox"
//                         checked={includedFields[currentSection][index]}
//                         onChange={() => toggleFieldInclusion(currentSection, index)}
//                         className="h-4 w-4"
//                       />
//                       <input
//                         type="text"
//                         value={value}
//                         onChange={(e) => handleInputChange(currentSection, index, e.target.value)}
//                         className="flex-1 p-2 border rounded-lg"
//                       />
//                     </div>
//                   );
//                 })}
//                 <button
//                   onClick={() => addArrayItem(currentSection)}
//                   className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
//                 >
//                   Add New
//                 </button>
//               </div>
//             )}

//             <div className="mt-8 flex justify-between">
//               <button
//                 onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
//                 disabled={currentStep === 0}
//                 className="bg-gray-200 px-6 py-2 rounded-lg disabled:opacity-50"
//               >
//                 Previous
//               </button>
              
//               {currentStep < sectionOrder.length - 1 ? (
//                 <button
//                   onClick={() => setCurrentStep(p => p + 1)}
//                   className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
//                 >
//                   Next
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => setShowOutput(true)}
//                   className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
//                 >
//                   Generate JSON
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
//           <h2 className="text-2xl font-bold mb-6 text-gray-800">Final JSON Output</h2>
//           <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
//             {JSON.stringify(processFinalJSON(), null, 2)}
//           </pre>
//           <button
//             onClick={() => setShowOutput(false)}
//             className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//           >
//             Edit Again
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }



// import { useEffect, useState } from 'react';
// import axios from '../../assets/AxiosConfig';

// const mockData = {
//   "personal": {
//     "name": "abcv",
//     "email": "adf@df.cm",
//     "address": "34sdsda",
//     "phone": "243254",
//     "linkedin": "ldsjfdjsg",
//     "linkedin_link": "www.sdfsd.sdf",
//     "github": "dfasdf",
//     "github_link": "wwq.cdfdsf.cv",
//     "portfolio": "sfdsfdsf",
//     "portfolio_link": "www.dsfds.dfsdf",
//   },
//   "education": [
//     {"clg":"B.Tech, IIT" },
//     {"clg":"M.Tech, MIT" }
//   ],
//   "experience": [
//     { "role": "DevOps Engineer at XYZ" },
//     { "role":"Intern at ABC" }
//   ],
//   "project": [
//     { "project": "Project A" },
//     { "project": "Project B" },
//     { "project": "Project C" },
//     { "project": "Project D" }
//   ],
//   "skill": [
//     { "category": "React" },
//     { "category": "Django" },
//     { "category": "PostgreSQL" }
//   ],
//   "certification": [
//     { "category": "React" },
//     { "category": "Django" },
//     { "category": "PostgreSQL" }
//   ],
//   "publication": [
//     { "category": "React" },
//     { "category": "Django" },
//     { "category": "PostgreSQL" }
//   ],
//   "achievement": [
//     { "category": "React" },
//     { "category": "Django" },
//     { "category": "PostgreSQL" }
//   ]
// };


// const sectionOrder = Object.keys(mockData);
// export default function TimelineJSONBuilder() {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [formData, setFormData] = useState(mockData);
//   const [showOutput, setShowOutput] = useState(false);
//   const [includedFields, setIncludedFields] = useState({
//     "personal": Object.keys(formData["personal"]).reduce((acc, key) => {
//       acc[key] = true;
//       return acc;
//     }, {})
//   });
//   useEffect(() => {
//     axios.post("/userdata/all/").then((response) => {
//       console.log(response.data);
//       setFormData(response.data);
//       sectionOrder = Object.keys(formData);
//     });
//   }, []);

//   const handleInputChange = (section, key, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [section]: Array.isArray(prev[section]) 
//         ? prev[section].map((item, i) => i === key ? { ...item, [Object.keys(item)[0]]: value } : item)
//         : { ...prev[section], [key]: value }
//     }));
//   };

//   const toggleFieldInclusion = (section, field) => {
//     setIncludedFields(prev => ({
//       ...prev,
//       [section]: {
//         ...prev[section],
//         [field]: !prev[section][field]
//       }
//     }));
//   };

//   // Modified processFinalJSONtofilter out excluded fields
//   const processFinalJSON = () => {
//     return {
//       ...formData,
//       "personal": Object.entries(formData["personal"]).reduce((acc, [key, value]) => {
//         if (includedFields["personal"][key]) {
//           acc[key] = value;
//         }
//         return acc;
//       }, {})
//     };
//   };

//   const addArrayItem = (section) => {
//     const template = { [Object.keys(formData[section][0])[0]]: "" };
//     setFormData(prev => ({
//       ...prev,
//       [section]: [...prev[section], template]
//     }));
//   };

//   const removeArrayItem = (section, index) => {
//     setFormData(prev => ({
//       ...prev,
//       [section]: prev[section].filter((_, i) => i !== index)
//     }));
//   };

//   const currentSection = sectionOrder[currentStep];

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       {!showOutput ? (
//         <div className="max-w-2xl mx-auto">
//           <div className="mb-8">
//             <div className="flex justify-between">
//               {sectionOrder.map((_, index) => (
//                 <div 
//                   key={index}
//                   className={`h-2 w-full mx-1 rounded-full ${index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
//                 />
//               ))}
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-lg p-6">
//             <h2 className="text-2xl font-bold mb-6 text-gray-800">
//               {currentSection}
//             </h2>

//             {typeof formData[currentSection] === 'object' && !Array.isArray(formData[currentSection]) ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {Object.entries(formData[currentSection]).map(([key, value]) => (
//                     <div key={key} className="space-y-2">
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={includedFields[currentSection][key]}
//                           onChange={() => toggleFieldInclusion(currentSection, key)}
//                           className="h-4 w-4"
//                         />
//                         <label className="block text-sm font-medium text-gray-700">
//                           {key.replace(/_/g, ' ').toUpperCase()}
//                         </label>
//                       </div>
//                       <input
//                         type="text"
//                         value={value}
//                         onChange={(e) => handleInputChange(currentSection, key, e.target.value)}
//                         className="w-full p-2 border rounded-lg"
//                         disabled={!includedFields[currentSection][key]}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )  : (
//               <div className="space-y-4">
//                 {formData[currentSection].map((item, index) => {
//                   var keyIndex="";
//                   switch(currentSection){
//                     case "education":
//                       keyIndex="degree";
//                       break;
//                     case "experience":
//                       keyIndex="role";
//                       break;
//                     case "project":
//                       keyIndex="title";
//                       break;
//                     case "skill":
//                       keyIndex="skill_name";
//                       break;
//                     case "certification":
//                       keyIndex="name";
//                       break;
//                     case "publication":
//                       keyIndex="title";
//                       break;
//                     case "achievement":
//                       keyIndex="title";
//                       break;
//                   }
//                   const key=keyIndex
//                   const value = item[keyIndex];
//                   return (
//                     <div key={index} className="flex items-center gap-4">
//                       <input
//                         type="text"
//                         value={value}
//                         onChange={(e) => handleInputChange(currentSection, index, e.target.value)}
//                         className="flex-1 p-2 border rounded-lg"
//                       />
//                       <button
//                         onClick={() => removeArrayItem(currentSection, index)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   );
//                 })}
//                 {/* <button
//                   onClick={() => addArrayItem(currentSection)}
//                   className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
//                 >
//                   Add New
//                 </button> */}
//               </div>
//             )}

//             <div className="mt-8 flex justify-between">
//               <button
//                 onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
//                 disabled={currentStep === 0}
//                 className="bg-gray-200 px-6 py-2 rounded-lg disabled:opacity-50"
//               >
//                 Previous
//               </button>
              
//               {currentStep < sectionOrder.length - 1 ? (
//                 <button
//                   onClick={() => setCurrentStep(p => p + 1)}
//                   className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
//                 >
//                   Next
//                 </button>
//               ) : (
//                 <button
//                   onClick={() => setShowOutput(true)}
//                   className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
//                 >
//                   Generate JSON
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
//           <h2 className="text-2xl font-bold mb-6 text-gray-800">Final JSON Output</h2>
//           <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
//             {JSON.stringify(processFinalJSON(), null, 2)}
//           </pre>
//           <button
//             onClick={() => setShowOutput(false)}
//             className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//           >
//             Edit Again
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
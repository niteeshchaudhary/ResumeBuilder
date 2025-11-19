import { useEffect, useState } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { nitp, sb2 } from '../assets/templates_image';
import { useNavigate } from 'react-router-dom';
import axios from '../assets/AxiosConfig';

const TemplateSelector = ({ selected, onSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample templates data with images
  const [templates, setTemplates] = useState([
    {
      id: 1,
      title: 'sb2',
      description: 'Professional',
      category: 'Engineer',
      image: sb2,
    },
    {
      id: 2,
      title: 'nitp',
      description: 'Professional with picture',
      category: 'Engineer',
      image: nitp,
    },
  ]);
  useEffect(() => {
    axios.get('/templates/')
      .then(response => {
        console.log('Templates fetched:', response.data);
        setTemplates(response.data);
      })
      .catch(error => {
        console.error('Error fetching templates:', error);
      });
  }, []);

  const selectTemplate = (template) => {
    setIsModalOpen(false);
    onSelect(template.title);
    const removeSelected = templates.filter(t => t.title !== template.title);
    const new_options = [template, ...removeSelected];
    setTemplates(new_options);
  }


  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-0 bg-white  mb-8 pb-4">
      <h2 className="text-2xl font-bold mb-6">Choose a Template</h2>

      {/* Featured Templates Grid */}
      <div className="grid grid-cols-1 md:flex gap-6 mb-8  pl-4">
        {templates.slice(0, 3).map(template => (
          <div key={template.id} className={`border rounded-lg p-6 hover:shadow-lg transition-shadow ${template.title === selected ? 'border-blue-500' : 'border-gray-300'}`} style={{ "cursor": "pointer" }} onClick={() => selectTemplate(template)}>
            {/* Image Container */}
            <div className="h-60 bg-gray-100 rounded-md mb-4 overflow-hidden">
              <img
                src={template.image}
                alt={template.title}
                style={{ minWidth: "150px" }}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-semibold text-lg">{template.title}</h3>
            <p className="text-gray-600 text-sm">{template.description}</p>
            {/* <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700" >
              Use Template
            </button> */}
          </div>
        ))}
      </div>

      {/* More Templates Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="text-blue-600 hover:text-blue-700 font-medium"
      >
        View More Templates →
      </button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">All Templates</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="w-full p-3 pl-10 border rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* Templates List */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Image Thumbnail */}
                    <div className="h-32 bg-gray-100 rounded-md mb-4 overflow-hidden">
                      <img
                        src={template.image}
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-medium">{template.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {template.category}
                    </span>
                    <button type="button" className="mt-3 text-blue-600 hover:text-blue-700 text-sm" onClick={() => selectTemplate(template)}>
                      Use Template →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  editcertifications,
  editpublications,
  editachievements,
  editedu,
  editexp,
  editperson,
  editprojects,
  editskills
} from '../../assets/Images';


const ResumeDataEditorOption = () => {
  const options = [
    { id: 0, image: editperson, text: 'Edit Personal Data', link: '/u/edit/personal' },
    { id: 1, image: editedu, text: 'Edit Education', link: '/u/edit/education' },
    { id: 2, image: editexp, text: 'Edit Experiences', link: '/u/edit/experience' },
    { id: 3, image: editprojects, text: 'Edit Projects', link: '/u/edit/projects' },
    { id: 4, image: editskills, text: 'Edit Skills', link: '/u/edit/skills' },
    { id: 5, image: editcertifications, text: 'Edit Achievements', link: '/u/edit/achievements' },
    { id: 6, image: editachievements, text: 'Edit Certifications', link: '/u/edit/certifications' },
    { id: 7, image: editpublications, text: 'Edit Publications', link: '/u/edit/publications' }
  ];
  const navigate = useNavigate();
  const handleNavigate = (event, link) => {
    event.preventDefault();
    navigate(link);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="sticky top-0 z-10 p-4">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur px-3 py-1.5 text-gray-700 shadow-sm transition hover:bg-white hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M9.53 4.47a.75.75 0 010 1.06L5.06 10h15.19a.75.75 0 010 1.5H5.06l4.47 4.47a.75.75 0 11-1.06 1.06l-5.75-5.75a.75.75 0 010-1.06l5.75-5.75a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12">
        <div className="text-center mt-4 mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
            Edit Your Resume Data
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Quickly jump to any section below and make updates with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={(e) => handleNavigate(e, option.link)}
              aria-label={option.text}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-50/60 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <div className="flex h-36 flex-col items-center justify-center gap-4">
                <img
                  src={option.image}
                  alt={option.text}
                  className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                />
                <span className="text-sm sm:text-base font-medium text-gray-800 text-center">
                  {option.text}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-purple-400 opacity-60 transition-opacity duration-200 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeDataEditorOption;

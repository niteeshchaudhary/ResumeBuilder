import React, { useState } from 'react';
import axios from "../../assets/AxiosConfig";
import { useNavigate } from 'react-router-dom';
import ProcessingPage from '../../components/ProcessingPage';

const host = import.meta.env.VITE_HOST;
const AdditionalInfo = () => {
  const navigator = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    setIsSubmitting(true);

    try {
      const resp = await axios.post(`specific-rating/`, formData);
      console.log("yewala apna h", resp.data);
      setIsSubmitting(false);
      if (resp.status === 200) {
        console.log('Form submitted successfully');
      }
      navigator("/u/results", { state: { rating: resp.data?.rating,tips:resp.data?.tips } });
    } catch (error) {
      setIsSubmitting(false);
      setMessage('An error occurred: ' + error.message);
    }

  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {isSubmitting ? (
        <ProcessingPage />
      ) : (
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Application</h1>
            <p className="text-gray-600">Tell us about the role you're applying for</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  What role are you applying for?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="e.g., Software Engineer, Product Manager, Designer..."
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!formData.description.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Grade My Application</span>
                </span>
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Your application will be analyzed and graded automatically</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Powered by AI-driven application analysis
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalInfo;

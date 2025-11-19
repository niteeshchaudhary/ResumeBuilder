import axios from "../assets/AxiosConfig";
import React, { useState } from 'react';

const host = import.meta.env.VITE_HOST;
const FileUpload = (props) => {
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const resp = await axios.post(`/upload-file/`, formData);

        if (resp.status === 200) {
          //  const response=await axios.get(`${host}/reserish/api/resume-parser/${resp.data.filename}`); // ${host}/reserish/
          //  console.log(response.data);
          props.callbk();
          setMessage('File uploaded successfully!');
        } else {
          setMessage('Failed to upload file.');
        }
      } catch (error) {
        console.error(error);
        setMessage('An error occurred during the upload.');
      } finally {
        setUploading(false);
      }
    } else {
      setMessage('No file selected');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        <div className="border-b pb-6">
          {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">Documents</h3> */}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Resume/CV <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                {uploading == true ?
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 6.93A8.003 8.003 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.93-1.008z"></path>
                    </svg>
                    <span className="text-blue-600">Uploading...</span>
                  </div>
                  : <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />}
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900">
                      {file ? file.name : 'Click to upload resume'}
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                </label>
              </div>
              {errors.resumeFile && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.resumeFile}
                </p>
              )}
            </div>
          </div>
        </div>



        {/* <label
          htmlFor="file-upload"
          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {file ? file.name : 'Choose a file'}
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="hidden"
        /> */}
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-center text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
};

export default FileUpload;

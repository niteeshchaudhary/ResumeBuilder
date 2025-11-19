import React from 'react';

const ProcessingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500 border-solid"></div>
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mt-6">Processing...</h2>
        <p className="text-gray-500 mt-2">Please wait while we process your request.</p>
      </div>
    </div>
  );
};

export default ProcessingPage;

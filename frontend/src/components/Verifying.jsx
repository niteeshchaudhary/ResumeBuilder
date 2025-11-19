import React from "react";

const Verifying = () => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-8 text-center animate-pulse w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h2>
      <p className="text-gray-600">Please wait while we verify your email...</p>
      <div className="mt-6">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default Verifying;

import React from "react";
import { CheckCircle } from "lucide-react";

const Success = () => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-8 text-center w-full max-w-md">
      <CheckCircle className="text-green-500 w-12 h-12 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-green-700 mb-2">Email Verified</h2>
      <p className="text-gray-700">Your email has been successfully verified. You can now log in!</p>
      <a href="/" className="mt-6 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded transition">
        Go to Home
      </a>
    </div>
  );
};

export default Success;

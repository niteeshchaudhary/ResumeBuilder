import React from "react";
import { XCircle } from "lucide-react";

const Failure = () => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-8 text-center w-full max-w-md">
      <XCircle className="text-red-500 w-12 h-12 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-red-700 mb-2">Verification Failed</h2>
      <p className="text-gray-700">The verification link is invalid or expired. Please try registering again.</p>
      <a href="/" className="mt-6 inline-block bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded transition">
        Go to Home
      </a>
    </div>
  );
};

export default Failure;

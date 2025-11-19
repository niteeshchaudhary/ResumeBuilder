import React from 'react';
import { AlertTriangle } from 'lucide-react';

const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">We'll be back soon!</h1>
        <p className="text-gray-600">
          Sorry for the inconvenience. We're performing some maintenance at the moment. We'll be back online shortly!
        </p>
        <p className="text-sm text-gray-400">
          &mdash; Team ResumeUpgrader
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;

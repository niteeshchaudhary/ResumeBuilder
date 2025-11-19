import React from 'react';
import { useFeatureFeedback } from '../hooks/useFeatureFeedback';

const SimpleFeedbackTest = () => {
  const { triggerImmediateFeedback, feedbackModal } = useFeatureFeedback();

  const testFeedback = () => {
    console.log("🧪 Testing immediate feedback");
    triggerImmediateFeedback("Test Feature");
  };

  return (
    <div className="p-4 bg-blue-100 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-2">🧪 Simple Feedback Test</h3>
      
      <div className="space-y-2">
        <button 
          onClick={testFeedback}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Feedback Popup
        </button>
        
        <div className="text-sm">
          <p>Modal Open: {feedbackModal.isOpen ? 'Yes' : 'No'}</p>
          <p>Feature: {feedbackModal.featureName || 'None'}</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleFeedbackTest;



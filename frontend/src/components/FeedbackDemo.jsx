import React from 'react';
import { useFeatureFeedback } from '../hooks/useFeatureFeedback';
import FeedbackButton from './FeedbackButton';

const FeedbackDemo = () => {
  const { 
    triggerFeatureFeedback, 
    triggerImmediateFeedback, 
    shouldShowFeedback,
    feedbackModal 
  } = useFeatureFeedback();

  const testFeatures = [
    "Resume Builder",
    "Job Search",
    "Interview Practice",
    "Resume Grading"
  ];

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Feedback System Demo</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Test Immediate Feedback:</h4>
          <div className="flex flex-wrap gap-2">
            {testFeatures.map(feature => (
              <button
                key={feature}
                onClick={() => triggerImmediateFeedback(feature)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Test {feature}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Test Delayed Feedback:</h4>
          <div className="flex flex-wrap gap-2">
            {testFeatures.map(feature => (
              <button
                key={feature}
                onClick={() => triggerFeatureFeedback(feature, { delay: 1000 })}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Test {feature} (1s delay)
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Feedback Buttons:</h4>
          <div className="flex flex-wrap gap-2">
            <FeedbackButton featureName="Demo Feature" variant="default" size="small">
              Default Button
            </FeedbackButton>
            <FeedbackButton featureName="Demo Feature" variant="inline" size="small">
              Inline Button
            </FeedbackButton>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">System Status:</h4>
          <div className="text-sm space-y-1">
            <div>Modal Open: {feedbackModal.isOpen ? 'Yes' : 'No'}</div>
            <div>Current Feature: {feedbackModal.featureName || 'None'}</div>
            <div>Should Show Feedback: {shouldShowFeedback('Demo Feature') ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDemo;



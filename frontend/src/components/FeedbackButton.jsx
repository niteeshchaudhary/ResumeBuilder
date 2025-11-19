import React, { useState } from 'react';
import { useFeatureFeedback } from '../hooks/useFeatureFeedback';

const FeedbackButton = ({ 
  featureName = "this feature",
  variant = "default", // "default", "floating", "inline"
  size = "medium", // "small", "medium", "large"
  className = "",
  children = "Give Feedback"
}) => {
  const { triggerImmediateFeedback } = useFeatureFeedback();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    console.log("🎯 FeedbackButton clicked for feature:", featureName);
    triggerImmediateFeedback(featureName, { remindLater: true });
  };

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base"
  };

  const variantClasses = {
    default: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
    floating: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-lg hover:shadow-xl focus:ring-indigo-500",
    inline: "bg-transparent hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 focus:ring-indigo-500"
  };

  const floatingClasses = variant === "floating" ? "fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg hover:shadow-xl" : "";

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${floatingClasses} ${className}`}
      title={`Give feedback about ${featureName}`}
    >
      {variant === "floating" ? (
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
      ) : (
        <>
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          {children}
        </>
      )}
    </button>
  );
};

export default FeedbackButton;

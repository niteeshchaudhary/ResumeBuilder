import { useCallback } from 'react';
import { useFeedback } from '../context/FeedbackContext';

export const useFeatureFeedback = () => {
  const {
    triggerFeedback,
    shouldShowFeedback,
    submitFeedback,
    closeFeedback,
    feedbackModal
  } = useFeedback();

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem("accessToken");
  };

  // Trigger feedback for a specific feature with options
  const triggerFeatureFeedback = useCallback((featureName, options = {}) => {
    const { delay = 2000, remindLater = true } = options;
    console.log('🎯 triggerFeatureFeedback called for:', featureName, 'with options:', options);
    
    const authStatus = isAuthenticated();
    console.log('🔍 Authentication status:', authStatus);
    console.log('🔍 shouldShowFeedback result:', shouldShowFeedback(featureName, authStatus));

    if (shouldShowFeedback(featureName, authStatus)) {
      console.log('✅ Triggering feedback for:', featureName);
      triggerFeedback(featureName, { delay, remindLater });
    } else {
      console.log('❌ Feedback not shown for:', featureName, '- shouldShowFeedback returned false');
    }
  }, [triggerFeedback, shouldShowFeedback]);

  // Trigger feedback immediately (no delay)
  const triggerImmediateFeedback = useCallback((featureName, options = {}) => {
    console.log('🎯 triggerImmediateFeedback called for:', featureName);
    triggerFeatureFeedback(featureName, { ...options, delay: 0 });
  }, [triggerFeatureFeedback]);

  // Trigger feedback after a specific action
  const triggerActionFeedback = useCallback((featureName, actionName, options = {}) => {
    console.log('🎯 triggerActionFeedback called for:', featureName, 'after action:', actionName);
    const { delay = 1000, remindLater = true } = options;
    triggerFeatureFeedback(featureName, { delay, remindLater });
  }, [triggerFeatureFeedback]);

  // Check if feedback modal is currently open
  const isFeedbackOpen = useCallback(() => {
    return feedbackModal.isOpen;
  }, [feedbackModal.isOpen]);

  // Get current feedback modal state
  const getCurrentFeedback = useCallback(() => {
    return feedbackModal;
  }, [feedbackModal]);

  return {
    // Core functions
    triggerFeatureFeedback,
    triggerImmediateFeedback,
    triggerActionFeedback,
    
    // Utility functions
    submitFeedback,
    closeFeedback,
    isFeedbackOpen,
    getCurrentFeedback,
    
    // State
    feedbackModal,
    
    // Helper
    isAuthenticated
  };
};


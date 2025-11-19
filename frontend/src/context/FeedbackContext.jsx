import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { feedbackService } from '../services/feedbackService';

const FeedbackContext = createContext();

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider = ({ children }) => {
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    featureName: '',
    onRemindLater: null
  });

  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [reminderQueue, setReminderQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load feedback history from backend on initialization
  // useEffect(() => {
  //   // Check if user is authenticated
  //   const isAuthenticated = !!localStorage.getItem("accessToken");
  //   if (isAuthenticated) {
  //     console.log('🔄 Loading feedback history for authenticated user');
  //     loadFeedbackHistory();
  //   }
  // }, []); // Empty dependency array means this runs once on mount

  // Trigger feedback popup for a specific feature
  const triggerFeedback = useCallback((featureName, options = {}) => {
    const { delay = 0, remindLater = true } = options;
    
    console.log('🔔 Triggering feedback for:', featureName, 'with options:', options);
    
    if (delay > 0) {
      console.log('⏰ Scheduling feedback with delay:', delay);
      setTimeout(() => {
        console.log('⏰ Showing feedback after delay for:', featureName);
        setFeedbackModal({
          isOpen: true,
          featureName,
          onRemindLater: remindLater ? () => addToReminderQueue(featureName) : null
        });
      }, delay);
    } else {
      console.log('🚀 Showing feedback immediately for:', featureName);
      setFeedbackModal({
        isOpen: true,
        featureName,
        onRemindLater: remindLater ? () => addToReminderQueue(featureName) : null
      });
    }
  }, []);

  // Close feedback modal
  const closeFeedback = useCallback(() => {
    console.log("🔒 Closing feedback modal");
    setFeedbackModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Submit feedback
  const submitFeedback = useCallback(async (feedbackData) => {
    console.log("📝 Submitting feedback:", feedbackData);
    try {
      // First, submit to backend
      const backendResult = await feedbackService.submitFeedback(feedbackData);
      
      if (!backendResult.success) {
        console.error('❌ Backend submission failed:', backendResult.error);
        return { success: false, error: backendResult.error };
      }
      
      // If backend submission successful, store locally
      const newFeedback = {
        ...feedbackData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        submitted: true,
        backendId: backendResult.data?.feedback_id // Store backend ID if available
      };
      
      setFeedbackHistory(prev => [...prev, newFeedback]);
      
      console.log('✅ Feedback submitted successfully to backend:', newFeedback);
      
      // Remove from reminder queue if it was there
      setReminderQueue(prev => prev.filter(item => item.featureName !== feedbackData.featureName));
      
      return { success: true, backendId: backendResult.data?.feedback_id };
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Add feature to reminder queue
  const addToReminderQueue = useCallback(async (featureName) => {
    const reminderTime = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(); // 24 hours later
    
    try {
      // Schedule reminder in backend
      const backendResult = await feedbackService.scheduleReminder(featureName, reminderTime);
      
      if (backendResult.success) {
        const reminder = {
          featureName,
          timestamp: Date.now(),
          reminderTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours later
          backendId: backendResult.data?.reminder_id
        };
        
        setReminderQueue(prev => {
          // Remove existing reminder for this feature
          const filtered = prev.filter(item => item.featureName !== featureName);
          return [...filtered, reminder];
        });
        
        console.log('✅ Reminder scheduled in backend for:', featureName);
        
        // Schedule local reminder
        setTimeout(() => {
          setReminderQueue(prev => prev.filter(item => item.featureName !== featureName));
          triggerFeedback(featureName, { remindLater: false });
        }, 24 * 60 * 60 * 1000); // 24 hours
      } else {
        console.error('❌ Failed to schedule reminder in backend:', backendResult.error);
      }
    } catch (error) {
      console.error('❌ Error scheduling reminder:', error);
      
      // Fallback to local reminder only
      const reminder = {
        featureName,
        timestamp: Date.now(),
        reminderTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours later
      };
      
      setReminderQueue(prev => {
        const filtered = prev.filter(item => item.featureName !== featureName);
        return [...filtered, reminder];
      });
      
      setTimeout(() => {
        setReminderQueue(prev => prev.filter(item => item.featureName !== featureName));
        triggerFeedback(featureName, { remindLater: false });
      }, 24 * 60 * 60 * 1000);
    }
  }, [triggerFeedback]);

  // Check if feedback should be shown for a feature
  const shouldShowFeedback = useCallback((featureName, isAuthenticated = false) => {
    // Only show feedback for authenticated users
    if (!isAuthenticated) {
      console.log("🔒 Feedback not shown: User not authenticated");
      return false;
    }
    
    // Don't show if user has already given feedback for this feature
    const hasFeedback = feedbackHistory.some(feedback => 
      feedback.featureName === featureName && feedback.submitted
    );
    
    if (hasFeedback) {
      console.log("🔒 Feedback not shown: User already gave feedback for", featureName);
      return false;
    }
    
    // Don't show if it's in reminder queue
    const isInQueue = reminderQueue.some(reminder => 
      reminder.featureName === featureName
    );
    
    if (isInQueue) {
      console.log("🔒 Feedback not shown: Feature in reminder queue", featureName);
      return false;
    }
    
    console.log("✅ Feedback can be shown for", featureName);
    return true;
  }, [feedbackHistory, reminderQueue]);

  // Load feedback history from backend
  // const loadFeedbackHistory = useCallback(async () => {
  //   if (isLoading) return;
    
  //   setIsLoading(true);
  //   try {
  //     const result = await feedbackService.getUserFeedbackHistory();
  //     if (result.success) {
  //       const backendFeedback = result.data.feedback_history.map(feedback => ({
  //         ...feedback,
  //         id: feedback.id,
  //         featureName: feedback.feature_name,
  //         feedback: feedback.detailed_feedback,
  //         timestamp: feedback.created_at,
  //         submitted: true,
  //         backendId: feedback.id
  //       }));
        
  //       setFeedbackHistory(backendFeedback);
  //       console.log('✅ Loaded feedback history from backend:', backendFeedback);
  //     } else {
  //       console.error('❌ Failed to load feedback history:', result.error);
  //     }
  //   } catch (error) {
  //     console.error('❌ Error loading feedback history:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [isLoading]);

  // Load feedback history from backend on initialization
  // useEffect(() => {
  //   // Check if user is authenticated
  //   const isAuthenticated = !!localStorage.getItem("accessToken");
  //   if (isAuthenticated) {
  //     console.log('🔄 Loading feedback history for authenticated user');
  //     loadFeedbackHistory();
  //   }
  // }, [loadFeedbackHistory]); // Add loadFeedbackHistory as dependency

  // Get feedback statistics
  // const getFeedbackStats = useCallback(() => {
  //   const total = feedbackHistory.length;
  //   const averageRating = total > 0 
  //     ? feedbackHistory.reduce((sum, feedback) => sum + feedback.rating, 0) / total 
  //     : 0;
    
  //   const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
  //     rating,
  //     count: feedbackHistory.filter(feedback => feedback.rating === rating).length
  //   }));
    
  //   return {
  //     total,
  //     averageRating: Math.round(averageRating * 10) / 10,
  //     ratingDistribution
  //   };
  // }, [feedbackHistory]);

  const value = {
    feedbackModal,
    feedbackHistory,
    reminderQueue,
    isLoading,
    triggerFeedback,
    closeFeedback,
    submitFeedback,
    addToReminderQueue,
    shouldShowFeedback,
  };

  // Debug logging
  console.log("🔧 FeedbackContext value updated:", {
    isOpen: feedbackModal.isOpen,
    featureName: feedbackModal.featureName,
    totalFeedback: feedbackHistory.length
  });

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

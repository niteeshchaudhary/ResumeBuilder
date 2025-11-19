import axios from '../assets/AxiosConfig';

const API_BASE = '/feedback';

export const feedbackService = {
  // Submit feedback to backend
  async submitFeedback(feedbackData) {
    try {
      console.log('🚀 Submitting feedback to backend:', feedbackData);
      
      const response = await axios.post(`${API_BASE}/submit/`, {
        feature_name: feedbackData.featureName,
        rating: feedbackData.rating,
        detailed_feedback: feedbackData.feedback || ''
      });

      console.log('✅ Backend response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error submitting feedback to backend:', error);
      
      if (error.response) {
        // Server responded with error
        console.error('Server error:', error.response.data);
        return { 
          success: false, 
          error: error.response.data.error || 'Failed to submit feedback',
          status: error.response.status
        };
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        return { 
          success: false, 
          error: 'Network error - please check your connection'
        };
      } else {
        // Other error
        console.error('Other error:', error.message);
        return { 
          success: false, 
          error: error.message || 'Unknown error occurred'
        };
      }
    }
  },

  // Get feedback statistics
  // async getFeedbackStats() {
  //   try {
  //     const response = await axios.get(`${API_BASE}/stats/`);
  //     return { success: true, data: response.data };
  //   } catch (error) {
  //     console.error('Error getting feedback stats:', error);
  //     return { success: false, error: error.message };
  //   }
  // },

  // // Schedule feedback reminder
  // async scheduleReminder(featureName, reminderTime) {
  //   try {
  //     const response = await axios.post(`${API_BASE}/reminder/`, {
  //       feature_name: featureName,
  //       reminder_time: reminderTime
  //     });
  //     return { success: true, data: response.data };
  //   } catch (error) {
  //     console.error('Error scheduling reminder:', error);
  //     return { success: false, error: error.message };
  //   }
  // },

  // Get user feedback history
  // async getUserFeedbackHistory() {
  //   try {
  //     const response = await axios.get(`${API_BASE}/history/`);
  //     return { success: true, data: response.data };
  //   } catch (error) {
  //     console.error('Error getting user feedback history:', error);
  //     return { success: false, error: error.message };
  //   }
  // },

  // // Delete feedback
  // async deleteFeedback(feedbackId) {
  //   try {
  //     const response = await axios.delete(`${API_BASE}/${feedbackId}/`);
  //     return { success: true, data: response.data };
  //   } catch (error) {
  //     console.error('Error deleting feedback:', error);
  //     return { success: false, error: error.message };
  //   }
  // }
};

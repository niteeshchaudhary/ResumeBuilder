import React, { useState, useEffect } from 'react';

const FeedbackModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  featureName = "this feature",
  onRemindLater 
}) => {
  // Debug logging
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setFeedback('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const result = await onSubmit({ rating, feedback, featureName });
      
      if (result.success) {
        setSubmitStatus('success');
        console.log('✅ Feedback submitted successfully');
        
        // Close modal after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setSubmitStatus('error');
        console.error('❌ Feedback submission failed:', result.error);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('❌ Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemindLater = () => {
    onRemindLater();
    onClose();
  };

  if (!isOpen) {
    console.log("🎪 FeedbackModal: Not open, returning null");
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              How was your experience?
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            We'd love to hear your feedback about {featureName}
          </p>
        </div>

        {/* Star Rating */}
        <div className="px-6 py-4">
          <div className="text-center">
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`w-12 h-12 transition-all duration-200 transform hover:scale-110 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  <svg
                    className="w-full h-full"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            
            {/* Rating Labels */}
            <div className="text-sm text-gray-600 mb-4">
              {rating === 0 && "Select a rating"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </div>
          </div>

          {/* Optional Detailed Feedback */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional feedback (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more about your experience..."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="px-6 py-3 bg-green-50 border-t border-green-200">
            <div className="flex items-center text-green-800">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Feedback submitted successfully!</span>
            </div>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-200">
            <div className="flex items-center text-red-800">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Failed to submit feedback. Please try again.</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
          <button
            onClick={handleRemindLater}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Remind me later
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              rating === 0 || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

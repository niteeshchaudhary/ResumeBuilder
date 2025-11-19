import { useEffect, useCallback, useRef } from 'react';
import { useFeatureFeedback } from './useFeatureFeedback';

export const useFeatureTracking = (featureName, options = {}) => {
  const { triggerFeatureFeedback } = useFeatureFeedback();
  const hasTriggered = useRef(false);
  const {
    delay = 3000,
    requireInteraction = true,
    autoTrigger = true,
    maxTriggers = 1
  } = options;

  // const trackInteraction = useCallback(() => {
  //   if (hasTriggered.current) return;
  //   console.log(`🎯 Feature interaction tracked: ${featureName}`);
    
  //   if (autoTrigger && !hasTriggered.current) {
  //     setTimeout(() => {
  //       console.log(`🚀 Auto-triggering feedback for: ${featureName}`);
  //       triggerFeatureFeedback(featureName, { delay: 1000 });
  //       hasTriggered.current = true;
  //     }, delay);
  //   }
  // }, [featureName, delay, autoTrigger, triggerFeatureFeedback]);

  // const triggerFeedback = useCallback(() => {
  //   if (hasTriggered.current) return;
  //   console.log(`🎯 Manually triggering feedback for: ${featureName}`);
  //   triggerFeatureFeedback(featureName, { delay: 1000 });
  //   hasTriggered.current = true;
  // }, [featureName, triggerFeatureFeedback]);

  // const resetTracking = useCallback(() => {
  //   hasTriggered.current = false;
  //   console.log(`🔄 Reset tracking for: ${featureName}`);
  // }, [featureName]);

  // Auto-trigger on page load if configured
  useEffect(() => {
    if (autoTrigger && !requireInteraction) {
      const timer = setTimeout(() => {
        if (!hasTriggered.current) {
          console.log(`🚀 Auto-triggering feedback for: ${featureName} (page load)`);
          triggerFeatureFeedback(featureName, { delay: 1000 });
          hasTriggered.current = true;
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [featureName, delay, autoTrigger, requireInteraction, triggerFeatureFeedback]);

  return {
    trackInteraction,
    triggerFeedback,
    resetTracking,
    hasTriggered: hasTriggered.current
  };
};


import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Enhanced component that automatically scrolls to top on route changes
 * This ensures consistent user experience across all pages
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Try smooth scrolling first, fallback to instant scroll
    const scrollToTop = () => {
      try {
        // Check if smooth scrolling is supported
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Fallback for older browsers
          window.scrollTo(0, 0);
        }
      } catch (error) {
        // Fallback to instant scroll if smooth scrolling fails
        window.scrollTo(0, 0);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(scrollToTop, 100);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;

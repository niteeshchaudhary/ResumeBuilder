/**
 * Utility functions for scroll management
 */

/**
 * Scrolls to top of the page with smooth behavior
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 */
export const scrollToTop = (smooth = true) => {
  try {
    if (smooth && 'scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, 0);
    }
  } catch (error) {
    // Fallback to instant scroll
    window.scrollTo(0, 0);
  }
};

/**
 * Scrolls to a specific element by ID
 * @param {string} elementId - The ID of the element to scroll to
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 */
export const scrollToElement = (elementId, smooth = true) => {
  const element = document.getElementById(elementId);
  if (element) {
    try {
      if (smooth && 'scrollBehavior' in document.documentElement.style) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        element.scrollIntoView();
      }
    } catch (error) {
      element.scrollIntoView();
    }
  }
};

/**
 * Scrolls to a specific position
 * @param {number} x - Horizontal position
 * @param {number} y - Vertical position
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 */
export const scrollToPosition = (x, y, smooth = true) => {
  try {
    if (smooth && 'scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: y,
        left: x,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(x, y);
    }
  } catch (error) {
    window.scrollTo(x, y);
  }
};



# Scroll Management System

This document explains how the scroll management system works in the Reserish frontend application.

## Overview

The scroll management system automatically handles scrolling to the top of the page whenever users navigate between different routes/pages. This ensures a consistent user experience where users always start at the top of new pages.

## How It Works

### 1. Automatic Scroll Restoration

The `ScrollToTop` component is automatically included in the router configuration through the `RouterWrapper` component and will:
- Monitor route changes using `useLocation` hook
- Automatically scroll to the top (0, 0) when the route changes
- Use smooth scrolling when supported, with fallback to instant scrolling
- Include a small delay to ensure the DOM is ready

### 2. Components Used

- **`ScrollToTop`**: Main component that handles automatic scroll restoration
- **`useScrollToTop`**: Custom hook for components that need manual scroll control
- **`scrollUtils.js`**: Utility functions for advanced scroll operations

## Implementation

### Automatic (Recommended)

The `ScrollToTop` component is already included in:
- Main router (`main.jsx`) through the `RouterWrapper` component
- All routes automatically inherit scroll restoration

No additional code is needed - scroll restoration happens automatically.

### Manual Control

If you need manual scroll control in specific components:

```jsx
import { useScrollToTop } from '../hooks/useScrollToTop';
import { scrollToTop, scrollToElement } from '../utils/scrollUtils';

function MyComponent() {
  // Automatically scroll to top when component mounts
  useScrollToTop();
  
  const handleButtonClick = () => {
    // Scroll to top manually
    scrollToTop();
    
    // Or scroll to specific element
    scrollToElement('my-element-id');
  };
  
  return (
    <div>
      <button onClick={handleButtonClick}>Scroll to Top</button>
      <div id="my-element-id">Target Element</div>
    </div>
  );
}
```

## Utility Functions

### `scrollToTop(smooth = true)`
Scrolls to the top of the page.

### `scrollToElement(elementId, smooth = true)`
Scrolls to a specific element by ID.

### `scrollToPosition(x, y, smooth = true)`
Scrolls to specific coordinates.

## Browser Compatibility

- **Modern browsers**: Smooth scrolling with `behavior: 'smooth'`
- **Older browsers**: Instant scrolling as fallback
- **Error handling**: Graceful fallback if smooth scrolling fails

## Troubleshooting

### Scroll not working on specific pages

1. Ensure the `ScrollToTop` component is included in the route
2. Check if the page has custom scroll behavior that might interfere
3. Verify the route is properly configured

### Smooth scrolling not working

1. Check browser compatibility
2. The system automatically falls back to instant scrolling
3. No user action required

## Best Practices

1. **Don't remove** the `ScrollToTop` component from routes
2. **Use manual utilities** only when you need specific scroll behavior
3. **Test** on different browsers to ensure compatibility
4. **Keep** the automatic system as the default behavior

## Files Modified

- `frontend/src/components/ScrollToTop.jsx` - Main scroll restoration component
- `frontend/src/components/RouterWrapper.jsx` - Router wrapper that provides scroll restoration
- `frontend/src/hooks/useScrollToTop.js` - Custom hook for manual control
- `frontend/src/utils/scrollUtils.js` - Utility functions
- `frontend/src/main.jsx` - Updated router configuration to use RouterWrapper
- `frontend/src/routes/UserRoutes.jsx` - Removed duplicate ScrollToTop (now handled at router level)

import { Outlet } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';

/**
 * Wrapper component that provides scroll restoration functionality
 * This component must be rendered inside a Router context
 */
const RouterWrapper = () => {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export default RouterWrapper;



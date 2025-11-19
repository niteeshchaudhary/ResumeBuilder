import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import NotFound from './pages/NotFound.jsx';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import UserRoutes from './routes/UserRoutes.jsx';
import ContactSupport from './pages/ContactSupport.jsx';
import LandingPage from './pages/LandingPage.jsx';
import { AuthProvider } from "./auth/AuthContext"
import ProfilePage from './pages/user/ProfilePage.jsx';
import Features from './pages/Features.jsx';
import JobListings from './pages/user/JobListings.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.jsx';
import TermsAndConditions from './pages/TermsAndConditions.jsx';
import RefundPolicy from './pages/RefundPolicy.jsx';
import NewPricingPage from './pages/NewPricingPage.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ShippingAndDelivery from './pages/ShippingandDelivery.jsx';
import LogsViewerPage from './pages/LogViewerPage.jsx';
import ResendVerificationLink from './components/ResendVerificationLink.jsx';
import UserLogin from './pages/user/UserLogin.jsx';
import UserSignUp from './pages/user/UserSignUp.jsx';
import AboutUs from './pages/AboutUs.jsx';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { ThemeProvider } from './theme/ThemeContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import MaintenancePage from './pages/MaintainancePage.jsx';
import SponsorshipPricingPage from './pages/SponsorshipPricingPage.jsx';
import CollegeBulkPricingPage from './pages/CollegeBulkPricingPage.jsx';
import { FeedbackProvider as FeedbackContextProvider } from './context/FeedbackContext.jsx';
import FeedbackModal from './components/FeedbackModal.jsx';
import { useFeedback } from './context/FeedbackContext.jsx';
import RouterWrapper from './components/RouterWrapper.jsx';

// Feedback Modal Wrapper Component
const FeedbackModalWrapper = () => {
  const { feedbackModal, closeFeedback, submitFeedback } = useFeedback();

  // Debug logging
  console.log("🎭 FeedbackModalWrapper render:", {
    isOpen: feedbackModal.isOpen,
    featureName: feedbackModal.featureName
  });

  return (
    <FeedbackModal
      isOpen={feedbackModal.isOpen}
      onClose={closeFeedback}
      onSubmit={submitFeedback}
      featureName={feedbackModal.featureName}
      onRemindLater={feedbackModal.onRemindLater}
    />
  );
};

const isMaintainance = import.meta.env.VITE_MAITAINANCE;

if (isMaintainance == "true") {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <MaintenancePage />
    </React.StrictMode>
  )

}
else {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RouterWrapper />,
      children: [
        {
          index: true,
          element: <LandingPage />,
        },
        {
          path: "profile",
          element: <ProfilePage />,
          errorElement: <NotFound />,
        },
        {
          path: "jobpostings",
          element: <JobListings />,
        },
        {
          path: "features",
          element: <Features />,
        },
        {
          path: "aboutus",
          element: <AboutUs />,
        },
        {
          path: "sponsorship",
          element: <SponsorshipPricingPage />,
        },
        {
          path: "college-pricing",
          element: <CollegeBulkPricingPage />,
        },
        {
          path: "pricing",
          element: <NewPricingPage />,
        },
        {
          path: "resendverificationlink",
          element: <ResendVerificationLink />,
        },
        {
          path: "support",
          element: <ContactSupport />,
          errorElement: <NotFound />,
        },
        {
          path: "privacypolicy",
          element: <PrivacyPolicy />,
        },
        {
          path: "shippinganddelivery",
          element: <ShippingAndDelivery />,
        },
        {
          path: "refundpolicy",
          element: <RefundPolicy />,
        },
        {
          path: "termsandconditions",
          element: <TermsAndConditions />,
        },
        {
          path: "reset-password/:uidb64/:token",
          element: <ResetPassword />,
        },
        {
          path: "logs/:token",
          element: <LogsViewerPage />,
        },
        {
          path: "u/*",
          element: <UserRoutes />,
        },
        {
          path: "verifyemail/:uidb64/:token",
          element: <VerifyEmail />,
        }
      ]
    }
  ]);

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId="283218481052-mn47lql812mlsq96movo392537cj2kct.apps.googleusercontent.com">
        <FeedbackContextProvider>
          <AuthProvider>
            <ThemeProvider>
              <RouterProvider router={router} />
            </ThemeProvider>
          </AuthProvider>
          <FeedbackModalWrapper />
        </FeedbackContextProvider>
      </GoogleOAuthProvider>
    </React.StrictMode>

  )
}

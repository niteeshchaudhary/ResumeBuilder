
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import LandingPage from '../pages/LandingPage';
import ContactSupport from '../pages/ContactSupport';
import Navbar from '../components/Navbar';
import ProcessingPage from '../components/ProcessingPage';
import UserLogin from '../pages/user/UserLogin';
import ResumeGrader from '../pages/user/ResumeGrader';
import AdditionalInfo from '../pages/user/AdditionalInfo';
import UserSignUp from '../pages/user/UserSignUp';
import Nav1 from '../components/Nav1';
import { AuthContext } from "../auth/AuthContext";
import NotFound from '../pages/NotFound';
import GradeResults from '../pages/user/GradeResults';
import OverAllRating from '../pages/user/OverAllRating';
import Footer from '../components/Footer';
import ResumeEditor from '../pages/user/ResumeEditor';
import CheckoutPage from '../pages/CheckoutPage';
import ResumeBuilderExisting from '../pages/user/resumebuilder/ResumeBuilderExisting';
import ResumeDataEditorOption from '../pages/user/ResumeDataEditorOption';


import PersonalDetailsPage from '../pages/user/resumebuilder/PersonalDetailsPage';
import EducationPage from '../pages/user/resumebuilder/EducationPage';
import ExperiencesPage from '../pages/user/resumebuilder/ExperiencesPage';
import ProjectPage from '../pages/user/resumebuilder/ProjectPage';
import AchievementPage from '../pages/user/resumebuilder/AchievementPage';
import CertificationPage from '../pages/user/resumebuilder/CertificationPage';
import ResearchPublicationPage from '../pages/user/resumebuilder/ResearchPublicationPage';
import SkillsPage from '../pages/user/resumebuilder/SkillsPage';
import ResumePipeline from '../pages/user/ResumePipeline';
import ResumeWithAi from '../pages/user/ResumeWithAi';
import FlowchartJSONBuilder from '../pages/user/FlowchartJSONBuilder';
import ApplicationsList from '../pages/user/ApplicationsList';
import JobListings from '../pages/user/JobListings';
import TransactionHistory from '../pages/TransactionHistory';
import PaymentStatus from '../pages/PaymentStatus';
import JobApplicationForm from '../pages/user/JobApplicationForm';
import ResumeEditorForm from '../pages/user/ResumeEditorForm';
import ProfilePage from '../pages/user/ProfilePage';
import NewUserDashboard from '../pages/user/NewUserDashboard';
import NewResumeBuilderOptionsPage from '../pages/user/NewResumeBuilderOptionsPage';
import NewPricingPage from '../pages/NewPricingPage';
import SponsorshipPricingPage from '../pages/SponsorshipPricingPage';
import InterviewPrep from '../pages/user/InterviewPrep';
import InterviewPracticePage from '../pages/user/InterviewPracticePage';
import AiInterview from '../pages/user/interview/AiInterview';
import ReferralPage from '../pages/user/ReferralPage';


export default function UserRoutes() {
  const { authState, login } = useContext(AuthContext);
  const [error, setError] = useState('');
  console.log(authState.isAuthenticated, localStorage.getItem("accessToken"));
  useEffect(() => {
    if (authState.isAuthenticated && localStorage.getItem("accessToken")) {
      console.log("authenticated");
    }
  }, [authState.isAuthenticated, localStorage.getItem("accessToken")]);

  return (
    <>
      <div className="App" style={{ height: "100vh", width: "100vw", padding: 0, margin: 0, overflowX: "hidden" }}>
        {authState.isAuthenticated && localStorage.getItem("accessToken") ? <Navbar /> : <Nav1 />}
        <Routes>
          {/* <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignUp />} /> */}
          <Route path="login" element={<UserLogin />} />
          <Route path="signup" element={<UserSignUp />} />
          
          <Route path="pricing" element={<NewPricingPage isFooter={false} isNav={false} />} />
          <Route path="sponsorship" element={<SponsorshipPricingPage isFooter={false} isNav={false} />} />
          {/* <Route path="resumebuilder/flowchart" element={<FlowchartJSONBuilder/>} /> */}

          {authState.isAuthenticated && authState.isEnterprise === false ? (
            <>
              {/* <Route path="profile" element={<Profile />} /> */}
              <Route path="" element={<NewUserDashboard />} />

              <Route path="checkout" element={<CheckoutPage />} />
              
              <Route path="resumegrader" element={<ResumeGrader />} />
              <Route path="overallrating" element={<OverAllRating />} />
              <Route path="resumebuilder/resumewithai" element={<ResumeWithAi />} />
              <Route path="resumebuilder" element={<NewResumeBuilderOptionsPage />} />
              <Route path="resumebuilder/existing" element={<ResumeBuilderExisting />} />
              <Route path="resumebuilder/storeddata" element={<ResumePipeline />} />
              <Route path="resumebuilder/flowchart" element={<FlowchartJSONBuilder />} />
              <Route path="resumeeditor" element={<ResumeEditor />} />
              <Route path="resumeeditorform" element={<ResumeEditorForm />} />
              <Route path="additionalinfo" element={<AdditionalInfo />} />
              <Route path="results" element={<GradeResults />} />
              <Route path="transactions" element={<TransactionHistory />} />

              <Route path="profile" element={<ProfilePage />} />

              <Route path="applicationstatus" element={<ApplicationsList />} />
              <Route path="jobsl" element={<JobListings />} />
              <Route path="jobapplicationform/:id" element={<JobApplicationForm />} />

              <Route path="ai-interview-prep" element={<AiInterview />} />
              <Route path="interviewprep" element={<InterviewPrep />} />
              <Route path="interview-practice" element={<InterviewPracticePage />} />
              <Route path="test-interview" element={<div>Test Interview Page Works!</div>} />
              
              <Route path="referral" element={<ReferralPage />} />

              <Route path="edit/options" element={<ResumeDataEditorOption />} />
              <Route path="edit/education" element={<EducationPage />} />
              <Route path="edit/experience" element={<ExperiencesPage />} />
              <Route path="edit/skills" element={<SkillsPage />} />
              <Route path="edit/personal" element={<PersonalDetailsPage />} />
              <Route path="edit/projects" element={<ProjectPage />} />
              <Route path="edit/publications" element={<ResearchPublicationPage />} />
              <Route path="edit/achievements" element={<AchievementPage />} />
              <Route path="edit/certifications" element={<CertificationPage />} />
              <Route path="/payment-status" element={<PaymentStatus />} />

              <Route path="*" element={<NotFound />} />
            </>
          ) : <Route path="*" element={<NotFound />} />}
        </Routes>
        <Footer />
      </div>
    </>
  );
}
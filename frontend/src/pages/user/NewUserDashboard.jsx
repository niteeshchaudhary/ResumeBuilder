import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../auth/AuthContext';
import { overallRatingImage, resumedradeImage, resumeBuilderImage, iwprep } from "../../assets/Images";
import Footer from "../../components/Footer";
import UpgradeButton from '../../components/UpgradeButton';
import InterviewBookingModal from '../../components/InterviewBookingModal';
const mode = import.meta.env.VITE_MODE; 

const subscriptions = {
    1: "Free",
    2: "Standard",
    3: "Premium",
    4: "Early Access"
};

const callouts = [
    {
        "name": "Resume Grader",
        "description": "Get instant feedback on your resume with AI-powered analysis",
        "imageSrc": resumedradeImage,
        "imageAlt": "resume score",
        "href": "/u/resumegrader",
        "subscription": 1,
        "icon": "📊",
        "color": "from-blue-500 to-blue-600"
    },
    {
        "name": "Overall Rating",
        "description": "Comprehensive resume evaluation with detailed insights",
        "imageSrc": overallRatingImage,
        "imageAlt": "overall rating",
        "href": "/u/overallrating",
        "subscription": 1,
        "icon": "⭐",
        "color": "from-yellow-500 to-orange-500"
    },
    {
        "name": "Resume Builder",
        "description": "Create professional resumes with our intuitive builder",
        "imageSrc": resumeBuilderImage,
        "imageAlt": "build resume",
        "href": "/u/resumebuilder",
        "subscription": 1,
        "icon": "📝",
        "color": "from-green-500 to-green-600"
    },
    {
        "name": "Find Jobs",
        "description": "Discover the latest job opportunities tailored for you",
        "imageSrc": "https://i0.wp.com/davynr.ac.in/wp-content/uploads/2018/05/Job-Openings-1.png?resize=344%2C256&ssl=1",
        "imageAlt": "Jobs",
        "href": "/u/jobsl",
        "subscription": 2,
        "icon": "💼",
        "color": "from-purple-500 to-purple-600"
    },
    {
        "name": "My Applications",
        "description": "Track and manage your job application progress",
        "imageSrc": "https://danstutorials.com/wp-content/uploads/2023/11/xe21ofrpqvk.jpg",
        "imageAlt": "app status",
        "href": "/u/applicationstatus",
        "subscription": 2,
        "icon": "📋",
        "color": "from-indigo-500 to-indigo-600"
    },
    {
        "name": "Interview Prep",
        "description": "Prepare for your interviews with our tools!",
        "imageSrc": iwprep,
        "imageAlt": "interview preparation",
        "href": "/u/interviewprep",
        "subscription": 4,
        "icon": "💬",
        "color": "from-red-500 to-red-600"
    },
    {
        "name": "Referral Program",
        "description": "Earn rewards by referring friends and family",
        "imageSrc": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs0MMOZ6wIcp1eMAz4y2dTnftHToYGWtd69w&s",
        "imageAlt": "referral program",
        "href": "#",
        "subscription": 1,
        "icon": "🎁",
        "color": "from-purple-500 to-purple-600",
        "isReferral": true
    }
];

export default function NewUserDashboard() {
    const navigator = useNavigate();
    const { authState, refreshToken, logout } = useContext(AuthContext);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

    const getPlanBadge = (planId) => {
        const colors = {
            1: 'bg-gray-100 text-gray-800 border-gray-300',
            2: 'bg-blue-100 text-blue-800 border-blue-300',
            3: 'bg-purple-100 text-purple-800 border-purple-300'
        };
        const icons = {
            1: '🆓',
            2: '⭐',
            3: '👑'
        };

        return (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[planId]}`}>
                <span className="mr-1">{icons[planId]}</span>
                {subscriptions[planId]} Plan
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-10"></div>
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex justify-center items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-3xl">🚀</span>
                            </div>
                            {getPlanBadge(authState?.userDetails?.active_plan || 1)}
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Welcome to Resume Upgrader
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Transform your career with AI-powered resume analysis, job matching, and interview preparation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="relative z-2 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">5</p>
                                <p className="text-sm text-gray-600">Available Tools</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    {authState.userDetails.active_plan === 1 ? '3' : '5'}
                                </p>
                                <p className="text-sm text-gray-600">Accessible Features</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{subscriptions[authState.userDetails.active_plan]}</p>
                                <p className="text-sm text-gray-600">Current Plan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Features Grid */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Career Tools</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Everything you need to create outstanding resumes and land your dream job
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {callouts.map((callout) => {
                        const isAccessible = (mode=="dev" || callout.subscription!==4 || authState.userDetails.active_plan==4)&&( authState.userDetails.active_plan !== 1 || callout.subscription === 1);

                        return (
                            <div
                                key={callout.name}
                                className={`group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 ${isAccessible
                                    ? 'hover:shadow-xl hover:-translate-y-2 cursor-pointer'
                                    : 'opacity-60'
                                    }`}
                                onClick={() => {
                                    if (isAccessible) {
                                        if (callout.isReferral) {
                                            navigator('/u/referral');
                                        } else {
                                            navigator(callout.href);
                                        }
                                    }
                                }}
                            >
                                {/* Feature Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-r ${callout.color} opacity-20`}></div>
                                    <img
                                        src={callout.imageSrc}
                                        alt={callout.imageAlt}
                                        className={`h-full w-full object-cover transition-transform duration-300 ${isAccessible ? 'group-hover:scale-105' : ''
                                            }`}
                                    />

                                    {/* Feature Icon */}
                                    <div className="absolute top-4 left-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center">
                                            <span className="text-2xl">{callout.icon}</span>
                                        </div>
                                    </div>

                                    {/* Premium Badge */}
                                    {!isAccessible && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 mx-auto">
                                                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <p className="text-white font-semibold text-sm">
                                                    Upgrade to {subscriptions[callout.subscription]}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Feature Content */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {callout.name}
                                        </h3>
                                        {isAccessible && (
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </div>

                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {callout.description}
                                    </p>

                                    {/* Feature Status */}
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isAccessible
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {isAccessible ? '✓ Available' : `🔒 ${subscriptions[callout.subscription]} Required`}
                                        </div>

                                        {isAccessible && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator(callout.href);
                                                }}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Get Started →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Upgrade CTA for Free Users */}
                {authState.userDetails.active_plan === 1 && (
                    <div className="mt-16 text-center">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                            <h3 className="text-2xl font-bold mb-4">Unlock Your Full Potential</h3>
                            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                                Upgrade to Standard or Premium to access advanced features like job search and application tracking
                            </p>
                            <div className="flex justify-center text-black">
                                <UpgradeButton usertype={"u"} />
                            </div>
                            {/* <UpgradeButton usertype={"u"} /> */}
                            {/* <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                                Upgrade Now
                            </button> */}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Interview Booking Modal */}
            <InterviewBookingModal 
                isOpen={isInterviewModalOpen}
                onClose={() => setIsInterviewModalOpen(false)}
            />

        </div>
    );
}
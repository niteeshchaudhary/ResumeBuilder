import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../auth/AuthContext';
import Footer from "../../components/Footer";


import { FiArrowRight, FiStar, FiZap, FiAward, FiBriefcase, FiFileText, FiCheckCircle, FiLock } from 'react-icons/fi';


export default function InterviewPrep() {
    const navigator = useNavigate();
    const { authState } = useContext(AuthContext);



    const interviewPrepOptions = [
        {
            id: "manual",
            name: "Manual Interview Prep",
            description: "Practice with curated interview questions and prepare your responses manually",
            icon: "📝",
            color: "from-blue-500 to-blue-600",
            features: [
                "Common interview questions by industry",
                "Behavioral question examples",
                "Technical interview preparation",
                "Response templates and tips",
                "Practice with sample scenarios"
            ],
            href: "/u/interview-practice"
        },
        {
            id: "ai",
            name: "AI Interview Prep",
            description: "Get AI-powered interview practice with real-time feedback and suggestions",
            icon: "🤖",
            color: "from-purple-500 to-purple-600",
            features: [
                "AI-powered mock interviews",
                "Real-time response analysis",
                "Personalized feedback and suggestions",
                "Industry-specific questions",
                "Performance tracking and improvement tips"
            ],
            href: "/u/ai-interview-prep"
        }
    ];

    const handleOptionSelect = (option) => {
        // Navigate to the selected option after a brief delay for visual feedback
        setTimeout(() => {
            navigator(option.href);
        }, 300);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header Section */}
            <div className="relative overflow-hidden">
                 {/* Back Button */}
                 {/* Back Button */}
                <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => navigator("/u/")}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 bg-black bg-opacity-20 px-3 py-2 rounded-lg backdrop-blur-sm"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-700 opacity-10"></div>
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex justify-center items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-2xl">💬</span>
                            </div>
                            <div className="text-left">
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    Interview Preparation
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Choose your preferred way to prepare for interviews
                                </p>
                            </div>
                        </div>


                        {/* Plan Badge */}
                        <div className="flex justify-center mb-8">
                            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-300">
                                <span className="mr-2">👑</span>
                                Early Access Feature
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
                <div className="text-center mb-12">
                    {/* <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Prep Method</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Whether you prefer structured manual preparation or AI-powered practice, 
                        we have the tools to help you ace your interviews
                    </p> */}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {interviewPrepOptions.map((option) => (
                        <div
                            key={option.id}
                            className="group relative bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:border-purple-300"
                            onClick={() => handleOptionSelect(option)}
                        >
                            {/* Header with Icon */}
                            <div className={`relative h-32 bg-gradient-to-r ${option.color} p-6`}>
                                <div className="flex items-center justify-between">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        <span className="text-3xl">{option.icon}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    {option.name}
                                </h3>
                                <p className="text-gray-600 text-base leading-relaxed mb-6">
                                    {option.description}
                                </p>

                                {/* Features List */}
                                <div className="space-y-3 mb-6">
                                    {option.features.map((feature, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-700 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <button
                                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r ${option.color} hover:shadow-lg`}
                                >
                                    Get Started
                                </button>
                            </div>


                        </div>
                    ))}
                </div>

                {/* Additional Info Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Prepare for Interviews?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Boost Confidence</h4>
                                <p className="text-gray-600 text-sm">Practice builds confidence and reduces interview anxiety</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Improve Skills</h4>
                                <p className="text-gray-600 text-sm">Develop better communication and problem-solving abilities</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Save Time</h4>
                                <p className="text-gray-600 text-sm">Structured preparation saves time and increases success rate</p>
                            </div>
                        </div>
                    </div>
                </div>

               
            </div>

        </div>
    );
}

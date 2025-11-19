import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../../auth/AuthContext';
import { overallRatingImage, resumedradeImage, resumeBuilderImage, iwprep } from "../../assets/Images";
import Footer from "../../components/Footer";

import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiZap, FiAward, FiBriefcase, FiFileText, FiCheckCircle, FiLock, FiCalendar } from 'react-icons/fi';

const subscriptions = {
    1: { name: "Free", color: "bg-gray-100 text-gray-800 border-gray-300" },
    2: { name: "Standard", color: "bg-blue-100 text-blue-800 border-blue-300" },
    3: { name: "Premium", color: "bg-purple-100 text-purple-800 border-purple-300" },
    4: { name: "Early Access", color: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent" }
};

const callouts = [
    {
        name: "Resume Grader",
        description: "Get instant feedback on your resume with AI-powered analysis",
        imageSrc: resumedradeImage,
        imageAlt: "resume score",
        href: "/u/resumegrader",
        subscription: 1,
        icon: <FiFileText className="w-6 h-6 text-blue-500" />,
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        name: "Overall Rating",
        description: "Comprehensive resume evaluation with detailed insights",
        imageSrc: overallRatingImage,
        imageAlt: "overall rating",
        href: "/u/overallrating",
        subscription: 1,
        icon: <FiStar className="w-6 h-6 text-yellow-500" />,
        color: "from-yellow-400 to-yellow-600",
        bgColor: "bg-yellow-50"
    },
    {
        name: "Resume Builder",
        description: "Create professional resumes with our intuitive builder",
        imageSrc: resumeBuilderImage,
        imageAlt: "build resume",
        href: "/u/resumebuilder",
        subscription: 1,
        icon: <FiFileText className="w-6 h-6 text-green-500" />,
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-50"
    },
    {
        name: "Find Jobs",
        description: "Discover the latest job opportunities tailored for you",
        imageSrc: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        imageAlt: "Jobs",
        href: "/u/jobl",
        subscription: 2,
        icon: <FiBriefcase className="w-6 h-6 text-purple-500" />,
        color: "from-purple-500 to-indigo-600",
        bgColor: "bg-purple-50"
    },
    {
        name: "My Applications",
        description: "Track and manage your job application progress",
        imageSrc: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        imageAlt: "app status",
        href: "/u/applicationstatus",
        subscription: 2,
        icon: <FiAward className="w-6 h-6 text-indigo-500" />,
        color: "from-indigo-500 to-blue-600",
        bgColor: "bg-indigo-50"
    },
    {
        name: "Interview Prep",
        description: "Prepare for your interviews with our tools!",
        imageSrc: iwprep || "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        imageAlt: "interview preparation",
        href: "interviewprep",
        subscription: 4,
        icon: <FiZap className="w-6 h-6 text-red-500" />,
        color: "from-red-500 to-orange-500",
        bgColor: "bg-red-50"
    }
];

// Animation variants for Framer Motion
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function getPlanBadge(planId) {
    const plan = subscriptions[planId] || subscriptions[1];
    return (
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${plan.color} border`}>
            {plan.name} Plan
        </span>
    );
}

export default function NewUserDashboard() {
    const navigate = useNavigate();
    const { authState } = useContext(AuthContext);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                <div className="text-center">
                    <motion.div
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        className="text-5xl mb-4"
                    >
                        🚀
                    </motion.div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-gray-600 text-lg"
                    >
                        Preparing your dashboard...
                    </motion.p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={container}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"
        >
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-5"></div>
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                    <motion.div 
                        variants={item}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
                    >
                        <div className="flex-1">
                            <motion.div 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="inline-flex items-center gap-3 mb-4"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-2xl md:text-3xl">🚀</span>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        Welcome back, {authState?.user?.name || 'User'}!
                                    </h1>
                                    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                        Welcome to your career advancement hub. Access powerful tools to enhance your resume, 
                                        track applications, and land your dream job.
                                    </p>
                                    
                                    
                                </motion.div>
                            </motion.div>
                        </div>
                        
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="w-full md:w-auto"
                        >
                            {getPlanBadge(authState?.user?.subscription_id || 1)}
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Features Grid */}
                <section className="py-8">
                    <motion.div 
                        variants={container}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {callouts.map((callout) => {
                            const isAccessible = callout.subscription <= (authState?.user?.subscription_id || 1);
                            
                            return (
                                <motion.div
                                    key={callout.name}
                                    variants={item}
                                    className={`group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl ${!isAccessible ? 'opacity-75' : 'hover:border-blue-200'}`}
                                >
                                    {/* Subscription Badge */}
                                    {callout.subscription > 1 && (
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${subscriptions[callout.subscription]?.color || 'bg-gray-100 text-gray-800'}`}>
                                                {subscriptions[callout.subscription]?.name}
                                            </span>
                                        </div>
                                    )}

                                    <div className="relative h-48 overflow-hidden group-hover:shadow-md transition-all duration-300">
                                        <img
                                            src={callout.imageSrc}
                                            alt={callout.imageAlt}
                                            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-white drop-shadow-md">
                                                    {callout.name}
                                                </h3>
                                                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                                                    {callout.icon}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6">
                                        <p className="text-gray-600 mb-6">{callout.description}</p>
                                        
                                        <div className="mt-auto">
                                            <Link
                                                to={isAccessible ? callout.href : '#'}
                                                onClick={(e) => !isAccessible && e.preventDefault()}
                                                className={`inline-flex items-center font-medium text-sm ${!isAccessible ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-500 group'}`}
                                            >
                                                {!isAccessible ? 'Upgrade to access' : 'Get started'}
                                                <FiArrowRight className={`ml-2 transition-transform duration-200 ${isAccessible ? 'group-hover:translate-x-1' : ''}`} />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>

                {/* Upgrade CTA for Free Users */}
                {authState?.user?.subscription_id === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12"
                    >
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 md:p-12 shadow-xl">
                            {/* Decorative elements */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
                            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-white/10 rounded-full"></div>
                            
                            <div className="relative z-10 text-center max-w-4xl mx-auto">
                                <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
                                    Unlock Your Full Potential
                                </h3>
                                <p className="text-lg text-indigo-100 mb-8 max-w-3xl mx-auto">
                                    Upgrade to Premium and get access to all our career tools, job matching, and interview preparation resources.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link
                                        to="/pricing"
                                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200 transform hover:-translate-y-0.5"
                                    >
                                        View Pricing Plans
                                        <FiArrowRight className="ml-2 -mr-1 w-5 h-5" />
                                    </Link>
                                    <Link
                                        to="/features"
                                        className="inline-flex items-center justify-center px-6 py-3 border border-white/20 text-base font-medium rounded-xl text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 transition-colors duration-200"
                                    >
                                        Explore Features
                                    </Link>
                                </div>
                                <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-indigo-100">
                                    <div className="flex items-center">
                                        <FiCheckCircle className="h-5 w-5 text-green-300 mr-2" />
                                        <span>7-day free trial</span>
                                    </div>
                                    <div className="h-4 w-px bg-white/30"></div>
                                    <div className="flex items-center">
                                        <FiCheckCircle className="h-5 w-5 text-green-300 mr-2" />
                                        <span>Cancel anytime</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <Footer />
            
         
        </motion.div>
    );
}

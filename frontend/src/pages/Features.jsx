import React from 'react';
import { motion } from 'framer-motion';
import Nav2 from '../components/Nav2';
import Footer from '../components/Footer';
import { f1img, f2img, f3img, f4img, resumeimage } from '../assets/Images';
import { 
  StarIcon, 
  DocumentTextIcon, 
  SparklesIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CogIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  VideoCameraIcon,
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const features = [
    // Resume Building & Creation
    {
        title: "AI-Powered Resume Builder",
        description: "Create stunning, professional resumes from scratch with our intelligent AI assistant. Our platform guides you through every step, from personal details to professional achievements, ensuring your resume stands out in today's competitive job market.",
        icon: f3img,
        benefits: ["Step-by-step guidance", "Real-time previews", "Expert tips", "Interactive prompts", "Multiple templates"],
        color: "from-green-500 to-emerald-500",
        category: "Resume Building"
    },
    {
        title: "Professional Resume Templates",
        description: "Choose from a curated collection of modern, ATS-friendly resume templates designed by industry experts. Each template is optimized for different industries and career levels, ensuring maximum impact.",
        icon: f2img,
        benefits: ["20+ premium designs", "Industry-specific layouts", "Customizable styling", "ATS-optimized", "Professional appearance"],
        color: "from-blue-500 to-indigo-500",
        category: "Resume Building"
    },
    {
        title: "Resume from Stored Data",
        description: "Build resumes using your previously saved information. Perfect for creating multiple versions or updating existing resumes with new experiences and achievements.",
        icon: f1img,
        benefits: ["Data persistence", "Quick updates", "Multiple versions", "Time-saving", "Consistent formatting"],
        color: "from-purple-500 to-pink-500",
        category: "Resume Building"
    },
    {
        title: "LaTeX Resume Generation",
        description: "Generate high-quality PDF resumes using LaTeX templates. Perfect for technical professionals who need precise formatting and mathematical notation support.",
        icon: f4img,
        benefits: ["High-quality PDFs", "Mathematical notation", "Precise formatting", "Professional output", "Multiple templates"],
        color: "from-orange-500 to-red-500",
        category: "Resume Building"
    },

    // AI Analysis & Grading
    {
        title: "AI Resume Grading",
        description: "Get comprehensive feedback on your resume with our advanced AI analysis. Our system evaluates structure, content, and alignment with industry standards, providing actionable suggestions for improvement.",
        icon: f1img,
        benefits: ["Section-wise feedback", "Missing elements detection", "Actionable suggestions", "Industry standards alignment", "Score out of 10"],
        color: "from-purple-500 to-pink-500",
        category: "AI Analysis"
    },
    {
        title: "Overall Resume Rating",
        description: "Receive a holistic assessment of your resume's performance based on readability, keyword density, relevance, and formatting. Get detailed insights to improve your chances of landing interviews.",
        icon: f2img,
        benefits: ["Readability analysis", "Keyword density check", "Relevance scoring", "Formatting assessment", "Comprehensive feedback"],
        color: "from-blue-500 to-indigo-500",
        category: "AI Analysis"
    },
    {
        title: "Job-Specific Resume Analysis",
        description: "Analyze your resume against specific job descriptions to identify gaps and opportunities. Our AI provides targeted recommendations to make your resume more relevant for specific positions.",
        icon: f3img,
        benefits: ["Job description matching", "Gap identification", "Targeted recommendations", "Skill alignment", "Role-specific tips"],
        color: "from-green-500 to-emerald-500",
        category: "AI Analysis"
    },
    {
        title: "AI-Generated Resume Content",
        description: "Let our AI create resume content based on job descriptions. Perfect for career changers or when you need to highlight specific skills and experiences for a particular role.",
        icon: f4img,
        benefits: ["AI-generated content", "Job-specific focus", "Skill optimization", "Experience highlighting", "Professional language"],
        color: "from-orange-500 to-red-500",
        category: "AI Analysis"
    },

    // Job Search & Matching
    {
        title: "AI-Powered Job Matching",
        description: "Discover opportunities that perfectly align with your skills, experience, and career goals. Our intelligent system analyzes your resume and recommends personalized job openings.",
        icon: f4img,
        benefits: ["AI-powered matching", "Personalized recommendations", "Skill-based filtering", "Time-saving search", "Relevant opportunities"],
        color: "from-orange-500 to-red-500",
        category: "Job Search"
    },
    {
        title: "Multi-Source Job Scraping",
        description: "Access jobs from LinkedIn, Indeed, Glassdoor, and more through our automated scraping system. Get fresh job listings every 2 hours with comprehensive filtering options.",
        icon: f1img,
        benefits: ["Multiple sources", "Real-time updates", "Advanced filtering", "Salary information", "Automated scraping"],
        color: "from-purple-500 to-pink-500",
        category: "Job Search"
    },
    {
        title: "Enhanced Salary Information",
        description: "Get comprehensive salary data from multiple sources including Glassdoor, AmbitionBox, and PayScale. Make informed decisions about compensation expectations and negotiations.",
        icon: f2img,
        benefits: ["Multi-source data", "Salary ranges", "Market insights", "Negotiation support", "Industry benchmarks"],
        color: "from-blue-500 to-indigo-500",
        category: "Job Search"
    },
    {
        title: "Job Application Tracking",
        description: "Keep track of all your job applications in one place. Monitor application status, follow up on opportunities, and never miss important deadlines.",
        icon: f3img,
        benefits: ["Application tracking", "Status monitoring", "Follow-up reminders", "Deadline management", "Progress tracking"],
        color: "from-green-500 to-emerald-500",
        category: "Job Search"
    },

    // Enterprise Features
    // {
    //     title: "Enterprise Job Posting",
    //     description: "Post job opportunities and manage applications through our comprehensive enterprise platform. Perfect for companies looking to hire top talent efficiently.",
    //     icon: f1img,
    //     benefits: ["Job posting", "Application management", "Candidate screening", "Resume filtering", "Enterprise dashboard"],
    //     color: "from-purple-500 to-pink-500",
    //     category: "Enterprise"
    // },
    // {
    //     title: "Resume Screening & Filtering",
    //     description: "Efficiently screen and filter resumes using AI-powered analysis. Identify the best candidates based on skills, experience, and job requirements.",
    //     icon: f2img,
    //     benefits: ["AI screening", "Smart filtering", "Candidate ranking", "Skill matching", "Efficient hiring"],
    //     color: "from-blue-500 to-indigo-500",
    //     category: "Enterprise"
    // },
    // {
    //     title: "Bulk Resume Processing",
    //     description: "Process multiple resumes simultaneously for large-scale hiring. Our system handles bulk operations efficiently while maintaining quality and accuracy.",
    //     icon: f3img,
    //     benefits: ["Bulk processing", "Scalable operations", "Quality maintenance", "Time efficiency", "Cost reduction"],
    //     color: "from-green-500 to-emerald-500",
    //     category: "Enterprise"
    // },

    // Career Development
    {
        title: "Interview Preparation",
        description: "Prepare for interviews with our comprehensive resources. Get tips, practice questions, and guidance to ace your next interview.",
        icon: f1img,
        benefits: ["Interview tips", "Practice questions", "Industry insights", "Confidence building", "Success strategies"],
        color: "from-purple-500 to-pink-500",
        category: "Career Development"
    },
    {
        title: "Career Guidance & Tips",
        description: "Access expert career advice and industry insights. Learn about career paths, skill development, and professional growth strategies.",
        icon: f2img,
        benefits: ["Expert advice", "Career paths", "Skill development", "Industry insights", "Growth strategies"],
        color: "from-blue-500 to-indigo-500",
        category: "Career Development"
    },
    {
        title: "Skill Assessment & Development",
        description: "Assess your current skills and identify areas for improvement. Get personalized recommendations for skill development and career advancement.",
        icon: f3img,
        benefits: ["Skill assessment", "Development plans", "Personalized recommendations", "Progress tracking", "Career advancement"],
        color: "from-green-500 to-emerald-500",
        category: "Career Development"
    },

    // Advanced Features
    {
        title: "Resume Pipeline Management",
        description: "Manage your resume creation process with our pipeline system. Track progress, save drafts, and collaborate on resume development.",
        icon: f4img,
        benefits: ["Pipeline management", "Progress tracking", "Draft saving", "Collaboration", "Workflow optimization"],
        color: "from-orange-500 to-red-500",
        category: "Advanced Features"
    },
    {
        title: "Custom Resume Sections",
        description: "Create custom sections for your resume including achievements, publications, certifications, and more. Tailor your resume to specific industries and roles.",
        icon: f1img,
        benefits: ["Custom sections", "Industry tailoring", "Flexible formatting", "Professional presentation", "Role-specific content"],
        color: "from-purple-500 to-pink-500",
        category: "Advanced Features"
    },
    {
        title: "Resume Analytics & Insights",
        description: "Get detailed analytics about your resume performance. Understand how recruiters view your resume and optimize for better results.",
        icon: f2img,
        benefits: ["Performance analytics", "Recruiter insights", "Optimization tips", "Data-driven decisions", "Continuous improvement"],
        color: "from-blue-500 to-indigo-500",
        category: "Advanced Features"
    }
];

const Features = () => {
    // Group features by category
    const groupedFeatures = features.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {});

    const categories = [
        { name: "Resume Building", icon: DocumentTextIcon, color: "from-green-500 to-emerald-500" },
        { name: "AI Analysis", icon: SparklesIcon, color: "from-purple-500 to-pink-500" },
        { name: "Job Search", icon: MagnifyingGlassIcon, color: "from-blue-500 to-indigo-500" },
        // { name: "Enterprise", icon: BuildingOfficeIcon, color: "from-orange-500 to-red-500" },
        { name: "Career Development", icon: AcademicCapIcon, color: "from-teal-500 to-cyan-500" },
        { name: "Advanced Features", icon: CogIcon, color: "from-indigo-500 to-purple-500" }
    ];

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-violet-50 via-white to-blue-50">
            <Nav2 isSignup={true} />

            {/* Hero Section */}
            <div className="pt-28 px-4 sm:px-10 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 text-sm font-medium text-purple-800 mb-6">
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Comprehensive Feature Suite
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Everything You Need to
                        <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Succeed
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Discover our comprehensive suite of AI-powered tools designed to transform your resume, accelerate your job search, and advance your career.
                    </p>
                </motion.div>
            </div>

            {/* Features by Category */}
            <div className="px-4 sm:px-10 pb-20">
                <div className="mx-auto space-y-20">
                    {categories.map((category, categoryIndex) => (
                        <motion.div
                            key={category.name}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
                        >
                            {/* Category Header */}
                            <div className="text-center mb-16">
                                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl mb-6`}>
                                    <category.icon className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{category.name}</h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    {category.name === "Resume Building" && "Create stunning, professional resumes with our comprehensive building tools"}
                                    {category.name === "AI Analysis" && "Get intelligent insights and feedback to optimize your resume"}
                                    {category.name === "Job Search" && "Discover opportunities that match your skills and career goals"}
                                    {category.name === "Enterprise" && "Powerful tools for companies to find and hire top talent"}
                                    {category.name === "Career Development" && "Grow your career with expert guidance and skill development"}
                                    {category.name === "Advanced Features" && "Advanced tools for power users and professionals"}
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {groupedFeatures[category.name]?.map((feature, index) => (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                    >
                                        <FeatureCard
                                            title={feature.title}
                                            description={feature.description}
                                            icon={feature.icon}
                                            benefits={feature.benefits}
                                            color={feature.color}
                                            index={index}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="px-4 sm:px-10 pb-20"
            >
                <div className=" mx-auto">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-fuchsia-600 p-12 text-white shadow-2xl">
                        <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(500px_300px_at_10%_10%,white,transparent)]" />
                        <div className="relative text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Career?</h2>
                            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                                Join thousands of professionals who have already upgraded their careers with our comprehensive AI-powered platform.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a 
                                    href="/u/login" 
                                    className="group inline-flex items-center px-8 py-4 bg-white text-purple-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    Get Started Free
                                    <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </a>
                                <a 
                                    href="/about" 
                                    className="text-white/90 hover:text-white font-semibold transition-colors duration-200"
                                >
                                    Learn More →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <Footer />
        </div>
    );
};

export default Features;

const FeatureCard = ({ title, description, icon, benefits, color, index }) => {
    return (
        <div className="relative group">
            {/* Background decoration */}
            <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-5 rounded-3xl blur-3xl group-hover:opacity-10 transition-opacity duration-300`} />
            
            <div className="relative bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}>
                        <img src={icon} alt={title} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-6">{description}</p>

                {/* Benefits */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Key Benefits:</h4>
                    <div className="grid grid-cols-1 gap-2">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center space-x-3">
                                <div className={`w-2 h-2 bg-gradient-to-r ${color} rounded-full flex-shrink-0`} />
                                <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                <div className="pt-6">
                    <a 
                        href="/u/login" 
                        className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${color} text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                    >
                        Try This Feature
                        <ArrowRightIcon className="ml-2 w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
};

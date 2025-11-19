import React from 'react';
import { motion } from 'framer-motion';
import Nav2 from '../components/Nav2';
import Footer from '../components/Footer';
import { 
  RocketLaunchIcon, 
  HeartIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  UsersIcon, 
  LightBulbIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const AboutUs = () => {
    return (
        <>
            <Nav2 isSignup={true} />
            
            {/* Hero Section */}
            <section className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 px-6 md:px-16">
                <div className="max-w-6xl mx-auto text-center pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 px-4 py-2 text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-6">
                            <StarIcon className="w-4 h-4 mr-2" />
                            About Our Company
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
                            We're Building the Future of
                            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Career Success
                            </span>
                        </h1>
                        
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
                            At Resume Upgrader, we're committed to delivering innovative AI-powered solutions that empower individuals and businesses worldwide. Our journey began with a vision to revolutionize how people build careers and how companies find talent.
                        </p>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
                        >
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">50K+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Resumes Created</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">95%</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-pink-600 dark:text-pink-400">24/7</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">AI Support</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">10K+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
                            </div>
                        </motion.div>

                        {/* Company Highlights */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="mb-16"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg">
                                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <RocketLaunchIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Innovation First</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">Leading the industry with cutting-edge AI technology and innovative solutions for career advancement.</p>
                                </div>
                                
                                <div className="bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <GlobeAltIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Global Reach</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">Serving professionals worldwide with localized solutions and multi-language support.</p>
                                </div>
                                
                                <div className="bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-white/10 shadow-lg">
                                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheckIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Trusted & Secure</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">Enterprise-grade security with SOC 2 compliance and 99.9% uptime guarantee.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Visual Elements & Company Story */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.7 }}
                            className="relative"
                        >
                            {/* Floating decorative elements */}
                            <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                            <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
                            <div className="absolute -bottom-8 -left-12 w-12 h-12 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20 animate-pulse delay-2000"></div>
                            <div className="absolute -bottom-8 -right-12 w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 animate-pulse delay-3000"></div>
                            
                            {/* Company Story Card */}
                            <div className="bg-white/70 dark:bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/30 dark:border-white/20 shadow-xl max-w-4xl mx-auto">
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Our Story</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                        Founded by a team of career experts and AI engineers, Resume Upgrader was born from a simple observation: 
                                        traditional resume building was broken. We set out to create a platform that combines human expertise with 
                                        artificial intelligence to deliver results that speak for themselves.
                                    </p>
                                </div>
                                
                                {/* Timeline */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="text-white font-bold text-lg">2020</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Founded</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">Started with a vision to revolutionize resume building</p>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="text-white font-bold text-lg">2022</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Launch</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">Introduced AI-powered resume analysis and grading</p>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="text-white font-bold text-lg">2024</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Global Scale</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">Serving 50K+ users across 100+ countries</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Values Section */}
            <section className="py-20 px-6 md:px-16 bg-white dark:bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                            Our Core Principles
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            The foundation of everything we do at Resume Upgrader
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Mission */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <InfoCard 
                                title="Our Mission" 
                                color="indigo" 
                                text="To build world-class AI-powered solutions that foster career growth, streamline hiring processes, and inspire success. We aim to provide top-quality services tailored to meet the unique needs of job seekers and employers worldwide."
                                icon={RocketLaunchIcon}
                            />
                        </motion.div>

                        {/* Values */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <InfoCard 
                                title="Our Values" 
                                color="purple" 
                                text="Integrity, innovation, and customer satisfaction are at the heart of everything we do. We believe in transparency, creativity, mutual respect, and continuous improvement."
                                icon={HeartIcon}
                            />
                        </motion.div>

                        {/* What We Do */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <InfoCard 
                                title="What We Do" 
                                color="pink" 
                                text="From AI-powered resume building to intelligent job matching, we help clients solve real-world career challenges through scalable, smart, and impactful solutions."
                                icon={LightBulbIcon}
                            />
                        </motion.div>

                        {/* Privacy */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <InfoCard 
                                title="We Value Privacy" 
                                color="blue" 
                                text="Your data is your own. We prioritize security and compliance, ensuring full transparency and robust protection for every user and enterprise client."
                                icon={ShieldCheckIcon}
                            />
                        </motion.div>

                        {/* Team Culture */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <InfoCard 
                                title="Our Culture" 
                                color="orange" 
                                text="We foster a people-first culture that values curiosity, collaboration, and continuous learning. Our teams are remote-friendly, diversity-driven, and innovation-focused."
                                icon={UsersIcon}
                            />
                        </motion.div>

                        {/* Vision */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <InfoCard 
                                title="Future Vision" 
                                color="fuchsia" 
                                text="To become a globally trusted brand that sets benchmarks in resume intelligence, hiring technology, and career empowerment through AI innovation and human-centered design."
                                icon={GlobeAltIcon}
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-20 px-6 md:px-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                            Why Choose Resume Upgrader?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            We're not just another resume builder - we're your career success partner
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">AI-Powered Intelligence</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Our advanced AI algorithms provide personalized recommendations, smart content suggestions, and intelligent formatting to make your resume stand out.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">ATS-Optimized Templates</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Every template is designed to pass Applicant Tracking Systems, ensuring your resume reaches human recruiters and increases your interview chances.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Comprehensive Career Tools</h3>
                                    <p className="text-gray-600 dark:text-gray-300">From resume building to job matching, interview prep to career guidance - we provide everything you need for career success in one platform.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="space-y-6"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Enterprise Solutions</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Powerful tools for companies to post jobs, screen candidates, and find the perfect talent match using our AI-powered platform.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Data Security & Privacy</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Your personal and professional information is protected with enterprise-grade security, ensuring complete privacy and data protection.</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">24/7 AI Support</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Get instant help and guidance anytime, anywhere. Our AI assistant is always ready to help you create the perfect resume.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="py-20 px-6 md:px-16"
            >
                <div className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-12 text-white shadow-2xl">
                        <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(500px_300px_at_10%_10%,white,transparent)]" />
                        <div className="relative text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Career?</h2>
                            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                                Join thousands of professionals who have already upgraded their careers with our AI-powered platform.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a 
                                    href="/u/login" 
                                    className="group inline-flex items-center px-8 py-4 bg-white text-indigo-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    Get Started Free
                                    <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </a>
                                <a 
                                    href="/features" 
                                    className="text-white/90 hover:text-white font-semibold transition-colors duration-200"
                                >
                                    Explore Features →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            <Footer />
        </>
    );
};

const InfoCard = ({ title, text, color, icon: Icon }) => {
    const colors = {
        indigo: 'from-indigo-500 to-blue-500',
        purple: 'from-purple-500 to-pink-500',
        pink: 'from-pink-500 to-red-500',
        blue: 'from-blue-500 to-indigo-500',
        green: 'from-green-500 to-emerald-500',
        orange: 'from-orange-500 to-red-500',
        fuchsia: 'from-fuchsia-500 to-purple-500',
    };

    return (
        <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/40 dark:border-gray-700/40 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className={`w-16 h-16 bg-gradient-to-r ${colors[color]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{text}</p>
        </div>
    );
};

export default AboutUs;

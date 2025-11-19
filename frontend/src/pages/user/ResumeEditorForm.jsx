
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, TrashIcon, DocumentIcon, CalendarIcon, UserIcon, BriefcaseIcon, AcademicCapIcon, CodeBracketIcon, TrophyIcon, DocumentTextIcon, StarIcon } from '@heroicons/react/24/outline';

const ResumeEditForm = () => {
    const [activeSection, setActiveSection] = useState('personal');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        personal: true,
        summary: false,
        skills: false,
        experience: false,
        education: false,
        projects: false,
        certifications: false,
        publications: false,
        achievements: false
    });

    // Sample resume data structure
    const [resumeData, setResumeData] = useState({
        name: '',
        phonenumber: '',
        email: '',
        emailthumbnail: '',
        linkedin: '',
        linkedinthumbnail: '',
        github: '',
        githubthumbnail: '',
        portfolio: '',
        portfoliothumbnail: '',
        summary: '',
        skills: {
            "Technical Skills": [],
            "Soft Skills": []
        },
        experiences: [
            {
                company: '',
                role: '',
                from_date: new Date(),
                to_date: new Date(),
                location: '',
                currentlyWorking: false,
                details: ['']
            }
        ],
        education: [
            {
                institution: '',
                from_date: 'Jan 2020',
                to_date: 'Dec 2024',
                degree: '',
                fieldOfStudy: '',
                currentlyStudying: false,
                scoreType: 'CGPA',
                score: '',
                coursework: ['']
            }
        ],
        projects: [
            {
                title: '',
                technologies: '',
                from_date: 'Jan 2023',
                to_date: 'Dec 2023',
                details: [''],
                projectLink: ''
            }
        ],
        certifications: [{ name: '', link: '' }],
        publications: [{ title: '', link: '', journel: '', publish_date: '' }],
        achievements: [{ title: '', link: '' }],
        margin: { horizontal: 2, vertical: 2 }
    });

    const [template, setTemplate] = useState('sb2');
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const sections = [
        { id: 'personal', name: 'Personal Info', icon: UserIcon },
        { id: 'summary', name: 'Summary', icon: DocumentTextIcon },
        { id: 'skills', name: 'Skills', icon: CodeBracketIcon },
        { id: 'experience', name: 'Experience', icon: BriefcaseIcon },
        { id: 'education', name: 'Education', icon: AcademicCapIcon },
        { id: 'projects', name: 'Projects', icon: DocumentIcon },
        { id: 'certifications', name: 'Certifications', icon: TrophyIcon },
        { id: 'publications', name: 'Publications', icon: DocumentTextIcon },
        { id: 'achievements', name: 'Achievements', icon: StarIcon }
    ];

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const formatDate = (date) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const year = date.getFullYear();
        const month = months[date.getMonth()];
        return `${month} ${year}`;
    };

    const handleSkillChange = (category, index, value) => {
        const updatedSkills = { ...resumeData.skills };
        updatedSkills[category][index] = value;
        setResumeData({ ...resumeData, skills: updatedSkills });
    };

    const addSkill = (category) => {
        const updatedSkills = { ...resumeData.skills };
        updatedSkills[category].push("");
        setResumeData({ ...resumeData, skills: updatedSkills });
    };

    const removeSkill = (category, index) => {
        const updatedSkills = { ...resumeData.skills };
        updatedSkills[category] = updatedSkills[category].filter((_, i) => i !== index);
        setResumeData({ ...resumeData, skills: updatedSkills });
    };

    const handleExperienceChange = (e, index, field) => {
        const updatedExperiences = resumeData.experiences.map((exp, i) =>
            i === index ? { ...exp, [field]: e.target.value } : exp
        );
        setResumeData({ ...resumeData, experiences: updatedExperiences });
    };

    const addNewExperience = () => {
        setResumeData({
            ...resumeData,
            experiences: [...resumeData.experiences, {
                company: '',
                role: '',
                from_date: new Date(),
                to_date: new Date(),
                location: '',
                currentlyWorking: false,
                details: ['']
            }]
        });
    };

    const compileCode = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API call - replace with your actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

            // Mock PDF URL - replace with actual API response
            const mockPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
            setPdfUrl(mockPdfUrl);
            setShowResult(true);
            setIsSubmitting(false);
        } catch (error) {
            setIsSubmitting(false);
            alert('Error generating resume. Please try again.');
        }
    };

    const handleGoBack = () => {
        setShowResult(false);
        setPdfUrl(null);
    };

    const SectionHeader = ({ section, isExpanded, onToggle }) => {
        const Icon = section.icon;
        return (
            <button
                onClick={() => onToggle(section.id)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
                <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                </div>
                {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
            </button>
        );
    };

    const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false, className = '' }) => (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${className}`}
            />
        </div>
    );

    const TextareaField = ({ label, value, onChange, placeholder, rows = 4, required = false }) => (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-vertical"
            />
        </div>
    );

    // Loading Overlay Component
    const LoadingOverlay = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
                <div className="text-center space-y-6">
                    {/* Loading Animation */}
                    <div className="relative">
                        <div className="w-20 h-20 mx-auto">
                            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse"></div>
                            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                        </div>
                    </div>

                    {/* Loading Text */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">Generating Your Resume</h3>
                        <p className="text-gray-600">Please wait while we process your information...</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-sm">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                    <path d="m6.564.75-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z" />
                                </svg>
                            </div>
                            <span className="text-gray-600">Processing personal information</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                    <path d="m6.564.75-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z" />
                                </svg>
                            </div>
                            <span className="text-gray-600">Formatting sections</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-gray-900 font-medium">Generating PDF document</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                            <span className="text-gray-400">Finalizing resume</span>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-left">
                                <p className="text-sm font-medium text-blue-900">Pro Tip</p>
                                <p className="text-xs text-blue-700">Your resume is being optimized for ATS systems and modern hiring practices.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Result Display Component
    const ResultDisplay = () => (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Generated Successfully!</h1>
                    <p className="text-gray-600">Your professional resume is ready for download and use.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* PDF Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                                <h2 className="text-xl font-bold text-white flex items-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Resume Preview
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '800px' }}>
                                    <iframe
                                        src={pdfUrl}
                                        className="w-full h-full"
                                        title="Resume Preview"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            {/* Download Section */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Download Options</h3>
                                <div className="space-y-3">
                                    <a
                                        href={pdfUrl}
                                        download="resume.pdf"
                                        className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Download PDF</span>
                                    </a>

                                    <button className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                        </svg>
                                        <span>Share Resume</span>
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Resume Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Template:</span>
                                        <span className="font-medium">{template === 'sb2' ? 'Modern' : 'Classic'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Sections:</span>
                                        <span className="font-medium">{Object.values(expandedSections).filter(Boolean).length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Format:</span>
                                        <span className="font-medium">PDF</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Generated:</span>
                                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleGoBack}
                                        className="w-full flex items-center justify-center space-x-3 border-2 border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                        </svg>
                                        <span>Edit Resume</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setPdfUrl(null);
                                            setShowResult(false);
                                            // Reset to a new resume
                                            setResumeData({
                                                name: '',
                                                phonenumber: '',
                                                email: '',
                                                emailthumbnail: '',
                                                linkedin: '',
                                                linkedinthumbnail: '',
                                                github: '',
                                                githubthumbnail: '',
                                                portfolio: '',
                                                portfoliothumbnail: '',
                                                summary: '',
                                                skills: {
                                                    "Technical Skills": [],
                                                    "Soft Skills": []
                                                },
                                                experiences: [{
                                                    company: '',
                                                    role: '',
                                                    from_date: new Date(),
                                                    to_date: new Date(),
                                                    location: '',
                                                    currentlyWorking: false,
                                                    details: ['']
                                                }],
                                                education: [{
                                                    institution: '',
                                                    from_date: 'Jan 2020',
                                                    to_date: 'Dec 2024',
                                                    degree: '',
                                                    fieldOfStudy: '',
                                                    currentlyStudying: false,
                                                    scoreType: 'CGPA',
                                                    score: '',
                                                    coursework: ['']
                                                }],
                                                projects: [{
                                                    title: '',
                                                    technologies: '',
                                                    from_date: 'Jan 2023',
                                                    to_date: 'Dec 2023',
                                                    details: [''],
                                                    projectLink: ''
                                                }],
                                                certifications: [{ name: '', link: '' }],
                                                publications: [{ title: '', link: '', journel: '', publish_date: '' }],
                                                achievements: [{ title: '', link: '' }],
                                                margin: { horizontal: 2, vertical: 2 }
                                            });
                                        }}
                                        className="w-full flex items-center justify-center space-x-3 border-2 border-blue-300 text-blue-600 font-medium py-3 px-4 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>New Resume</span>
                                    </button>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-semibold text-blue-900">Next Steps</h4>
                                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                            <li>• Proofread your resume carefully</li>
                                            <li>• Customize it for each job application</li>
                                            <li>• Keep it updated with new experiences</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Show result page if resume is generated
    if (showResult && pdfUrl) {
        return <ResultDisplay />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
            {/* Loading Overlay */}
            {isSubmitting && <LoadingOverlay />}
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
                            <p className="text-gray-600 mt-1">Create your professional resume with our modern editor</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="sb2">Modern Template</option>
                                <option value="nitp1">Classic Template</option>
                            </select>
                            <button
                                onClick={compileCode}
                                disabled={isSubmitting}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed text-white'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Generating...</span>
                                    </div>
                                ) : (
                                    'Generate Resume'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-8">
                            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
                                <h2 className="text-xl font-bold text-white">Sections</h2>
                            </div>
                            <nav className="space-y-1 p-2">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeSection === section.id
                                                    ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{section.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Personal Information Section */}
                            {activeSection === 'personal' && (
                                <div>
                                    <SectionHeader
                                        section={sections.find(s => s.id === 'personal')}
                                        isExpanded={expandedSections.personal}
                                        onToggle={toggleSection}
                                    />
                                    {expandedSections.personal && (
                                        <div className="p-6 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField
                                                    label="Full Name"
                                                    value={resumeData.name}
                                                    onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                                                    placeholder="John Doe"
                                                    required
                                                />
                                                <InputField
                                                    label="Phone Number"
                                                    type="tel"
                                                    value={resumeData.phonenumber}
                                                    onChange={(e) => setResumeData({ ...resumeData, phonenumber: e.target.value })}
                                                    placeholder="+1 (555) 123-4567"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField
                                                    label="Email Address"
                                                    type="email"
                                                    value={resumeData.email}
                                                    onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                                                    placeholder="john.doe@example.com"
                                                    required
                                                />
                                                <InputField
                                                    label="Email Display Text"
                                                    value={resumeData.emailthumbnail}
                                                    onChange={(e) => setResumeData({ ...resumeData, emailthumbnail: e.target.value })}
                                                    placeholder="john.doe@example.com"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField
                                                    label="LinkedIn URL"
                                                    type="url"
                                                    value={resumeData.linkedin}
                                                    onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                                                    placeholder="https://linkedin.com/in/johndoe"
                                                />
                                                <InputField
                                                    label="LinkedIn Display Text"
                                                    value={resumeData.linkedinthumbnail}
                                                    onChange={(e) => setResumeData({ ...resumeData, linkedinthumbnail: e.target.value })}
                                                    placeholder="linkedin.com/in/johndoe"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField
                                                    label="GitHub URL"
                                                    type="url"
                                                    value={resumeData.github}
                                                    onChange={(e) => setResumeData({ ...resumeData, github: e.target.value })}
                                                    placeholder="https://github.com/johndoe"
                                                />
                                                <InputField
                                                    label="GitHub Display Text"
                                                    value={resumeData.githubthumbnail}
                                                    onChange={(e) => setResumeData({ ...resumeData, githubthumbnail: e.target.value })}
                                                    placeholder="github.com/johndoe"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputField
                                                    label="Portfolio URL"
                                                    type="url"
                                                    value={resumeData.portfolio}
                                                    onChange={(e) => setResumeData({ ...resumeData, portfolio: e.target.value })}
                                                    placeholder="https://johndoe.dev"
                                                />
                                                <InputField
                                                    label="Portfolio Display Text"
                                                    value={resumeData.portfoliothumbnail}
                                                    onChange={(e) => setResumeData({ ...resumeData, portfoliothumbnail: e.target.value })}
                                                    placeholder="johndoe.dev"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Summary Section */}
                            {activeSection === 'summary' && (
                                <div>
                                    <SectionHeader
                                        section={sections.find(s => s.id === 'summary')}
                                        isExpanded={expandedSections.summary}
                                        onToggle={toggleSection}
                                    />
                                    {expandedSections.summary && (
                                        <div className="p-6">
                                            <TextareaField
                                                label="Professional Summary"
                                                value={resumeData.summary}
                                                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                                                placeholder="Write a compelling summary that highlights your key skills, experience, and career objectives..."
                                                rows={6}
                                                required
                                            />
                                            <div className="mt-2 text-sm text-gray-500">
                                                {resumeData.summary.length}/500 characters recommended
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Skills Section */}
                            {activeSection === 'skills' && (
                                <div>
                                    <SectionHeader
                                        section={sections.find(s => s.id === 'skills')}
                                        isExpanded={expandedSections.skills}
                                        onToggle={toggleSection}
                                    />
                                    {expandedSections.skills && (
                                        <div className="p-6 space-y-6">
                                            {Object.keys(resumeData.skills).map((category) => (
                                                <div key={category} className="border border-gray-200 rounded-lg p-4">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{category}</h4>
                                                    <div className="space-y-3">
                                                        {resumeData.skills[category].map((skill, index) => (
                                                            <div key={index} className="flex items-center space-x-3">
                                                                <input
                                                                    type="text"
                                                                    value={skill}
                                                                    onChange={(e) => handleSkillChange(category, index, e.target.value)}
                                                                    placeholder="Enter skill..."
                                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                                <button
                                                                    onClick={() => removeSkill(category, index)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                                >
                                                                    <TrashIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => addSkill(category)}
                                                            className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                                                        >
                                                            <PlusIcon className="w-4 h-4" />
                                                            <span>Add {category.slice(0, -1)}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Experience Section */}
                            {activeSection === 'experience' && (
                                <div>
                                    <SectionHeader
                                        section={sections.find(s => s.id === 'experience')}
                                        isExpanded={expandedSections.experience}
                                        onToggle={toggleSection}
                                    />
                                    {expandedSections.experience && (
                                        <div className="p-6 space-y-6">
                                            {resumeData.experiences.map((exp, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-lg font-semibold text-gray-900">Experience {index + 1}</h4>
                                                        {resumeData.experiences.length > 1 && (
                                                            <button className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InputField
                                                            label="Job Title"
                                                            value={exp.role}
                                                            onChange={(e) => handleExperienceChange(e, index, 'role')}
                                                            placeholder="Software Engineer"
                                                            required
                                                        />
                                                        <InputField
                                                            label="Company"
                                                            value={exp.company}
                                                            onChange={(e) => handleExperienceChange(e, index, 'company')}
                                                            placeholder="Tech Company Inc."
                                                            required
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <InputField
                                                            label="Start Date"
                                                            type="month"
                                                            value={exp.from_date}
                                                            onChange={(e) => handleExperienceChange(e, index, 'from_date')}
                                                        />
                                                        <InputField
                                                            label="End Date"
                                                            type="month"
                                                            value={exp.currentlyWorking ? '' : exp.to_date}
                                                            onChange={(e) => handleExperienceChange(e, index, 'to_date')}
                                                            disabled={exp.currentlyWorking}
                                                        />
                                                        <div className="flex items-center space-x-2 mt-7">
                                                            <input
                                                                type="checkbox"
                                                                id={`currently-working-${index}`}
                                                                checked={exp.currentlyWorking}
                                                                onChange={(e) => {
                                                                    const updatedExperiences = resumeData.experiences.map((experience, i) =>
                                                                        i === index ? { ...experience, currentlyWorking: e.target.checked, to_date: e.target.checked ? 'Present' : '' } : experience
                                                                    );
                                                                    setResumeData({ ...resumeData, experiences: updatedExperiences });
                                                                }}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <label htmlFor={`currently-working-${index}`} className="text-sm font-medium text-gray-700">
                                                                Currently Working
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <InputField
                                                        label="Location"
                                                        value={exp.location}
                                                        onChange={(e) => handleExperienceChange(e, index, 'location')}
                                                        placeholder="New York, NY"
                                                    />

                                                    <div className="space-y-3">
                                                        <label className="block text-sm font-semibold text-gray-700">Job Responsibilities</label>
                                                        {exp.details.map((detail, detailIndex) => (
                                                            <div key={detailIndex} className="flex items-start space-x-3">
                                                                <textarea
                                                                    value={detail}
                                                                    onChange={(e) => {
                                                                        const updatedDetails = exp.details.map((d, i) =>
                                                                            i === detailIndex ? e.target.value : d
                                                                        );
                                                                        const updatedExperiences = resumeData.experiences.map((experience, i) =>
                                                                            i === index ? { ...experience, details: updatedDetails } : experience
                                                                        );
                                                                        setResumeData({ ...resumeData, experiences: updatedExperiences });
                                                                    }}
                                                                    placeholder="Describe your responsibilities and achievements..."
                                                                    rows={2}
                                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                                                                />
                                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-300">
                                                                    🔃
                                                                </button>
                                                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                                    <TrashIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                                                            <PlusIcon className="w-4 h-4" />
                                                            <span>Add Responsibility</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={addNewExperience}
                                                className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                                <span>Add Another Experience</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Education Section */}
                            {activeSection === 'education' && (
                                <div>
                                    <SectionHeader
                                        section={sections.find(s => s.id === 'education')}
                                        isExpanded={expandedSections.education}
                                        onToggle={toggleSection}
                                    />
                                    {expandedSections.education && (
                                        <div className="p-6 space-y-6">
                                            {resumeData.education.map((edu, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-lg font-semibold text-gray-900">Education {index + 1}</h4>
                                                        {resumeData.education.length > 1 && (
                                                            <button
                                                                onClick={() => {
                                                                    const updatedEducation = resumeData.education.filter((_, i) => i !== index);
                                                                    setResumeData({ ...resumeData, education: updatedEducation });
                                                                }}
                                                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InputField
                                                            label="Institution"
                                                            value={edu.institution}
                                                            onChange={(e) => {
                                                                const updatedEducation = resumeData.education.map((education, i) =>
                                                                    i === index ? { ...education, institution: e.target.value } : education
                                                                );
                                                                setResumeData({ ...resumeData, education: updatedEducation });
                                                            }}
                                                            placeholder="University of Technology"
                                                            required
                                                        />
                                                        <InputField
                                                            label="Degree"
                                                            value={edu.degree}
                                                            onChange={(e) => {
                                                                const updatedEducation = resumeData.education.map((education, i) =>
                                                                    i === index ? { ...education, degree: e.target.value } : education
                                                                );
                                                                setResumeData({ ...resumeData, education: updatedEducation });
                                                            }}
                                                            placeholder="Bachelor of Science"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InputField
                                                            label="Field of Study"
                                                            value={edu.fieldOfStudy}
                                                            onChange={(e) => {
                                                                const updatedEducation = resumeData.education.map((education, i) =>
                                                                    i === index ? { ...education, fieldOfStudy: e.target.value } : education
                                                                );
                                                                setResumeData({ ...resumeData, education: updatedEducation });
                                                            }}
                                                            placeholder="Computer Science"
                                                        />
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-semibold text-gray-700">Score Type</label>
                                                            <select
                                                                value={edu.scoreType}
                                                                onChange={(e) => {
                                                                    const updatedEducation = resumeData.education.map((education, i) =>
                                                                        i === index ? { ...education, scoreType: e.target.value } : education
                                                                    );
                                                                    setResumeData({ ...resumeData, education: updatedEducation });
                                                                }}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="CGPA">CGPA</option>
                                                                <option value="GPA">GPA</option>
                                                                <option value="Percentage">Percentage</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <InputField
                                                            label="Start Date"
                                                            value={edu.from_date}
                                                            onChange={(e) => {
                                                                const updatedEducation = resumeData.education.map((education, i) =>
                                                                    i === index ? { ...education, from_date: e.target.value } : education
                                                                );
                                                                setResumeData({ ...resumeData, education: updatedEducation });
                                                            }}
                                                            placeholder="Jan 2020"
                                                        />
                                                        <InputField
                                                            label="End Date"
                                                            value={edu.currentlyStudying ? 'Present' : edu.to_date}
                                                            onChange={(e) => {
                                                                const updatedEducation = resumeData.education.map((education, i) =>
                                                                    i === index ? { ...education, to_date: e.target.value } : education
                                                                );
                                                                setResumeData({ ...resumeData, education: updatedEducation });
                                                            }}
                                                            placeholder="Dec 2024"
                                                            disabled={edu.currentlyStudying}
                                                        />
                                                        <div className="flex items-center space-x-2 mt-7">
                                                            <input
                                                                type="checkbox"
                                                                id={`currently-studying-${index}`}
                                                                checked={edu.currentlyStudying}
                                                                onChange={(e) => {
                                                                    const updatedEducation = resumeData.education.map((education, i) =>
                                                                        i === index ? { ...education, currentlyStudying: e.target.checked, to_date: e.target.checked ? 'Present' : education.to_date } : education
                                                                    );
                                                                    setResumeData({ ...resumeData, education: updatedEducation });
                                                                }}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <label htmlFor={`currently-studying-${index}`} className="text-sm font-medium text-gray-700">
                                                                Currently Studying
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <InputField
                                                        label={`${edu.scoreType || 'Score'}`}
                                                        value={edu.score}
                                                        onChange={(e) => {
                                                            const updatedEducation = resumeData.education.map((education, i) =>
                                                                i === index ? { ...education, score: e.target.value } : education
                                                            );
                                                            setResumeData({ ...resumeData, education: updatedEducation });
                                                        }}
                                                        placeholder="3.8"
                                                    />

                                                    <div className="space-y-3">
                                                        <label className="block text-sm font-semibold text-gray-700">Relevant Coursework</label>
                                                        {edu.coursework.map((course, courseIndex) => (
                                                            <div key={courseIndex} className="flex items-center space-x-3">
                                                                <input
                                                                    type="text"
                                                                    value={course}
                                                                    onChange={(e) => {
                                                                        const updatedCoursework = edu.coursework.map((c, i) =>
                                                                            i === courseIndex ? e.target.value : c
                                                                        );
                                                                        const updatedEducation = resumeData.education.map((education, i) =>
                                                                            i === index ? { ...education, coursework: updatedCoursework } : education
                                                                        );
                                                                        setResumeData({ ...resumeData, education: updatedEducation });
                                                                    }}
                                                                    placeholder="Data Structures and Algorithms"
                                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const updatedCoursework = edu.coursework.filter((_, i) => i !== courseIndex);
                                                                        const updatedEducation = resumeData.education.map((education, i) =>
                                                                            i === index ? { ...education, coursework: updatedCoursework } : education
                                                                        );
                                                                        setResumeData({ ...resumeData, education: updatedEducation });
                                                                    }}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                                >
                                                                    <TrashIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => {
                                                                const updatedEducation = resumeData.education.map((education, i) =>
                                                                    i === index ? { ...education, coursework: [...education.coursework, ''] } : education
                                                                );
                                                                setResumeData({ ...resumeData, education: updatedEducation });
                                                            }}
                                                            className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                                                        >
                                                            <PlusIcon className="w-4 h-4" />
                                                            <span>Add Course</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => {
                                                    setResumeData({
                                                        ...resumeData,
                                                        education: [...resumeData.education, {
                                                            institution: '',
                                                            from_date: 'Jan 2020',
                                                            to_date: 'Dec 2024',
                                                            degree: '',
                                                            fieldOfStudy: '',
                                                            currentlyStudying: false,
                                                            scoreType: 'CGPA',
                                                            score: '',
                                                            coursework: ['']
                                                        }]
                                                    });
                                                }}
                                                className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                                <span>Add Another Education</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Projects Section */}
                            {activeSection === 'projects' && (
                                <div>
                                    <SectionHeader
                                        section={sections.find(s => s.id === 'projects')}
                                        isExpanded={expandedSections.projects}
                                        onToggle={toggleSection}
                                    />
                                    {expandedSections.projects && (
                                        <div className="p-6 space-y-6">
                                            {resumeData.projects.map((project, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-6 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-lg font-semibold text-gray-900">Project {index + 1}</h4>
                                                        {resumeData.projects.length > 1 && (
                                                            <button
                                                                onClick={() => {
                                                                    const updatedProjects = resumeData.projects.filter((_, i) => i !== index);
                                                                    setResumeData({ ...resumeData, projects: updatedProjects });
                                                                }}
                                                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InputField
                                                            label="Project Title"
                                                            value={project.title}
                                                            onChange={(e) => {
                                                                const updatedProjects = resumeData.projects.map((proj, i) =>
                                                                    i === index ? { ...proj, title: e.target.value } : proj
                                                                );
                                                                setResumeData({ ...resumeData, projects: updatedProjects });
                                                            }}
                                                            placeholder="E-commerce Web Application"
                                                            required
                                                        />
                                                        <InputField
                                                            label="Technologies Used"
                                                            value={project.technologies}
                                                            onChange={(e) => {
                                                                const updatedProjects = resumeData.projects.map((proj, i) =>
                                                                    i === index ? { ...proj, technologies: e.target.value } : proj
                                                                );
                                                                setResumeData({ ...resumeData, projects: updatedProjects });
                                                            }}
                                                            placeholder="React, Node.js, MongoDB"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InputField
                                                            label="Start Date"
                                                            value={project.from_date}
                                                            onChange={(e) => {
                                                                const updatedProjects = resumeData.projects.map((proj, i) =>
                                                                    i === index ? { ...proj, from_date: e.target.value } : proj
                                                                );
                                                                setResumeData({ ...resumeData, projects: updatedProjects });
                                                            }}
                                                            placeholder="Jan 2023"
                                                        />
                                                        <InputField
                                                            label="End Date"
                                                            value={project.to_date}
                                                            onChange={(e) => {
                                                                const updatedProjects = resumeData.projects.map((proj, i) =>
                                                                    i === index ? { ...proj, to_date: e.target.value } : proj
                                                                );
                                                                setResumeData({ ...resumeData, projects: updatedProjects });
                                                            }}
                                                            placeholder="Dec 2023"
                                                        />
                                                    </div>

                                                    <InputField
                                                        label="Project Link (Optional)"
                                                        type="url"
                                                        value={project.projectLink}
                                                        onChange={(e) => {
                                                            const updatedProjects = resumeData.projects.map((proj, i) =>
                                                                i === index ? { ...proj, projectLink: e.target.value } : proj
                                                            );
                                                            setResumeData({ ...resumeData, projects: updatedProjects });
                                                        }}
                                                        placeholder="https://github.com/username/project"
                                                    />

                                                    <div className="space-y-3">
                                                        <label className="block text-sm font-semibold text-gray-700">Project Details</label>
                                                        {project.details.map((detail, detailIndex) => (
                                                            <div key={detailIndex} className="flex items-start space-x-3">
                                                                <textarea
                                                                    value={detail}
                                                                    onChange={(e) => {
                                                                        const updatedDetails = project.details.map((d, i) =>
                                                                            i === detailIndex ? e.target.value : d
                                                                        );
                                                                        const updatedProjects = resumeData.projects.map((proj, i) =>
                                                                            i === index ? { ...proj, details: updatedDetails } : proj
                                                                        );
                                                                        setResumeData({ ...resumeData, projects: updatedProjects });
                                                                    }}
                                                                    placeholder="Describe the project features and your contributions..."
                                                                    rows={2}
                                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const updatedDetails = project.details.filter((_, i) => i !== detailIndex);
                                                                        const updatedProjects = resumeData.projects.map((proj, i) =>
                                                                            i === index ? { ...proj, details: updatedDetails } : proj
                                                                        );
                                                                        setResumeData({ ...resumeData, projects: updatedProjects });
                                                                    }}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <TrashIcon className="w-5 h-5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => {
                                                                const updatedProjects = resumeData.projects.map((proj, i) =>
                                                                    i === index ? { ...proj, details: [...proj.details, ''] } : proj
                                                                );
                                                                setResumeData({ ...resumeData, projects: updatedProjects });
                                                            }}
                                                            className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                                                        >
                                                            <PlusIcon className="w-4 h-4" />
                                                            <span>Add Detail</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => {
                                                    setResumeData({
                                                        ...resumeData,
                                                        projects: [...resumeData.projects, {
                                                            title: '',
                                                            technologies: '',
                                                            from_date: 'Jan 2023',
                                                            to_date: 'Dec 2023',
                                                            details: [''],
                                                            projectLink: ''
                                                        }]
                                                    });
                                                }}
                                                className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                                <span>Add Another Project</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Certifications Section */}
                            {activeSection === 'certifications' && (
                                <div>
                                    <SectionHeader
                                        section={sections.find(s => s.id === 'certifications')}
                                        isExpanded={expandedSections.certifications}
                                        onToggle={toggleSection}
                                    />
                                    {expandedSections.certifications && (
                                        <div className="p-6 space-y-6">
                                            {resumeData.certifications.map((cert, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-lg font-semibold text-gray-900">Certification {index + 1}</h4>
                                                        {resumeData.certifications.length > 1 && (
                                                            <button
                                                                onClick={() => {
                                                                    const updatedCertifications = resumeData.certifications.filter((_, i) => i !== index);
                                                                    setResumeData({ ...resumeData, certifications: updatedCertifications });
                                                                }}
                                                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InputField
                                                            label="Certification Name"
                                                            value={cert.name}
                                                            onChange={(e) => {
                                                                const updatedCertifications = resumeData.certifications.map((certification, i) =>
                                                                    i === index ? { ...certification, name: e.target.value } : certification
                                                                );
                                                                setResumeData({ ...resumeData, certifications: updatedCertifications });
                                                            }}
                                                            placeholder="AWS Solutions Architect"
                                                            required
                                                        />
                                                        <InputField
                                                            label="Certificate Link (Optional)"
                                                            type="url"
                                                            value={cert.link}
                                                            onChange={(e) => {
                                                                const updatedCertifications = resumeData.certifications.map((certification, i) =>
                                                                    i === index ? { ...certification, link: e.target.value } : certification
                                                                );
                                                                setResumeData({ ...resumeData, certifications: updatedCertifications });
                                                            }}
                                                            placeholder="https://aws.amazon.com/certificate/..."
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => {
                                                    setResumeData({
                                                        ...resumeData,
                                                        certifications: [...resumeData.certifications, { name: '', link: '' }]
                                                    });
                                                }}
                                                className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                                <span>Add Another Certification</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Publications Section */}
                            {activeSection === 'publications' && (
                                <div>
                                    <SectionHeader
                                        section={sections.find(s => s.id === 'publications')}
                                        isExpanded={expandedSections.publications}
                                        onToggle={toggleSection}
                                    />
                                    {expandedSections.publications && (
                                        <div className="p-6 space-y-6">
                                            {resumeData.publications.map((pub, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-lg font-semibold text-gray-900">Publication {index + 1}</h4>
                                                        {resumeData.publications.length > 1 && (
                                                            <button
                                                                onClick={() => {
                                                                    const updatedPublications = resumeData.publications.filter((_, i) => i !== index);
                                                                    setResumeData({ ...resumeData, publications: updatedPublications });
                                                                }}
                                                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InputField
                                                            label="Publication Title"
                                                            value={pub.title}
                                                            onChange={(e) => {
                                                                const updatedPublications = resumeData.publications.map((publication, i) =>
                                                                    i === index ? { ...publication, title: e.target.value } : publication
                                                                );
                                                                setResumeData({ ...resumeData, publications: updatedPublications });
                                                            }}
                                                            placeholder="Machine Learning in Healthcare"
                                                            required
                                                        />
                                                        <InputField
                                                            label="Journal/Conference"
                                                            value={pub.journel}
                                                            onChange={(e) => {
                                                                const updatedPublications = resumeData.publications.map((publication, i) =>
                                                                    i === index ? { ...publication, journel: e.target.value } : publication
                                                                );
                                                                setResumeData({ ...resumeData, publications: updatedPublications });
                                                            }}
                                                            placeholder="IEEE Transactions on Medical Imaging"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InputField
                                                            label="Publication Date"
                                                            value={pub.publish_date}
                                                            onChange={(e) => {
                                                                const updatedPublications = resumeData.publications.map((publication, i) =>
                                                                    i === index ? { ...publication, publish_date: e.target.value } : publication
                                                                );
                                                                setResumeData({ ...resumeData, publications: updatedPublications });
                                                            }}
                                                            placeholder="Jan 2023"
                                                        />
                                                        <InputField
                                                            label="Publication Link (Optional)"
                                                            type="url"
                                                            value={pub.link}
                                                            onChange={(e) => {
                                                                const updatedPublications = resumeData.publications.map((publication, i) =>
                                                                    i === index ? { ...publication, link: e.target.value } : publication
                                                                );
                                                                setResumeData({ ...resumeData, publications: updatedPublications });
                                                            }}
                                                            placeholder="https://doi.org/..."
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => {
                                                    setResumeData({
                                                        ...resumeData,
                                                        publications: [...resumeData.publications, { title: '', link: '', journel: '', publish_date: '' }]
                                                    });
                                                }}
                                                className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                                <span>Add Another Publication</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Achievements Section */}
                            {activeSection === 'achievements' && (
                                <div>
                                    <SectionHeader
                                        section={sections.find(s => s.id === 'achievements')}
                                        isExpanded={expandedSections.achievements}
                                        onToggle={toggleSection}
                                    />
                                    {expandedSections.achievements && (
                                        <div className="p-6 space-y-6">
                                            {resumeData.achievements.map((achievement, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-lg font-semibold text-gray-900">Achievement {index + 1}</h4>
                                                        {resumeData.achievements.length > 1 && (
                                                            <button
                                                                onClick={() => {
                                                                    const updatedAchievements = resumeData.achievements.filter((_, i) => i !== index);
                                                                    setResumeData({ ...resumeData, achievements: updatedAchievements });
                                                                }}
                                                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                                                            >
                                                                <TrashIcon className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <InputField
                                                            label="Achievement Title"
                                                            value={achievement.title}
                                                            onChange={(e) => {
                                                                const updatedAchievements = resumeData.achievements.map((ach, i) =>
                                                                    i === index ? { ...ach, title: e.target.value } : ach
                                                                );
                                                                setResumeData({ ...resumeData, achievements: updatedAchievements });
                                                            }}
                                                            placeholder="Winner of National Coding Competition"
                                                            required
                                                        />
                                                        <InputField
                                                            label="Achievement Link (Optional)"
                                                            type="url"
                                                            value={achievement.link}
                                                            onChange={(e) => {
                                                                const updatedAchievements = resumeData.achievements.map((ach, i) =>
                                                                    i === index ? { ...ach, link: e.target.value } : ach
                                                                );
                                                                setResumeData({ ...resumeData, achievements: updatedAchievements });
                                                            }}
                                                            placeholder="https://example.com/certificate"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => {
                                                    setResumeData({
                                                        ...resumeData,
                                                        achievements: [...resumeData.achievements, { title: '', link: '' }]
                                                    });
                                                }}
                                                className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                            >
                                                <PlusIcon className="w-5 h-5" />
                                                <span>Add Another Achievement</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeEditForm;

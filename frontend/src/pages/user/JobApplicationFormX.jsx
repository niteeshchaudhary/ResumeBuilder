
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from "../../assets/AxiosConfig";

export default function JobApplicationFormX() {
    const [resumeFile, setResumeFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const navigator = useNavigate();
    const onBack = () => {
        navigator(-1);
    }
    const { job } = useLocation().state || {};
    if (!job) {
        return <div className="text-center text-red-500">Job not found</div>;
    }
    const [formData, setFormData] = useState({
        applicantName: "",
        job: job.id,
        email: '',
        phone: '',
        linkedinProfile: '',
        portfolioUrl: '',
        currentLocation: '',
        expectedSalary: '',
        noticePeriod: '',
        cover_letter: '',
        resume: '',
    })
    const onSubmit = (applicationData) => {
        // Handle the submission of the application data
        console.log('Application submitting:', applicationData);
        axios.post('/apply/', applicationData).then((response) => {
            console.log('Application submitted successfully:', response.data);
            alert('Application submitted successfully!');
            navigator('/u/applicationstatus');
        }
        ).catch((error) => {
            console.error('Error submitting application:', error);
            alert('Error submitting application. Please try again.');
        });
    };

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)

    const experienceLevels = [
        'Entry Level (0-2 years)',
        'Mid Level (2-5 years)',
        'Senior Level (5-8 years)',
        'Lead Level (8+ years)',
        'Executive Level'
    ]

    const noticePeriods = [
        'Immediately available',
        '2 weeks',
        '1 month',
        '2 months',
        '3 months',
        'More than 3 months'
    ]

    const validateForm = () => {
        const newErrors = {}

        if (!formData.applicantName.trim()) {
            newErrors.applicantName = 'applicantName name is required'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address'
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required'
        }

        if (!formData.currentLocation.trim()) {
            newErrors.currentLocation = 'Current location is required'
        }

        if (!formData.noticePeriod) {
            newErrors.noticePeriod = 'Notice period is required'
        }

        if (!formData.cover_letter.trim()) {
            newErrors.cover_letter = 'Cover letter is required'
        }

        if (!resumeFile) {
            newErrors.resumeFile = 'Resume is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('Form Data:', formData);
        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Create application object
            const applicationData = {
                id: Date.now(),
                jobId: job.id,
                jobTitle: job.title,
                applicantName: job.applicantName,
                email: formData.email,
                phone: formData.phone,
                appliedDate: new Date().toISOString(),
                status: 'pending',
                ...formData
            }

            onSubmit(applicationData)

        } catch (error) {
            alert('Error submitting application. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileChange = (e, fileType) => {
        const file = e.target.files[0]
        if (file) {
            if (fileType === 'resume') {
                setIsUploading(true);
                setErrors({ ...errors, resumeFile: '' })
                setResumeFile(file);
                const uploadformData = new FormData();
                uploadformData.append('file', file);
                uploadformData.append('jobId', job.id);
                axios.post('/upload-job-file/', uploadformData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(response => {
                    setFormData({ ...formData, resume: response.data.filePath })

                    setIsUploading(false);
                    console.log('Resume uploaded successfully:', response.data)
                }).catch(error => {
                    setIsUploading(false);
                    setErrors({ ...errors, resumeFile: 'Error uploading resume' })
                    console.error('Error uploading resume:', error)
                })
            }
        }
    }

    const generateCoverLetter = async () => {
        setIsGeneratingCoverLetter(true);
        setErrors({ ...errors, cover_letter: '' });
        
        try {
            const response = await axios.post('/generate-cover-letter/', {
                job_title: job.title,
                job_description: job.description || '',
                company_name: job.company || '',
                applicant_name: formData.applicantName,
                applicant_experience: formData.experience,
                applicant_skills: formData.skills,
                applicant_current_position: formData.currentPosition,
                applicant_current_company: formData.currentCompany
            });

            if (response.data.success) {
                setFormData({ ...formData, cover_letter: response.data.cover_letter });
            } else {
                setErrors({ ...errors, cover_letter: response.data.error || 'Failed to generate cover letter' });
            }
        } catch (error) {
            console.error('Error generating cover letter:', error);
            setErrors({ ...errors, cover_letter: 'Failed to generate cover letter. Please try again.' });
        } finally {
            setIsGeneratingCoverLetter(false);
        }
    }

    const inputClasses = (field) => {
        return `w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[field]
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 focus:border-blue-500 bg-white'
            }`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Job Details
                    </button>

                    <div className="bg-white rounded-lg p-6 shadow-md mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for: {job.title}</h1>
                        <div className="flex items-center text-gray-600 text-sm space-x-4">
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location}
                            </span>
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                </svg>
                                {job.job_type}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Application Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Application Details</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="border-b pb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Applicant Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        className={inputClasses('applicantName')}
                                        value={formData.applicantName}
                                        onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                                    />
                                    {errors.applicantName && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.applicantName}
                                        </p>
                                    )}
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        className={inputClasses('email')}
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        className={inputClasses('phone')}
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="border-b pb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h3>


                            {/* Experience Level */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Experience Level <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className={inputClasses('experience')}
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                >
                                    <option value="">Select Experience Level</option>
                                    {experienceLevels.map((level) => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                                {errors.experience && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.experience}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Current Position <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Software Engineer"
                                        className={inputClasses('currentPosition')}
                                        value={formData.currentPosition}
                                        onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                                    />
                                    {errors.currentPosition && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.currentPosition}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Current Company <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TechCorp Inc."
                                        className={inputClasses('currentCompany')}
                                        value={formData.currentCompany}
                                        onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                                    />
                                    {errors.currentCompany && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.currentCompany}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Current Location <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="City, State/Country"
                                        className={inputClasses('currentLocation')}
                                        value={formData.currentLocation}
                                        onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                                    />
                                    {errors.currentLocation && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.currentLocation}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Expected Salary <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. $80,000 - $100,000"
                                        className={inputClasses('expectedSalary')}
                                        value={formData.expectedSalary}
                                        onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                                    />
                                    {errors.expectedSalary && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.expectedSalary}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Notice Period <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={inputClasses('noticePeriod')}
                                value={formData.noticePeriod}
                                onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                            >
                                <option value="">Select notice period</option>
                                {noticePeriods.map((period) => (
                                    <option key={period} value={period}>{period}</option>
                                ))}
                            </select>
                            {errors.noticePeriod && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.noticePeriod}
                                </p>
                            )}
                        </div>
                        {/* Documents */}
                        < div className="border-b pb-6" >
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Documents</h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Resume/CV <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                                        {isUploading == true ?
                                            <div className="flex items-center justify-center space-x-2">
                                                <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2.93 6.93A8.003 8.003 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3.93-1.008z"></path>
                                                </svg>
                                                <span className="text-blue-600">Uploading...</span>
                                            </div>
                                            : <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => handleFileChange(e, 'resume')}
                                                className="hidden"
                                                id="resume-upload"
                                            />}
                                        <label htmlFor="resume-upload" className="cursor-pointer">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {resumeFile ? resumeFile.name : 'Click to upload resume'}
                                                </p>
                                                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                                            </div>
                                        </label>
                                    </div>
                                    {errors.resumeFile && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.resumeFile}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div >

                        {/* Cover Letter */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Cover Letter <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={generateCoverLetter}
                                    disabled={isGeneratingCoverLetter || !formData.applicantName || !formData.skills}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                        isGeneratingCoverLetter || !formData.applicantName || !formData.skills
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {isGeneratingCoverLetter ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Generate with AI
                                        </span>
                                    )}
                                </button>
                            </div>
                            {(!formData.applicantName || !formData.skills) && (
                                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                                    💡 Fill in your name and skills above to enable AI cover letter generation
                                </p>
                            )}
                            <textarea
                                rows="8"
                                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                                className={inputClasses('cover_letter')}
                                value={formData.cover_letter}
                                onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                            />
                            {errors.cover_letter && (
                                <p className="text-red-500 text-sm flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.cover_letter}
                                </p>
                            )}
                            <div className="text-right">
                                <span className="text-xs text-gray-500">
                                    {formData.cover_letter.length}/1500 characters
                                </span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        < div className="pt-6" >
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-[1.02] shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Submit Application
                                        </>
                                    )}
                                </span>
                            </button>
                        </div >
                    </form >
                </div >
            </div >
        </div >
    )
}

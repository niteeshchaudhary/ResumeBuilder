
import { useState, useEffect } from 'react'
import axios from '../../assets/AxiosConfig'
import { useNavigate } from "react-router-dom"; 
// [
//         {
//             id: 1,
//             jobId: 1,
//             jobTitle: 'Senior Frontend Developer',
//             company: 'TechCorp Inc.',
//             location: 'New York, NY',
//             applied_at: '2024-01-15',
//             status: 'Interviewed',
//             statusDate: '2024-01-20',
//             nextStep: 'Final round scheduled for Jan 25',
//             salary: '$90,000 - $120,000',
//             jobType: 'Full-time',
//             interviewRounds: [
//                 { round: 'Phone Screening', date: '2024-01-18', status: 'Completed' },
//                 { round: 'Technical Interview', date: '2024-01-20', status: 'Completed' },
//                 { round: 'Final Interview', date: '2024-01-25', status: 'Scheduled' }
//             ]
//         },
//         {
//             id: 2,
//             jobId: 2,
//             jobTitle: 'Full Stack Engineer',
//             company: 'StartupXYZ',
//             location: 'San Francisco, CA',
//             applied_at: '2024-01-12',
//             status: 'Shortlisted',
//             statusDate: '2024-01-16',
//             nextStep: 'Technical assessment pending',
//             salary: '$85,000 - $110,000',
//             jobType: 'Full-time',
//             interviewRounds: [
//                 { round: 'Initial Review', date: '2024-01-16', status: 'Completed' }
//             ]
//         },
//         {
//             id: 3,
//             jobId: 3,
//             jobTitle: 'DevOps Engineer',
//             company: 'CloudTech Solutions',
//             location: 'Remote',
//             applied_at: '2024-01-10',
//             status: 'Under Review',
//             statusDate: '2024-01-10',
//             nextStep: 'Application being reviewed by hiring team',
//             salary: '$95,000 - $130,000',
//             jobType: 'Remote',
//             interviewRounds: []
//         },
//         {
//             id: 4,
//             jobTitle: 'UI/UX Designer',
//             company: 'DesignStudio Pro',
//             location: 'Los Angeles, CA',
//             applied_at: '2024-01-08',
//             status: 'Rejected',
//             statusDate: '2024-01-14',
//             nextStep: 'Position filled',
//             salary: '$70,000 - $90,000',
//             jobType: 'Contract',
//             interviewRounds: [
//                 { round: 'Portfolio Review', date: '2024-01-12', status: 'Completed' }
//             ]
//         },
//         {
//             id: 5,
//             jobTitle: 'Product Manager',
//             company: 'InnovateCorp',
//             location: 'Seattle, WA',
//             applied_at: '2024-01-05',
//             status: 'Offer Extended',
//             statusDate: '2024-01-22',
//             nextStep: 'Offer expires Jan 30',
//             salary: '$110,000 - $140,000',
//             jobType: 'Full-time',
//             interviewRounds: [
//                 { round: 'Phone Screening', date: '2024-01-10', status: 'Completed' },
//                 { round: 'Product Case Study', date: '2024-01-15', status: 'Completed' },
//                 { round: 'Final Interview', date: '2024-01-20', status: 'Completed' }
//             ]
//         }
//     ]
export default function MyApplications() {
    // Mock data for user's applications - in a real app, this would come from an API
    const [applications, setApplications] = useState([])
    const navigator = useNavigate();

    const [selectedStatus, setSelectedStatus] = useState('All')
    const [sortBy, setSortBy] = useState('newest')

    const statusFilters = ['All', 'Under Review', 'Shortlisted', 'Interviewed', 'Offer Extended', 'Rejected']

    useEffect(() => {
        // Fetch applications from API or context
        axios.post('job/myapplications/').then(response => {
            // Assuming the response data is an array of applications
            console.log('Applications fetched:', response.data)
            setApplications(response.data)
        }).catch(error => {
            console.error('Error fetching applications:', error)
            // Handle error (e.g., show a notification)
            alert('Failed to load applications. Please try again later.')
        })
    }, [])


    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'under review':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'shortlisted':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'interviewed':
                return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'offer extended':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'under review':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                )
            case 'shortlisted':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                )
            case 'interviewed':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                )
            case 'offer extended':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            case 'rejected':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            default:
                return null
        }
    }

    const filteredApplications = applications.filter(app =>
        selectedStatus === 'All' || app.status === selectedStatus
    ).sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.applied_at) - new Date(a.applied_at)
        } else if (sortBy === 'oldest') {
            return new Date(a.applied_at) - new Date(b.applied_at)
        } else if (sortBy === 'status') {
            return a.status.localeCompare(b.status)
        }
        return 0
    })

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getStatusStats = () => {
        const stats = {}
        statusFilters.slice(1).forEach(status => {
            stats[status] = applications.filter(app => app.status === status)?.length
        })
        return stats
    }

    const stats = getStatusStats()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    {/* Back Button */}
                    <div className="flex justify-start mb-6">
                        <button
                            onClick={() => navigator("/u/")}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </button>
                    </div>
                    
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
                        <p className="text-gray-600">Track your job applications and their current status</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{applications?.length}</div>
                            <div className="text-sm text-gray-600">Total Applied</div>
                        </div>
                    </div>
                    {Object.entries(stats).map(([status, count]) => (
                        <div key={status} className="bg-white rounded-lg shadow-md p-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{count}</div>
                                <div className="text-sm text-gray-600">{status}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Status Filter */}
                        <div className="flex flex-wrap gap-2">
                            {statusFilters.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${selectedStatus === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status}
                                    {status !== 'All' && (
                                        <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                                            {stats[status] || 0}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="status">Status</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                <div className="space-y-6">
                    {filteredApplications.map((application) => (
                        <div key={application.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">{application.job.title}</h3>
                                                <p className="text-lg text-gray-700 font-medium">{application.job.company}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(application.job.status)}`}>
                                                {getStatusIcon(application.job.status)}
                                                {application.job.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-gray-600 text-sm space-x-4 mb-3">
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {application.job.location}
                                            </span>
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                                </svg>
                                                {application.job.job_type}
                                            </span>
                                            {application.job.salary && <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                                {application.job.salary}
                                            </span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Application Timeline */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Application Details */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-800">Application Details</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Applied on:</span>
                                                <span className="font-medium">{formatDate(application.applied_at)}</span>
                                            </div>
                                            {/* <div className="flex justify-between">
                                                <span className="text-gray-600">Last updated:</span>
                                                <span className="font-medium">{formatDate(application.statusDate)}</span>
                                            </div> */}
                                            {/* <div className="pt-2">
                                                <span className="text-gray-600">Next step:</span>
                                                <p className="text-gray-800 font-medium mt-1">{application.nextStep}</p>
                                            </div> */}
                                        </div>
                                    </div>

                                    {/* Interview Progress */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-gray-800">Interview Progress</h4>
                                        {application.interviewRounds?.length > 0 ? (
                                            <div className="space-y-2">
                                                {application.interviewRounds.map((round, index) => (
                                                    <div key={index} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded-full ${round.status === 'Completed' ? 'bg-green-500' :
                                                                round.status === 'Scheduled' ? 'bg-blue-500' : 'bg-gray-300'
                                                                }`}></div>
                                                            <span className="text-gray-700">{round.round}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-gray-600">{formatDate(round.date)}</div>
                                                            <div className={`text-xs font-medium ${round.status === 'Completed' ? 'text-green-600' :
                                                                round.status === 'Scheduled' ? 'text-blue-600' : 'text-gray-500'
                                                                }`}>
                                                                {round.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No interviews scheduled yet</p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                                    {/* <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                        View Job Details
                                    </button>
                                    <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                        View Application
                                    </button> */}
                                    {application.status === 'Offer Extended' && (
                                        <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200">
                                            Review Offer
                                        </button>
                                    )}
                                    {/* <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                        Send Follow-up
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredApplications?.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {selectedStatus === 'All' ? 'No applications found' : `No ${selectedStatus.toLowerCase()} applications`}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {selectedStatus === 'All'
                                ? 'Start applying to jobs to see them here.'
                                : `You don't have any ${selectedStatus.toLowerCase()} applications yet.`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

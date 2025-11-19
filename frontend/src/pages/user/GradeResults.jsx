import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const host = import.meta.env.VITE_HOST;
const GradeResults = () => {
    const location = useLocation();
    const navigator = useNavigate();
    const { rating, tips } = location.state || { rating: 0, tips: "" };
    const val = useMemo(() => {
        if (rating === undefined) {
            window.location.href = "/u/resumegrader";
        }
        return 301.6 * (1 - Number(rating).toFixed(2) / 10);
    }, [rating]);
    const score = Number(rating).toFixed(1);
    const percentage = (score * 10);

    // Determine grade color based on score
    const getGradeColor = (score) => {
        if (score >= 8) return 'text-green-500';
        if (score >= 6) return 'text-yellow-500';
        if (score >= 4) return 'text-orange-500';
        return 'text-red-500';
    };

    const getGradeColorBg = (score) => {
        if (score >= 8) return 'from-green-400 to-green-600';
        if (score >= 6) return 'from-yellow-400 to-yellow-600';
        if (score >= 4) return 'from-orange-400 to-orange-600';
        return 'from-red-400 to-red-600';
    };

    const getGradeLetter = (score) => {
        if (score >= 9) return 'A+';
        if (score >= 8) return 'A';
        if (score >= 7) return 'B+';
        if (score >= 6) return 'B';
        if (score >= 5) return 'C+';
        if (score >= 4) return 'C';
        return 'D';
    };

    const getEncouragementMessage = (score) => {
        if (score >= 8) return "Outstanding! Your application is exceptional.";
        if (score >= 6) return "Great work! You're on the right track.";
        if (score >= 4) return "Good effort! There's room for improvement.";
        return "Keep working! Every step forward counts.";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
            {rating !== "" ? (
                <div className="w-full max-w-4xl">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Grade Results</h1>
                        <p className="text-gray-600 text-lg">Your application has been analyzed and graded</p>
                    </div>

                    {/* Main Results Card */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Main Results Card */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                            <div className="flex flex-col items-center space-y-6">

                                {/* Score Circle */}
                                <div className="flex flex-col items-center">
                                    <div className="relative flex items-center justify-center mb-4">
                                        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                                            {/* Background circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                stroke="currentColor"
                                                strokeWidth="6"
                                                fill="transparent"
                                                className="text-gray-200"
                                            />
                                            {/* Progress circle */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                stroke="currentColor"
                                                strokeWidth="6"
                                                fill="transparent"
                                                strokeLinecap="round"
                                                strokeDasharray="282.74"
                                                strokeDashoffset={val}
                                                className={`transition-all duration-1000 ease-out ${getGradeColor(score)}`}
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className={`text-4xl font-bold ${getGradeColor(score)}`}>
                                                {score}
                                            </span>
                                            <span className="text-gray-500 text-lg font-medium">out of 10</span>
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getGradeColorBg(score)} text-white font-bold text-xl shadow-lg`}>
                                        Grade: {getGradeLetter(score)}
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="w-full text-center">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                        {getEncouragementMessage(score)}
                                    </h2>

                                    {/* Score Breakdown */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-700">Overall Score</span>
                                            <span className={`font-bold ${getGradeColor(score)}`}>{percentage}%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-700">Grade Letter</span>
                                            <span className={`font-bold ${getGradeColor(score)}`}>{getGradeLetter(score)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips and Recommendations Card */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                            <div className="flex items-center mb-6">
                                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800">Improvement Tips</h3>
                            </div>

                            {tips && tips.length > 0 ? (
                                <div className="space-y-4">
                                    {tips}
                                    {/* .map((tip, index) => (
                                        <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-400">
                                            <div className="flex-shrink-0">
                                                <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <p className="text-gray-700 font-medium leading-relaxed">{tip}</p>
                                        </div>
                                    )) */}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-500 text-lg">Great job! No specific improvements needed.</p>
                                </div>
                            )}

                            {/* General Recommendation */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-400">
                                <div className="flex items-center mb-2">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-green-700 font-bold">Pro Tip</p>
                                </div>
                                <p className="text-green-700">
                                    {score >= 8 ? "Keep maintaining this high standard in your applications!" : "Focus on implementing these suggestions to improve your application score."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigator("/u/")}
                            className="px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Go Back</span>
                            </span>
                        </button>

                        <button
                            onClick={() => navigator("/u/resumegrader")}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            <span className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Try Again</span>
                            </span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">No Results Found</h1>
                    <p className="text-gray-600 mb-8">We couldn't find any grading results to display.</p>
                    <button
                        onClick={() => navigator("/u/resumegrader")}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        Start New Analysis
                    </button>
                </div>

            )}
        </div>
    )
}
export default GradeResults;
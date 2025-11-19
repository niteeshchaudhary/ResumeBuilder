
import React, { useState, useRef, useContext } from 'react';
import axios from '../../assets/AxiosConfig';
import { AuthContext } from '../../auth/AuthContext';
import UpgradeButton from '../../components/UpgradeButton';
import ResetPasswordModal from '../../components/FogotPass';
import ReferralCodeApplication from '../../components/ReferralCodeApplication';
import {UserImage} from '../../assets/Images';

const host = import.meta.env.VITE_HOST;

const NewProfilePage = () => {
    const subscriptions = {
        1: "Free",
        2: "Standard",
        3: "Premium"
    };

    const { authState, refreshToken, logout } = useContext(AuthContext);

    // Initial user data stored in state
    const [user, setUser] = useState({
        name: authState?.userDetails?.email.split('@')[0],
        profilePic: `${host}/reserish${authState?.userDetails?.profile_picture}`,
        userinfo: authState?.userDetails,
    });

    const [isUploading, setIsUploading] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const formatDate = (dateString) => {
        if (!dateString) return null;

        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        dateString = date.toLocaleDateString('en-GB', options).replace(/\//g, '-');

        const [day, month, year] = dateString.split('-');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthName = monthNames[parseInt(month, 10) - 1];
        return `${day} ${monthName} ${year}`;
    };

    const fileInputRef = useRef(null);

    const handleProfilePicClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            const formData = new FormData();

            reader.onloadend = () => {
                formData.append('profile_pic', file);
                axios.post('/upload-profile-pic/', formData)
                    .then((response) => {
                        setUser((prevUser) => ({
                            ...prevUser,
                            profilePic: `${host}/reserish${response.data.filename}`,
                        }));
                        setIsUploading(false);
                        window.location.reload();
                    })
                    .catch((error) => {
                        alert(error.response.data.error);
                        setIsUploading(false);
                    });
            };
            reader.readAsDataURL(file);
        }
    };

    const getPlanBadgeColor = (plan) => {
        switch (plan) {
            case 1: return 'bg-gray-100 text-gray-800 border-gray-300';
            case 2: return 'bg-blue-100 text-blue-800 border-blue-300';
            case 3: return 'bg-purple-100 text-purple-800 border-purple-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getPlanIcon = (plan) => {
        switch (plan) {
            case 1: return '🆓';
            case 2: return '⭐';
            case 3: return '👑';
            default: return '🆓';
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('New password must be at least 6 characters long');
            return;
        }

        try {
            const response = await axios.post('/change-password/', {
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword
            });

            alert('Password changed successfully');
            setShowPasswordChange(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            alert(error.response?.data?.error || 'Error changing password');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-40 relative">
                <div className="absolute inset-0 bg-black opacity-10"></div>
            </div>

            <div className="relative -mt-20 flex justify-center px-4 pb-8 pt-4 overflow-visible">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-visible">
                    {/* Profile Header Section */}
                    <div className="relative px-8 pt-16 pb-8">
                        {/* Profile Picture */}
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-20">
                            <div className="relative">
                                <div
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105"
                                    onClick={handleProfilePicClick}
                                >
                                    <img
                                        src={user.profilePic|| UserImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Upload overlay */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                                        <svg
                                            className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Upload indicator */}
                                {isUploading && (
                                    <div className="absolute inset-0 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                )}

                                {/* Camera icon hint */}
                                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleProfilePicChange}
                            className="hidden"
                        />

                        {/* User Info */}
                        <div className="text-center mt-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {user.name}
                            </h1>
                            <p className="text-gray-600 text-lg">
                                {authState?.userDetails?.email}
                            </p>

                            {/* Plan Badge */}
                            <div className="mt-4 flex justify-center">
                                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getPlanBadgeColor(user?.userinfo?.active_plan)}`}>
                                    <span className="mr-2">{getPlanIcon(user?.userinfo?.active_plan)}</span>
                                    {subscriptions[user?.userinfo?.active_plan]} Plan
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Details Section */}
                    <div className="px-8 pb-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Subscription Info Card */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 ml-3">Subscription Details</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Current Plan:</span>
                                        <span className="font-semibold text-gray-900">{subscriptions[user?.userinfo?.active_plan]}</span>
                                    </div>

                                    {user?.userinfo?.active_plan === 1 ? (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-semibold text-gray-900">
                                                {user?.userinfo?.plan_duration === -1 ? "Unlimited" : user?.userinfo?.plan_duration}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Plan Expiry:</span>
                                            <span className="font-semibold text-gray-900">
                                                {formatDate(user?.userinfo?.plan_expiry_date) || "-"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Statistics Card */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 ml-3">Account Info</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Member Since:</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatDate(user?.userinfo?.created_at) || "Recently"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Account Status:</span>
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Referral Code Application Card */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 ml-3">Referral Code</h3>
                                </div>

                                <ReferralCodeApplication />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <UpgradeButton usertype={"u"} />
                            <ResetPasswordModal temail={authState?.userDetails?.email} isOpen={showPasswordChange} onClose={() => setShowPasswordChange(false)} message='Change Password' submessage='We will send password reset link to below email' inputdisabled={true} />
                            <button
                                onClick={() => setShowPasswordChange(true)}
                                className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-200 transition-all duration-200 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Change Password
                            </button>

                            {/* <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Account Settings
                            </button> */}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
                        <p className="text-center text-sm text-gray-500">
                            Need help? <a href="/support" className="text-indigo-600 hover:text-indigo-700 font-medium">Contact Support</a>
                        </p>
                    </div>
                </div>
            </div>


            {/* Password Change Modal */}
            {/* {showPasswordChange && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                                <button
                                    onClick={() => setShowPasswordChange(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        minLength="6"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordChange(false)}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default NewProfilePage;

import React, { useState, useEffect } from 'react';
import axios from '../assets/AxiosConfig';
import ReferralCodeApplication from './ReferralCodeApplication';

const EnhancedReferralDashboard = () => {
  const [referralData, setReferralData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');


  useEffect(() => {
    fetchReferralData();
    fetchLeaderboard();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/referral/enhanced-stats/`);

      if (response.data.success) {
        setReferralData(response.data.data);
      } else {
        setError('Failed to fetch referral data');
      }
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setError('Failed to fetch referral data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`/referral/leaderboard/?limit=10`);

      if (response.data.success) {
        setLeaderboard(response.data.data.leaderboard);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };


  const claimReward = async (achievementId) => {
    try {
      const response = await axios.post(`/referral/claim-reward/`, {
        achievement_id: achievementId
      });

      if (response.data.success) {
        // Refresh data to show updated achievement
        fetchReferralData();
        alert('Reward claimed successfully!');
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
      alert('Failed to claim reward');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getAchievementColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      bronze: 'from-amber-600 to-amber-700',
      silver: 'from-gray-400 to-gray-500',
      gold: 'from-yellow-400 to-yellow-500',
      purple: 'from-purple-500 to-purple-600',
      rainbow: 'from-pink-500 via-purple-500 to-indigo-500'
    };
    return colors[color] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!referralData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-600">No referral data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Program</h1>
        <p className="text-gray-600">Earn rewards by referring friends and climb the leaderboard!</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {['overview', 'apply', 'achievements', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-blue-100 text-sm">Total Referrals</p>
                  <p className="text-2xl font-bold">{referralData.total_referrals}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-green-100 text-sm">Your Code</p>
                  <p className="text-lg font-bold">{referralData.active_referral_code}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-purple-100 text-sm">Your Rank</p>
                  <p className="text-lg font-bold">{getRankIcon(referralData.current_rank)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-orange-100 text-sm">Achievements</p>
                  <p className="text-lg font-bold">{referralData.achievements.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Code Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Code</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <div className="flex">
                  <input
                    type="text"
                    value={referralData.active_referral_code}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100 text-gray-900 font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(referralData.active_referral_code)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral Link</label>
                <div className="flex">
                  <input
                    type="text"
                    value={referralData.referral_link}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100 text-gray-900 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(referralData.referral_link)}
                    className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 transition-colors"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Next Achievement */}
          {referralData.next_achievement && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Achievement</h3>
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${getAchievementColor(referralData.next_achievement.color)} rounded-full flex items-center justify-center text-2xl`}>
                  {referralData.next_achievement.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{referralData.next_achievement.name}</h4>
                  <p className="text-gray-600 text-sm">{referralData.next_achievement.description}</p>
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (referralData.total_referrals / referralData.next_achievement.threshold) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {referralData.total_referrals}/{referralData.next_achievement.threshold}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Referrals */}
          {referralData.recent_referrals && referralData.recent_referrals.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Referrals</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referralData.recent_referrals.map((referral) => (
                      <tr key={referral.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {referral.referred_user_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {referral.referred_user_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Apply Tab */}
      {activeTab === 'apply' && (
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 border border-green-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply Referral Code</h2>
              <p className="text-gray-600">Apply a referral code to join the referral program and start earning rewards!</p>
            </div>
            
            <ReferralCodeApplication />
          </div>
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Achievements</h2>
          
          {referralData.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {referralData.achievements.map((achievement) => (
                <div key={achievement.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getAchievementColor(achievement.achievement.color)} rounded-full flex items-center justify-center text-xl`}>
                      {achievement.achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{achievement.achievement.name}</h3>
                      <p className="text-sm text-gray-600">{achievement.achievement.description}</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {achievement.achievement.reward_type}: {achievement.achievement.reward_value}
                        </span>
                      </div>
                      {!achievement.is_claimed && (
                        <></>
                        // <button
                        //   onClick={() => claimReward(achievement.id)}
                        //   className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                        // >
                        //   Claim Reward
                        // </button>
                      )}
                      {achievement.is_claimed && (
                        <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          ✓ Claimed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
              <p className="text-gray-500">Start referring friends to unlock your first achievement!</p>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Referral Leaderboard</h2>
          
          {leaderboard.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Referrers</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {leaderboard.map((entry, index) => (
                  <div key={entry.rank} className="px-6 py-4 flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        entry.rank === 3 ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {getRankIcon(entry.rank)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {entry.user_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {entry.user_email}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {entry.referral_count} referrals
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Leaderboard coming soon</h3>
              <p className="text-gray-500">The leaderboard will be updated soon. Keep referring to climb the ranks!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedReferralDashboard;

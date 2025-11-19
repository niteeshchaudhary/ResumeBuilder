import React, { useState, useEffect } from 'react';
import axios from '../assets/AxiosConfig';

const ReferralCodeApplication = () => {
  const [appliedCode, setAppliedCode] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAppliedCode();
  }, []);

  const fetchAppliedCode = async () => {
    try {
      const response = await axios.get('/referral/applied/');
      if (response.data.success) {
        setAppliedCode(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching applied referral code:', err);
    }
  };

  const handleApplyCode = async (e) => {
    e.preventDefault();
    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/referral/apply/', {
        referral_code: referralCode.trim()
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setAppliedCode(response.data.data);
        setReferralCode('');
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      console.error('Error applying referral code:', err);
      setError(err.response?.data?.error || 'Failed to apply referral code');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Applied Code:</span>
          <span className="font-mono font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-lg">
            {appliedCode.applied_referral_code}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Applied On:</span>
          <span className="font-semibold text-gray-900">
            {new Date(appliedCode.applied_at).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Referrer:</span>
          <span className="font-semibold text-gray-900">
            {appliedCode.referrer_email}
          </span>
        </div>
        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            ✓ You have successfully applied a referral code. This cannot be changed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Apply a referral code to get started with our referral program. You can only apply one code and cannot change it later.
      </div>
      
      <form onSubmit={handleApplyCode} className="space-y-4">
        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
            Enter Referral Code
          </label>
          <input
            id="referralCode"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="Enter referral code"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            maxLength={20}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !referralCode.trim()}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Applying...' : 'Apply Referral Code'}
        </button>
      </form>
    </div>
  );
};

export default ReferralCodeApplication;

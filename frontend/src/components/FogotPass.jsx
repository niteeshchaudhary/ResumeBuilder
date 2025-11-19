// ForgotPassword.jsx
import { useState } from 'react';
import axios from 'axios';

const host = import.meta.env.VITE_HOST;

export default function ForgotPassword({ temail, isOpen, onClose,message="Forgot Password",submessage="Enter your email and we'll send you a reset link.",inputdisabled=false }) {
  const [email, setEmail] = useState(temail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${host}/reserish/api/reset-password/`, { email });
      alert("✅ Check your email for the reset link.");
      onClose()
    } catch (err) {
      console.log(err?.response.data);
      setError("❌ Error sending reset email: " + err?.response?.data?.error);
    }
    finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">{message}</h2>
        <p className="text-sm text-center text-gray-500 mb-4">
          {submessage}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            disabled={inputdisabled}
            placeholder="you@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />{loading == true ?
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500 border-solid"></div>
            :
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Send Reset Link
            </button>}
        </form>
        {error && (
          <p className={`mt-4 text-center ${error != '' ? 'text-red-500' : 'text-green-600'}`}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

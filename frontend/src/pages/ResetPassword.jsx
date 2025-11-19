// ResetPassword.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../assets/AxiosConfig';

export default function ResetPassword() {
    const { uidb64, token } = useParams();
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    // Password validation rules
    const requirements = [
        {
            label: 'At least 8 characters',
            test: (pw) => pw.length >= 8,
        },
        {
            label: 'At least 1 number',
            test: (pw) => /[0-9]/.test(pw),
        },
        {
            label: 'At least 1 uppercase letter',
            test: (pw) => /[A-Z]/.test(pw),
        },
        {
            label: 'At least 1 special character',
            test: (pw) => /[^A-Za-z0-9]/.test(pw),
        },
    ];
    const allValid = requirements.every(r => r.test(password));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');
        try {
            await axios.post(`/reset-password-confirm/${uidb64}/${token}/`, { password });
            setMsg('✅ Password reset successful!');
        } catch {
            setError('❌ Invalid or expired link.');
        }
    };

    return (
        <div style={{ width: "100vw" }}>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
                <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full">
                    {msg != '' ?
                        <p className={`mt-4 text-center 'text-green-600'`}>
                            {msg}
                        </p>
                        : <>
                            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Your Password</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your new password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    {/* Password requirements checklist */}
                                    <ul className="mt-2 mb-2 space-y-1">
                                        {requirements.map((req, idx) => {
                                            const passed = req.test(password);
                                            return (
                                                <li key={idx} className="flex items-center text-sm">
                                                    <span className={`mr-2 ${passed ? 'text-green-600' : 'text-gray-400'}`}>{passed ? '✔️' : '❌'}</span>
                                                    <span className={passed ? 'text-green-600' : ''}>{req.label}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                <button
                                    type="submit"
                                    className={`w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ${!allValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                                    disabled={!allValid}
                                >
                                    Reset Password
                                </button>
                            </form>
                            {error && (
                                <p className="mt-4 text-center text-red-500">
                                    {error}
                                </p>
                            )}
                            <p className="mt-6 text-sm text-center text-gray-500">
                                If you didn't request this, you can safely ignore this page.
                            </p>
                        </>
                    }
                </div>
            </div>
        </div>
    );
}
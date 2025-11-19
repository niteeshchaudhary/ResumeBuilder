import { useState } from "react";
import axios from "axios";

const host = import.meta.env.VITE_HOST;

export default function ResendVerificationLink() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(""); // "success", "error", or ""
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResend = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus("");
        setMessage("");

        try {
            // Replace with your backend endpoint
            const res = await axios.post(`${host}/reserish/api/resend-verification/`, { email });

            if (res.status == 200) {
                setStatus("success");
                setMessage("Verification link sent successfully.");
            } else {
                setStatus("error");
                setMessage(res?.data?.error || "Failed to resend verification link.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("An unexpected error occurred. " + error?.response?.data?.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Resend Verification Link</h1>

                <form onSubmit={handleResend} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {status && (
                        <div
                            className={`text-sm p-2 rounded ${status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Resend Verification Link"}
                    </button>
                </form>
            </div>
        </div>
    );
}

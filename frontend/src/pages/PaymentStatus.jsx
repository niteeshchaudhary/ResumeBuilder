import React, { useEffect, useState } from 'react';
import axios from '../assets/AxiosConfig';
import { useLocation } from 'react-router-dom';

const PaymentStatus = () => {
    const [status, setStatus] = useState('Checking payment status...');
    const [statusType, setStatusType] = useState('loading'); // success | failed | loading

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('order_id');

    useEffect(() => {
        const checkPaymentStatus = async () => {
            try {
                const response = await axios.post("/cashfree/payment_status", { order_id: orderId });
                setStatus(response.data.msg);
                setStatusType(response.data.success ? 'success' : 'failed');
            } catch (err) {
                setStatus('Failed to verify payment status');
                setStatusType('failed');
            }
        };

        if (orderId) {
            checkPaymentStatus();
        } else {
            setStatus('No order ID found');
            setStatusType('failed');
        }
    }, [orderId]);

    const getStatusColor = () => {
        switch (statusType) {
            case 'success':
                return 'text-green-600 border-green-500 bg-green-50';
            case 'failed':
                return 'text-red-600 border-red-500 bg-red-50';
            default:
                return 'text-blue-600 border-blue-500 bg-blue-50 animate-pulse';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white px-4">
            <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Payment Status</h1>
                <div className={`text-center text-lg font-medium border rounded-xl px-4 py-6 transition-all ${getStatusColor()}`}>
                    {status}
                </div>
                <div className="mt-6 text-center">
                    <a
                        href="transactions"
                        className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                    >
                        Go to Transactions
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;

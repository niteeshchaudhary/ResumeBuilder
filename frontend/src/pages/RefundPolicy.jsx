// pages/RefundPolicy.jsx
import React from 'react';
import Footer from '../components/Footer';
import Nav2 from '../components/Nav2';

export const RefundPolicy = () => {
    return (
        <div style={{ width: "100vw" }} className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
            <Nav2/>
            <div className="text-gray-800 mt-20">
                <div className="mx-auto px-6 py-12">
                    <h1 className="text-4xl font-bold text-red-600 mb-6">Refund & Cancellation Policy</h1>

                    <p className="mb-6 text-lg">
                        At <strong>resumeupgrader.in</strong>, we are committed to providing quality resume improvement and related services to our users. Please read our refund and cancellation policy carefully before making a purchase.
                    </p>

                    <div className="space-y-8">

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">1. Cancellation Policy</h2>
                            <p className="text-gray-700">
                                You may cancel your order within <strong>2 hours</strong> of placing it, provided the resume service or evaluation process has not yet started. Once processing has begun, cancellations will not be accepted.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">2. Refund Policy</h2>
                            <p className="text-gray-700">
                                Refunds are applicable only under the following conditions:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                                <li>If the service was not delivered due to technical or internal issues.</li>
                                <li>If you were charged multiple times for the same service.</li>
                                <li>If the order was cancelled within the allowed 2-hour window and service had not started.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">3. Refund Timelines</h2>
                            <p className="text-gray-700">
                                Upon approval, the refund will be processed within <strong>5-7 business days</strong> to the original mode of payment.
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Note: Actual credit to your account may vary depending on your bank or payment provider.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">4. No Refund Conditions</h2>
                            <p className="text-gray-700">
                                We do not offer refunds in the following cases:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                                <li>If the resume improvement service has already been initiated or completed.</li>
                                <li>If the refund request is made more than 24 hours after order placement.</li>
                                <li>If dissatisfaction is subjective and not related to service quality or delivery failure.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">5. How to Request a Refund</h2>
                            <p className="text-gray-700">
                                To request a refund, please email us at <a href="mailto:support@resumeupgrader.in" className="text-blue-600 underline">support@resumeupgrader.in</a> with your order ID and a brief explanation of the issue. Our team will respond within 48 hours.
                            </p>
                        </section>

                    </div>

                    <p className="text-sm text-gray-500 mt-12">Last updated: May 17, 2025</p>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default RefundPolicy;

// pages/TermsAndConditions.jsx
import React from 'react';
import Footer from '../components/Footer';
import Nav2 from '../components/Nav2';

export const TermsAndConditions = () => {
    return (
        <div style={{ width: "100vw" }} className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
            <Nav2 />
            <div className="text-gray-800 mt-20">
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <h1 className="text-4xl font-bold text-blue-700 mb-6">Terms and Conditions</h1>

                    <p className="mb-6 text-lg">
                        Welcome to <strong>resumeupgrader.in</strong>. These terms and conditions outline the rules and regulations for the use of our website and services.
                    </p>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h2>
                            <p className="text-gray-700">
                                By accessing this website and using our services, you agree to be bound by these terms. If you do not accept all the terms and conditions stated on this page, please do not continue to use the platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">2. Services Offered</h2>
                            <p className="text-gray-700">
                                resumeupgrader.in offers resume evaluation, tips, feedback, and resume enhancement services. We do not guarantee job placement or recruitment outcomes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">3. User Responsibilities</h2>
                            <ul className="list-disc list-inside text-gray-700">
                                <li>Provide accurate and truthful information.</li>
                                <li>Do not misuse or attempt to disrupt the platform.</li>
                                <li>Maintain the confidentiality of login credentials (if applicable).</li>
                                <li>Respect the intellectual property of resumeupgrader.in.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">4. Intellectual Property</h2>
                            <p className="text-gray-700">
                                All content on resumeupgrader.in, including logos, text, images, and code, is the property of resumeupgrader.in and protected by copyright laws. Unauthorized use or reproduction is strictly prohibited.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">5. Payment & Refund</h2>
                            <p className="text-gray-700">
                                All payments for services must be made in advance. Please refer to our <a href="/refundpolicy" className="text-blue-600 underline">Refund & Cancellation Policy</a> for details on refunds and cancellations.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">6. Limitations of Liability</h2>
                            <p className="text-gray-700">
                                resumeupgrader.in is not liable for any indirect or consequential damages arising out of the use of our services. We do not guarantee employment or interview calls based on our recommendations.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">7. Modifications</h2>
                            <p className="text-gray-700">
                                We may revise these terms and conditions at any time without prior notice. By using this website, you agree to be bound by the current version of these terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">8. Governing Law</h2>
                            <p className="text-gray-700">
                                These terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of Jaipur, Rajasthan.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">9. Contact Us</h2>
                            <p className="text-gray-700">
                                For any concerns or questions, please contact us at:
                            </p>
                            <ul className="mt-2 text-gray-700">
                                <li>Email: support@resumeupgrader.in</li>
                                <li>Phone: +91-9929072706</li>
                            </ul>
                        </section>
                    </div>

                    <p className="text-sm text-gray-500 mt-12">Last updated: May 17, 2025</p>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default TermsAndConditions;

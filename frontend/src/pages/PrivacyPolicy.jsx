// pages/PrivacyPolicy.jsx
import React from 'react';
import Footer from '../components/Footer';
import Nav2 from '../components/Nav2';

export const PrivacyPolicy = () => {
    return (
        <div style={{ width: "100vw" }} className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50">
            <Nav2 />
            <div className="text-gray-800 mt-20">
                <div className="mx-auto px-6 py-12">
                    <h1 className="text-4xl font-bold text-blue-700 mb-6">Privacy Policy</h1>

                    <p className="mb-6 text-lg">
                        At <strong>resumeupgrader.in</strong>, your privacy is our priority. This Privacy Policy outlines how we collect, use, and protect the information you provide when using our platform.
                    </p>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-2xl font-semibold mb-2">1. Information We Collect</h2>
                            <ul className="list-disc list-inside text-gray-700">
                                <li>Name, email address, and contact information</li>
                                <li>Resume content and user inputs on the platform</li>
                                <li>Usage data (IP address, browser type, device type)</li>
                                <li>Cookies and session identifiers</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">2. How We Use Your Information</h2>
                            <ul className="list-disc list-inside text-gray-700">
                                <li>To provide resume feedback, scoring, and suggestions</li>
                                <li>To enhance user experience and improve the platform</li>
                                <li>To communicate updates, offers, and service messages</li>
                                <li>To process payments securely (via trusted third parties)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">3. Data Protection</h2>
                            <p className="text-gray-700">
                                We implement appropriate security measures to protect your data, including HTTPS encryption, firewalls, and access control protocols. All personal information is securely stored and only accessible by authorized personnel.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">4. Sharing of Information</h2>
                            <p className="text-gray-700">
                                We do not sell or rent your personal data. Information may be shared with trusted partners (e.g., payment gateways) strictly for the purpose of delivering our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">5. Cookies</h2>
                            <p className="text-gray-700">
                                resumeupgrader.in uses cookies to track user sessions and improve functionality. You may choose to disable cookies in your browser settings, though this may affect site performance.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">6. Your Rights</h2>
                            <ul className="list-disc list-inside text-gray-700">
                                <li>Request access to your personal data</li>
                                <li>Request corrections or deletion of your information</li>
                                <li>Opt out of marketing communications at any time</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">7. Updates to this Policy</h2>
                            <p className="text-gray-700">
                                We may update this Privacy Policy as our services evolve. All changes will be posted on this page with an updated revision date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-2">8. Contact Us</h2>
                            <p className="text-gray-700">
                                For any questions regarding this Privacy Policy, contact us at:
                            </p>
                            <ul className="mt-2 text-gray-700">
                                <li>Email: support@resumeupgrader.in</li>
                                <li>Phone: +91-8905936141</li>
                                <li>Address: Ward No. 35, Ujjain Tola, Bettiah, Bihar - 845438</li>
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

export default PrivacyPolicy;

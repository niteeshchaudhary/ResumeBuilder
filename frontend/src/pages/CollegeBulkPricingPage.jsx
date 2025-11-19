import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Nav2 from "../components/Nav2";
import { useNavigate } from "react-router-dom";
import { useFeatureTracking } from "../hooks/useFeatureTracking";
import FeedbackButton from "../components/FeedbackButton";


const billingOptions = [
    { key: "price_month", label: "Monthly", suffix: "/mo" },
    { key: "price_qyear", label: "Quarterly", suffix: "/3mo" },
    { key: "price_hyear", label: "Half-Yearly", suffix: "/6mo" },
    { key: "price_year", label: "Yearly", suffix: "/yr" },
];

const billed = {
    "price_month": "Monthly",
    "price_qyear": "Quarterly",
    "price_hyear": "Half-Yearly",
    "price_year": "Yearly",
};

const collegePremiumPlans = [
    {
        id: 1,
        name: "College Premium",
        description: "Perfect for educational institutions and colleges",
        price_base: "200.00",
        price_month: "149.00",
        price_qyear: "399.00", 
        price_hyear: "749.00", 
        price_year: "1399.00", 
        level: 3,
        features: [
            "Resume Creation",
            "Resume Grading", 
            "Resume Overview",
            "Resume Creation from stored data",
            "Job Finding",
            "Email Support",
            "Resume Creation using AI",
            "Priority Email Support 24/7",
            "Bulk User Management",
            "College Dashboard",
            "Student Progress Tracking",
            "Custom Branding Options",
            "Dedicated Account Manager"
        ],
        originalPrice: "300.00",
        discount: "150.00"
    }
];

const CollegeBulkPricingPage = ({ isNav = true, isFooter = true }) => {
    const [billingCycle, setBillingCycle] = useState("price_month");
    const [selectedPlan, setSelectedPlan] = useState(collegePremiumPlans[0]);
    const [quantity, setQuantity] = useState(10);
    const [contactInfo, setContactInfo] = useState({
        name: "",
        email: "",
        phone: "",
        college: "",
        message: ""
    });
    

    const numberOfMonths = {
        "price_month": 1,
        "price_qyear": 3,
        "price_hyear": 6,
        "price_year": 12,
    };

    const navigator = useNavigate();

    // Feature tracking for automatic feedback
    // const { trackInteraction: trackPricingPage } = useFeatureTracking("College Pricing Page", {
    //     delay: 5000,
    //     requireInteraction: false,
    //     autoTrigger: true
    // });

    // const { trackInteraction: trackBillingCycle } = useFeatureTracking("Billing Cycle Selection", {
    //     delay: 2000,
    //     requireInteraction: true,
    //     autoTrigger: true
    // });

    // const { trackInteraction: trackQuantityAdjustment } = useFeatureTracking("Quantity Adjustment", {
    //     delay: 2000,
    //     requireInteraction: true,
    //     autoTrigger: true
    // });

    // const { trackInteraction: trackContactUs } = useFeatureTracking("Contact Us Action", {
    //     delay: 1000,
    //     requireInteraction: true,
    //     autoTrigger: true
    // });

    // Track page load for feedback
    // useEffect(() => {
    //     console.log('🎯 College Pricing Page loaded, tracking for feedback');
    //     trackPricingPage();
    // }, [trackPricingPage]);

    const calculateTotalPrice = () => {
        const basePrice = parseFloat(selectedPlan[billingCycle]);
        const totalPrice = basePrice * quantity;
        
        // Apply volume discounts
        let volumeDiscount = 0;
        if (quantity >= 50) volumeDiscount = 0.15; // 15% off for 50+ users
        else if (quantity >= 25) volumeDiscount = 0.10; // 10% off for 25+ users
        else if (quantity >= 10) volumeDiscount = 0.05; // 5% off for 10+ users
        
        const discountedTotal = totalPrice * (1 - volumeDiscount);
        return {
            original: totalPrice,
            discounted: discountedTotal,
            volumeDiscount: volumeDiscount * 100,
            savings: totalPrice - discountedTotal
        };
    };

    const calculatePlanDiscount = () => {
        const originalPrice = selectedPlan.price_base * numberOfMonths[billingCycle];
        const discountedPrice = parseFloat(selectedPlan[billingCycle]);
        const discount = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
        
        return {
            originalPrice: originalPrice,
            discountedPrice: discountedPrice,
            discount: discount
        };
    };


    const pricing = calculateTotalPrice();

    return (
        <div>
            {isNav && <Nav2 isSignup={true} />}
            <div className="h-full w-full max-w-6xl mx-auto px-4 md:px-6 py-24">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        College Bulk Pricing
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Special pricing for educational institutions. Get premium resume building tools 
                        for your students at unbeatable rates with volume discounts.
                    </p>
                    <div className="mt-6 flex items-center justify-center space-x-4">
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">Special Educational Discount Applied</span>
                        </div>
                        
                    </div>
                </div>

                {/* Billing Option Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex border border-gray-300 rounded-full shadow-sm">
                        {billingOptions.map((opt) => (
                            <button
                                key={opt.key}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition ${billingCycle === opt.key
                                    ? "bg-indigo-500 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                onClick={() => {
                                    console.log("🎯 Billing cycle changed to:", opt.key);
                                    setBillingCycle(opt.key);
                                    // Track billing cycle interaction for feedback
                                    trackBillingCycle();
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Pricing Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl border-2 border-indigo-500 ring-4 ring-indigo-100 p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {selectedPlan.name}
                            </h2>
                            <p className="text-gray-600 mb-4">{selectedPlan.description}</p>
                            
                            {/* Price Display */}
                            <div className="mb-6">
                                {(() => {
                                    const planDiscount = calculatePlanDiscount();
                                    return (
                                        <>
                                            <div className="flex items-baseline justify-center space-x-2 mb-2">
                                                <span className="line-through text-gray-400 text-lg">
                                                    ₹{planDiscount.originalPrice.toFixed(2)}
                                                </span>
                                                <span className="text-4xl font-bold text-indigo-600">
                                                    ₹{planDiscount.discountedPrice.toFixed(2)}
                                                </span>
                                                <span className="text-lg text-gray-500">
                                                    {billed[billingCycle]}
                                                </span>
                                            </div>
                                            {planDiscount.discount > 0 && (
                                                <div className="text-green-600 font-semibold text-lg">
                                                    {planDiscount.discount}% OFF per user per {billingCycle === 'price_month' ? 'month' : billingCycle === 'price_qyear' ? 'quarter' : billingCycle === 'price_hyear' ? '6 months' : 'year'}!
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                Number of Users
                            </label>
                            <div className="flex justify-center items-center space-x-4">
                                <button
                                    onClick={() => {
                                        console.log("🎯 Quantity decreased to:", Math.max(5, quantity - 5));
                                        setQuantity(Math.max(5, quantity - 5));
                                        // Track quantity adjustment for feedback
                                        trackQuantityAdjustment();
                                    }}
                                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                </button>
                                <span className="text-2xl font-bold text-gray-900 min-w-[80px] text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => {
                                        console.log("🎯 Quantity increased to:", quantity + 5);
                                        setQuantity(quantity + 5);
                                        // Track quantity adjustment for feedback
                                        trackQuantityAdjustment();
                                    }}
                                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Volume Discount Info */}
                            {pricing.volumeDiscount > 0 && (
                                <div className="text-center mt-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        {pricing.volumeDiscount}% Volume Discount Applied
                                    </span>
                                </div>
                            )}
                        </div>

                                                {/* Total Price Calculation */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Total Cost</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Base Price ({quantity} users × ₹{selectedPlan[billingCycle]})</span>
                                    <span>₹{pricing.original.toFixed(2)}</span>
                                </div>
                                {pricing.volumeDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Volume Discount ({pricing.volumeDiscount}%)</span>
                                        <span>-₹{pricing.savings.toFixed(2)}</span>
                                    </div>
                                )}
                                <hr className="my-2" />
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-indigo-600">₹{pricing.discounted.toFixed(2)}</span>
                                </div>
                                <div className="text-center text-sm text-gray-600">
                                    Billed {billed[billingCycle]}
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">What's Included</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedPlan.features.map((feature, index) => (
                                    <div key={index} className="flex items-center">
                                        <svg className="w-4 h-4 fill-emerald-500 mr-3 shrink-0" viewBox="0 0 12 12">
                                            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                                        </svg>
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="text-center">
                            <button 
                                onClick={() => {
                                    console.log("🎯 Contact Us button clicked");
                                    navigator("/support");
                                    // Track contact us action for feedback
                                    trackContactUs();
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-200 transform hover:scale-105"
                            >
                                Contact Us
                            </button>
                        </div>
                    </div>
                </div>

                {/* Why Choose Us Section */}
                <div className="mt-16 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">
                        Why Colleges Choose Reserish
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Student Success</h3>
                            <p className="text-gray-600">Help your students create professional resumes that stand out in the job market</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Reporting</h3>
                            <p className="text-gray-600">Track student progress and engagement with detailed analytics and reports</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Dedicated Support</h3>
                            <p className="text-gray-600">Get personalized support with a dedicated account manager for your institution</p>
                        </div>
                    </div>
                </div>

                {/* Contact Form
                <div className="mt-16 bg-gray-50 rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Need a Custom Quote?
                        </h2>
                        <p className="text-gray-600">
                            Contact us for custom pricing, additional features, or to discuss your specific requirements.
                        </p>
                    </div>
                    
                    <form onSubmit={handleContactSubmit} className="max-w-2xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={contactInfo.name}
                                    onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={contactInfo.email}
                                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={contactInfo.phone}
                                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">College/Institution</label>
                                <input
                                    type="text"
                                    required
                                    value={contactInfo.college}
                                    onChange={(e) => setContactInfo({...contactInfo, college: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea
                                rows="4"
                                value={contactInfo.message}
                                onChange={(e) => setContactInfo({...contactInfo, message: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Tell us about your requirements, number of students, or any specific needs..."
                            />
                        </div>
                        <div className="text-center">
                            <button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
                            >
                                Send Message
                            </button>
                        </div>
                    </form>
                </div> */}

            
                {/* Additional Information */}
                <div className="mt-12 text-center space-y-4">
                    <p className="text-sm text-gray-600">
                        Need immediate assistance?{' '}
                        <a href="/support" className="text-blue-600 underline hover:text-blue-800">
                            Contact our support team
                        </a>
                    </p>
                    <p className="text-sm text-gray-600">
                        Please check our{' '}
                        <a href="/refundpolicy" className="text-blue-600 underline hover:text-blue-800">
                            Refund & Cancellation Policy
                        </a>.
                    </p>
                </div>
            </div>
            
            {/* Feedback Button */}
            <FeedbackButton
                featureName="College Pricing Page"
                variant="floating"
                size="large"
            />
            
            {isFooter && <Footer />}
        </div>
    );
};

export default CollegeBulkPricingPage;

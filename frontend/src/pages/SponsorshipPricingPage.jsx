import React, { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import Nav2 from "../components/Nav2";
import { useNavigate } from "react-router-dom";
import axios from "../assets/AxiosConfig";
import { AuthContext } from "../auth/AuthContext";

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

const initialSponsorshipPlans = [
    {
        id: 1,
        name: "Bronze Sponsor",
        price_month: "259.00",
        price_qyear: "699.00",
        price_hyear: "1499.00",
        price_year: "2349.00",
        level: 1,
        features:
            "Resume Creation;Resume Grading;Resume Overview",
    },
    {
        id: 2,
        name: "Silver Sponsor",
        price_month: "449.00",
        price_qyear: "1299.00",
        price_hyear: "2599.00",
        price_year: "4699.00",
        level: 2,
        features:
            "Resume Creation;Resume Grading;Resume Overview;Resume Creation from stored data;Job Finding;Email Support",
    },
    {
        id: 3,
        name: "Gold Sponsor",
        price_month: "849.00",
        price_qyear: "2499.00",
        price_hyear: "4799.00",
        price_year: "8999.00",
        level: 3,
        features:
            "Resume Creation;Resume Grading;Resume Overview;Resume Creation from stored data;Job Finding;Email Support;Resume Creation using AI;Priority Email Support 24/7",
    },
];

const SponsorshipPricingPage = ({ isNav = true, isFooter = true }) => {
    const [billingCycle, setBillingCycle] = useState("price_month");
    const [sponsorshipPlans, setSponsorshipPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const numberOfMonths = {
        "price_month": 1,
        "price_qyear": 3,
        "price_hyear": 6,
        "price_year": 12,
    };
    
    const navigator = useNavigate();
    const { authState } = useContext(AuthContext);

    const takeAction = (plan) => {
        // Compute pricing for the selected billing cycle
        const months = numberOfMonths[billingCycle] || 1;
        const monthlyPrice = parseFloat(plan?.price_month || 0);
        const priceWithoutDiscount = monthlyPrice * months;
        const discountedPrice = parseFloat(plan?.[billingCycle] || priceWithoutDiscount);
        const discount = Math.max(0, Math.round(((priceWithoutDiscount - discountedPrice) / (priceWithoutDiscount || 1)) * 100));

        if (authState?.isAuthenticated) {
            navigator("/u/checkout", {
                state: {
                    id: plan.id,
                    discount,
                    name: `${plan.name} — ${billed[billingCycle]}`,
                    price: discountedPrice,
                },
            });
        } else {
            navigator("/u/login");
        }
    };

    useEffect(() => {
        // Try fetching sponsorship plans from API; fall back to initialSponsorshipPlans
        const fetchPlans = async () => {
            setLoading(true);
            try {
                // Backend may expose different keys; handle flexibly
                const response = await axios.get("/get_sponsorship_plans/");
                const data = response?.data || {};
                const plans = Array.isArray(data?.plans)
                    ? data.plans
                    : Array.isArray(data?.splans)
                        ? data.splans
                        : Array.isArray(data?.sponsorship_plans)
                            ? data.sponsorship_plans
                            : null;
                setSponsorshipPlans(plans && plans.length ? plans : initialSponsorshipPlans);
            } catch (error) {
                setSponsorshipPlans(initialSponsorshipPlans);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    return (
        <div>
            {isNav && <Nav2 isSignup={true} />}
            <div className="h-full w-full max-w-6xl mx-auto px-4 md:px-6 py-24">
               
                
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Sponsorship Opportunities
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Partner with us to reach thousands of job seekers and professionals. 
                        Choose a sponsorship plan that aligns with your marketing goals.
                    </p>
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
                                onClick={() => setBillingCycle(opt.key)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plans */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500 border-solid" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {sponsorshipPlans.map((plan) => {
                            const months = numberOfMonths[billingCycle] || 1;
                            const price = parseFloat(plan?.price_month || 0) * months;
                            const discountedPrice = parseFloat(plan?.[billingCycle] || price);
                            const discount = Math.max(0, Math.round(((price - discountedPrice) / (price || 1)) * 100));

                            return (
                                <div
                                    key={plan.id}
                                    className={`p-6 bg-white rounded-2xl shadow border-2 ${
                                        plan.level === 3 ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
                                    }`}
                                >
                                    {plan.level === 3 && (
                                        <div className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {plan.name}
                                    </h3>
                                    <div className="mb-2">
                                        {discount > 0 ? (
                                            <div className="flex items-baseline space-x-2">
                                                <span className="line-through text-gray-400 text-sm">
                                                    ₹{price.toFixed(2)}
                                                </span>
                                                <span className="text-2xl font-bold text-gray-900">
                                                    ₹{discountedPrice.toFixed(2)}
                                                </span>
                                                <span className="text-sm text-green-600 font-semibold">
                                                    ({discount}% OFF)
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="text-2xl font-bold text-gray-900">
                                                ₹{price.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-gray-500 text-sm mb-4">
                                        Billed {billed[billingCycle]}
                                    </div>
                                    {/* CTA */}
                                    <button
                                        onClick={() => takeAction(plan)}
                                        className={`mb-4 w-full py-2 px-4 rounded transition ${
                                            plan.level === 3
                                                ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                                                : 'bg-gray-500 hover:bg-gray-600 text-white'
                                        }`}
                                    >
                                        Choose {plan.name}
                                    </button>

                                    {/* Features */}
                                    <ul className="text-slate-600 dark:text-slate-400 text-sm space-y-3 grow">
                                        {(plan.features || "")
                                            .split(";")
                                            .filter(Boolean)
                                            .map((feature, i) => (
                                                <li className="flex items-center" key={i}>
                                                    <svg
                                                        className="w-3 h-3 fill-emerald-500 mr-3 shrink-0"
                                                        viewBox="0 0 12 12"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                                                    </svg>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Additional Information */}
                <div className="mt-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Why Sponsor With Us?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="text-center">
                            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Large Audience</h3>
                            <p className="text-gray-600 text-sm">Reach thousands of job seekers and professionals actively looking for opportunities</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
                            <p className="text-gray-600 text-sm">Get comprehensive reports on engagement, clicks, and conversion metrics</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">High Engagement</h3>
                            <p className="text-gray-600 text-sm">Our audience is highly engaged and actively seeking career opportunities</p>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="mt-12 text-center space-y-4">
                    <p className="text-sm text-gray-600">
                        Need a custom sponsorship package?{' '}
                        <a href="/support" className="text-blue-600 underline hover:text-blue-800">
                            Contact us
                        </a>{' '}
                        to discuss your specific requirements.
                    </p>
                    <p className="text-sm text-gray-600">
                        Please check our{' '}
                        <a href="/refundpolicy" className="text-blue-600 underline hover:text-blue-800">
                            Refund & Cancellation Policy
                        </a>.
                    </p>
                </div>
            </div>
            {isFooter && <Footer />}
        </div>
    );
};

export default SponsorshipPricingPage;

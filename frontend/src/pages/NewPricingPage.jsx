import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Nav2 from "../components/Nav2";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const host = import.meta.env.VITE_HOST;

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

const initialPlansUser = [
    {
        id: 1,
        name: "Free",
        price_month: "0.00",
        price_qyear: "0.00",
        price_hyear: "0.00",
        price_year: "0.00",
        level: 1,
        features:
            "Resume Creation;Resume Grading;Resume Overview",
    },
    {
        id: 2,
        name: "Standard",
        price_month: "29.00",
        price_qyear: "79.00",
        price_hyear: "149.00",
        price_year: "249.00",
        level: 2,
        features:
            "Resume Creation;Resume Grading;Resume Overview;Resume Creation from stored data;Job Finding;Email Support",
    },
    {
        id: 3,
        name: "Premium",
        price_month: "49.00",
        price_qyear: "129.00",
        price_hyear: "249.00",
        price_year: "399.00",
        level: 3,
        features:
            "Resume Creation;Resume Grading;Resume Overview;Resume Creation from stored data;Job Finding;Email Support;Resume Creation using AI;Priority Email Support 24/7",
    },
];

const PricingPlans = ({ isNav = true, isFooter = true }) => {
    const [billingCycle, setBillingCycle] = useState("price_month");

    const numberOfMonths = {
        "price_month": 1,
        "price_qyear": 3,
        "price_hyear": 6,
        "price_year": 12,
    };
    const [userplans, setUserPlans] = useState([]);
    const [enpplans, setEnpPlans] = useState([]);
    const navigator = useNavigate();
    const takeAction = (plan) => {
        navigator("/u/login");
    }
    console.log(userplans);
    console.log(enpplans);
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get(`${host}/reserish/api/get_offered_plans/`);
                console.log(response.data)
                setUserPlans(response.data.uplans);
                setEnpPlans(response.data.eplans);
                console.log(response.data.active_plan);
            } catch (error) {
                console.error('Error fetching plans:', error);
            }
        };
        fetchPlans();
    }, []);
    return (
        <div>
            {isNav && <Nav2 isSignup={true} />}
            <div className="h-full w-full max-w-6xl mx-auto px-4 md:px-6 py-24">
                
                    <div
                        className="absolute inset-x-0 -top-20 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                        aria-hidden="true"
                    >
                        <div
                            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                            style={{
                                clipPath:
                                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                            }}
                        />
                    </div>
                    <svg
                        viewBox="0 0 512 512"
                        className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
                        aria-hidden="true"
                    >
                        <circle cx={128} cy={128} r={128} fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fillOpacity="0.2" />
                        <defs>
                            <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                                <stop stopColor="#7775D6" />
                                <stop offset={1} stopColor="#E935C1" />
                            </radialGradient>
                        </defs>
                    </svg>

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
                <h1 class="mb-4">User Plans</h1>
                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {userplans.length === 0 ?
                        <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500 border-solid"></div>
                        : userplans.map((plan) => {
                            const discountKey = billingCycle;
                            const price = plan?.price_month * numberOfMonths[billingCycle];
                            const discountedPrice = parseFloat(plan[discountKey]);
                            const discount = Math.round(((price - discountedPrice) / price) * 100);

                            return (
                                <div
                                    key={plan.id}
                                    className="p-6 bg-white rounded-2xl shadow border border-gray-200"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {plan.name}
                                    </h3>
                                    {plan.level == 1 ? <>
                                        <div className="mb-2">
                                            <span className="text-2xl font-bold text-gray-900">
                                                ₹{discountedPrice}
                                            </span>
                                        </div>
                                    </> : <>
                                        <div className="mb-2">
                                            {discount > 0 && (
                                                <div className="flex items-baseline space-x-2">
                                                    <span className="line-through text-gray-400 text-sm">
                                                        ₹{price.toFixed(2)}
                                                    </span>
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        ₹{discountedPrice}
                                                    </span>
                                                    <span className="text-sm text-green-600 font-semibold">
                                                        ({discount}% OFF)
                                                    </span>
                                                </div>
                                            )}
                                            {discount === 0 && (
                                                <div className="text-2xl font-bold text-gray-900">
                                                    ₹{price.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                    }
                                    <div className="text-gray-500 text-sm mb-4">
                                        Billed {billed[billingCycle]}
                                    </div>
                                    {/* CTA */}
                                    <button onClick={takeAction} className="mb-4 w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 transition">
                                        Choose {plan.name}
                                    </button>

                                    {/* Features */}

                                    {/* <div
                                    className="text-sm text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: plan.features }}
                                /> */}
                                    <ul className="text-slate-600 dark:text-slate-400 text-sm space-y-3 grow">
                                        {plan.features.split(";").map((feature, i) => (
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
                        })
                    }
                </div>
                <br />
                <hr />
                <br />

                {/* College Bulk Pricing Section */}
                <div className="mt-16 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Need Bulk Pricing for Your College?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                        Get special educational discounts and bulk pricing for your institution. 
                        Perfect for colleges, universities, and educational organizations.
                    </p>
                    <a
                        href="/college-pricing"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200"
                    >
                        View College Bulk Pricing
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>

                {/* Refund & Cancellation Policy Link */}
                <div className="text-center mt-12">
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

export default PricingPlans;

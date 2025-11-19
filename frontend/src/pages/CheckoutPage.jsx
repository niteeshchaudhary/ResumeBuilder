import React from 'react';
import axios from "../assets/AxiosConfig";
import { companyLogo } from '../assets/Images';
import './checkout.css';
import { useLocation } from 'react-router-dom';
import { load } from "@cashfreepayments/cashfree-js";

const host = import.meta.env.VITE_HOST;
const RAZORPAY_API_KEY = import.meta.env.VITE_RAZORPAY_API_KEY;
const CASHFREE_MODE = import.meta.env.VITE_CASHFREE_MODE;

const CheckoutPage = () => {
  const location = useLocation();
  const state = location.state;
  const [error, setError] = React.useState('');
  const [cfdata, setCfdata] = React.useState('');
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    description: "",
  });
  const [items, setItems] = React.useState(state);

  function loadScript(src) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  function validateFields() {
    if (formData.phone.length !== 10) {
      setError("Phone number should be 10 digits");
      return false;
    } else if (formData.zipCode.length !== 6) {
      setError("Zip code should be 6 digits");
      return false;
    } else if (formData.email.length < 6 || !formData.email.includes('@') || !formData.email.includes('.')) {
      setError("Email should be valid");
      return false;
    }
    return true;
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handlePayment(provider) {
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.zipCode || !formData.country || !formData.phone) {
      setError("Please fill in all fields");
    } else if (!validateFields()) {
      return;
    } else {
      setError("");
      provider === "razorpay" ? displayRazorpay() : displayCashfree();
    }
  }

  async function displayRazorpay() {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    const result = await axios.post("/payment/orders", {
      amount: items.price * 100,
      planid: state.id,
      discount: state.discount,
      notes: items
    }).catch((err) => {
      alert(err?.response?.data?.error || "Error");
    });

    if (!result) return;

    const { amount, id: order_id, currency } = result.data;

    const options = {
      key: RAZORPAY_API_KEY,
      amount: amount.toString(),
      currency,
      name: formData.name,
      description: formData.description,
      image: companyLogo,
      order_id,
      handler: async function (response) {
        const data = {
          orderCreationId: order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        };

        const result = await axios.post("/payment/success", data);
        alert(result.data.msg);
        window.location.href = window.location.href.split('/').slice(0, -1).join('/') + "/transactions";
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      notes: {
        address: formData.address,
      },
      theme: { color: "#61dafb" },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

  function displayCashfree() {
    axios.post("/cashfree/initiate", {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      planid: state.id,
      description: formData.description,
      amount: items.price,
      discount: state.discount,
      notes: items
    }).then((result) => {
      console.log("**", result);
      setCfdata(result.data);
    }).catch((err) => {
      console.log(err);
      alert(err?.response?.data?.error || "Error");
    });
  }
  if (cfdata) {
    let cashfree;
    console.log("HERE")
    var initializeSDK = async function () {
      cashfree = await load({
        mode: CASHFREE_MODE
      });
      console.log("in");
    }

    const doPayment = async () => {
      let checkoutOptions = {
        paymentSessionId: cfdata.payment_session_id,
        redirectTarget: "_self",
      };
      console.log("do");
      cashfree.checkout(checkoutOptions);
    };
    initializeSDK().then(() => {
      doPayment();
    }).catch(ex => {
      console.log(ex);
    })

  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4 bg-gray-50">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Checkout</h2>

        {/* Shipping Form */}
        <section className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Shipping Information</h3>
          <form className="space-y-4">
            {["name", "email", "address", "city", "zipCode", "country", "phone"].map((field) => (
              <input
                key={field}
                name={field}
                type={field === "email" ? "email" : field === "phone" || field === "zipCode" ? "number" : "text"}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </form>
        </section>

        {/* Order Summary */}
        <section className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Order Summary</h3>
          <div className="flex justify-between text-gray-600">
            <span>{items.name}</span>
            <span>₹ {items.price.toFixed(2)}</span>
          </div>
        </section>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Payment Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button onClick={() => handlePayment("razorpay")} className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            Pay with Razorpay
          </button>
          <button onClick={() => handlePayment("cashfree")} className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition">
            Pay with Cashfree
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

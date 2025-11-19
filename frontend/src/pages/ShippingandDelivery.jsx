import React from "react";
import Nav2 from "../components/Nav2";
import Footer from "../components/Footer";

const ShippingAndDelivery = () => {

    return (
        <>
            <Nav2 />
            <div style={{ width: "100vw" }}>
                <div style={{
                    margin: "80px 40px", padding: "24px", background: "#fff", borderRadius: "8px", height: "100vh",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                }}>
                    <h1>Shipping & Delivery</h1>
                    <p>
                        Our shipping and delivery services are fully online. You can place your orders through our website at any time,
                        and track your shipment status in real-time.
                    </p>
                    <ul>
                        <li>Fast and reliable delivery to your doorstep</li>
                        <li>Order tracking available online</li>
                        <li>Secure packaging for all shipments</li>
                        <li>Customer support available for any shipping inquiries</li>
                    </ul>
                    <p>
                        For more information or assistance, please contact our support team at <a href="mailto:support@resumeupgrader.in">support@resumeupgrader.in</a>
                    </p>
                </div>

                <Footer />
            </div >
        </>
    );
}

export default ShippingAndDelivery;
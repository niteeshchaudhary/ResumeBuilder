import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Verifying from "../components/Verifying";
import Success from "../components/Success";
import Failure from "../components/Failure";
const host = import.meta.env.VITE_HOST;
const VerifyEmail = () => {
    const { uidb64, token } = useParams();
    const [status, setStatus] = useState("verifying");

    useEffect(() => {
        const verify = async () => {
            try {
                await axios.get(
                    `${host}/reserish/verify-email/${uidb64}/${token}/`
                );
                setStatus("success");
            } catch (error) {
                setStatus("failure");
            }
        };

        if (uidb64 && token) {
            verify();
        }
    }, [uidb64, token]);

    return (
        <div className="App" style={{ height: "100vh", width: "100vw", padding: 0, margin: 0, overflowX: "hidden" }}>
            <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-100 flex items-center justify-center">
                {status === "verifying" && <Verifying />}
                {status === "success" && <Success />}
                {status === "failure" && <Failure />}
            </div>
        </div>
    );
};

export default VerifyEmail;

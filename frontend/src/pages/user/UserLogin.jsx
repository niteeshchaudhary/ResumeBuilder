import Nav1 from '../../components/Nav1';
import { useState, useContext,useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import axios from 'axios';
import { companyLogo } from '../../assets/Images';
import ResetPasswordModal from '../../components/FogotPass';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const host = import.meta.env.VITE_HOST;

export default function UserLogin() {
  const [processing, setProcession] = useState(false);
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { authState, login } = useContext(AuthContext);
  const navigator = useNavigate();

  if (authState.isAuthenticated && localStorage.getItem("accessToken")) {
    console.log("Auth State",authState.isAuthenticated);
    navigator("/u/");
  }
  useEffect(() => {
    console.log("Auth State",authState.isAuthenticated);
    if (authState.isAuthenticated && localStorage.getItem("accessToken")) {
      console.log("Auth State",authState.isAuthenticated);
      navigator("/u/");
    }
  }, [authState.isAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcession(true);
    axios.post(`${host}/reserish/api/u/login/`, { email, password })
      .then((response) => {
        localStorage.setItem("accessToken", response.data.access_token);
        localStorage.setItem("refreshToken", response.data.refresh_token);
        localStorage.setItem("isEnterprise", response.data?.is_enterprise);
        login(response.data.access_token, response.data.refresh_token, response.data?.is_enterprise, 30 * 60).then(() => {
          console.log("Login successful");
          navigator("/u/");
          //
        }).catch((err) => {
          console.error("Login error:", err);
          setError("Login failed. Please try again.");
        });

      }).catch((error) => {
        if (error?.response?.data?.verify === false) {
          setError(<p>Please verify your Email address. If not received click <a href='/resendverificationlink' className='text-blue-800'>here</a>.</p>);
        } else {
          setError(error?.response?.data?.detail || error?.message || "Unknown Error occurred");
        }
      }).finally(() => {
        setProcession(false);
      });
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    setProcession(true); // Show loader immediately
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Google user info:", decoded);
    axios.post(`${host}/reserish/api/u/google-login/`, {
      token: credentialResponse.credential
    }).then((response) => {
      localStorage.setItem("accessToken", response.data.access_token);
      localStorage.setItem("refreshToken", response.data.refresh_token);
      login(response.data.access_token, response.data.refresh_token, response.data?.is_enterprise, 30 * 60).then(() => {
        console.log("Login successful");
        setTimeout(() => {
          console.log("Login.....");
          window.location.href = "/u/";
        }, 1000);
        // navigator("/u/");
      }).catch((err) => {
        console.error("Login error:", err);
        setError("Login failed. Please try again.");
      });
    }).catch(err => {
      console.error(err);
      setError("Google login failed. Please try again.");
    })
    .finally(() => {
        setProcession(false); // Hide loader
      });
  };

  const handleGoogleLoginFailure = () => {
    setError("Google login was unsuccessful.");
  };

  return (
    <div className="App" style={{ height: "100vh", width: "100vw", padding: 0, margin: 0, overflowX: "hidden" }}>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img src={companyLogo} alt="Company Logo" className="mx-auto h-10 w-auto " />
          <h2 className="mt-10 text-center text-2xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">Password</label>
                <button type="button" onClick={() => setIsOpen(true)} className="text-sm text-indigo-600 hover:text-indigo-500">Forgot password?</button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              {processing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500 border-solid mx-auto"></div>
              ) : (
                <button
                  type="submit"
                  className="w-full flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Sign in
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center flex flex-col justify-center items-center" style={{"alignItems": "center"}}>
            <p className="text-sm text-gray-500 mb-2">Or</p>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
            />
          </div>

          <ResetPasswordModal temail={email} isOpen={isOpen} onClose={() => setIsOpen(false)} />
          <p className="mt-4 text-center text-sm text-red-500">{error}</p>
        </div>
      </div>
    </div>
  );
}

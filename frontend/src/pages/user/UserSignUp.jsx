import { useState, useContext,useEffect} from 'react';
import axios from 'axios';
import { AuthContext } from "../../auth/AuthContext";
import { useNavigate,useSearchParams } from "react-router-dom";
import Nav1 from '../../components/Nav1';
import { companyLogo } from '../../assets/Images';
import { Switch } from '@headlessui/react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const host = import.meta.env.VITE_HOST;

export default function UserSignUp() {
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [success, setSuccess] = useState(false);
  const { authState, login } = useContext(AuthContext);
  const [error, setError] = useState('');
  const navigator = useNavigate();
  const [searchParams] = useSearchParams();
  
    // Check for referral code in URL
  useEffect(() => {
    const refCode = searchParams.get('ref');
    console.log("Referral code from URL:", refCode);
    if (refCode) {
      setReferralCode(refCode);
      
    }
  }, [searchParams]);

  const validations = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'At least 1 number', regex: /[0-9]/ },
    { label: 'At least 1 lowercase letter', regex: /[a-z]/ },
    { label: 'At least 1 uppercase letter', regex: /[A-Z]/ },
    { label: 'At least 1 special character', regex: /[^A-Za-z0-9]/ },
  ];

  if (authState.isAuthenticated && localStorage.getItem("accessToken")) {
     navigator("/u/");
  }

  const isPasswordValid = validations.every(rule => rule.regex.test(password));
  const isFormValid = email && isPasswordValid && agreed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Please fill all fields correctly.");
      return;
    }
    setError('');
    setProcessing(true);
    axios.post(`${host}/reserish/api/register/`, {
      email,
      password,
      "is_enterprise": false,
      referral_code: referralCode || undefined
    }).then((response) => {
      console.log(response.data);
      setSuccess(true);
    }).catch((error) => {
      setProcessing(false);
      console.log(error);
      if (typeof error?.response?.data === 'object' && error?.response?.data !== null) {
        const ekeys=Object.keys(error?.response?.data)
        if(ekeys.length !== 0) {
          setError(ekeys.map((key) => {
            return `${key.charAt(0).toUpperCase() + key.slice(1)}: ${error?.response?.data[key]}`;
          }).join(', '));
        }
      }
      else if (error?.response?.data?.error) {
        setError(error?.response?.data?.error);
      }
      else if (error?.response?.request?.response) {
        setError(error?.response?.request?.response);
      }
      else {
        setError(error.message);
      }
    });
  };

  // Google Login Handler
  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const email = decoded.email;

      axios.post(`${host}/reserish/api/u/google-login/`, {
        token: credentialResponse.credential,
        email,
        referralCode: referralCode || undefined
      }).then((response)=>{
        const data = response.data;
        console.log("Google login response:", data);
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        login(data.access_token, data.refresh_token, data?.is_enterprise, 30 * 60).then(() => {
          navigator("/u/");
          console.log("Login successful");
          console.log("accessToken:", data.access_token);
          console.log("refreshToken:", data.refresh_token);
        }).catch((err) => {
          console.error("Login error:", err);
          setError("Login failed. Please try again.");
        });

      })

      
    } catch (err) {
      console.error("Google login failed", err);
      setError("Google authentication failed");
    }
  };

  return (
    <>
      <div className="App" style={{ height: "100vh", width: "100vw", padding: 0, margin: 0, overflowX: "hidden" }}>
        {/* <Nav1 isSignup={true}/> */}
        {success === true ? (
          <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-purple-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
              <h1 className="text-2xl font-bold text-purple-700 text-center mb-4">Registration Successful</h1>
              <p className="text-gray-600 text-center mb-6">Your account has been created. Please log in to continue.</p>
              <div className="flex justify-center">
                <button
                  onClick={() => navigator("/u/login")}
                  className="px-6 py-2 text-white bg-purple-600 hover:bg-purple-700 transition-all duration-200 rounded-md shadow-md"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
              <img src={companyLogo} alt="Company Logo" className="mx-auto h-10 w-auto " />
              <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                Create a New Account
              </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                    Password
                  </label>
                  <div className="mt-2">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    {password && (
                      <ul className="text-sm space-y-1">
                        {validations.map((rule, idx) => {
                          const isValid = rule.regex.test(password);
                          return (
                            <li key={idx} className="flex items-center gap-2">
                              <i className={`fa-solid ${isValid ? 'fa-check text-green-600' : 'fa-xmark text-red-500'}`}></i>
                              <span className={`${isValid ? 'opacity-60' : ''}`}>{rule.label}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>

                <Switch.Group as="div" className="flex gap-x-4 sm:col-span-2">
                  <div className="flex h-6 items-center">
                    <Switch
                      checked={agreed}
                      onChange={setAgreed}
                      className={classNames(
                        agreed ? 'bg-indigo-600' : 'bg-gray-200',
                        'flex w-8 flex-none cursor-pointer rounded-full p-px ring-1 ring-inset ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      )}
                    >
                      <span className="sr-only">Agree to policies</span>
                      <span
                        aria-hidden="true"
                        className={classNames(
                          agreed ? 'translate-x-3.5' : 'translate-x-0',
                          'h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out'
                        )}
                      />
                    </Switch>
                  </div>
                  <Switch.Label className="text-sm leading-6 text-gray-600">
                    By selecting this, you agree to our{' '}
                  </Switch.Label>
                  <a href="/termsandconditions" className="font-semibold text-indigo-600">
                    Terms & Conditions
                  </a>
                </Switch.Group>

                <div>
                  <button
                    type="submit"
                    disabled={!isFormValid || processing}
                    className={`w-full py-2 px-4 rounded-md text-white font-semibold transition 
                      ${!isFormValid || processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                  >
                    {processing ? 'Signing up...' : 'Sign Up'}
                  </button>
                </div>
              </form>

              <p className="mt-10 text-center text-sm text-red-500">
                {error}
              </p>

              {/*  Google Login below */}
              <div className="mt-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google login failed")}
                />
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}

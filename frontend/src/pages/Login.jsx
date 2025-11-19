import React from 'react';
import { enterpriseImage, UserImage } from '../assets/Images';
import { useNavigate } from 'react-router-dom';
import Nav1 from '../components/Nav1';
import Footer from '../components/Footer';
import './login.css';
import { GoogleLogin } from '@react-oauth/google';


export default function Login ()  {
  const navigator = useNavigate();
  const navigateTo = (path) => {
    navigator(path);
  }

const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwt_decode(credentialResponse.credential);
    console.log("Google User:", decoded);
    localStorage.setItem("googleUser", JSON.stringify(decoded));
    navigator("/u/");
  };

  return (
    <div style={{overflowX:"hidden"}}>
      <div className="App" style={{display:"flex",height:"100vh",width:"100vw",padding:0,margin:0,overflowX:"hidden"}}>
        <Nav1 isSignup={true}/>
        {/* Left side - Enterprise Login */}
        <div className="w-1/2 bg-gray-100 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <h2 className="text-3xl font-semibold mb-8">Enterprise Login</h2>
              <img src={enterpriseImage} alt="Enterprise" className="w-48 mx-auto mb-6" />
              <div className='flex gap-3 items-center justify-center'>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={() => navigateTo('/e/login')}
                >Login</button>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={() => navigateTo('/e/signup')}
                >Sign Up</button>
              </div>
          </div>
        </div>

        {/* Right side - User Login */}
        <div className="w-1/2 bg-white flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <h2 className="text-3xl font-semibold mb-8">User <div className='break'></div> Login</h2>
            <img src={UserImage} alt="User" className="w-48 mx-auto mb-6" />
            <div className='flex gap-3 items-center justify-center'>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => navigateTo('/u/login')}
              >Login</button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={() => navigateTo('/u/signup')}
              >Sign Up</button>

              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.log("Google Login Failed");
                }}
              />
              
            </div>
          </div>
        </div>
        
      </div>
      <Footer/>
    </div>
  );
};


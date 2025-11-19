// AuthContext.js
import { createContext, useEffect, useState } from "react";
import axios,{axios2} from "../assets/AxiosConfig";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    userDetails: null,
    isAuthenticated: false,
    isEnterprise: false,
    accessToken: null,
    refreshToken: null,
    tokenExpiryTime: Math.floor(Date.now() / 1000) + 1800,
  });

  useEffect(() => {
    const tokenExpiryTimer = setTimeout(refreshToken, calculateTimeToRefresh());

    return () => clearTimeout(tokenExpiryTimer);
  }, [authState.accessToken]); // Refresh token timer whenever access token changes

  useEffect(() => {
    console.log("::",authState);
    if (!authState.isAuthenticated && localStorage.getItem("accessToken")) {
      refreshToken();
      console.log("refreshed");
    }
  }, [authState]);

  const calculateTimeToRefresh = () => {
    // Calculate time remaining until token expiry
    const currentTime = Math.floor(Date.now() / 1000);
    const expiresIn = authState.tokenExpiryTime - currentTime;
    // Set the timer to refresh the token 5 seconds before expiry
    return Math.max(0, expiresIn - 5) * 1000;
  };

  const login = async (accessToken, refreshToken,isEnterprise,expiresIn) => {
    const user_details = await getUserDetails();
    if (user_details) {
      setAuthState({
        userDetails: user_details,
        isEnterprise,
        isAuthenticated: true,
        accessToken,
        refreshToken,
        tokenExpiryTime: Math.floor(Date.now() / 1000) + expiresIn,
      });
      console.log(Math.floor(Date.now() / 1000) + expiresIn);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("isEnterprise", isEnterprise);
      localStorage.setItem("tokenExpiryTime", authState.tokenExpiryTime);
    } else {
      logout();
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      isEnterprise: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiryTime: null,
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiryTime");
    localStorage.removeItem("isEnterprise");
    // window.location.replace("/");
  };

  const getUserDetails = async () => {
    try {
      const response = await axios.get("/complete-profile/");

      console.log(response.data, "_____");
      return response.data;
      // if (response.data) {
      //   setAuthState({ ...authState, userDetails: response.data });
      // } else {
      //   logout(); // Log out user if refresh token is invalid
      // }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    console.log(refreshToken);
    if (!refreshToken) return;
    try {
      const response = await axios2.post("/token/refresh/", {
        refresh: refreshToken,
      });
      console.log(response.data);
      if (response.data?.access) {
        console.log(response.data);
        const access_token = await response.data?.access;
        const isEnterprise = localStorage.getItem("isEnterprise") === "true";
        console.log("mydebug",isEnterprise); 
        login(access_token, refreshToken, isEnterprise, 1800);
      } else {
        logout(); // Log out user if refresh token is invalid
      }
    } catch (error) {
      if(error?.response?.status === 401) {
        logout(); // Log out user if refresh token is invalid
      }
      console.error("Error refreshing token:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ authState, login, logout, refreshToken, getUserDetails }}
    >
      {children}
    </AuthContext.Provider>
  );
};

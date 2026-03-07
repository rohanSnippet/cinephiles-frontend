import React, { createContext, useState, useEffect, useCallback } from "react";
import { baseURL, SignUpUser, userLogin } from "../Services/URL";
import useAxiosPublic from "../Hooks/AxiosPublic";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState({
    username: "",
    token: "",
  });
  const axiosPublic = useAxiosPublic();

  // Helper: Check if token is expired
  const isTokenExpired = () => {
    const expiry = localStorage.getItem("token-expiry");
    if (!expiry) return false;
    return Date.now() > expiry;
  };

  const signOut = useCallback(() => {
    console.log("Signing out...");
    localStorage.removeItem("username");
    localStorage.removeItem("access-token");
    localStorage.removeItem("token-expiry");
    setUserData({ username: "", token: "" });
    setSession(null);
  }, []);

  const signIn = async (username, password) => {
    try {
      const data = await userLogin(username, password);
      const token = data.jwtToken || data.token;

      handleLoginSuccess(token, data.username);
      return data;
    } catch (error) {
      console.error("Error during sign-in:", error);
      throw error;
    }
  };

   const createUser = async (firstName, lastName, email, password) => {
      try {
        // Assuming SignUpUser is your API call from Services/URL.js
        const response = await SignUpUser(firstName, lastName, email, password);
        return response;
      } catch (error) {
        throw error;
      }
    };

  const googleSignUp = () => {
    window.location.href = `${baseURL}/oauth2/authorization/google`;
  };

  // Centralized function to set state and storage
  const handleLoginSuccess = (token, username) => {
      // 1. Save to LocalStorage
      localStorage.setItem("access-token", token);
      localStorage.setItem("username", username);

      // 2. Decode and save expiry
      try {
        const tokenPayload = JSON.parse(atob(token.split(".")[1]));
        const tokenExpiry = tokenPayload.exp * 1000;
        localStorage.setItem("token-expiry", tokenExpiry);
      } catch (e) {
        console.error("Error parsing token payload", e);
      }

      // 3. Update React State
      setUserData({ username: username, token: token });
      console.log("User logged in successfully:", username);
  };

  useEffect(() => {
    // --- STEP 1: Check URL for Token (OAuth Redirect) ---
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      console.log("DETECTED TOKEN IN URL:", urlToken);
      
      // Try to extract username from token (usually in 'sub' field)
      let extractedUsername = "User"; 
      try {
          const payload = JSON.parse(atob(urlToken.split(".")[1]));
          if (payload.sub) extractedUsername = payload.sub;
      } catch(e) {}

      handleLoginSuccess(urlToken, extractedUsername);

      // Clean the URL so the token doesn't stay in the browser address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    } 
    // --- STEP 2: Check LocalStorage (Page Reload) ---
    else {
        const storedToken = localStorage.getItem("access-token");
        const storedUser = localStorage.getItem("username");

        if (storedToken && storedUser && !isTokenExpired()) {
            console.log("Restoring session from storage...");
            setUserData({ username: storedUser, token: storedToken });
        } else if (isTokenExpired()) {
            signOut();
        }
    }
  }, [signOut]);

  // --- STEP 3: Fetch Full User Profile ---
  useEffect(() => {
      // We only fetch if we have a token in state
      if (userData.token) {
          axiosPublic.get(`${baseURL}/auth/user-info`, { 
               headers: { Authorization: `Bearer ${userData.token}` }
          })
          .then((res) => {
              const email = res.data.email || res.data.username;
              setSession(res.data);
              // Ensure username is synced if it was generic before
              if (email && userData.username !== email) {
                  localStorage.setItem("username", email);
                  setUserData(prev => ({ ...prev, username: email }));
              }
          })
          .catch((err) => {
              console.error("Failed to fetch user session", err);
          });
      }
  }, [userData.token, axiosPublic]);

  const authInfo = {
    session,
    setSession,
    userData,
    signIn,
    signOut,
    googleSignUp,
    createUser
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
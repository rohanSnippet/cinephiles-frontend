import React, { createContext, useState, useEffect } from "react";
import { SignUpUser, userLogin } from "../Services/URL";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    username: "",
    token: "",
  });

  const [city, setCity] = useState();

  const createUser = async (firstName, lastName, username, password) => {
    try {
      return await SignUpUser(firstName, lastName, username, password);
    } catch (error) {
      console.error("Error during sign-up:", error);
      throw error;
    }
  };

  const signIn = async (username, password) => {
    try {
      const data = await userLogin(username, password);
      setUserData({ username: data.username, token: data.jwtToken });
      localStorage.setItem("access-token", data.jwtToken);
      localStorage.setItem("username", data.username);
      const tokenPayload = JSON.parse(atob(data.jwtToken.split(".")[1]));
      const tokenExpiry = tokenPayload.exp * 1000;
      localStorage.setItem("token-expiry", tokenExpiry);
      return data;
    } catch (error) {
      console.error("Error during sign-in:", error);
      throw error;
    }
  };

  const isTokenExpired = () => {
    const expiry = localStorage.getItem("token-expiry");
    if (!expiry) return false;

    return Date.now() > expiry;
  };

  if (isTokenExpired()) {
    localStorage.removeItem("username");
    localStorage.removeItem("access-token");
  }

  /* const handleOAuthRedirect = async () => {
    // Assuming you get redirected here after OAuth success
    const token = getOAuthTokenFromUrl(); // Implement this function to extract token from URL

    if (token) {
      try {
        // Now you will get user data along with the token
        const response = await fetch("/api/oauth/success", {
          // Your backend endpoint to handle success
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await response.json();

        // Store user data in context and local storage
        setUserData({ username: userData.username, token: userData.token });
        localStorage.setItem("access-token", userData.token);
        localStorage.setItem("username", userData.username);
        const tokenPayload = JSON.parse(atob(userData.token.split(".")[1]));
        const tokenExpiry = tokenPayload.exp * 1000;
        localStorage.setItem("token-expiry", tokenExpiry);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  }; */

  useEffect(() => {
    // handleOAuthRedirect();
    const storedUser = localStorage.getItem("username");
    const storedToken = localStorage.getItem("access-token");

    if (isTokenExpired()) {
      setUserData({ username: "", token: "" });
      localStorage.removeItem("username");
      localStorage.removeItem("access-token");
      localStorage.removeItem("token-expiry");
    } else if (storedUser && storedToken) {
      setUserData({ username: storedUser, token: storedToken });
    }
  }, []); // Run once on component mount

  const authInfo = {
    createUser,
    userData,
    signIn,
    city,
    setCity,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;

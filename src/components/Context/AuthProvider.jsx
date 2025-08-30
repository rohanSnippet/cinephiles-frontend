import React, { createContext, useState, useEffect } from "react";
import {  baseURL, SignUpUser, userLogin } from "../Services/URL";
import axios from "axios";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [city, setCity] = useState();
  const [session, setSession] = useState()
  const [userData, setUserData] = useState({
    username: "",
    token: "",
  });

  /**************  Form based signup and login methods *************************/
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

    //****************** OAuth2 Methods **********************************/
 const googleSignUp =()=>{
  window.location.href = `${baseURL}/oauth2/authorization/google`;
  console.log("auth called on "+baseURL+"/oauth2/authorization/google")
 }

  //****************** Refresh token Methods **********************************/
  const isTokenExpired = () => {
    const expiry = localStorage.getItem("token-expiry");
    if (!expiry) return false;

    return Date.now() > expiry;
  };

  if (isTokenExpired()) {
    localStorage.removeItem("username");
    localStorage.removeItem("access-token");
  }
  useEffect(() => {
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
  }, []);


  useEffect(() => {
   
     const getSession = ()=>{
      axios.get(`${baseURL}/auth/user-info`,{withCredentials:true}).then((res)=>{
        //console.log("Get Session : ",res.data)
         localStorage.setItem("username",res.data.email)
             setSession(res.data)
              //  console.log(res.data)
              setUserData(prevData=>({...prevData,username:res.data.email}))
      }).catch(err=>{
        console.error(err)
      })
    } 
      
  getSession();   

   const handleOAuth2Response = async () => {
    const response = await fetch(`${baseURL}/auth/callback`, {
        method: 'GET',
        credentials: 'include',
    });
    console.log(response)

    if (response.ok) {
        const data = await response.json();
        const token = data.token;
  
      localStorage.setItem('access-token', token);
      setUserData(prevData=>({...prevData,token:token}))
    } else {
        console.error('Failed to authenticate ');
    }
};


handleOAuth2Response(); 
  }, []);

  const authInfo = {
    session,
    setSession,
    createUser,
    userData,
    signIn,
    city,
    setCity,
    googleSignUp
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;

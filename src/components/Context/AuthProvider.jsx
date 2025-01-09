import React, { createContext, useState, useEffect } from "react";
import { frontURL, SignUpUser, userLogin } from "../Services/URL";
import supabase from "../Services/supabaseConfig";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [city, setCity] = useState();
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

  //**************** supabase Email and password ********************//

  //1.Sign up with email
  const signUpNewUser =async(firstName,lastName,email,password)=> {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_Name:lastName,
          phone:8989898989,
          age: null,
        },
        emailRedirectTo: frontURL ,
      },
    })

    if(error){
      console.log(error)
    }

    return data;
  }
  
  //2.Sign in with email
  const signInWithEmail=async(email,password)=>{
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
  
    if(error){
      console.log(error)
    }

    return data;
  }
  
    //*************** supabase OAuth ********************//

    //1. With Google
    const signOutGoogle = async()=> {
      const {data,error} = await supabase.auth.signOut();
      if(error) console.log(error)

        return data;
    }

    const signUpWithGoogle = async()=>{
     const{data,error} =  await supabase.auth.signInWithOAuth({
        provider:'google',
      });

      if(error) console.log(error)

    return data;    
    }
console.log(session.user.user_metadata)
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

 /* useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
     /*  let userInfo = {
        firstName,
        lastName,
        username,
        password,
        profile,
        provider,
        providerId
      }
      createUser(userInfo) 
    })
   
    return () => subscription.unsubscribe()
  }, [])*/

  const authInfo = {
    createUser,
    userData,
    signIn,
    city,
    setCity,
    signUpNewUser,
    signInWithEmail,
    session,
    signOutGoogle,
    signUpWithGoogle
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;

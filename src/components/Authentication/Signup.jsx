import React, { useContext, useEffect, useState } from "react";
import { Link, redirect, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../Context/AuthProvider";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import { FaGithubAlt } from "react-icons/fa";
import insta from "../../assets/insta.png";
import supabase from "../Services/supabaseConfig";

const Signup = () => {
  const { createUser, signUpNewUser , session , signUpWithGoogle,signOutGoogle} = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);

  // Toast success
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
    background: "linear-gradient(to right, #000000 , #2D3436)",
    color: "#fff",
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  // Check if a string contains only alphabets
  function containsOnlyAlphabets(str) {
    return /^[a-zA-Z]+$/.test(str);
  }

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName || formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters long";
    }
    if (!formData.lastName || formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters long";
    }
    if (!containsOnlyAlphabets(formData.firstName)) {
      newErrors.firstName = "First name must contain only alphabets";
    }
    if (!containsOnlyAlphabets(formData.lastName)) {
      newErrors.lastName = "Last name must contain only alphabets";
    }
    const right = false;
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setLoading(true);
      try {
        const result = await signUpNewUser(formData.firstName,formData.lastName,formData.email,formData.password); 
        console.log(result.user.user_metadata.first_name)
        const response = await createUser(
          result.user.user_metadata.first_name,
          result.user.user_metadata.last_name,
          result.user.user_metadata.email, // Ensure this is passed correctly
          formData.password
        );
        console.log(response.data);
        // Check if response is successful
        if (response.status === 200 || response.status == 201) {
          // Assuming 201 is the success status

          await Toast.fire({
            icon: "success",
            title: "Signed up successfully",
          });
          navigate("/login");
        } else {
          // Handle errors from the server
          const data = response.data;
          setErrors({ general: data.message || "Something went wrong" });
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: data.message || "Something went wrong",
          });
        }
      } catch (error) {
        if (error.response && error.response.status === 409) {
          setErrors({ general: "User already exists" });
          Swal.fire({
            icon: "warning",
            title: "Oops..",
            text: "User Already Exists",
            footer: '<a href="#">Try another email</a>',
          });
        } else {
          setErrors({ general: "Network error" });
          console.log(error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Network error",
            footer: '<a href="#">Check Connection</a>',
          });
        }
      } finally {
        setLoading(false);
      }
    }
  }; 

  const handleEye = () => {

    setVisible(!visible);
  }; 

   const signUp = async()=>{
    const res = await signUpWithGoogle();
   
   }

    const signout = async()=>{
      const res = await signOutGoogle();
      console.log(res)
    }
   /* if (!session) {
      return ( <div className="min-h-screen w-[40%] my-[12vh] mx-[30%] justify-center align-middle text-center   rounded-xl "><Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }}  socialLayout="horizontal"/> </div>)
    }
    else {
      return (<div><h2>Welcome {session?.user?.email} !!</h2>
      <button onClick={signout}>Sign Out</button></div>)
    } */

  if(!session){
    return (
      <div className="min-h-screen w-[40%] my-[12vh] mx-[30%] justify-center align-middle text-center   rounded-xl ">
         <div className="relative bg-gradient-to-br from-black/90 via-black/50 to-black/40 py-36 rounded-xl pt-16 px-[15%] w-full shadow-gray-700 shadow-2xl">
          <h2 className="text-center justify-center text-white text-xl mb-8 poppins-semibold">
            Sign Up
          </h2>
          <form method="dialog" onSubmit={handleSubmit}>
            <label className="input input-bordered my-5 rounded-2xl flex items-center gap-2">
              <input
                type="text"
                name="firstName"
                className="grow roboto-regular"
                required
                onChange={handleChange}
                value={formData.firstName}
                placeholder="Enter Your First Name"
              />
              {errors.firstName && <p className="errors">{errors.firstName}</p>}
            </label>
            <label className="input input-bordered my-5 rounded-2xl flex items-center gap-2">
              <input
                type="text"
                name="lastName"
                className="grow roboto-regular"
                required
                onChange={handleChange}
                value={formData.lastName}
                placeholder="Enter Your Last Name"
              />
              {errors.lastName && <p className="errors">{errors.lastName}</p>}
            </label>
            <label className="input input-bordered my-5 rounded-2xl flex items-center gap-2">
              <input
                type="email"
                name="email"
                className="grow roboto-regular"
                onChange={handleChange}
                value={formData.email}
                required
                placeholder="Email"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70"
              >
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
              {errors.email && <p className="errors">{errors.email}</p>}
            </label>
            {visible ? (
              <label className="input input-bordered my-5 rounded-2xl flex items-center gap-2">
                <input
                  type="password"
                  name="password"
                  className="grow roboto-regular"
                  required
                  onChange={handleChange}
                  value={formData.password}
                  minLength={6}
                  placeholder="Enter password"
                />
                <GoEye onClick={handleEye} className="cursor-pointer" />
                {errors.password && <p className="errors">{errors.password}</p>}
              </label>
            ) : (
              <label className="input input-bordered my-5 rounded-2xl flex items-center gap-2">
                <input
                  type="text"
                  name="password"
                  className="grow roboto-regular"
                  required
                  onChange={handleChange}
                  value={formData.password}
                  minLength={6}
                  placeholder="Enter password"
                />
                <GoEyeClosed onClick={handleEye} className="cursor-pointer" />
                {errors.password && <p className="errors">{errors.password}</p>}
              </label>
            )}
            <button
              type="submit"
              className="bg-gradient-to-br from-white via-white/90 to-gray-300 hover:scale-110 transition-transform duration-300 px-4 py-1 rounded-2xl text-black poppins-regular shadow-md shadow-slate-500 mt-0 hover:text-black/80"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
            {errors.general && <p className="errors">{errors.general}</p>}
            <Link
              to="/login"
              className=" absolute px-4 py-1 mt-10 left-[30%] rounded-2xl text-white text-md roboto-light underline hover:text-blue-500"
            >
              Already have an account? Login.
            </Link>
            {errors.general && <p className="errors">{errors.general}</p>}
            {" "}
          </form>
          <span className="flex justify-center absolute left-[34%] bottom-[8%] space-x-12">
            <button type="" onClick={signUp}>
              <FcGoogle
                size={34}
                className="bg-white rounded-full cursor-pointer"
              />
            </button>
              <FaGithubAlt
                size={34}
                className="text-black bg-white rounded-full cursor-pointer"
              />
              <span className=" bg-white rounded-full p-[6px] cursor-pointer">
                {" "}
                <img src={insta} className="w-[25px] h-[25px] bg-white" />
              </span>
              
            </span>
        </div> 
        
      </div>
    );
  }else{
 return( <div><h2>Welcome {session?.user?.user_metadata?.full_name} !! </h2><button onClick={signout}>Sign Out</button></div>)
  }
};

export default Signup;

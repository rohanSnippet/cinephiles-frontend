import React, { useContext, useEffect, useState } from "react";
import { Link, redirect, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../Context/AuthProvider";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import { FaGithubAlt } from "react-icons/fa";
import insta from "../../assets/insta.png";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { SwalStyles } from "../../Styles/StylesServer";

const Signup = () => {
  const { createUser, googleSignUp } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

    if (typeof document !== "undefined") {
      const styleSheet = document.createElement("style");
      styleSheet.textContent = SwalStyles;
      document.head.appendChild(styleSheet);
    }

  // Toast success
   const Toast = Swal.mixin({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
              background:
                "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2D3436 100%)",
              color: "#fff",
              iconColor: "#4ade80",
              customClass: {
                container: "swal-container",
                popup: "swal-popup",
                title: "swal-title",
                timerProgressBar: "swal-progress",
              },
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
  
                // Add custom animation
                toast.style.transform = "translateX(100%)";
                toast.style.transition = "transform 0.3s ease-out";
                setTimeout(() => {
                  toast.style.transform = "translateX(0)";
                }, 10);
              },
              willClose: (toast) => {
                // Add exit animation
                toast.style.transition =
                  "transform 0.3s ease-in, opacity 0.3s ease-in";
                toast.style.transform = "translateX(100%)";
                toast.style.opacity = "0";
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
        const response = await createUser(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );
        if (response.status === 200 || response.status === 201) {
          await Toast.fire({
            icon: "success",
            title: "Signed up successfully",
          });
          navigate("/login");
        } else {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Home Button */}
      <button
        onClick={()=>navigate("/")}
        className="absolute top-4 right-4 md:top-6 md:right-6 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span className="hidden sm:inline">Home</span>
      </button>
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-gradient-to-br from-black/90 via-black/50 to-black/40 rounded-xl py-8 md:py-10 lg:py-12 px-4 md:px-6 lg:px-8 shadow-2xl shadow-gray-700">
        <div className="flex justify-center mb-6">
          <h2 className="text-white text-2xl md:text-3xl font-semibold poppins-semibold">
            Sign Up
          </h2>
        </div>

        <div className="flex flex-col items-center mb-6">
          <p className="text-gray-400 text-sm text-center">
            Please enter your details
          </p>
        </div>
        {/* Social Login Buttons */}
        <div className="flex justify-center space-x-6 md:space-x-8 mt-8">
          <button
            type="button"
            onClick={googleSignUp}
            className="p-2 bg-white rounded-full hover:scale-110 transition-transform duration-200"
          >
            <FcGoogle size={28} className="md:w-7 md:h-7" />
          </button>
          {/*  <button className="p-2 bg-white rounded-full hover:scale-110 transition-transform duration-200">
            <FaGithubAlt size={28} className="text-black md:w-7 md:h-7" />
          </button>
          <button className="p-2 bg-white rounded-full hover:scale-110 transition-transform duration-200">
            <img src={insta} className="w-6 h-6 md:w-7 md:h-7" alt="Instagram" />
          </button> */}
        </div>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-4 flex-shrink text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {/* First Name */}
          <div className="relative">
            <input
              type="text"
              name="firstName"
              className="w-full px-4 py-3 rounded-2xl border border-gray-600 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              onChange={handleChange}
              value={formData.firstName}
              placeholder="Enter Your First Name"
            />
            {errors.firstName && (
              <p className="text-red-400 text-xs mt-1 ml-2 text-left">
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="relative">
            <input
              type="text"
              name="lastName"
              className="w-full px-4 py-3 rounded-2xl border border-gray-600 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              onChange={handleChange}
              value={formData.lastName}
              placeholder="Enter Your Last Name"
            />
            {errors.lastName && (
              <p className="text-red-400 text-xs mt-1 ml-2 text-left">
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <div className="flex items-center">
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 rounded-2xl border border-gray-600 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                value={formData.email}
                required
                placeholder="Email"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-5 w-5 opacity-70 text-white absolute right-3"
              >
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1 ml-2 text-left">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <div className="flex items-center">
              <input
                type={visible ? "text" : "password"}
                name="password"
                className="w-full px-4 py-3 rounded-2xl border border-gray-600 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
                onChange={handleChange}
                value={formData.password}
                minLength={6}
                placeholder="Enter password"
              />
              <span
                onClick={handleEye}
                className="absolute right-3 cursor-pointer text-white"
              >
                {visible ? <GoEye size={20} /> : <GoEyeClosed size={20} />}
              </span>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1 ml-2 text-left">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-br from-white via-white/90 to-gray-300 hover:scale-105 transition-transform duration-300 py-3 rounded-2xl text-black font-medium poppins-regular shadow-md shadow-slate-500/50 hover:text-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          {errors.general && (
            <p className="text-red-400 text-sm text-center">{errors.general}</p>
          )}
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-white text-sm md:text-base roboto-light underline hover:text-blue-400 transition-colors"
          >
            Already have an account? Login.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

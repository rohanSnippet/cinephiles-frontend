import { Link, useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import insta from "../../assets/insta.png";
import { AuthContext } from "../Context/AuthProvider";
import { FaGithubAlt } from "react-icons/fa";
import { baseURL } from "../Services/URL";
import { SwalStyles } from "../../Styles/StylesServer";

const Login = () => {
  const [user, setUser] = useState({ username: "", password: "" });
  const [visible, setVisible] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { signIn, googleSignUp } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  // Add these styles to your CSS

  if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = SwalStyles;
    document.head.appendChild(styleSheet);
  }

  // Using optional chaining with default values to avoid destructure errors
  const {
    selectedShow = null,
    nextPath = "/",
    movie = null,
    theatre = null,
    selectedDate = null,
  } = location.state || {};

  const setDetails = (field, value) => {
    setUser({ ...user, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!user.username || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.username)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!user.password || user.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setLoading(true);
      const { username, password } = user;
      try {
        const data = await signIn(username, password);
        if (data.jwtToken) {
          console.log("Login successful!");
          const res = await axiosSecure.get(`/user?username=${username}`);
          const currUser = res.data;
          console.log(currUser);

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
          Toast.fire({
            icon: "success",
            title: `Welcome ${currUser?.firstName || ""} ${
              currUser?.lastName || currUser?.username || ""
            }`,
          });

          setTimeout(() => {
            navigate(nextPath, {
              state: {
                selectedShow,
                movie,
                theatre,
                selectedDate,
              },
            });
          }, 1000);
        } else {
          Swal.fire({
            icon: "warning",
            title: "Oops..",
            text: "Invalid Credentials",
            footer: '<a href="#">Try again</a>',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "warning",
          title: "Oops..",
          text: "Invalid Credentials",
          footer: '<a href="#">Try again</a>',
        });
        console.error("Login error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${baseURL}/oauth2/authorization/google`;
  };
  const handleGithubLogin = () => {
    window.location.href = `${baseURL}/oauth2/authorization/github`;
  };
  const handleEye = () => setVisible(!visible);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 md:top-6 md:right-6 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span className="hidden sm:inline">Home</span>
      </button>
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-gradient-to-br from-black/90 via-black/50 to-black/40 rounded-xl py-8 md:py-10 lg:py-12 px-4 md:px-6 lg:px-8 shadow-2xl shadow-gray-700">
        <div className="flex flex-col items-center mb-6">
          <h1 className="poppins-semibold text-white text-2xl md:text-3xl text-center mb-2">
            Sign In
          </h1>
          <p className="text-gray-400 text-sm text-center">
            Welcome back! Please enter your details
          </p>
        </div>

        {/* Social login buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={handleGoogleLogin}
            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Sign in with Google"
          >
            <FcGoogle size={24} />
          </button>
          {/*  <button 
            onClick={handleGithubLogin}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Sign in with GitHub"
          >
            <FaGithubAlt size={24} className="text-white" />
          </button> */}
        </div>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-4 flex-shrink text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-gray-300 text-sm">
              Email
            </label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="email"
                id="email"
                placeholder="Enter your email"
                value={user.username}
                onChange={(e) => setDetails("username", e.target.value)}
                required
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-gray-300 text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={visible ? "password" : "text"}
                id="password"
                className="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                onChange={(e) => setDetails("password", e.target.value)}
                value={user.password}
                minLength={6}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={handleEye}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                aria-label={visible ? "Show password" : "Hide password"}
              >
                {visible ? <GoEye size={18} /> : <GoEyeClosed size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-br from-white via-white/90 to-gray-300 hover:scale-105 transition-transform duration-300 py-3 rounded-2xl text-black font-medium poppins-regular shadow-md shadow-slate-500/50 hover:text-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in... " : "Login"}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <Link
            to="/Signup"
            className="text-white text-sm md:text-base roboto-light underline hover:text-blue-400 transition-colors"
          >
            Don't have an account? Sign up.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

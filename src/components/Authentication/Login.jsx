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

const Login = () => {
  const [user, setUser] = useState({ username: "", password: "" });
  const [visible, setVisible] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, googleSignUp } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

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

          Toast.fire({
            icon: "success",
            title: `Welcome ${currUser?.firstName || ""} ${
              currUser?.lastName || currUser.username
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-gradient-to-br from-black/90 via-black/50 to-black/20 shadow-2xl shadow-slate-600 p-6 md:p-8">
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
          <button 
            onClick={handleGithubLogin}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Sign in with GitHub"
          >
            <FaGithubAlt size={24} className="text-white" />
          </button>
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
            className="w-full bg-gradient-to-br from-white via-gray-100 to-gray-300 hover:from-gray-100 hover:to-white transition-all duration-300 py-3 rounded-xl text-black font-medium shadow-md mt-2"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link
              to="/Signup"
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
              state={location.state}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
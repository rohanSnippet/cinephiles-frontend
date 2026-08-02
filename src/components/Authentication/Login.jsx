import { Link, useLocation, useNavigate } from "react-router-dom";
// import useAxiosSecure from "../Hooks/AxiosSecure"; // Don't use this immediately after login
import axios from "axios"; // Use raw axios for the immediate fetch
import { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import { AuthContext } from "../Context/AuthProvider";
import { baseURL } from "../Services/URL";
import { SwalStyles } from "../../Styles/StylesServer";

const Login = () => {
  const [user, setUser] = useState({ username: "", password: "" });
  const [visible, setVisible] = useState(false); // standard is hidden
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { signIn, googleSignUp } = useContext(AuthContext);

  // Inject styles once
  useEffect(() => {
    if (typeof document !== "undefined" && SwalStyles) {
      const styleSheet = document.createElement("style");
      styleSheet.textContent = SwalStyles;
      document.head.appendChild(styleSheet);
      return () => {
        if(document.head.contains(styleSheet)) document.head.removeChild(styleSheet);
      }
    }
  }, []);

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
      return;
    }

    setLoading(true);
    const { username, password } = user;
    
    try {
      const data = await signIn(username, password);
      
      // Determine token key
      const token = data.jwtToken || data.token;

      if (token) {
        console.log("Login successful!");
        
        // VITAL FIX: Use raw axios with explicit header. 
        // usage of axiosSecure here fails because React state hasn't updated the interceptor yet.
        try {
            const res = await axios.get(`${baseURL}/user?username=${username}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const currUser = res.data;
            
            const Toast = Swal.mixin({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
              background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2D3436 100%)",
              color: "#fff",
              iconColor: "#4ade80",
              customClass: {
                container: "swal-container",
                popup: "swal-popup",
                title: "swal-title",
                timerProgressBar: "swal-progress",
              },
            });

            Toast.fire({
              icon: "success",
              title: `Welcome ${currUser?.firstName || ""} ${currUser?.lastName || currUser?.username || ""}`,
            });

            setTimeout(() => {
              navigate(nextPath, {
                replace: true, 
                state: { selectedShow, movie, theatre, selectedDate },
              });
            }, 500);

        } catch(fetchErr) {
            console.error("Error fetching user details", fetchErr);
            // Navigate anyway, as login was successful
             navigate(nextPath, { replace: true });
        }
      } 
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire({
        icon: "warning",
        title: "Login Failed",
        text: error.response?.data?.message || "Invalid Credentials",
        footer: '<a href="#">Try again</a>',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    googleSignUp();
  };

   console.log(location)

  const handleEye = () => setVisible(!visible);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 md:top-6 md:right-6 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 z-10"
      >
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
        </div>

        <div className="relative flex items-center my-6">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-4 flex-shrink text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-gray-300 text-sm">Email</label>
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
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-gray-300 text-sm">Password</label>
            <div className="relative">
              <input
                type={visible ? "text" : "password"}
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
              >
                {visible ? <GoEye size={18} /> : <GoEyeClosed size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-br from-white via-white/90 to-gray-300 hover:scale-105 transition-transform duration-300 py-3 rounded-2xl text-black font-medium poppins-regular shadow-md shadow-slate-500/50 hover:text-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in... " : "Login"}
          </button>
        </form>

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
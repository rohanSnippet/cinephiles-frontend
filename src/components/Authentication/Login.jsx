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
console.log(baseURL)
  const handleGoogleLogin = () => {
    window.location.href = `${baseURL}/oauth2/authorization/google`;
  };
  const handleGithubLogin = () => {
    window.location.href = `${baseURL}/oauth2/authorization/github`;
  };
  const handleEye = () => setVisible(!visible);

  return (
    <div className="relative h-[100vh] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <div className="absolute h-[55vh] w-[80vh] ml-[30%] mt-[10%] rounded-xl bg-gradient-to-br from-black/90 via-black/50 to-black/20 shadow-2xl shadow-slate-600">
        <span className="flex justify-center absolute left-[35%] top-[15%] space-x-12">
          <button onClick={handleGoogleLogin}>
            <FcGoogle
            onClick={googleSignUp}
              size={34}
              className="bg-white rounded-full cursor-pointer"
            />
          </button>
          <button onClick={handleGithubLogin}>
            <FaGithubAlt
              size={34}
              className="text-black bg-white rounded-full cursor-pointer"
            />
          </button>
          <span className="bg-white rounded-full p-[6px] cursor-pointer">
            <img src={insta} className="w-[25px] h-[25px] bg-white" />
          </span>
        </span>
        <div id="login" className="w-[80%] ml-[10%] pt-[20%] text-center">
          <h1 className="poppins-semibold text-center text-white text-xl">
            Sign In
          </h1>
          <form method="dialog" onSubmit={handleSubmit}>
            <label className="input input-bordered my-5 rounded-2xl flex items-center gap-2 relative">
              <input
                className="roboto-regular"
                type="email"
                id="email"
                placeholder="Email"
                value={user.username}
                onChange={(e) => setDetails("username", e.target.value)}
                required
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 absolute right-4 opacity-70"
              >
                <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
              </svg>
            </label>
            <label className="input input-bordered my-5 rounded-2xl flex items-center gap-2">
              <input
                type={visible ? "password" : "text"}
                name="password"
                className="grow roboto-regular"
                required
                onChange={(e) => setDetails("password", e.target.value)}
                value={user.password}
                minLength={6}
                placeholder="Enter password"
              />
              {visible ? (
                <GoEye onClick={handleEye} className="cursor-pointer" />
              ) : (
                <GoEyeClosed onClick={handleEye} className="cursor-pointer" />
              )}
            </label>
            <button
              type="submit"
              className="bg-gradient-to-br from-white via-gray-100 to-gray-300 hover:scale-110 transition-transform duration-300 px-4 py-1 rounded-2xl text-black shadow-md mt-0"
            >
              Sign In
            </button>
            <Link
              to="/Signup"
              className="absolute px-4 py-1 mt-10 left-[30%] text-white text-md underline hover:text-blue-500"
            >
              Don't have an account? Sign Up
            </Link>
          </form>
        </div>
      </div>

   
    </div>
  );
};

export default Login;

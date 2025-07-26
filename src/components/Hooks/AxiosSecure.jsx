import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react"; // Import useContext
import { baseURL } from "../Services/URL"; // Ensure baseURL is exported
import { AuthContext } from "../Context/AuthProvider";
 // Import AuthContext

const axiosSecure = axios.create({
  baseURL: baseURL,
});

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { signOut } = useContext(AuthContext); // Get signOut from AuthContext

  useEffect(() => {
    // Request Interceptor: Add Authorization header
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access-token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`; // Correct header name is 'Authorization'
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor: Handle errors, especially 401 Unauthorized
    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const status = error.response ? error.response.status : null;

        // Handle 401 Unauthorized errors
        if (status === 401) {
          console.warn("Received 401 Unauthorized. Redirecting to login.");
          signOut(); // Use the signOut function from AuthContext
          // navigate("/login"); // signOut already handles navigation
        }
        // You can add more specific error handling here (e.g., 403 Forbidden, 404 Not Found)
        // based on the error.response.status or error.response.data

        return Promise.reject(error); // Re-throw the error so calling components can catch it
      }
    );

    // Cleanup interceptors on component unmount
    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, signOut]); // Add signOut to dependencies

  return axiosSecure;
};

export default useAxiosSecure;
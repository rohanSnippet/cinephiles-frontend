import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import { baseURL } from "../Services/URL";
import { AuthContext } from "../Context/AuthProvider";

// Create instance outside to prevent recreation
const axiosInstance = axios.create({
  baseURL: baseURL,
});

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { signOut } = useContext(AuthContext);

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access-token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error.response ? error.response.status : null;
        if (status === 401) {
          if(signOut) signOut();
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, signOut]);

  return axiosInstance;
};

export default useAxiosSecure;
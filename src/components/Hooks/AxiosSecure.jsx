import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useContext, useMemo } from "react";
import { baseURL } from "../Services/URL";
import { AuthContext } from "../Context/AuthProvider";

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { signOut } = useContext(AuthContext);

  // 1. Create the instance inside the hook using useMemo
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: baseURL,
    });
  }, []); // Empty dependency array ensures it's only created once per component mount

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

        // When your backend throws a 401 Unauthorized, handle the logout
        if (status === 401) {
          if (signOut) signOut();
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // 2. Cleanup is now perfectly safe and won't affect other components
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [axiosInstance, navigate, signOut]);

  return axiosInstance;
};

export default useAxiosSecure;
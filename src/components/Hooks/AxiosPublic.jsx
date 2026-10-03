import axios from "axios";
import { baseURL } from "../Services/URL";

const axiosPublic = axios.create({
  baseURL: baseURL,
});

axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
    
    if (status) {
        import("../Common/SwalUtils").then(({ Toast }) => {
            Toast.fire({
                icon: 'error',
                title: 'Oops...',
                text: errorMessage
            });
        });
    }
    return Promise.reject(error);
  }
);

const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;

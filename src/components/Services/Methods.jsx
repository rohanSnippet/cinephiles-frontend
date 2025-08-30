import useAxiosSecure from "../Hooks/AxiosSecure";

const axiosSecure = useAxiosSecure();

//Get user
export const getUser = async (username) => {
  try {
    const res = await axiosSecure.get(`/user?username=${username}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return error;
  }
};

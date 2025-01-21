import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAdmin from "../Hooks/useAdmin";
import useOwner from "../Hooks/useOwner";
import { CiUser } from "react-icons/ci";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthProvider";

const Profile = () => {
  const {session,setSession} = useContext(AuthContext);
  const username = localStorage.getItem("username");
  const [user, setUser] = useState(null);
  const axiosSecure = useAxiosSecure();
  const getUser = async () => {
    try {
      const res = await axiosSecure.get(`/user?username=${username}`);
      setUser(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getUser();
  }, []);

  const handleLogout = async() => {
    if(session){
    
        try {
          const response = await fetch("http://localhost:8082/auth/logout", {
            method: "POST",
            credentials: "include", // Include cookies if used
          });
      
          if (response.ok) {
            // Clear local storage and state
            localStorage.removeItem("access-token");
            localStorage.removeItem("username");
            setSession(null);
            setUserData({
              username: "",
              token: "",
            });
  
            // Redirect to login page
            window.location.href = "http://localhost:5173/";
          } else {
            console.error("Logout failed");
          }
        } catch (error) {
          console.error("An error occurred during logout", error);
        }
    }
    localStorage.removeItem("access-token");
    localStorage.removeItem("username");
    const Toast = Swal.mixin({
      toast: true,
      position: "top",
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      background: "linear-gradient(to right, #000000, #2D3436)",
      color: "#fff",
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
    Toast.fire({
      icon: "success",
      title: "Logged Out Successfully",
    });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const [isAdmin, isAdminLoading] = useAdmin();
  const [isOwner, isOwnerLoading] = useOwner();
  return (
    <div className="drawer drawer-end z-50">
      {/* Ensure z-index is higher */}
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content transition-all duration-300 ">
        {/* Page content here */}
        <label
          htmlFor="my-drawer-4"
          className="drawer-button btn btn-ghost btn-circle avatar"
        >
          <div className="w-8 rounded-full pt-[1px] text-white pl-[2px] shadow-gray-600 shadow-sm  border-collapse border-white border-[1px]">
            {/* <img
              alt="User Avatar"
              src={
                userimg ||
                "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
              }
            /> */}
            <CiUser size={28} />
          </div>
        </label>
      </div>
      <div className="drawer-side opacity-90 z-10 ">
        {/* Set the z-index for sidebar */}
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu w-80 min-h-full text-white text-lg gap-y-1 poppins-regular rounded-2xl ring-2 ring-white/10 bg-gradient-to-tr from-black via-slate-950 to-black">
          {/* Sidebar content here */}{" "}
          {user != null && (
            <Link
              to={`/update-profile`}
              className="pl-5 ml-3 pt-2 text-start shadow-sm shadow-gray-600 bg-gradient-to-l from-black/20 via-gray-800/90 to-gray-800/90 poppins-regular text-2xl hidden md:block text-white ring-1 ring-white/20 w-64 rounded-2xl mb-4 h-12"
            >
              👋 Hey, {user.firstName.toUpperCase() || "User"}
            </Link>
          )}
          <li>
            <a href="/update-profile">Edit Profile</a>
          </li>
          <li>
            <a href="/update-profile">Your Wishlist</a>
          </li>
          <li>
            <a href="/Orders">Your Orders</a>
          </li>
          {!isOwner && !isAdmin && (
            <li>
              <a href="/theatre-request">List Your Shows</a>
            </li>
          )}
          {isOwner && (
            <li>
              <a href="/owner">Owner Dashboard</a>
            </li>
          )}
          {isAdmin && (
            <li>
              <a href="/admin">Admin Dashboard</a>
            </li>
          )}
          <li>
            <a onClick={handleLogout}>Logout</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;

import React, { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Swal from "sweetalert2";
import useAdmin from "../Hooks/useAdmin";
import useOwner from "../Hooks/useOwner";
import { CiUser } from "react-icons/ci";
import { FiX } from "react-icons/fi";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthProvider";
import { baseURL, frontURL } from "../Services/URL";

const Profile = () => {
  const { session, setSession, signOut } = useContext(AuthContext);
  const username = localStorage.getItem("username");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  const [isOpen, setIsOpen] = useState(false);

  const [isAdmin] = useAdmin();
  const [isOwner] = useOwner();

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const res = await axiosSecure.get(`/user?username=${username}`);
        if (res.data) setUser(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    if (username) {
      getUser();
    }
  }, [username, axiosSecure]);

 const handleLogout = async () => {
     try {
       // 1. Use relative path since axiosSecure already has baseURL configured
       const response = await axiosSecure.post(`/auth/logout`);

       // 2. Axios uses response.status, not response.ok
       if (response.status === 200) {
         signOut();
           Swal.fire({
                icon: "success",
                title: "Logged Out Successfully",
                timer: 1000,
                showConfirmButton: false,
                background: "#111",
                color: "#fff",
              });
       }
     } catch (error) {
       console.error("An error occurred during logout", error);
       // 3. Fail-safe: Force logout on the frontend even if the server throws an error (like 401 or network issue)
       signOut();
     }
   };

  // --- THE SIDEBAR CONTENT (Rendered via Portal) ---
  const sidebarContent = (
    <div className={`fixed inset-0 z-[100] ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>

      {/* Dimmed Background Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Glassmorphism Sidebar Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-80 sm:w-96 bg-[#050505]/85 backdrop-blur-3xl border-l border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="poppins-bold text-white text-xl tracking-widest uppercase">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* User Greeting Area */}
        {user && (
          <div className="p-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
            <p className="text-xs text-white/50 poppins-medium uppercase tracking-widest mb-1">
              Welcome Back
            </p>
            <h3 className="text-2xl poppins-semibold text-white tracking-wide truncate">
              👋 Hey, {user.firstName || "User"}
            </h3>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex flex-col py-4 flex-grow overflow-y-auto">

          <Link
            to="/update-profile"
            onClick={() => setIsOpen(false)}
            className="px-8 py-4 text-white/80 poppins-medium text-lg hover:text-white hover:bg-white/5 hover:pl-10 transition-all duration-300 border-l-2 border-transparent hover:border-white"
          >
            Edit Profile
          </Link>

          <Link
            to="/update-profile"
            onClick={() => setIsOpen(false)}
            className="px-8 py-4 text-white/80 poppins-medium text-lg hover:text-white hover:bg-white/5 hover:pl-10 transition-all duration-300 border-l-2 border-transparent hover:border-white"
          >
            Your Wishlist
          </Link>

          <Link
            to="/Orders"
            onClick={() => setIsOpen(false)}
            className="px-8 py-4 text-white/80 poppins-medium text-lg hover:text-white hover:bg-white/5 hover:pl-10 transition-all duration-300 border-l-2 border-transparent hover:border-white"
          >
            Your Orders
          </Link>

          {!isOwner && !isAdmin && (
            <Link
              to="/theatre-request"
              onClick={() => setIsOpen(false)}
              className="px-8 py-4 text-white/80 poppins-medium text-lg hover:text-white hover:bg-white/5 hover:pl-10 transition-all duration-300 border-l-2 border-transparent hover:border-white"
            >
              List Your Shows
            </Link>
          )}

          {isOwner && (
            <Link
              to="/owner"
              onClick={() => setIsOpen(false)}
              className="px-8 py-4 text-white/80 poppins-medium text-lg hover:text-white hover:bg-white/5 hover:pl-10 transition-all duration-300 border-l-2 border-transparent hover:border-white"
            >
              Owner Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="px-8 py-4 text-white/80 poppins-medium text-lg hover:text-white hover:bg-white/5 hover:pl-10 transition-all duration-300 border-l-2 border-transparent hover:border-white"
            >
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Footer / Logout */}
        <div className="p-6 border-t border-white/10 bg-black/50">
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full py-4 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-white hover:text-red-400 poppins-semibold tracking-widest uppercase transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

//   console.log(user, session)

  return (
    <>
      {/* Profile Button (Sits in the Header) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 focus:outline-none transition-transform duration-300 hover:scale-105"
      >
        {user || session?.picture ? (
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 hover:border-white transition-colors bg-[#111] shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <img
              alt="User Avatar"
              src={user?.profile || session?.picture}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 hover:border-white transition-colors bg-[#111] text-white">
            <CiUser size={24} />
          </div>
        )}
      </button>

      {/* Render the Sidebar completely outside the Header using Portal */}
      {createPortal(sidebarContent, document.body)}
    </>
  );
};

export default Profile;
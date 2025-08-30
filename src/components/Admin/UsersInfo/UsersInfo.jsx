import React, { useContext, useEffect, useState } from "react";
import { PiFilmReelBold } from "react-icons/pi";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { IoIosMail } from "react-icons/io";
import { MdAdminPanelSettings, MdMovieEdit } from "react-icons/md";
import { GrUserManager } from "react-icons/gr";
import { FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { AuthContext } from "../../Context/AuthProvider";

const UsersInfo = () => {
  const [allUsers, setAllUsers] = useState([]);
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);

  const getAllUsers = async () => {
    try {
      const res = await axiosSecure.get(`/user/all-users`);
      if (res) {
        setAllUsers(res.data);
        console.log(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 bg-gray-800 rounded-lg min-h-screen">
      <div className="ring-2 ring-gray-900 ring-offset-2 rounded-xl flex flex-col sm:flex-row items-center justify-center sm:justify-start bg-gradient-to-br from-black via-gray-900 to-black mb-6 shadow-2xl text-white shadow-slate-600 p-4 sm:p-5 text-xl sm:text-2xl poppins-semibold gap-x-4">
        <MdMovieEdit size={32} className="mb-2 sm:mb-0 sm:ml-4 flex-shrink-0" />
        <span className="text-center sm:text-left">MANAGE USERS</span>
      </div>

      {/* User list header - hidden on mobile, shown on medium screens and up */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-gray-300 poppins-semibold mb-2">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Name</div>
        <div className="col-span-4">Contact</div>
        <div className="col-span-2">Phone</div>
        <div className="col-span-2">Role</div>
      </div>

      {/* User list */}
      {allUsers.map((user, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-black/30 via-gray-900/30 to-slate-900/80 rounded-lg mb-3 p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
        >
          {/* Number - shown on all screens */}
          <div className="text-lg poppins-bold text-white md:col-span-1">
            {i + 1}
          </div>

          {/* Name section */}
          <div className="md:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="poppins-bold text-lg text-white">
                {user.firstName} {user.lastName}
              </div>
            </div>
          </div>

          {/* Contact/Username section */}
          <div className="md:col-span-4 flex items-center gap-2">
            {user.provider === "google" ? (
              <FcGoogle size={20} className="flex-shrink-0" />
            ) : (
              <IoIosMail size={20} className="flex-shrink-0 text-blue-300" />
            )}
            <span className="poppins-light text-white/90 truncate">
              {user.username}
            </span>
          </div>

          {/* Phone section - hidden on small screens */}
          <div className="md:col-span-2 poppins-light text-white/90 hidden md:block">
            {user?.phone || "Not Provided"}
          </div>

          {/* Role badge */}
          <div className="md:col-span-2">
            {user.role === "ADMIN" ? (
              <button className="flex items-center justify-center gap-1 text-white bg-gradient-to-r from-yellow-200/30 via-yellow-300/30 to-orange-400/30 py-1 px-2 rounded-xl w-full max-w-[120px] mx-auto">
                <MdAdminPanelSettings size={18} />
                <span className="truncate">ADMIN</span>
              </button>
            ) : user.role === "THEATRE_OWNER" ? (
              <button className="flex items-center justify-center gap-1 text-white bg-gradient-to-r from-pink-200/30 via-red-300/30 to-red-400/30 py-1 px-2 rounded-xl w-full max-w-[120px] mx-auto">
                <GrUserManager size={16} />
                <span className="truncate">OWNER</span>
              </button>
            ) : (
              <button className="flex items-center justify-center gap-1 text-white bg-gradient-to-r from-teal-200/30 via-green-300/30 to-green-400/30 py-1 px-2 rounded-xl w-full max-w-[120px] mx-auto">
                <FaUser size={14} />
                <span className="truncate">USER</span>
              </button>
            )}
          </div>

          {/* Phone number for mobile view */}
          <div className="md:hidden poppins-light text-white/90 text-sm mt-2">
            Phone: {user?.phone || "Not Provided"}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersInfo;

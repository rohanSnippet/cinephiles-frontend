import React, { useEffect, useState } from "react";
import { PiFilmReelBold } from "react-icons/pi";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { IoIosMail } from "react-icons/io";
import { MdAdminPanelSettings, MdMovieEdit } from "react-icons/md";
import { GrUserManager } from "react-icons/gr";
import { FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

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
  console.log(allUsers);
  useEffect(() => {
    getAllUsers();
  }, []);
  return (
    <div className="relative w-full p-4 sm:p-6 lg:p-8 bg-gray-800 rounded-lg min-h-screen">
      {" "}
      <div className="ring-2 ring-gray-900 ring-offset-2 rounded-xl flex flex-col sm:flex-row items-center justify-center sm:justify-start bg-gradient-to-br from-black via-gray-900 to-black mb-6 shadow-2xl text-white shadow-slate-600 p-4 sm:p-5 text-xl sm:text-2xl poppins-semibold gap-x-4">
        <MdMovieEdit size={32} className="mb-2 sm:mb-0 sm:ml-4 flex-shrink-0" />{" "}
        <span className="text-center sm:text-left">MANAGE USERS</span>
      </div>
      {/* filter & sort options */}
      <div></div>
      {/* all theatres with owners */}
      {allUsers.map((user, i) => {
        return (
          <div
            key={i}
            className="bg-gradient-to-br from-black/30 via-gray-900/30 to-slate-900/80 rounded-md relative mx-auto flex mt-4 py-2"
          >
            <div className="text-lg poppins-bold pl-8 pt-1 text-white">
              {i + 1}
            </div>
            <div className="absolute left-[8%] justify-around pt-1 flex gap-x-1">
              {" "}
              <div className=" poppins-bold text-xl text-white ">
                {user.firstName}
              </div>
              <div className=" poppins-bold text-xl  text-white ">
                {user.lastName}
              </div>
            </div>
            <div className="flex justify-evenly gap-x-2 absolute poppins-light text-md  left-[30%] pt-1  text-white/90 ">
              {user.provider == "google" ? (
                <FcGoogle size={24} />
              ) : (
                <IoIosMail size={24} />
              )}
              {user.username}
            </div>
            <div className="absolute poppins-light text-md  left-[50%] pt-1  text-white/90 ">
              {user.phone || "Contact Not Provided"}
            </div>
            <div className="absolute  w-[13vh] flex poppins-light text-md left-[75%] pt-1">
              {user.role == "ADMIN" ? (
                <button className="flex text-white bg-gradient-to-r from-yellow-200/30 via-yellow-300/30 to-orange-400/30  px-2 rounded-xl">
                  {" "}
                  <MdAdminPanelSettings size={24} className="text-white" />{" "}
                  ADMIN
                </button>
              ) : user.role == "THEATRE_OWNER" ? (
                <button className="flex text-white bg-gradient-to-r from-pink-200/30 via-red-300/30 to-red-400/30  px-2 rounded-xl">
                  <GrUserManager size={20} className="text-white" /> OWNER
                </button>
              ) : (
                <button className="flex text-white ml-2 bg-gradient-to-r gap-x-1 from-teal-200/30 via-green-300/30 to-green-400/30  px-2 rounded-xl">
                  {" "}
                  <FaUser size={16} className="text-white mt-1" /> USER
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UsersInfo;

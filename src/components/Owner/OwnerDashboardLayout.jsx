import React, { useContext, useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { MdDashboard, MdOutlineMovieFilter } from "react-icons/md";
import { FaQuestionCircle } from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { GiTheater } from "react-icons/gi";
import { RiMovie2Line } from "react-icons/ri";
import { AuthContext } from "../Context/AuthProvider";

const sharedLinks = (
  <>
    <li className="mt-3">
      <Link to="/">
        <MdDashboard />
        Home
      </Link>
    </li>
    <li>
      <Link to="/menu">
        <BiCategory />
        Tours
      </Link>
    </li>
    {/*  <li>
      <Link to="/menu">
        <FaLocationArrow />
        Orders Tracking
      </Link>
    </li> */}
    <li>
      <Link to="/menu">
        <FaQuestionCircle />
        Customer support
      </Link>
    </li>
  </>
);
const DashboardLayout = () => {
   const { session } = useContext(AuthContext);
  const [isAdmin, isAdminLoading] = useState(true);
  return (
    <div>
      {isAdmin ? (
        <div className="drawer sm:drawer-open">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col sm:items-srart sm:justify-start my-2 shadow-xl shadow-slate-500 rounded-lg bg-gradient-to-tl  mx-2  from-base-100  to-base-200">
            {/* Page content here */}
            <div className="flex items-center justify-between mx-4">
              <label
                htmlFor="my-drawer-2"
                className="btn btn-primary drawer-button md:hidden lg:hidden"
              >
                <MdDashboardCustomize />
              </label>
              <button className="btn rounded-full px-6 bg-green flex items-center gap-2 text-white sm:hidden">
                <FaRegUser />
                Logout
              </button>
            </div>
            <div className="mt-5  md:mt-2 mx-4">
              <Outlet />
            </div>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer-2"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
              {/* Sidebar content here */}
              <li>
                <Link to="/owner" className="flex justify-start mb-3">
                   <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 border-2 border-purple-300/30 shadow-lg shadow-purple-500/30 transform transition-all duration-200 hover:scale-105 hover:shadow-purple-500/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine"></div>
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                        clipRule="evenodd"
                      ></path>
                    </svg>

                    <span className="relative z-10 drop-shadow-md">
                      THEATRES MANAGER
                    </span>

                    <div className="absolute top-1 left-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute bottom-2 right-6 w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse delay-300"></div>
                    <div className="absolute top-3 right-3 w-1 h-1 bg-white/70 rounded-full animate-pulse delay-700"></div>
                  </span>

                   {session && <img
                    src={session?.picture}
                    alt=""
                    className="rounded-full w-10"
                  />}

                </Link>
              </li>
              <hr />
              <li className="mt-3">
                <Link to="/owner">
                  <MdDashboard size={25} />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/owner/manage-theatres">
                  <RiMovie2Line size={25} />
                  Manage Theatres
                </Link>
              </li>
              <li className="mt-3">
                <Link to={`/owner/screen-details`}>
                  <GiTheater size={22} />
                  Screen Details
                </Link>
              </li>
              <li className="mt-3">
                <Link to="/owner/Show-details">
                  <MdOutlineMovieFilter size={25} />
                  Show Details
                </Link>
              </li>

              {/*
              <li>
                <Link to="/dashboard/manage-tour">
                  <MdManageSearch />
                  Manage Tours
                </Link>
              </li>
              <li>
                <Link to="/dashboard/add-tour">
                  <FaPlusCircle />
                  Add Tour
                </Link>
              </li>
              <li>
                <Link to="/dashboard/users">
                  <FaUsers />
                  All Users
                </Link>
              </li> */}

              <hr />

              {/* shared nav links */}
              {sharedLinks}
            </ul>
          </div>
        </div>
      ) : (
        <p>Login</p>
      )}
    </div>
  );
};

export default DashboardLayout;

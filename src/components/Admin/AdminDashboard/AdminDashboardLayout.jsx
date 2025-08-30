import React, { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  MdDashboard,
  MdManageSearch,
  MdDashboardCustomize,
} from "react-icons/md";
import {
  FaQuestionCircle,
  FaUsers,
  FaBookmark,
  FaPlusCircle,
  FaRegUser,
} from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import useAdmin from "../../Hooks/useAdmin";
import Login from "../../Authentication/Login";
import { AuthContext } from "../../Context/AuthProvider";
// import { AuthContext } from "../../Context/AuthProvider";

const sharedLinks = (
  <>
    <li className="mt-3">
      <Link
        to="/"
        onClick={() => (document.getElementById("my-drawer-2").checked = false)}
      >
        <MdDashboard />
        Home
      </Link>
    </li>
    <li>
      <Link
        to="/owner-revenue"
        onClick={() => (document.getElementById("my-drawer-2").checked = false)}
      >
        <BiCategory />
        Revenue
      </Link>
    </li>
    <li>
      <Link
        to="/owner-support"
        onClick={() => (document.getElementById("my-drawer-2").checked = false)}
      >
        <FaQuestionCircle />
        Customer support
      </Link>
    </li>
  </>
);

const AdminDashboardLayout = () => {
   const { session } = useContext(AuthContext);
  
  const [isAdmin, isAdminLoading] = useAdmin();

  // Handle loading state if useAdmin is asynchronous
  if (isAdminLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      {isAdmin ? (
        <div className="drawer sm:drawer-open">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col sm:items-start sm:justify-start my-2 shadow-xl shadow-slate-300/50 rounded-lg bg-gradient-to-tl mx-2 from-base-200 to-slate-700">
            {/* Page content here */}
            <div className="flex items-center justify-between mx-4 py-2">
              {" "}
              {/* Added py-2 for vertical padding */}
              <label
                htmlFor="my-drawer-2"
                className="btn btn-primary drawer-button md:hidden lg:hidden"
              >
                <MdDashboardCustomize className="text-xl" /> {/* Larger icon */}
              </label>
              <button className="btn rounded-full px-6 bg-green-600/80 hover:bg-red-500/80 hover:shadow-md hover:shadow-red-500/40 hover:border-none flex items-center gap-2 text-white sm:hidden">
                {" "}
                {/* Adjusted green color, added hover */}
                <FaRegUser />
                Logout
              </button>
            </div>
            <div className=" md:mt-2 mx-2 flex-grow w-full overflow-y-auto">
              {" "}
              {/* Added flex-grow and overflow-y-auto for content scrolling */}
              <Outlet />
            </div>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer-2"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content transform transition-transform duration-300 ease-in-out">
              {" "}
              {/* Added transition for smoother movement */}
              {/* Sidebar content here */}
              <li>
                <Link
                  to="/admin"
                  className="flex justify-start mb-3"
                  onClick={() =>
                    (document.getElementById("my-drawer-2").checked = false)
                  }
                >
                  {/* Assuming you have a logo image, uncomment and add src */}
                  {/* <img src="/path/to/your/logo.png" alt="Admin Logo" className="w-26 h-10" /> */}
                  <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 border-2 border-yellow-300/30 shadow-lg shadow-yellow-500/30 transform transition-all duration-200 hover:scale-105 hover:shadow-yellow-500/40 relative overflow-hidden">
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
                      ADMIN PANEL
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
              <hr className="my-2 border-gray-300" /> {/* Better separator */}
              <li className="mt-3">
                <Link
                  to="/admin"
                  onClick={() =>
                    (document.getElementById("my-drawer-2").checked = false)
                  }
                >
                  <MdDashboard />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/OwnerInfo"
                  onClick={() =>
                    (document.getElementById("my-drawer-2").checked = false)
                  }
                >
                  <FaBookmark />
                  Manage Owners
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/theatres-info"
                  onClick={() =>
                    (document.getElementById("my-drawer-2").checked = false)
                  }
                >
                  <MdManageSearch />
                  Manage Theatre Requests
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/movie-dashboard"
                  onClick={() =>
                    (document.getElementById("my-drawer-2").checked = false)
                  }
                >
                  <FaPlusCircle />
                  Manage Movie
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/UsersInfo"
                  onClick={() =>
                    (document.getElementById("my-drawer-2").checked = false)
                  }
                >
                  <FaUsers />
                  All Users
                </Link>
              </li>
              <hr className="my-2 border-gray-300" />
              {/* shared nav links */}
              {sharedLinks}
            </ul>
          </div>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default AdminDashboardLayout;

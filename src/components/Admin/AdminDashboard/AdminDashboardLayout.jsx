import React from "react";
import { Outlet, Link } from "react-router-dom";
import { MdDashboard, MdManageSearch, MdDashboardCustomize } from "react-icons/md";
import { FaQuestionCircle, FaUsers, FaBookmark, FaPlusCircle, FaRegUser } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import useAdmin from "../../Hooks/useAdmin";
import Login from "../../Authentication/Login";

const sharedLinks = (
  <>
    <li className="mt-3">
      <Link to="/" onClick={() => document.getElementById('my-drawer-2').checked = false}>
        <MdDashboard />
        Home
      </Link>
    </li>
    <li>
      <Link to="/owner-revenue" onClick={() => document.getElementById('my-drawer-2').checked = false}>
        <BiCategory />
        Revenue
      </Link>
    </li>
    <li>
      <Link to="/owner-support" onClick={() => document.getElementById('my-drawer-2').checked = false}>
        <FaQuestionCircle />
        Customer support
      </Link>
    </li>
  </>
);

const AdminDashboardLayout = () => {
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
            <div className="flex items-center justify-between mx-4 py-2"> {/* Added py-2 for vertical padding */}
              <label
                htmlFor="my-drawer-2"
                className="btn btn-primary drawer-button md:hidden lg:hidden"
              >
                <MdDashboardCustomize className="text-xl" /> {/* Larger icon */}
              </label>
              <button className="btn rounded-full px-6 bg-green-500 hover:bg-green-600 flex items-center gap-2 text-white sm:hidden"> {/* Adjusted green color, added hover */}
                <FaRegUser />
                Logout
              </button>
            </div>
            <div className="mt-5 md:mt-2 mx-4 flex-grow overflow-y-auto"> {/* Added flex-grow and overflow-y-auto for content scrolling */}
              <Outlet />
            </div>
          </div>
          <div className="drawer-side">
            <label
              htmlFor="my-drawer-2"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content transform transition-transform duration-300 ease-in-out"> {/* Added transition for smoother movement */}
              {/* Sidebar content here */}
              <li>
                <Link to="/admin" className="flex justify-start mb-3" onClick={() => document.getElementById('my-drawer-2').checked = false}>
                  {/* Assuming you have a logo image, uncomment and add src */}
                  {/* <img src="/path/to/your/logo.png" alt="Admin Logo" className="w-26 h-10" /> */}
                  <span className="badge badge-primary text-lg">Admin Panel</span> {/* Larger text for Admin badge */}
                </Link>
              </li>
              <hr className="my-2 border-gray-300" /> {/* Better separator */}
              <li className="mt-3">
                <Link to="/admin" onClick={() => document.getElementById('my-drawer-2').checked = false}>
                  <MdDashboard />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/OwnerInfo" onClick={() => document.getElementById('my-drawer-2').checked = false}>
                  <FaBookmark />
                  Manage Owners
                </Link>
              </li>
              <li>
                <Link to="/admin/theatres-info" onClick={() => document.getElementById('my-drawer-2').checked = false}>
                  <MdManageSearch />
                  Manage Theatre Requests
                </Link>
              </li>
              <li>
                <Link to="/admin/movie-dashboard" onClick={() => document.getElementById('my-drawer-2').checked = false}>
                  <FaPlusCircle />
                  Manage Movie
                </Link>
              </li>
              <li>
                <Link to="/admin/UsersInfo" onClick={() => document.getElementById('my-drawer-2').checked = false}>
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
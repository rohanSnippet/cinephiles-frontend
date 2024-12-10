import React from "react";
import { Outlet, Link } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaQuestionCircle, FaUsers } from "react-icons/fa";
import { FaBookmark } from "react-icons/fa";
import { MdManageSearch } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import useAdmin from "../../Hooks/useAdmin";
import Login from "../../Authentication/Login";

const sharedLinks = (
  <>
    <li className="mt-3">
      <Link to="/">
        <MdDashboard />
        Home
      </Link>
    </li>
    <li>
      <Link to="/owner-revenue">
        <BiCategory />
        Revenue
      </Link>
    </li>
    {/*  <li>
      <Link to="/menu">
        <FaLocationArrow />
        Orders Tracking
      </Link>
    </li> */}
    <li>
      <Link to="/owner-support">
        <FaQuestionCircle />
        Customer support
      </Link>
    </li>
  </>
);
const AdminDashboardLayout = () => {
  const [isAdmin, isAdminLoading] = useAdmin();
  return (
    <div >
      {isAdmin ? (
        <div className="drawer sm:drawer-open">
          <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col sm:items-srart sm:justify-start my-2 shadow-xl shadow-slate-300/50 rounded-lg bg-gradient-to-tl mx-2  from-base-200  to-slate-700">
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
            <ul className="menu p-4 w-80 min-h-full bg-base-100 text-base-content">
              {/* Sidebar content here */}
              <li>
                <Link to="/admin" className="flex justify-start mb-3">
                  <img src="" alt="" className="w-26 h-10" />
                  <span className="badge badge-primary">Admin</span>
                </Link>
              </li>
              <hr />
              <li className="mt-3">
                <Link to="/admin">
                  <MdDashboard />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/OwnerInfo">
                  <FaBookmark />
                  Manage Owners
                </Link>
              </li>
              <li>
                <Link to="/admin/theatres-info">
                  <MdManageSearch />
                  Manage Theatre Requests
                </Link>
              </li>
              <li>
                <Link to="/admin/movie-dashboard">
                  <FaPlusCircle />
                  Manage Movie
                </Link>
              </li>
              <li>
                <Link to="/admin/UsersInfo">
                  <FaUsers />
                  All Users
                </Link>
              </li>

              <hr />

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

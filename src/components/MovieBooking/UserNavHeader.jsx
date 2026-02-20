import React, { useContext, useState } from "react";
import { IoSearchOutline, IoChevronBackSharp } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown, MdOutlineAddLocationAlt } from "react-icons/md";
import { FiMenu, FiX } from "react-icons/fi";
import Swal from "sweetalert2";

import Profile from "../Home/Profile";
import { AuthContext } from "../Context/AuthProvider";
import useCity from "../Hooks/useCity";
import useScrollDirection from "../Hooks/useScrollDirection";
import SearchBar from "../Common/SearchBar";
import useAdmin from "../Hooks/useAdmin";
import useOwner from "../Hooks/useOwner";
import { baseURL, frontURL } from "../Services/URL";

const UserNavHeader = ({ navLocation, item }) => {
  const { userData, setSession } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const city = useCity();
  const scrollDirection = useScrollDirection();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [isAdmin] = useAdmin();
  const [isOwner] = useOwner();

  const handleSignIn = () => {
    navigate("/login", { state: { nextPath: location.pathname } });
    setIsMobileMenuOpen(false);
  };

  const navigateTo = () => {
    navigate(navLocation, { state: { item: item } });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${baseURL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("access-token");
        localStorage.removeItem("username");
        setSession(null);

        Swal.fire({
          icon: "success",
          title: "Logged Out Successfully",
          timer: 1000,
          showConfirmButton: false,
        });
        
        setIsMobileMenuOpen(false);

        setTimeout(() => {
          window.location.href = frontURL;
        }, 1000);
      }
    } catch (error) {
      console.error("An error occurred during logout", error);
    }
  };

  return (
    <div
      className={`
        w-full sticky top-0 z-50 transition-transform duration-300 ease-in-out border-b border-white/10
        bg-transparent backdrop-blur-xl shadow-sm
        ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"}
      `}
    >
      <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Left Section: Back Button + Logo */}
        <div className="flex items-center space-x-1 md:space-x-3">
          <button
            onClick={navigateTo}
            className="p-1 -ml-1 text-gray-200 hover:text-white hover:bg-white/10 rounded-full transition-colors focus:outline-none"
            aria-label="Go back"
          >
            <IoChevronBackSharp size={28} />
          </button>
          <span className="font-bold roboto-bold text-xl md:text-2xl text-white">
            <Link to="/">Cinephiles</Link>
          </span>
        </div>

        {/* Center Section: Desktop Search (Reusing SearchBar) */}
        <div className="hidden md:flex grow justify-center mx-4">
          <SearchBar />
        </div>

        {/* Mobile Search Toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleSearch} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
            <IoSearchOutline size={24} />
          </button>
        </div>

        {/* Mobile Search Input Overlay */}
        {showSearch && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-transparent backdrop-blur-2xl p-3 shadow-lg border-b border-white/10">
            <SearchBar isMobile={true} onClose={toggleSearch} />
          </div>
        )}

        {/* Right Section: Location and User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {city ? (
            <div className="flex items-center mr-2">
              <Link
                to="/location"
                className="rounded-3xl roboto-light hover:bg-white/10 transition-colors text-sm font-semibold text-white px-3 py-1.5"
              >
                {city.length > 15 ? `${city.substring(0, 15)}...` : city}
              </Link>
              <MdKeyboardArrowDown className="text-gray-300" size={20} />
            </div>
          ) : (
            <Link to="/location" className="mr-2 p-2 hover:bg-white/10 rounded-full transition-colors">
              <MdOutlineAddLocationAlt size={24} className="text-gray-100" />
            </Link>
          )}

          {userData && userData.username ? (
            <Profile />
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="rounded-3xl shadow-sm bg-blue-600/90 hover:bg-blue-500 backdrop-blur-md transition-colors px-5 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black"
            >
              Sign in
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/40 backdrop-blur-2xl p-4 shadow-xl border-t border-white/10 min-h-screen">
          <div className="flex flex-col space-y-4">
            {/* Mobile Location */}
            {city ? (
              <Link
                to="/location"
                className="flex items-center justify-between text-white py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="font-medium">{city}</span>
                <MdKeyboardArrowDown size={22} />
              </Link>
            ) : (
              <Link
                to="/location"
                className="flex items-center text-white py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MdOutlineAddLocationAlt size={22} className="mr-3 text-blue-400" />
                <span className="font-medium">Set Location</span>
              </Link>
            )}

            {/* Mobile Auth/Profile Actions */}
            {userData && userData.username ? (
              <div className="py-2">
                <ul className="flex flex-col gap-2 text-white text-lg">
                  <li>
                    <Link to="/update-profile" className="block py-3 px-4 rounded-xl hover:bg-white/10 transition-colors">Edit Profile</Link>
                  </li>
                  <li>
                    <Link to="/update-profile" className="block py-3 px-4 rounded-xl hover:bg-white/10 transition-colors">Your Wishlist</Link>
                  </li>
                  <li>
                    <Link to="/Orders" className="block py-3 px-4 rounded-xl hover:bg-white/10 transition-colors">Your Orders</Link>
                  </li>
                  
                  {!isOwner && !isAdmin && (
                    <li>
                      <Link to="/theatre-request" className="block py-3 px-4 rounded-xl hover:bg-white/10 transition-colors">List Your Shows</Link>
                    </li>
                  )}
                  {isOwner && (
                    <li>
                      <Link to="/owner" className="block py-3 px-4 rounded-xl hover:bg-white/10 transition-colors">Owner Dashboard</Link>
                    </li>
                  )}
                  {isAdmin && (
                    <li>
                      <Link to="/admin" className="block py-3 px-4 rounded-xl hover:bg-white/10 transition-colors">Admin Dashboard</Link>
                    </li>
                  )}
                  
                  <div className="h-px bg-white/10 my-2"></div>
                  
                  <li>
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left py-3 px-4 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="w-full rounded-xl bg-blue-600/90 hover:bg-blue-500 backdrop-blur-md py-3.5 text-lg font-semibold text-white text-center transition-colors mt-4"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNavHeader;
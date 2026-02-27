import React, { useContext, useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  const [isAdmin] = useAdmin();
  const [isOwner] = useOwner();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignIn = () => {
    navigate("/login", { state: { nextPath: location.pathname } });
    setIsMobileMenuOpen(false);
  };

  const navigateTo = () => navigate(navLocation, { state: { item: item } });
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => setShowSearch(!showSearch);

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
          background: '#111',
          color: '#fff'
        });

        setIsMobileMenuOpen(false);
        setTimeout(() => { window.location.href = frontURL; }, 1000);
      }
    } catch (error) {
      console.error("An error occurred during logout", error);
    }
  };

  return (
    <div
      className={`
        w-full sticky top-0 z-50 transition-all duration-500 ease-in-out
        ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"}
        ${scrolled ? "bg-black/75 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" : "bg-transparent"}
      `}
    >
      {/* Added 'relative' to the inner container to allow absolute centering */}
      <div className="relative max-w-[100rem] mx-auto flex items-center justify-between px-4 py-4 md:py-5 sm:px-8 lg:px-12 w-full">

        {/* Left Section: Back Button + Logo */}
        <div className="flex items-center gap-3 md:gap-5 relative z-10">
          {navLocation && (
            <button
              onClick={navigateTo}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 focus:outline-none"
              aria-label="Go back"
            >
              <IoChevronBackSharp size={24} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-bold poppins-bold text-xl md:text-2xl text-white tracking-widest uppercase group-hover:text-white/80 transition-colors">
              Cinephiles
            </span>
          </Link>
        </div>

        {/* 🚨 CENTER SECTION: Absolutely Centered & Massive Width 🚨 */}
        <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[45vw] lg:w-[50vw] xl:w-[55vw] max-w-5xl z-0">
          <div className="w-full flex justify-center">
            {/* The wrapper forces the SearchBar to span the full width allowed */}
            <div className="w-full">
              <SearchBar />
            </div>
          </div>
        </div>

        {/* Mobile Search Toggle */}
        <div className="md:hidden flex items-center relative z-10">
          <button
            onClick={toggleSearch}
            className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <IoSearchOutline size={22} />
          </button>
        </div>

        {/* Mobile Search Input Overlay */}
        {showSearch && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#050505] p-4 shadow-2xl border-b border-white/10 animate-fade-in z-50">
            <SearchBar isMobile={true} onClose={toggleSearch} />
          </div>
        )}

        {/* Right Section: Location and User Actions */}
        <div className="hidden md:flex items-center gap-6 relative z-10 bg-transparent">

          {/* Location Selector */}
          {city ? (
            <Link
              to="/location"
              className="flex items-center gap-1.5 group cursor-pointer"
            >
              <span className="poppins-medium text-xs text-white/80 tracking-wide uppercase group-hover:text-white transition-colors">
                {city.length > 15 ? `${city.substring(0, 15)}...` : city}
              </span>
              <MdKeyboardArrowDown className="text-white/60 group-hover:text-white transition-colors" size={18} />
            </Link>
          ) : (
            <Link
              to="/location"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all text-white/80 hover:text-white"
            >
              <MdOutlineAddLocationAlt size={16} />
              <span className="poppins-medium text-xs tracking-wide uppercase">Location</span>
            </Link>
          )}

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-white/15"></div>

          {/* Auth / Profile */}
          {userData && userData.username ? (
            <div className="hover:scale-105 transition-transform duration-300">
              <Profile />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="px-6 py-2 rounded-full bg-white text-black poppins-semibold text-xs uppercase tracking-widest hover:bg-neutral-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center relative z-10">
          <button
            onClick={toggleMobileMenu}
            className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 h-screen bg-black/95 backdrop-blur-2xl border-t border-white/5 z-50">
          <div className="flex flex-col p-6 gap-6">

            {/* Mobile Location */}
            <Link
              to="/location"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 text-white">
                <MdOutlineAddLocationAlt size={22} className="text-white/70" />
                <span className="poppins-medium tracking-wide">
                  {city ? city : "Set Location"}
                </span>
              </div>
              {city && <MdKeyboardArrowDown size={22} className="text-white/50" />}
            </Link>

            <div className="h-px w-full bg-white/10"></div>

            {/* Mobile Auth/Profile Actions */}
            {userData && userData.username ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-white/50 uppercase tracking-widest poppins-medium mb-2 pl-2">Account</p>
                <Link to="/update-profile" className="p-3 text-white poppins-light hover:bg-white/10 rounded-lg transition-colors">Edit Profile</Link>
                <Link to="/update-profile" className="p-3 text-white poppins-light hover:bg-white/10 rounded-lg transition-colors">Your Wishlist</Link>
                <Link to="/Orders" className="p-3 text-white poppins-light hover:bg-white/10 rounded-lg transition-colors">Your Orders</Link>

                {(!isOwner && !isAdmin) && (
                  <Link to="/theatre-request" className="p-3 text-white poppins-light hover:bg-white/10 rounded-lg transition-colors">List Your Shows</Link>
                )}
                {isOwner && (
                  <Link to="/owner" className="p-3 text-white poppins-light hover:bg-white/10 rounded-lg transition-colors">Owner Dashboard</Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="p-3 text-white poppins-light hover:bg-white/10 rounded-lg transition-colors">Admin Dashboard</Link>
                )}

                <button
                  onClick={handleLogout}
                  className="mt-4 p-3 w-full text-left text-red-400 poppins-medium hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full py-4 rounded-xl bg-white text-black poppins-semibold tracking-widest uppercase hover:bg-neutral-300 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNavHeader;
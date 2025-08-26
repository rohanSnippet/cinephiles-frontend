// Header.jsx
import { useContext, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import Profile from "./Home/Profile";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./Context/AuthProvider";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MdOutlineAddLocationAlt } from "react-icons/md";
import useCity from "./Hooks/useCity";
import useScrollDirection from "./Hooks/useScrollDirection";
import { FiMenu, FiX } from "react-icons/fi";

const Header = () => {
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const city = useCity();
  const scrollDirection = useScrollDirection();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSignIn = () => {
    navigate("/login", { state: { nextPath: location.pathname } });
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <div
      className={`
        w-full fixed top-0 z-50 transition-all duration-300 ease-in-out
        ${
          scrollDirection === "down"
            ? "-translate-y-full"
            : "translate-y-0"
        }
        ${
          scrollDirection === "down" || typeof window !== 'undefined' && window.pageYOffset > 0
            ? "bg-gradient-to-b from-black/95 via-black/90 to-black/85 backdrop-blur-sm"
            : ""
        }
      `}
    >
      <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="font-bold roboto-bold text-2xl text-white">
            <Link to="/">Cinephiles</Link>
          </span>
          <span className="font-bold roboto-bold text-2xl text-white sm:hidden">
            <Link to="/">CP</Link>
          </span>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex grow justify-center mx-4">
          <div className="relative w-full max-w-md">
            <input
              className="h-10 w-full shadow-sm shadow-gray-600 rounded-3xl bg-transparent px-4 py-2 text-md placeholder:text-gray-300 text-white ring-1 ring-gray-400 hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
              type="text"
              placeholder="Search movies, shows, and more"
            />
            <IoSearchOutline className="absolute right-3 top-2.5 text-white" size={20} />
          </div>
        </div>

        {/* Mobile Search Toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleSearch} className="p-2 text-white">
            <IoSearchOutline size={24} />
          </button>
        </div>

        {/* Mobile Search Input (appears when toggled) */}
        {showSearch && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 p-3 shadow-lg">
            <div className="relative">
              <input
                className="h-10 w-full shadow-sm shadow-gray-600 rounded-3xl bg-transparent px-4 py-2 text-md placeholder:text-gray-300 text-white ring-1 ring-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                type="text"
                placeholder="Search movies, shows, and more"
                autoFocus
              />
              <button 
                onClick={toggleSearch}
                className="absolute right-3 top-2.5 text-white"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Location and User Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {city ? (
            <div className="flex items-center mr-2">
              <Link
                to="/location"
                className="rounded-3xl roboto-light hover:bg-black/20 text-sm font-semibold text-white px-3 py-1.5"
              >
                {city.length > 15 ? `${city.substring(0, 15)}...` : city}
              </Link>
              <MdKeyboardArrowDown className="text-white" size={20} />
            </div>
          ) : (
            <Link to="/location" className="mr-2">
              <MdOutlineAddLocationAlt
                size={28}
                className="text-gray-100 opacity-85 hover:opacity-100"
              />
            </Link>
          )}
          
          {userData && userData.username ? (
            <Profile />
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="rounded-3xl shadow-sm shadow-gray-600 roboto-regular ring-1 ring-gray-400 hover:bg-black/20 px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              Sign in
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={toggleMobileMenu}
            className="p-2 text-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg p-4 shadow-lg border-t border-gray-800">
          <div className="flex flex-col space-y-4">
            {city ? (
              <Link
                to="/location"
                className="flex items-center justify-between text-white py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>{city}</span>
                <MdKeyboardArrowDown size={20} />
              </Link>
            ) : (
              <Link
                to="/location"
                className="flex items-center text-white py-2 px-3 rounded-lg hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <MdOutlineAddLocationAlt size={20} className="mr-2" />
                <span>Set Location</span>
              </Link>
            )}
            
            {userData && userData.username ? (
              <div className="py-2 px-3">
                <Profile mobileView={true} onSelect={() => setIsMobileMenuOpen(false)} />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-3 text-base font-semibold text-white text-center"
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

export default Header;
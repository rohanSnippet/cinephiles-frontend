import React, { useState, useContext } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../Context/AuthProvider";
import { FaBars, FaTimes, FaUsers, FaFilm, FaStore, FaBuilding, FaStar, FaHome } from "react-icons/fa";
import { BiHomeAlt } from "react-icons/bi";
import { FiLogOut } from "react-icons/fi";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { Toast } from "../../Common/SwalUtils";

const AdminDashboardLayout = () => {
  const { signOut } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const axiosSecure = useAxiosSecure();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
        try {
          const response = await axiosSecure.post(`/auth/logout`);
          if (response.status === 200) {
            signOut();
            Toast.fire({ icon: "success", title: "Logged Out" });
            setTimeout(() => { window.location.href = "/"; }, 1000);
          }
        } catch (error) {
          console.error("An error occurred during logout", error);
          signOut();
        }
      };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <FaHome size={18} /> },
    { name: "Movies", path: "/admin/movie-dashboard", icon: <FaFilm size={18} /> },
    { name: "Users", path: "/admin/UsersInfo", icon: <FaUsers size={18} /> },
    { name: "Theatres", path: "/admin/theatres-info", icon: <FaBuilding size={18} /> },
    { name: "Owners", path: "/admin/OwnerInfo", icon: <FaStore size={18} /> },
    { name: "Commercials", path: "/admin/featured", icon: <FaStar size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-md transition-opacity"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar - Vintage Dark Monochrome */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-neutral-800 transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] lg:relative lg:translate-x-0 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-shrink-0 flex items-center justify-between h-[70px] px-6 border-b border-neutral-800">
          <span className="text-xl poppins-bold tracking-widest text-white uppercase">System</span>
          <button onClick={toggleSidebar} className="lg:hidden text-neutral-400 hover:text-white transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm poppins-medium rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-white text-black shadow-md shadow-white/10"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="tracking-wide uppercase text-xs">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-800 flex flex-col gap-2 shrink-0">
          <Link to="/" className="flex items-center gap-4 px-4 py-3 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <BiHomeAlt size={20} className="shrink-0" />
            <span className={`poppins-medium text-sm`}>Back to App</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all w-full">
            <FiLogOut size={20} className="shrink-0" />
            <span className={`poppins-medium text-sm`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="h-[70px] flex items-center justify-between px-6 lg:px-10 bg-[#0a0a0a] border-b border-neutral-800 z-30">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="lg:hidden text-neutral-400 hover:text-white transition-colors p-2 bg-neutral-800/50 rounded-lg">
              <FaBars size={18} />
            </button>
            <h2 className="text-xs sm:text-sm poppins-semibold text-neutral-300 tracking-widest uppercase hidden sm:block">
               Control Center
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-9 h-9 rounded-full bg-[#141414] border border-neutral-700 flex items-center justify-center text-xs poppins-bold text-neutral-300 uppercase">
                AD
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar bg-[#050505]">
          <div className="max-w-[95rem] mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
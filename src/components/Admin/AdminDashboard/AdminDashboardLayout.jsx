import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaUsers, FaFilm, FaStore, FaBuilding, FaStar, FaHome } from "react-icons/fa";

const AdminDashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <FaHome /> },
    { name: "Movies", path: "/admin/movie-dashboard", icon: <FaFilm /> },
    { name: "Users", path: "/admin/UsersInfo", icon: <FaUsers /> },
    { name: "Theatres", path: "/admin/theatres-info", icon: <FaBuilding /> },
    { name: "Owners", path: "/admin/OwnerInfo", icon: <FaStore /> },
    { name: "Commercials", path: "/admin/featured", icon: <FaStar /> },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar - Sharp Borders, No Curves */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-neutral-800 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-800 bg-[#0a0a0a]">
          <span className="text-xl poppins-bold tracking-widest uppercase text-white">System</span>
          <button onClick={toggleSidebar} className="lg:hidden text-neutral-400 hover:text-white transition-colors">
            <FaTimes size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm poppins-medium transition-colors border-l-2 ${
                  isActive
                    ? "border-white bg-white/5 text-white"
                    : "border-transparent text-neutral-500 hover:bg-white/5 hover:border-neutral-600 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="uppercase tracking-wider text-xs">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-[#0a0a0a] border-b border-neutral-800 z-30">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="lg:hidden text-neutral-400 hover:text-white transition-colors">
              <FaBars size={20} />
            </button>
            <h2 className="text-xs sm:text-sm poppins-semibold text-neutral-300 uppercase tracking-widest">
               Admin Control Center
            </h2>
          </div>
          <div className="flex items-center gap-4">
             {/* Sharp Admin Avatar Placeholder */}
             <div className="w-8 h-8 bg-[#141414] border border-neutral-700 flex items-center justify-center text-[10px] poppins-bold uppercase text-neutral-300">
                AD
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#050505] p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
import React, { useContext, useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard, MdOutlineMovieFilter, MdMenu, MdClose } from "react-icons/md";
import { BiHomeAlt } from "react-icons/bi";
import { GiTheater } from "react-icons/gi";
import { RiMovie2Line, RiMenuFoldLine, RiMenuUnfoldLine } from "react-icons/ri";
import { FiLogOut } from "react-icons/fi";
import { AuthContext } from "../Context/AuthProvider";
import Swal from "sweetalert2";
import { baseURL, frontURL } from "../Services/URL";
import useAxiosSecure from "../Hooks/AxiosSecure";

const OwnerDashboardLayout = () => {
  const { session, signOut, userData } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const[user, setUser] = useState(null);
  const[image, setImage] = useState(null);

   useEffect(() => {
        const getUser = async () => {
          try {
            const res = await axiosSecure.get(`/user?username=${userData?.username}`);
            console.log(res.data)
            if (res.data){
                setUser(res.data);
                setImage(res.data.profile || null);
            }
          } catch (error) {
            console.error("Error fetching user:", error);
          }
        };
        if (userData.username) {
          getUser();
        }
      }, [userData.username, axiosSecure]);

  // Sidebar State: expanded (true) or collapsed into icons (false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

 const handleLogout = async () => {
      try {
        const response = await axiosSecure.post(`/auth/logout`);

        if (response.status === 200) {
          signOut();
          Swal.fire({ icon: "success", title: "Logged Out", timer: 1000, showConfirmButton: false, background: '#111', color: '#fff' });
          setTimeout(() => { window.location.href = frontURL; }, 1000);
        }
      } catch (error) {
        console.error("An error occurred during logout", error);
        // 3. Fail-safe: Force logout on the frontend even if the server throws an error (like 401 or network issue)
        signOut();
      }
    };

  const navLinks = [
    { name: "Dashboard", path: "/owner", icon: <MdDashboard size={24} /> },
    { name: "Manage Theatres", path: "/owner/manage-theatres", icon: <RiMovie2Line size={24} /> },
    { name: "Screen Details", path: "/owner/screen-details", icon: <GiTheater size={24} /> },
    { name: "Show Details", path: "/owner/Show-details", icon: <MdOutlineMovieFilter size={24} /> },
  ];

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden font-poppins text-white">

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar (Desktop & Mobile) */}
      <aside
        className={`fixed md:relative z-50 h-full bg-[#0a0a0a] border-r border-white/5 transition-all duration-300 ease-in-out flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)]
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isSidebarOpen ? "w-64" : "w-20"}
      `}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isSidebarOpen ? "w-full opacity-100" : "w-0 opacity-0"}`}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shrink-0">
              <GiTheater size={20} className="text-white" />
            </div>
            <span className="poppins-bold tracking-widest text-sm uppercase whitespace-nowrap">Manager</span>
          </div>

          {/* Mobile Close Button */}
          <button className="md:hidden p-2 text-white/50 hover:text-white" onClick={() => setIsMobileOpen(false)}>
            <MdClose size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3 custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/owner' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 group
                  ${isActive ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"}
                `}
                title={!isSidebarOpen ? link.name : ""}
              >
                <div className={`shrink-0 ${isActive ? "text-red-400" : "text-white/50 group-hover:text-white"}`}>
                  {link.icon}
                </div>
                <span className={`poppins-medium text-sm whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 hidden"}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* User / Footer Area */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-2 shrink-0">
          <Link to="/" className="flex items-center gap-4 px-3 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all" title={!isSidebarOpen ? "Back to App" : ""}>
            <BiHomeAlt size={24} className="shrink-0" />
            <span className={`poppins-medium text-sm whitespace-nowrap ${isSidebarOpen ? "block" : "hidden"}`}>Back to App</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-4 px-3 py-3 rounded-xl text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all w-full" title={!isSidebarOpen ? "Logout" : ""}>
            <FiLogOut size={24} className="shrink-0" />
            <span className={`poppins-medium text-sm whitespace-nowrap ${isSidebarOpen ? "block" : "hidden"}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#050505]">

        {/* Top Header */}
        <header className="h-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">

          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 text-white/70 hover:text-white bg-white/5 rounded-lg border border-white/10" onClick={() => setIsMobileOpen(true)}>
              <MdMenu size={24} />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              className="hidden md:flex p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <RiMenuFoldLine size={24} /> : <RiMenuUnfoldLine size={24} />}
            </button>

            <h2 className="poppins-semibold text-lg text-white/90 hidden sm:block tracking-wide">Owner Portal</h2>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            {(session || image )&& (
              <img src={image || session?.picture} alt="User" className="w-10 h-10 rounded-full border-2 border-white/10 shadow-lg object-cover" />
            )}
          </div>
        </header>

        {/* Dashboard Pages Injection */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboardLayout;
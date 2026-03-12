import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { FaUsers, FaFilm, FaStore, FaBuilding, FaSyncAlt, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const AdminPanel = () => {
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMovies: 0,
    totalTheatres: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);

  // Fetch all dashboard data simultaneously for maximum speed
  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      const [usersRes, moviesRes] = await Promise.all([
        axiosSecure.get("/user/all-users"),
        // Leverages your new high-speed paginated endpoint
        axiosSecure.get("/movie/admin/paginated?page=0&size=5&sortBy=id&direction=desc")
      ]);

      const allUsers = usersRes.data || [];
      const paginatedMovies = moviesRes.data;

      setStats({
        totalUsers: allUsers.length,
        totalMovies: paginatedMovies.totalElements || 0,
        totalTheatres: 12, // Placeholder until a specific endpoint is mapped
      });

      // Isolate the 5 newest users
      const sortedUsers = [...allUsers].sort((a, b) => b.id - a.id).slice(0, 5);
      setRecentUsers(sortedUsers);

      // Movies are already perfectly sorted by the backend
      setRecentMovies(paginatedMovies.content || []);

    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [axiosSecure]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-[1px] border-white/20 border-t-white animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header & Sync Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl poppins-bold text-white uppercase tracking-wider">Overview</h1>
          <p className="text-[10px] sm:text-xs text-neutral-500 poppins-medium mt-1 uppercase tracking-[0.2em]">
            Real-time System Metrics
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white text-black px-5 py-2.5 poppins-semibold text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Syncing..." : "Sync Data"}
        </button>
      </div>

      {/* Stats Grid - Sharp Edges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 relative overflow-hidden group hover:border-neutral-600 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-white group-hover:opacity-10 transition-opacity">
            <FaUsers size={80} />
          </div>
          <p className="text-neutral-500 text-[10px] poppins-semibold uppercase tracking-widest mb-2">Total Users</p>
          <h3 className="text-4xl poppins-bold text-white">{stats.totalUsers}</h3>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 relative overflow-hidden group hover:border-neutral-600 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-white group-hover:opacity-10 transition-opacity">
            <FaFilm size={80} />
          </div>
          <p className="text-neutral-500 text-[10px] poppins-semibold uppercase tracking-widest mb-2">Total Movies</p>
          <h3 className="text-4xl poppins-bold text-white">{stats.totalMovies}</h3>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 relative overflow-hidden group hover:border-neutral-600 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-white group-hover:opacity-10 transition-opacity">
            <FaBuilding size={80} />
          </div>
          <p className="text-neutral-500 text-[10px] poppins-semibold uppercase tracking-widest mb-2">Registered Theatres</p>
          <h3 className="text-4xl poppins-bold text-white">{stats.totalTheatres}</h3>
        </div>
      </div>

      {/* Data Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

        {/* Recent Movies */}
        <div className="bg-[#0a0a0a] border border-neutral-800 flex flex-col">
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-[#0d0d0d]">
            <h2 className="text-xs poppins-semibold text-white uppercase tracking-widest">Latest Movies Added</h2>
            <Link to="/admin/movies" className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-1 uppercase tracking-wider transition-colors">
              View All <FaArrowRight size={10}/>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-[#141414] text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Release Date</th>
                </tr>
              </thead>
              <tbody>
                {recentMovies.length > 0 ? recentMovies.map((movie) => (
                  <tr key={movie.id} className="border-b border-neutral-800/50 hover:bg-[#141414] transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-neutral-500">#{movie.id}</td>
                    <td className="px-5 py-4 text-xs font-medium text-white">{movie.title}</td>
                    <td className="px-5 py-4 text-xs text-neutral-400">{movie.releaseDate || 'N/A'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="px-5 py-8 text-center text-xs uppercase tracking-widest text-neutral-600">No recent movies.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[#0a0a0a] border border-neutral-800 flex flex-col">
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-[#0d0d0d]">
            <h2 className="text-xs poppins-semibold text-white uppercase tracking-widest">Newest Registrations</h2>
            <Link to="/admin/users" className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-1 uppercase tracking-wider transition-colors">
              View All <FaArrowRight size={10}/>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-[#141414] text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length > 0 ? recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-[#141414] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#1f1f1f] border border-neutral-700 flex items-center justify-center text-[10px] uppercase font-bold text-white">
                          {user.firstName ? user.firstName[0] : 'U'}
                        </div>
                        <span className="text-xs font-medium text-white">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-neutral-400">{user.username}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                        user.role === 'ADMIN' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                        user.role === 'OWNER' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                        'border-neutral-700 text-neutral-400 bg-neutral-800/50'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="px-5 py-8 text-center text-xs uppercase tracking-widest text-neutral-600">No recent users.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;
import React, { useState, useEffect, useMemo } from "react";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { FaBuilding, FaSearch, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const TheatresInfo = () => {
  const axiosSecure = useAxiosSecure();
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchTheatres = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get("/theatre/all-theatres"); // Adjust endpoint as needed
      setTheatres(res.data || []);
    } catch (err) {
      console.error("Failed to fetch theatres", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, [axiosSecure]);

  const filteredTheatres = useMemo(() => {
    return theatres.filter((theatre) => {
      const matchesSearch =
        theatre.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        theatre.city?.toLowerCase().includes(searchTerm.toLowerCase());

      // Assuming theatres have an active/inactive boolean or status
      const matchesStatus = statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE" ? theatre.active : !theatre.active;

      return matchesSearch && matchesStatus;
    });
  }, [theatres, searchTerm, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl poppins-bold text-white uppercase tracking-wider flex items-center gap-3">
            <FaBuilding className="text-neutral-500" /> Theatre Network
          </h1>
          <p className="text-[10px] sm:text-xs text-neutral-500 poppins-medium mt-1 uppercase tracking-[0.2em]">
            Global Infrastructure Management
          </p>
        </div>
        <div className="text-right">
            <div className="text-3xl poppins-bold text-white">{filteredTheatres.length}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Active Nodes</div>
        </div>
      </div>

      {/* Control Bar (Sharp Edges) */}
      <div className="bg-[#0a0a0a] border border-neutral-800 p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by theatre name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-neutral-800 text-white pl-10 pr-4 py-2.5 text-xs poppins-medium focus:outline-none focus:border-white transition-colors !rounded-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#141414] border border-neutral-800 text-white px-4 py-2.5 text-xs poppins-medium uppercase tracking-wider focus:outline-none focus:border-white transition-colors !rounded-none cursor-pointer"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-[#0a0a0a] border border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-[1px] border-white/20 border-t-white animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-[#141414] text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-medium">UID</th>
                  <th className="px-6 py-4 font-medium">Theatre Name</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Screens</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTheatres.map((theatre) => (
                  <tr key={theatre.id} className="border-b border-neutral-800/50 hover:bg-[#141414] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">#{theatre.id}</td>
                    <td className="px-6 py-4 text-xs font-bold text-white tracking-wide uppercase">
                        {theatre.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <FaMapMarkerAlt className="text-neutral-600" />
                        {theatre.city}, {theatre.state || 'India'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-neutral-300">
                       0{theatre.totalScreens || 1}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Assuming true/false logic, adjust based on your actual backend data */}
                        {theatre.active !== false ? (
                          <span className="flex items-center gap-1.5 text-[10px] text-teal-400 uppercase tracking-widest font-bold">
                            <FaCheckCircle /> Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[10px] text-red-500 uppercase tracking-widest font-bold">
                            <FaTimesCircle /> Offline
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTheatres.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-xs uppercase tracking-widest text-neutral-600">
                      No network nodes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TheatresInfo;
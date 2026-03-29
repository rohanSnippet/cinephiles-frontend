import React, { useState, useEffect, useMemo } from "react";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { FaBuilding, FaSearch, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle, FaClock, FaEnvelope } from "react-icons/fa";
import Swal from 'sweetalert2';

// Create a reusable SweetAlert2 Toast configuration for a dark theme
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: '#141414', // Matches your table header background
  color: '#ffffff',
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

const TheatresInfo = () => {
  const axiosSecure = useAxiosSecure();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get("/get-requests");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch theatre requests", err);
      Toast.fire({
        icon: 'error',
        title: 'Failed to load requests'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [axiosSecure]);

  // Handle Approve Action using your existing route
  const handleApprove = async (req) => {
    setProcessingId(req.id);
    try {
      await axiosSecure.put(`/admin/make-owner?username=${req.username}&id=${req.id}`);

      Toast.fire({
        icon: 'success',
        title: `${req.tname} Approved!`,
        text: 'User is now an Owner.'
      });

      // Update local state to immediately reflect the change
      setRequests(prev =>
        prev.map(r => r.id === req.id ? { ...r, status: 'APPROVED' } : r)
      );
    } catch (error) {
      console.error("Error approving request:", error);
      Toast.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: 'Please check if the user exists.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.tname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.tlocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.username?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "ALL"
        ? true
        : req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  // Renders either the static status badge OR the action button if pending
  const renderStatusOrAction = (req) => {
    if (req.status === "APPROVED") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] text-teal-400 uppercase tracking-widest font-bold bg-teal-400/10 px-3 py-1.5 rounded w-fit ml-auto">
          <FaCheckCircle size={12} /> Approved
        </span>
      );
    }

    if (req.status === "REJECTED") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] text-red-500 uppercase tracking-widest font-bold bg-red-500/10 px-3 py-1.5 rounded w-fit ml-auto">
          <FaTimesCircle size={12} /> Rejected
        </span>
      );
    }

    // If PENDING, show the Approve Button
    return (
      <button
        onClick={() => handleApprove(req)}
        disabled={processingId === req.id}
        className="flex items-center justify-center gap-2 bg-white text-black px-4 py-1.5 poppins-semibold text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-colors disabled:opacity-50 min-w-[100px] ml-auto"
      >
        {processingId === req.id ? (
          <div className="w-3 h-3 border-[1px] border-black/20 border-t-black animate-spin rounded-full"></div>
        ) : (
          "Approve"
        )}
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl poppins-bold text-white uppercase tracking-wider flex items-center gap-3">
            <FaBuilding className="text-neutral-500" /> Theatre Requests
          </h1>
          <p className="text-[10px] sm:text-xs text-neutral-500 poppins-medium mt-1 uppercase tracking-[0.2em]">
            Review & Approve Partner Applications
          </p>
        </div>
        <div className="text-right flex gap-6">
            <div>
              <div className="text-3xl poppins-bold text-white">{requests.filter(r => r.status === 'PENDING').length}</div>
              <div className="text-[10px] text-yellow-500 uppercase tracking-widest">Pending</div>
            </div>
            <div>
              <div className="text-3xl poppins-bold text-white">{filteredRequests.length}</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Total Shown</div>
            </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-[#0a0a0a] border border-neutral-800 p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by theatre name, city, or email..."
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
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
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
                  <th className="px-6 py-4 font-medium">Req ID</th>
                  <th className="px-6 py-4 font-medium">Theatre Name</th>
                  <th className="px-6 py-4 font-medium">Applicant Email</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium text-center">Screens</th>
                  <th className="px-6 py-4 font-medium text-right">Action / Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="border-b border-neutral-800/50 hover:bg-[#141414] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">#{req.id}</td>
                    <td className="px-6 py-4 text-xs font-bold text-white tracking-wide uppercase">
                        {req.tname}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <FaEnvelope className="text-neutral-600" />
                        {req.username}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <FaMapMarkerAlt className="text-neutral-600" />
                        {req.tlocation}, {req.state || 'India'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-center text-neutral-300">
                       0{req.tscreens || 1}
                    </td>
                    <td className="px-6 py-4">
                       {renderStatusOrAction(req)}
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-xs uppercase tracking-widest text-neutral-600">
                      No requests found.
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
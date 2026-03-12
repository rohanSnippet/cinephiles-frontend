import React, { useState, useEffect, useMemo } from "react";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { FaUsers, FaSearch, FaTrash, FaUserShield } from "react-icons/fa";
import Swal from "sweetalert2";

const UsersInfo = () => {
  const axiosSecure = useAxiosSecure();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get("/user/all-users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [axiosSecure]);

  // Lightning-fast client-side filtering
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleDelete = (id) => {
    Swal.fire({
      title: "TERMINATE USER?",
      text: "This action cannot be undone.",
      background: "rgba(5, 5, 5, 0.95)",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#8b0000",
      cancelButtonColor: "#333",
      confirmButtonText: "YES, DELETE",
      customClass: {
        popup: "border border-neutral-800 !rounded-none",
        title: "poppins-bold tracking-widest uppercase text-sm",
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Implement your delete logic here
        // await axiosSecure.delete(`/user/${id}`);
        // fetchUsers();
        Swal.fire({
            toast: true, position: "top-end", timer: 2000, showConfirmButton: false,
            title: "USER DELETED", background: "#050505", color: "#fff",
            customClass: { popup: "border border-neutral-800 !rounded-none" }
        });
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl poppins-bold text-white uppercase tracking-wider flex items-center gap-3">
            <FaUsers className="text-neutral-500" /> User Registry
          </h1>
          <p className="text-[10px] sm:text-xs text-neutral-500 poppins-medium mt-1 uppercase tracking-[0.2em]">
            Manage System Access & Roles
          </p>
        </div>
        <div className="text-right">
            <div className="text-3xl poppins-bold text-white">{filteredUsers.length}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Total Results</div>
        </div>
      </div>

      {/* Control Bar (Sharp Edges) */}
      <div className="bg-[#0a0a0a] border border-neutral-800 p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-neutral-800 text-white pl-10 pr-4 py-2.5 text-xs poppins-medium focus:outline-none focus:border-white transition-colors !rounded-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#141414] border border-neutral-800 text-white px-4 py-2.5 text-xs poppins-medium uppercase tracking-wider focus:outline-none focus:border-white transition-colors !rounded-none cursor-pointer"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">User</option>
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
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
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Identity</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-800/50 hover:bg-[#141414] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-neutral-500">#{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1f1f1f] border border-neutral-700 flex items-center justify-center text-xs uppercase font-bold text-white">
                          {user.firstName ? user.firstName[0] : 'U'}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white tracking-wide">{user.firstName} {user.lastName}</div>
                            <div className="text-[10px] text-neutral-500 uppercase">{user.provider || 'NATIVE'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-400">
                        <div>{user.username}</div>
                        <div className="text-[10px] text-neutral-600 mt-0.5">{user.phone || 'No Phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border ${
                        user.role === 'ADMIN' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                        user.role === 'OWNER' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                        'border-neutral-700 text-neutral-400 bg-neutral-800/50'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-700">
                          <FaUserShield size={14} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/30">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-xs uppercase tracking-widest text-neutral-600">
                      No matching records found in registry.
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

export default UsersInfo;
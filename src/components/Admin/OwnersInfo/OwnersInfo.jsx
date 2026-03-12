import React, { useEffect, useState, useMemo } from "react";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { FaStore, FaSearch, FaChevronDown, FaChevronUp, FaBuilding, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";

const OwnersInfo = () => {
  const axiosSecure = useAxiosSecure();
  const [allOwners, setAllOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Track which accordion is open
  const [expandedOwnerId, setExpandedOwnerId] = useState(null);

  const getAllOwners = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get(`/owner/get-owners`);
      if (res && res.data) {
        setAllOwners(res.data);
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllOwners();
  }, [axiosSecure]);

  // Lightning-fast client-side filtering
  const filteredOwners = useMemo(() => {
    if (!searchTerm) return allOwners;
    return allOwners.filter((owner) => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${owner.user.firstName || ""} ${owner.user.lastName || ""}`.toLowerCase();
      const email = (owner.user.username || "").toLowerCase();
      return fullName.includes(searchLower) || email.includes(searchLower);
    });
  }, [allOwners, searchTerm]);

  const toggleExpand = (id) => {
    setExpandedOwnerId(expandedOwnerId === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl poppins-bold text-white uppercase tracking-wider flex items-center gap-3">
            <FaStore className="text-neutral-500" /> Owner Directory
          </h1>
          <p className="text-[10px] sm:text-xs text-neutral-500 poppins-medium mt-1 uppercase tracking-[0.2em]">
            Partner & Franchise Management
          </p>
        </div>
        <div className="text-right">
            <div className="text-3xl poppins-bold text-white">{filteredOwners.length}</div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Registered Partners</div>
        </div>
      </div>

      {/* Control Bar (Sharp Edges) */}
      <div className="bg-[#0a0a0a] border border-neutral-800 p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search partners by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-neutral-800 text-white pl-10 pr-4 py-2.5 text-xs poppins-medium focus:outline-none focus:border-white transition-colors !rounded-none"
          />
        </div>
      </div>

      {/* Data Accordion/List */}
      <div className="bg-[#0a0a0a] border border-neutral-800 overflow-hidden flex flex-col min-h-[500px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
             <div className="w-8 h-8 border-[1px] border-white/20 border-t-white animate-spin"></div>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center py-20 text-center">
             <FaStore className="text-neutral-800 mb-4" size={48} />
             <div className="text-xs uppercase tracking-widest text-neutral-600">No partners found.</div>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredOwners.map((owner, index) => {
              const isExpanded = expandedOwnerId === (owner.user.id || index);

              return (
                <div key={owner.user.id || index} className="border-b border-neutral-800/50 last:border-b-0">

                  {/* Accordion Header (Clickable) */}
                  <div
                    onClick={() => toggleExpand(owner.user.id || index)}
                    className="p-4 sm:px-6 hover:bg-[#141414] cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar Square */}
                      <div className="w-10 h-10 bg-[#1f1f1f] border border-neutral-700 flex items-center justify-center text-sm uppercase font-bold text-white flex-shrink-0">
                        {owner.user.firstName ? owner.user.firstName[0] : 'O'}
                      </div>

                      {/* Owner Info */}
                      <div>
                        <div className="text-sm font-bold text-white tracking-wide uppercase">
                          {owner.user.firstName} {owner.user.lastName}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
                          <span className="flex items-center gap-1.5"><IoIosMail size={12}/> {owner.user.username}</span>
                          <span className="hidden sm:inline">|</span>
                          <span className="flex items-center gap-1.5"><FaPhoneAlt size={10}/> {owner.user.phone || "NO CONTACT"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Toggle */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 border-t border-neutral-800 sm:border-0 pt-3 sm:pt-0">
                      <div className="text-right">
                        <div className="text-lg poppins-bold text-white leading-none">{owner.theatres?.length || 0}</div>
                        <div className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">Theatres</div>
                      </div>
                      <div className="text-neutral-500">
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>
                  </div>

                  {/* Accordion Content (Theatres List) */}
                  {isExpanded && (
                    <div className="bg-[#050505] border-t border-neutral-800 p-4 sm:p-6">
                      <h3 className="text-[10px] text-neutral-500 poppins-semibold uppercase tracking-[0.2em] mb-4">
                        Registered Infrastructure
                      </h3>

                      {owner.theatres && owner.theatres.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {owner.theatres.map((theatre, tIndex) => (
                            <div key={theatre._id || tIndex} className="bg-[#0a0a0a] border border-neutral-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-600 transition-colors">

                              <div className="flex items-start gap-3">
                                <FaBuilding className="text-neutral-600 mt-1 flex-shrink-0" />
                                <div>
                                  <div className="text-xs font-bold text-white tracking-wide uppercase">{theatre.name}</div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">
                                    <FaMapMarkerAlt /> {theatre.city || "Unknown City"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-6 border-t border-neutral-800 sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                <div className="text-center">
                                  <div className="text-xs font-mono text-white">{String(theatre.tscreens || 0).padStart(2, '0')}</div>
                                  <div className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">Screens</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs font-mono text-white">{theatre.contact || "N/A"}</div>
                                  <div className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">Contact</div>
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-[#0a0a0a] border border-neutral-800 border-dashed p-6 text-center">
                          <div className="text-[10px] text-neutral-500 uppercase tracking-widest">
                            No theatres mapped to this partner.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnersInfo;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline, IoLocationOutline } from "react-icons/io5";
import { FiX } from "react-icons/fi";
import { locationHierarchy } from "../Services/Locations";
import useAxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";

const Location = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(locationHierarchy);

  const axiosSecure = useAxiosSecure(); // ADDED THIS
  const username = localStorage.getItem("username"); // ADDED THIS

  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(locationHierarchy);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = locationHierarchy.map(regionObj => {
      const regionMatch = regionObj.region.toLowerCase().includes(lowerQuery);
      const matchedCities = regionObj.cities.filter(c => c.toLowerCase().includes(lowerQuery));
      if (regionMatch || matchedCities.length > 0) return { ...regionObj, cities: matchedCities };
      return null;
    }).filter(Boolean);
    setFilteredData(filtered);
  }, [searchQuery]);

  const handleSelectLocation = async (locationName) => {
    // 1. Instantly update LocalStorage & UI for snappy feel
    localStorage.setItem("city", locationName);
    window.dispatchEvent(new Event("locationUpdated"));

    // 2. If User is Logged In, update the Database in the background!
    if (username) {
      try {
        const res = await axiosSecure.get(`/user?username=${username}`);
        console.log(res.data)
        const userId = res.data?.id;
        if (userId) {
         const resp = await axiosSecure.put(`/user/update-location/${userId}`, {
            currLocation: locationName,
          });

          if(resp?.status == 200){
          Swal.fire({
           icon: "success",
           title: `Location Updated to ${locationName}`,
           timer: 1000,
           showConfirmButton: false,
           background: "#111",
           color: "#fff",
           });
          }else{
              Swal.fire({
                       icon: "error",
                       title: "Cannot update location",
                       timer: 1000,
                       showConfirmButton: false,
                       background: "#111",
                       color: "#fff",
                       });
          }
        }
      } catch (err) {
        console.error("Failed to sync new location to DB", err);
      }
    }

    navigate(-1);
  };


  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center pt-10 px-4 pb-20 relative">

      {/* Background Ambient Glow */}
      <div className="absolute top-[-10%] left-1/2 transform -translate-x-1/2 w-[80vw] h-[50vh] bg-red-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">

        {/* Header & Close Button */}
        <div className="w-full flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl poppins-bold tracking-wide">Pick a Region</h1>
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full relative mb-12">
          <IoSearchOutline className="absolute left-5 top-1/2 transform -translate-y-1/2 text-neutral-400" size={24} />
          <input
            type="text"
            placeholder="Search for your city or region (e.g., Kalyan, Mumbai Region)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder-neutral-500 poppins-medium focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 shadow-xl transition-all"
          />
        </div>

        {/* Popular Mega-Regions (Only show if not actively searching) */}
        {!searchQuery && (
          <div className="w-full mb-12">
            <h2 className="text-sm poppins-semibold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <IoLocationOutline size={18} /> Popular Regions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {locationHierarchy.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectLocation(loc.region)}
                  className="group cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-white transition-all duration-300 shadow-lg">
                    <img src={loc.image} alt={loc.region} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <span className="poppins-medium text-sm text-neutral-300 group-hover:text-white transition-colors text-center">
                    {loc.region}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results / Full Hierarchy List */}
        <div className="w-full space-y-8">
          {filteredData.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 poppins-light">
              We couldn't find any regions or cities matching "{searchQuery}"
            </div>
          ) : (
            filteredData.map((loc, idx) => (
              <div key={idx} className="bg-[#111] border border-white/5 rounded-2xl p-6">

                {/* Select Entire Region Button */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-xl poppins-bold text-white mb-1">{loc.region}</h3>
                    <p className="text-xs text-neutral-500 poppins-medium uppercase tracking-wider">{loc.state}</p>
                  </div>
                  <button
                    onClick={() => handleSelectLocation(loc.region)}
                    className="px-5 py-2.5 bg-white text-black poppins-semibold text-xs rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    Select All {loc.region}
                  </button>
                </div>

                {/* Select Specific City Buttons */}
                <div className="flex flex-wrap gap-3">
                  {(loc.cities || []).map((city, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => handleSelectLocation(city)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl poppins-medium text-sm text-neutral-300 hover:text-white transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Location;
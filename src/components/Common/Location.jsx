import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearchOutline, IoLocationOutline, IoArrowBackOutline } from "react-icons/io5";
import { FiX } from "react-icons/fi";
import { locationHierarchy } from "../Services/Locations";
import useAxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";
import Loading from "./Loading"

const Location = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(locationHierarchy);
  const [isLoading, setIsLoading] = useState(false);

  // NEW STATE: Tracks which macro-region the user clicked into
  const [activeRegion, setActiveRegion] = useState(null);

  const axiosSecure = useAxiosSecure();
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!searchQuery) {
      // If we are looking at a specific region, only show that region's data
      if (activeRegion) {
        setFilteredData(locationHierarchy.filter(r => r.region === activeRegion.region));
      } else {
        setFilteredData(locationHierarchy);
      }
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
  }, [searchQuery, activeRegion]);

  const handleSelectLocation = async (locationName) => {
    // 1. Instantly update LocalStorage & UI
    localStorage.setItem("city", locationName);
    window.dispatchEvent(new Event("locationUpdated"));

    // 2. If User is Logged In, update the Database
    if (username) {
      try {
        setIsLoading(true)
        const res = await axiosSecure.get(`/user?username=${username}`);
        const userId = res.data?.id;
        if (userId) {
         const resp = await axiosSecure.put(`/user/update-location/${userId}`, {
            currLocation: locationName,
          });
          if(resp?.status === 200){
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: `LOCATION : ${locationName.toUpperCase()}`,
              timer: 2500,
              showConfirmButton: false,
              background: "rgba(5, 5, 5, 0.95)",
              color: "#e5e5e5",
              iconColor: "rgba(255, 255, 255, 0.4)",
              customClass: {
                popup: "backdrop-blur-2xl border border-white/5 rounded-md shadow-[0_15px_40px_rgba(0,0,0,0.8)] px-4 py-3",
                title: "poppins-medium text-[10px] sm:text-xs tracking-[0.2em] uppercase opacity-70 m-0 mt-1",
              }
            });
          } else {
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
      } finally {
        setIsLoading(false)
      }
    }

    navigate(-1);
  };

  const handleMacroRegionClick = (loc) => {
    setActiveRegion(loc);
    setSearchQuery(""); // Clear search when diving into a region
  };

  if(isLoading) return <Loading/>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center pt-10 px-4 pb-20 relative">

      {/* Background Ambient Glow */}
      <div className="absolute top-[-10%] left-1/2 transform -translate-x-1/2 w-[80vw] h-[50vh] bg-red-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">

        {/* Header & Close Button */}
        <div className="w-full flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {/* Show Back Button if viewing a specific region */}
            {activeRegion && !searchQuery && (
              <button
                onClick={() => setActiveRegion(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 text-neutral-400 hover:text-white"
              >
                <IoArrowBackOutline size={20} />
              </button>
            )}
            <h1 className="text-2xl md:text-3xl poppins-bold tracking-wide">
              {activeRegion && !searchQuery ? `Regions in ${activeRegion.region}` : "Pick a Region"}
            </h1>
          </div>
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
            placeholder={activeRegion ? `Search in ${activeRegion.region}...` : "Search for your city or region (e.g., Kalyan, Mumbai Region)"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder-neutral-500 poppins-medium focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 shadow-xl transition-all"
          />
        </div>

        {/* STEP 1: Popular Mega-Regions (Only show if NOT searching and NO active region selected) */}
        {!searchQuery && !activeRegion && (
          <div className="w-full mb-12 animate-fade-in">
            <h2 className="text-sm poppins-semibold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <IoLocationOutline size={18} /> Popular Regions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {locationHierarchy.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => handleMacroRegionClick(loc)}
                  className="group cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-red-500/50 transition-all duration-300 shadow-lg">
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

        {/* STEP 2: Sub-Cities / Search Results List */}
        {(searchQuery || activeRegion) && (
          <div className="w-full space-y-8 animate-fade-in">
            {filteredData.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 poppins-light">
                We couldn't find any regions or cities matching "{searchQuery}"
              </div>
            ) : (
              filteredData.map((loc, idx) => (
                <div key={idx} className="bg-[#111] border border-white/5 rounded-2xl p-6">

                  {/* Header for the Region Group */}
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                    <div>
                      <h3 className="text-xl poppins-bold text-white mb-1">{loc.region}</h3>
                      <p className="text-xs text-neutral-500 poppins-medium uppercase tracking-wider">{loc.state}</p>
                    </div>
                  </div>

                  {/* The City Buttons Grid */}
                  <div className="flex flex-wrap gap-3">
                    {/* The "All Region" Button (Like BookMyShow) */}
                    <button
                      onClick={() => handleSelectLocation(`All ${loc.region}`)}
                      className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 rounded-xl poppins-medium text-sm text-red-400 hover:text-red-300 transition-colors w-full sm:w-auto text-center"
                    >
                      All {loc.region}
                    </button>

                    {/* Individual Sub-Cities */}
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
        )}

      </div>
    </div>
  );
};

export default Location;
import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { FaTrash, FaPlus, FaSearch, FaSave, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import Swal from "sweetalert2";

const AVAILABLE_REGIONS = ["Global (Pan India)", "Mumbai", "Pune", "Delhi", "Bangalore", "Hyderabad"];

const FeaturedMovieManager = () => {
  const [allMovies, setAllMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(AVAILABLE_REGIONS[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchAllMovies = async () => {
      try {
        const res = await axiosSecure.get("/movie/all-movies");
        setAllMovies(res.data || []);
      } catch (error) {
        console.error("Failed to fetch all movies:", error);
      }
    };
    fetchAllMovies();
  }, [axiosSecure]);

  useEffect(() => {
    const fetchFeaturedForRegion = async () => {
      setLoading(true);
      try {
        const res = await axiosSecure.get(`/movie/featured?region=${selectedRegion}`);
        setFeaturedMovies(res.data || []);
      } catch (error) {
        console.error("Failed to fetch featured movies for region:", error);
        setFeaturedMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedForRegion();
  }, [selectedRegion, axiosSecure]);

  const fireToast = (title, color = "#fff", bgColor = "#050505") => {
    Swal.fire({
      toast: true, position: "top-end", timer: 2500, showConfirmButton: false,
      title: title, background: bgColor, color: color,
      customClass: { popup: "border border-neutral-800 !rounded-none", title: "poppins-bold tracking-widest uppercase text-xs m-0 mt-1 px-2" }
    });
  };

  const handleAddFeatured = (movie) => {
    if (featuredMovies.find((m) => m.id === movie.id)) return;
    if (featuredMovies.length >= 5) {
      fireToast("MAXIMUM 5 TITLES ALLOWED", "#fff", "#8b0000");
      return;
    }
    setFeaturedMovies([...featuredMovies, movie]);
  };

  const handleRemoveFeatured = (movieId) => {
    setFeaturedMovies(featuredMovies.filter((m) => m.id !== movieId));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const featuredIds = featuredMovies.map((m) => m.id);
      await axiosSecure.post("/movie/featured", {
        region: selectedRegion,
        movieIds: featuredIds
      });
      fireToast(`CONFIG SAVED : ${selectedRegion.toUpperCase()}`);
    } catch (error) {
      console.error("Failed to update featured movies:", error);
      fireToast("FAILED TO SAVE CHANGES", "#fff", "#8b0000");
    } finally {
      setSaving(false);
    }
  };

  const availableMovies = allMovies.filter(
    (movie) =>
      !featuredMovies.some((fm) => fm.id === movie.id) &&
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl poppins-bold text-white uppercase tracking-wider flex items-center gap-3">
            <FaStar className="text-neutral-500" /> Hero Configuration
          </h1>
          <p className="text-[10px] sm:text-xs text-neutral-500 poppins-medium mt-1 uppercase tracking-[0.2em]">
            Manage Regional Carousel Content
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Sharp Region Selector */}
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full sm:w-64 bg-[#141414] border border-neutral-800 text-white pl-10 pr-4 py-3 text-xs poppins-medium uppercase tracking-wider focus:outline-none focus:border-white transition-colors !rounded-none appearance-none cursor-pointer"
            >
              {AVAILABLE_REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveChanges}
            disabled={saving || loading}
            className="flex items-center justify-center gap-2 bg-white text-black px-8 py-3 poppins-semibold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors !rounded-none disabled:opacity-50"
          >
            <FaSave size={14} />
            {saving ? "SAVING..." : "COMMIT CHANGES"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="w-8 h-8 border-[1px] border-white/20 border-t-white animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left Column: Currently Featured */}
          <div className="bg-[#0a0a0a] border border-neutral-800 flex flex-col h-full">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-[#0d0d0d]">
              <h2 className="text-xs poppins-semibold text-white uppercase tracking-widest">
                Active in {selectedRegion}
              </h2>
              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                featuredMovies.length === 5 ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-neutral-700 text-neutral-400 bg-neutral-800/50'
              }`}>
                {featuredMovies.length} / 5 SLOTS
              </span>
            </div>

            <div className="p-4 flex-1">
              {featuredMovies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center border border-dashed border-neutral-800">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-widest">
                    No active content for this region.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {featuredMovies.map((movie, index) => (
                    <div key={movie.id} className="flex items-center gap-4 bg-[#141414] border border-neutral-800 p-2 hover:border-neutral-600 transition-colors">
                      <div className="w-6 text-center text-xs font-mono text-neutral-600">0{index + 1}</div>
                      <img
                        src={movie.poster || movie.banner || "https://m.media-amazon.com/images/I/3120m+SwqYL._AC_UF1000,1000_QL80_.jpg"}
                        alt={movie.title}
                        className="w-10 h-14 object-cover border border-neutral-700"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white tracking-wide uppercase line-clamp-1">{movie.title}</div>
                        <div className="text-[9px] text-neutral-500 uppercase tracking-widest mt-0.5">{movie.releaseDate || 'NO DATE'}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveFeatured(movie.id)}
                        className="p-3 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/30 mr-1"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Search & Add */}
          <div className="bg-[#0a0a0a] border border-neutral-800 flex flex-col h-[600px]">
            <div className="p-4 border-b border-neutral-800 bg-[#0d0d0d]">
              <h2 className="text-xs poppins-semibold text-white uppercase tracking-widest mb-3">
                Content Library
              </h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 size-3" />
                <input
                  type="text"
                  placeholder="Query database by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-neutral-800 text-white pl-9 pr-4 py-2 text-[10px] poppins-medium uppercase focus:outline-none focus:border-white transition-colors !rounded-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {availableMovies.map((movie) => (
                <div key={movie.id} className="flex items-center gap-4 bg-transparent border border-neutral-800/50 p-2 hover:bg-[#141414] hover:border-neutral-700 transition-colors">
                  <img
                    src={movie.poster || movie.banner || "https://m.media-amazon.com/images/I/3120m+SwqYL._AC_UF1000,1000_QL80_.jpg"}
                    alt={movie.title}
                    className="w-8 h-12 object-cover border border-neutral-800 opacity-80"
                  />
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-neutral-300 tracking-wide uppercase line-clamp-1">{movie.title}</div>
                  </div>
                  <button
                    onClick={() => handleAddFeatured(movie)}
                    disabled={featuredMovies.length >= 5}
                    className="flex items-center gap-1.5 px-3 py-2 border border-neutral-700 text-neutral-400 text-[9px] uppercase tracking-widest hover:border-white hover:text-white disabled:opacity-20 disabled:hover:border-neutral-700 disabled:hover:text-neutral-400 transition-colors !rounded-none"
                  >
                    <FaPlus size={8} /> ADD
                  </button>
                </div>
              ))}
              {availableMovies.length === 0 && (
                 <div className="text-center py-10 text-[10px] uppercase tracking-widest text-neutral-600">
                    No matching titles found.
                 </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default FeaturedMovieManager;
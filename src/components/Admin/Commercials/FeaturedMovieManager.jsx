import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { FaTrash, FaPlus, FaSearch, FaSave, FaMapMarkerAlt } from "react-icons/fa";

// You can fetch these from your backend or define standard operational regions
const AVAILABLE_REGIONS = ["Global (Pan India)","Mumbai", "Pune", "Delhi", "Bangalore", "Hyderabad"];

const FeaturedMovieManager = () => {
  const [allMovies, setAllMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(AVAILABLE_REGIONS[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const axiosSecure = useAxiosSecure();

  // Fetch all movies once on mount
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

  // Fetch featured movies whenever the selected region changes
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

  const handleAddFeatured = (movie) => {
    if (featuredMovies.find((m) => m.id === movie.id)) return;
    if (featuredMovies.length >= 5) {
      alert("You can only feature up to 5 movies per region.");
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

      // Sending both region and movieIds to the backend
      await axiosSecure.post("/movie/featured", {
        region: selectedRegion,
        movieIds: featuredIds
      });
      alert(`Featured movies updated successfully for ${selectedRegion}!`);
    } catch (error) {
      console.error("Failed to update featured movies:", error);
      alert("Failed to save changes. Please try again.");
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
    <div className="p-6 md:p-10 bg-[#0a0a0a] min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl poppins-bold mb-2">Manage Featured Movies</h1>
            <p className="text-neutral-400 poppins-light">
              Customize the hero carousel for different regions.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Region Selector */}
            <div className="relative flex-1 md:flex-none">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full md:w-48 bg-[#1f1f1f] border border-neutral-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
              >
                {AVAILABLE_REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSaveChanges}
              disabled={saving || loading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg poppins-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <FaSave />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-12 text-neutral-400 animate-pulse">
            Loading movies for {selectedRegion}...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Currently Featured */}
            <div className="bg-[#141414] p-6 rounded-xl border border-neutral-800">
              <h2 className="text-xl poppins-semibold mb-4 flex items-center justify-between">
                Featured in {selectedRegion}
                <span className={`text-sm px-2 py-1 rounded ${featuredMovies.length === 5 ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 text-neutral-400'}`}>
                  {featuredMovies.length} / 5
                </span>
              </h2>

              {featuredMovies.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-neutral-700 rounded-lg text-neutral-500">
                  No movies selected for {selectedRegion}.
                </div>
              ) : (
                <div className="space-y-4">
                  {featuredMovies.map((movie, index) => (
                    <div key={movie.id} className="flex items-center gap-4 bg-[#1f1f1f] p-3 rounded-lg shadow-sm border border-neutral-800">
                      <span className="text-neutral-500 font-bold w-4">{index + 1}</span>
                      <img src={movie.poster || movie.banner || "https://via.placeholder.com/50"} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="poppins-medium text-sm line-clamp-1">{movie.title}</h3>
                      </div>
                      <button onClick={() => handleRemoveFeatured(movie.id)} className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Search & Add */}
            <div className="bg-[#141414] p-6 rounded-xl border border-neutral-800">
              <h2 className="text-xl poppins-semibold mb-4">Available Movies</h2>

              <div className="relative mb-6">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search movies by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1f1f1f] border border-neutral-800 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {availableMovies.map((movie) => (
                  <div key={movie.id} className="flex items-center gap-4 bg-[#1f1f1f] p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                    <img src={movie.poster || movie.banner || "https://via.placeholder.com/50"} alt={movie.title} className="w-12 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="poppins-medium text-sm line-clamp-1">{movie.title}</h3>
                    </div>
                    <button
                      onClick={() => handleAddFeatured(movie)}
                      disabled={featuredMovies.length >= 5}
                      className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent text-white rounded-lg transition-colors flex items-center gap-2 text-sm px-4"
                    >
                      <FaPlus size={12} /> Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedMovieManager;
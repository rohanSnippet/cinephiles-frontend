import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import UserNavHeader from "../MovieBooking/UserNavHeader";
import useAxiosSecure from "../Hooks/AxiosSecure";
import MovieCard from "./MovieCard";
import { BsSortAlphaDown, BsSortAlphaUpAlt, BsFilter } from "react-icons/bs";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "../Common/Loading";

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const AllMovies = () => {
  const axiosSecure = useAxiosSecure();
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedSort, setSelectedSort] = useState("earliest");

  // Loading & Pagination States
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0); // 0-indexed for Spring Boot
  const itemsPerPage = 8;

  const observer = useRef();

  // Helper to map frontend sort string to backend params
  const getSortParams = (sortVal) => {
    switch (sortVal) {
      case "earliest": return { sortBy: "releaseDate", direction: "asc" };
      case "latest":   return { sortBy: "releaseDate", direction: "desc" };
      case "a-z":      return { sortBy: "title", direction: "asc" };
      case "z-a":      return { sortBy: "title", direction: "desc" };
      default:         return { sortBy: "releaseDate", direction: "asc" };
    }
  };

  // Fetch movies from the backend using Pagination AND Sorting
  const fetchMovies = useCallback(async (currentPage, currentSort) => {
    try {
      if (currentPage === 0) setIsLoading(true);
      else setIsFetchingMore(true);

      const { sortBy, direction } = getSortParams(currentSort);

      const res = await axiosSecure.get(
        `/movie/upcoming-page?page=${currentPage}&size=${itemsPerPage}&sortBy=${sortBy}&direction=${direction}`
      );

      const fetchedMovies = res.data.content || [];

      // Determine if more pages exist
      setHasMore(!res.data.last);

      setMovies((prev) => {
        // If page is 0 (initial load or sort change), completely replace the list
        if (currentPage === 0) return fetchedMovies;

        // Otherwise, append to bottom securely
        const newIds = new Set(fetchedMovies.map(m => m._id || m.id));
        const filteredPrev = prev.filter(m => !newIds.has(m._id || m.id));
        return [...filteredPrev, ...fetchedMovies];
      });

    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [axiosSecure]);

  // Trigger fetch when PAGE or SORT changes
  useEffect(() => {
    fetchMovies(page, selectedSort);
  }, [fetchMovies, page, selectedSort]);

  // Memoized filtered movies (Sorting is completely removed from here!)
  const filteredMovies = useMemo(() => {
    if (!movies.length) return [];
    if (selectedGenre === "All") return movies;

    return movies.filter(movie =>
      movie.genre && movie.genre.includes(selectedGenre)
    );
  }, [movies, selectedGenre]);

  // Infinite Scroll Observer
  const lastElementRef = useCallback((node) => {
      if (isLoading || isFetchingMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      }, {
        threshold: 0.1,
        rootMargin: "200px"
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingMore, hasMore]
  );

  const handleFilterChange = useCallback((value) => setSelectedGenre(value), []);

  // Handle Sort Change: Reset list to top
  const handleSortChange = useCallback((value) => {
    if (value === selectedSort) return;
    setMovies([]);      // Clear current list to prevent UI mixing
    setPage(0);         // Reset to first page
    setHasMore(true);
    setSelectedSort(value); // This state update triggers the useEffect to fetch data
  }, [selectedSort]);

  if (isLoading && page === 0) {
    return <Loading/>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] to-[#05070a] text-white overflow-x-hidden">
      <UserNavHeader navLocation="/" item={null} />

      <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar - Trending Movies */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hidden lg:block lg:w-1/4 xl:w-1/5"
          >
            <div className="sticky top-24 bg-gradient-to-br from-slate-900/80 to-black/80 backdrop-blur-xl border border-white/5 rounded-2xl h-[75vh] p-4 shadow-2xl">
              <div className="w-full h-full bg-slate-800/30 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                <span className="text-slate-400 poppins-medium tracking-wider uppercase text-sm">Trending Movies</span>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4 xl:w-4/5 flex flex-col gap-6">

            {/* Filter and Sort Controls */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-[70px] z-30 bg-[#0a0f1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <h1 className="text-2xl sm:text-3xl poppins-bold text-center lg:text-left mb-5 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-wide uppercase">
                Upcoming Movies
              </h1>

              <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
                {/* Sorting Pills */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 p-1.5 ring-1 ring-white/10 shadow-lg text-sm poppins-medium bg-slate-900/60 rounded-full w-full md:w-auto">
                  {[
                    { value: "earliest", label: "By Date", icon: null },
                    { value: "latest", label: "New", icon: null },
                    { value: "a-z", label: "A-Z", icon: <BsSortAlphaDown size={18} /> },
                    { value: "z-a", label: "Z-A", icon: <BsSortAlphaUpAlt size={18} /> }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer relative group">
                      <input
                        type="radio"
                        name="sorting"
                        value={option.value}
                        checked={selectedSort === option.value}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="sr-only"
                      />
                      <span className={`px-4 py-2 rounded-full flex items-center gap-1.5 transition-all duration-300 ${
                        selectedSort === option.value
                          ? 'bg-slate-200 text-black shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}>
                        {option.icon && <span>{option.icon}</span>}
                        <span>{option.label}</span>
                      </span>
                    </label>
                  ))}
                </div>

                {/* Filter Pills */}
                <div className="hidden md:flex flex-wrap justify-center gap-2 p-1.5 ring-1 ring-white/10 shadow-lg text-sm poppins-medium bg-slate-900/60 rounded-full">
                  {["All", "Action", "Comedy", "Horror", "Thriller"].map((genre) => (
                    <label key={genre} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="genre"
                        value={genre}
                        checked={selectedGenre === genre}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="sr-only"
                      />
                      <span className={`px-5 py-2 rounded-full transition-all duration-300 ${
                        selectedGenre === genre
                          ? 'bg-slate-200 text-black shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}>
                        {genre}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Mobile Filter Dropdown */}
                <div className="md:hidden relative w-full sm:w-auto">
                  <select
                    value={selectedGenre}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="w-full p-3 ring-1 ring-white/10 shadow-lg text-sm poppins-medium bg-slate-900/80 rounded-full appearance-none pl-5 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {["All", "Action", "Comedy", "Horror", "Thriller"].map((genre) => (
                      <option key={genre} value={genre} className="bg-slate-900 text-white">{genre}</option>
                    ))}
                  </select>
                  <BsFilter size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </motion.div>

            {/* Movies Grid */}
            <AnimatePresence mode="wait">
              {filteredMovies.length > 0 ? (
                <motion.div
                  key="movies-grid"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 mt-2"
                >
                  {filteredMovies.map((movie) => (
                    <motion.div
                      key={movie._id || movie.id}
                      variants={itemVariants}
                      layoutId={String(movie._id || movie.id)}
                    >
                      <MovieCard item={movie} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                !isLoading && (
                  <motion.div
                    key="no-movies"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex flex-col items-center justify-center py-24 text-slate-500 bg-slate-900/20 rounded-2xl border border-white/5"
                  >
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                    <p className="poppins-medium text-lg">No movies found in this genre.</p>
                  </motion.div>
                )
              )}
            </AnimatePresence>

            {/* Sentinel Element for Real Infinite Scroll */}
            {hasMore && movies.length > 0 && (
               <div ref={lastElementRef} className="w-full flex justify-center py-8 min-h-[100px]">
                            {isFetchingMore && (
                              <div className="flex items-center gap-2 text-slate-400 poppins-medium text-sm animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-200 animation-delay-200"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-200 animation-delay-400"></div>
                                <span className="ml-2">Loading more movies...</span>
                              </div>
                            )}
                          </div>
            )}

            <div className="flex justify-center mt-6 mb-8">
              <Link
                to="/"
                className="px-8 py-3 bg-slate-800/80 hover:bg-indigo-600 rounded-full transition-all duration-300 text-sm poppins-medium text-white shadow-lg border border-white/10 hover:border-indigo-500"
              >
                Back to Home Page
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AllMovies;
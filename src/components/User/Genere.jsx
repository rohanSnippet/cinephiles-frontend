import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../Hooks/AxiosPublic";
import MovieCard from "./MovieCard";
import { BsSortAlphaDown, BsSortAlphaUpAlt, BsFilter } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import Loading from "../Common/Loading";
import UserNavHeader from "../MovieBooking/UserNavHeader";

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

const Genere = () => {
  const axiosPublic = useAxiosPublic();
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial genre from URL query parameter
  const queryParams = new URLSearchParams(location.search);
  const initialGenre = queryParams.get("category") || "Action";

  // Filter States
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedSort, setSelectedSort] = useState("latest");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  // Pagination / Infinite Scroll States
  const [page, setPage] = useState(1);
  const itemsPerPage = 10; // 5 in a row, so 10 per page gives 2 full rows
  const observer = useRef();

  // Fetch ALL movies once, React Query handles caching automatically
  const { data: allMovies = [], isLoading } = useQuery({
    queryKey: ["allMoviesCache"],
    queryFn: async () => {
      const res = await axiosPublic.get("/movie/all-movies");
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 mins
  });

  // Extract dynamic languages from available movies
  const availableLanguages = useMemo(() => {
    const langs = new Set();
    allMovies.forEach(m => m.languages?.forEach(l => langs.add(l)));
    return ["All", ...Array.from(langs)];
  }, [allMovies]);

  const availableGenres = ["Action", "Period Drama", "Horror", "Romance", "Comedy", "Thriller", "Sci-Fi"];

  // Filter & Sort Logic in Frontend
  const filteredAndSortedMovies = useMemo(() => {
    let result = [...allMovies];

    // 1. Genre Filter
    if (selectedGenre !== "Explore More" && selectedGenre !== "All") {
      result = result.filter((m) => m.genre?.includes(selectedGenre));
    }

    // 2. Rating Filter
    if (selectedRating !== "All") {
      const minRating = parseFloat(selectedRating);
      result = result.filter((m) => (m.ratings || 0) >= minRating);
    }

    // 3. Status Filter (Upcoming / Now Running)
    if (selectedStatus !== "All") {
      const today = new Date().toISOString().split("T")[0];
      if (selectedStatus === "Upcoming") {
        result = result.filter((m) => m.releaseDate > today);
      } else if (selectedStatus === "Now Running") {
        result = result.filter((m) => m.releaseDate <= today || m.bookingOpen);
      }
    }

    // 4. Language Filter
    if (selectedLanguage !== "All") {
      result = result.filter((m) => m.languages?.includes(selectedLanguage));
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (selectedSort === "latest") {
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      }
      if (selectedSort === "earliest") {
        return new Date(a.releaseDate) - new Date(b.releaseDate);
      }
      if (selectedSort === "a-z") {
        return a.title.localeCompare(b.title);
      }
      if (selectedSort === "z-a") {
        return b.title.localeCompare(a.title);
      }
      if (selectedSort === "rating-high") {
        return (b.ratings || 0) - (a.ratings || 0);
      }
      return 0;
    });

    return result;
  }, [allMovies, selectedGenre, selectedRating, selectedStatus, selectedLanguage, selectedSort]);

  // Handle resetting page when filters change
  useEffect(() => {
    setPage(1);
    // Update URL query param to reflect the current genre
    if (selectedGenre !== "All") {
      navigate(`/genre?category=${selectedGenre}`, { replace: true });
    }
  }, [selectedGenre, selectedRating, selectedStatus, selectedLanguage, selectedSort, navigate]);

  // Current displayed items based on virtual pagination
  const displayedMovies = useMemo(() => {
    return filteredAndSortedMovies.slice(0, page * itemsPerPage);
  }, [filteredAndSortedMovies, page, itemsPerPage]);

  const hasMore = displayedMovies.length < filteredAndSortedMovies.length;

  // Infinite Scroll Observer
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white overflow-x-hidden pb-10">
      <UserNavHeader navLocation="/" item={null} />

      <div className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-10 py-8 mt-6">
        
        {/* Header Section */}
        <div className="mb-10">
           <h1 className="text-3xl md:text-5xl poppins-bold text-white tracking-wide uppercase mb-2">
             Explore <span className="text-red-600">Genres</span>
           </h1>
           <p className="text-slate-400 poppins-light text-sm md:text-base">
             Discover movies tailored exactly to your mood. Use the advanced filters to narrow down the perfect choice.
           </p>
        </div>

        {/* Advanced Filters Layout - Light and non-intrusive */}
        <div className="flex flex-col xl:flex-row gap-6 mb-10">
          
          {/* Genre Tabs */}
          <div className="flex flex-wrap gap-2 flex-1">
             {availableGenres.map((genre) => (
               <button
                 key={genre}
                 onClick={() => setSelectedGenre(genre)}
                 className={`px-5 py-2 poppins-medium text-sm transition-all duration-300 ${
                   selectedGenre === genre
                     ? "bg-red-600 text-white shadow-lg"
                     : "bg-slate-800/40 text-slate-300 hover:bg-slate-700 hover:text-white"
                 }`}
               >
                 {genre}
               </button>
             ))}
          </div>

          {/* Sort & Additional Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 text-white poppins-medium text-sm outline-none focus:border-red-500 transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="Now Running">Now Running</option>
              <option value="Upcoming">Upcoming</option>
            </select>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 text-white poppins-medium text-sm outline-none focus:border-red-500 transition-colors"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>{lang === "All" ? "All Languages" : lang}</option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 text-white poppins-medium text-sm outline-none focus:border-red-500 transition-colors"
            >
              <option value="All">All Ratings</option>
              <option value="8">8.0+ ⭐</option>
              <option value="7">7.0+ ⭐</option>
              <option value="6">6.0+ ⭐</option>
            </select>

            {/* Sort Filter */}
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-4 py-2 bg-slate-800/60 border border-slate-700/50 text-white poppins-medium text-sm outline-none focus:border-red-500 transition-colors"
            >
              <option value="latest">Release: Newest First</option>
              <option value="earliest">Release: Oldest First</option>
              <option value="rating-high">Highest Rated</option>
              <option value="a-z">Title: A-Z</option>
              <option value="z-a">Title: Z-A</option>
            </select>

          </div>
        </div>

        {/* Movies Grid - 5 in a row */}
        <AnimatePresence mode="wait">
          {displayedMovies.length > 0 ? (
            <motion.div
              key="movies-grid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              layout
              // Standardizing grid cols to 5 for large screens
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {displayedMovies.map((movie) => (
                <motion.div
                  key={movie.id}
                  variants={itemVariants}
                  layoutId={String(movie.id)}
                >
                  <MovieCard item={movie} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-movies"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center justify-center py-32 text-slate-500 bg-slate-900/10 border-t border-b border-white/5"
            >
              <BsFilter size={48} className="mb-4 opacity-30" />
              <p className="poppins-medium text-xl">No movies found matching your filters.</p>
              <button 
                onClick={() => {
                  setSelectedGenre("All");
                  setSelectedStatus("All");
                  setSelectedLanguage("All");
                  setSelectedRating("All");
                }}
                className="mt-6 px-6 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-colors poppins-medium rounded"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intersection Observer Sentinel for Auto Fetching */}
        {hasMore && displayedMovies.length > 0 && (
          <div ref={lastElementRef} className="w-full flex justify-center py-12">
             <div className="flex items-center gap-2 text-slate-400 poppins-medium text-sm animate-pulse">
               <div className="w-2 h-2 rounded-full bg-slate-400"></div>
               <div className="w-2 h-2 rounded-full bg-slate-400 animation-delay-200"></div>
               <div className="w-2 h-2 rounded-full bg-slate-400 animation-delay-400"></div>
               <span className="ml-2">Loading more movies...</span>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Genere;

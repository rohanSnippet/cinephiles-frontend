import React, { useEffect, useState, useMemo, useCallback } from "react";
import UserNavHeader from "../MovieBooking/UserNavHeader";
import useAxiosSecure from "../Hooks/AxiosSecure";
import MovieCard from "./MovieCard";
import { BsSortAlphaDown, BsSortAlphaUpAlt, BsFilter } from "react-icons/bs";
import { Link } from "react-router-dom";

const AllMovies = () => {
  const axiosSecure = useAxiosSecure();
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedSort, setSelectedSort] = useState("earliest");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch movies from the backend
  const fetchMovies = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axiosSecure.get("/movie/upcoming-movies");
      setMovies(res.data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
    }
  }, [axiosSecure]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Memoized filtered and sorted movies for better performance
  const filteredAndSortedMovies = useMemo(() => {
    if (!movies.length) return [];
    
    let result = [...movies];
    
    // Apply genre filter
    if (selectedGenre !== "All") {
      result = result.filter(movie => 
        movie.genre && movie.genre.includes(selectedGenre)
      );
    }
    
    // Apply sorting
    switch (selectedSort) {
      case "earliest":
        return result.sort((m1, m2) => 
          new Date(m1.releaseDate) - new Date(m2.releaseDate)
        );
      case "latest":
        return result.sort((m1, m2) => 
          new Date(m2.releaseDate) - new Date(m1.releaseDate)
        );
      case "a-z":
        return result.sort((m1, m2) => 
          m1.title.localeCompare(m2.title)
        );
      case "z-a":
        return result.sort((m1, m2) => 
          m2.title.localeCompare(m1.title)
        );
      default:
        return result;
    }
  }, [movies, selectedGenre, selectedSort]);

  // Combined handler for filter and sort to reduce re-renders
  const handleFilterChange = useCallback((value) => {
    setSelectedGenre(value);
  }, []);

  const handleSortChange = useCallback((value) => {
    setSelectedSort(value);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white">
        <UserNavHeader navLocation="/" item={null} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white">
      <UserNavHeader navLocation="/" item={null} />
      
      <div className="container mx-auto px-2 sm:px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar - Trending Movies (Hidden on mobile) */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-gradient-to-br from-slate-900/90 to-black rounded-xl h-full p-3">
              <div className="w-full h-full bg-gradient-to-br from-white/10 to-slate-100/10 rounded-xl flex items-center justify-center">
                <span className="text-gray-300">Trending movies</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            <div className="bg-gradient-to-br from-slate-900/90 to-black/60 rounded-lg p-4">
              {/* Page Title for mobile */}
              <h1 className="text-2xl poppins-semibold text-center mb-4 lg:hidden">
                UPCOMING MOVIES
              </h1>

              {/* Filter and Sort Controls */}
              <div className="sticky top-0 z-10 pb-4 bg-gradient-to-br from-slate-900/90 to-black/60 rounded-lg">
                {/* Page Title for desktop */}
                <div className="hidden lg:flex text-2xl poppins-semibold justify-center mb-3">
                  UPCOMING MOVIES
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
                  {/* Sorting */}
                  <div className="flex flex-wrap justify-center gap-2 p-2 ring-1 ring-white/10 shadow-md shadow-white/10 text-md poppins-light bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-3xl">
                    {[
                      { value: "earliest", label: "By Date", icon: null },
                      { value: "latest", label: "New", icon: null },
                      { value: "a-z", label: "A-Z", icon: <BsSortAlphaDown size={16} /> },
                      { value: "z-a", label: "Z-A", icon: <BsSortAlphaUpAlt size={16} /> }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="sorting"
                          value={option.value}
                          checked={selectedSort === option.value}
                          onChange={(e) => handleSortChange(e.target.value)}
                          className="sr-only"
                        />
                        <span className={`px-3 py-1 rounded-2xl text-sm flex items-center gap-1 ${selectedSort === option.value ? 'bg-slate-300 text-black' : 'bg-slate-800 hover:bg-slate-700'}`}>
                          {option.icon && <span>{option.icon}</span>}
                          <span>{option.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Filter for larger screens */}
                  <div className="hidden md:flex flex-wrap justify-center gap-2 p-2 ring-1 ring-white/10 shadow-md shadow-white/10 text-md poppins-light bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-3xl">
                    {["All", "Action", "Comedy", "Horror", "Thriller"].map((genre) => (
                      <label key={genre} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="option"
                          value={genre}
                          checked={selectedGenre === genre}
                          onChange={(e) => handleFilterChange(e.target.value)}
                          className="sr-only"
                        />
                        <span className={`px-3 py-1 rounded-2xl text-sm ${selectedGenre === genre ? 'bg-slate-300 text-black' : 'bg-slate-800 hover:bg-slate-700'}`}>
                          {genre}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Mobile filter dropdown */}
                  <div className="md:hidden relative">
                    <select 
                      value={selectedGenre}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="p-2 ring-1 ring-white/10 shadow-md shadow-white/10 text-md poppins-light bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-3xl appearance-none pl-4 pr-8"
                    >
                      {["All", "Action", "Comedy", "Horror", "Thriller"].map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                    <BsFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Movies Grid - Adjusted for proper card display */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
                {filteredAndSortedMovies.length > 0 ? (
                  filteredAndSortedMovies.map((movie) => (
                    <MovieCard key={movie._id || movie.id} item={movie} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    No movies found. Try adjusting your filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Link */}
      <div className="container mx-auto px-4 py-4 text-center">
        <Link 
          to="/pop2" 
          state={{from: "/All-Movies"}}
          className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm"
        >
          Navigate
        </Link>
      </div>
    </div>
  );
};

export default AllMovies;
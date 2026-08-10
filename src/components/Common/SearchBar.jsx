import { useState, useEffect, useRef } from "react";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import useAxiosPublic from "../Hooks/AxiosPublic"
import useAxiosSecure from "../Hooks/AxiosSecure"
import {baseURL} from "../Services/URL.js"
import axios from "axios";

const SearchBar = ({ isMobile = false, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const axiosSecure = useAxiosSecure();
  const axiosPublic = useAxiosPublic();
  const searchRef = useRef(null);

  // ... (Keep existing useEffects and functions identical) ...

  // Debounce search
    useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
        if (query.length > 2) {
          performSearch();
        } else {
          setResults([]);
          setShowResults(false);
        }
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // Close results when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
          setShowResults(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const performSearch = async () => {
      setIsLoading(true);
      try {
        const response = await axiosPublic.get(`${baseURL}/movie/search?query=${query}&limit=5`);
        console.log(response)
        setResults(response.data);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const handleInputChange = (e) => {
      setQuery(e.target.value.trimStart());
    };

    const handleResultClick = () => {
      setShowResults(false);
      setQuery("");
      if (onClose) onClose();
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      /* if (query.trim()) {
        // Navigate to search results page
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      } */
    };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <IoSearchOutline size={20} className="absolute left-4 text-white/50" />
        <input
          className="w-full h-11 bg-white/10 border border-white/10 hover:bg-white/15 focus:bg-white/10 focus:border-white/30 rounded-full pl-11 pr-10 text-sm placeholder:text-white/40 text-white poppins-light outline-none transition-all duration-300"
          type="text"
          placeholder="Search movies, actors, or theaters..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 2 && setShowResults(true)}
          autoFocus={isMobile}
        />

        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); setShowResults(false); }}
            className="absolute right-4 text-white/50 hover:text-white"
          >
            <IoClose size={20} />
          </button>
        )}
      </form>

      {/* Dropdown Results */}
      {showResults && (results.length > 0 || isLoading) && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#0a0a0a] backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50">
          {isLoading ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></div>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {results.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie-details`}
                  state={{ item: movie, previousPath: "/" }}
                  onClick={handleResultClick}
                  className="flex items-center gap-4 p-3 hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors"
                >
                  <img
                    src={movie.poster || "/placeholder-poster.jpg"}
                    alt={movie.title}
                    className="w-12 h-[72px] object-cover rounded bg-[#111]"
                    onError={(e) => { e.target.src = "/placeholder-poster.jpg"; }}
                  />
                  <div>
                    <h4 className="text-white poppins-medium text-sm line-clamp-1">{movie.title}</h4>
                    {movie.releaseDate && (
                      <p className="text-white/50 poppins-light text-xs mt-0.5">{movie.releaseDate.substring(0,4)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
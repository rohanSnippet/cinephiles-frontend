// components/SearchBar.jsx
import { useState, useEffect, useRef } from "react";
import { IoSearchOutline, IoClose } from "react-icons/io5";
import { Link } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";


const SearchBar = ({ isMobile = false, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const axiosSecure = useAxiosSecure();
  const searchRef = useRef(null);

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
      const response = await axiosSecure.get(`/movie/search?query=${query}&limit=5`);
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
    <div ref={searchRef} className="relative sm:w-1/2 w-full">
      <form onSubmit={handleSubmit} className="relative md:justify-center md:flex md:text-center">
        <input
          className={`h-10 w-full shadow-sm shadow-gray-600 rounded-3xl bg-transparent px-4 py-2 text-md placeholder:text-gray-300 text-white ring-1 ring-gray-400 hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 ${
            isMobile ? "pr-10" : "pr-10"
          }`}
          type="text"
          placeholder="Search movies, shows, and more"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 2 && setShowResults(true)}
          autoFocus={isMobile}
        />
        
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-10 top-2.5 text-white hover:text-gray-300"
          >
            <IoClose size={20} />
          </button>
        )}
        
        <button
          type="submit"
          className="absolute right-3 top-2.5 text-white hover:text-gray-300"
        >
          <IoSearchOutline size={20} />
        </button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/85 poppins-light backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-white">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            </div>
          ) : (
            <>
              {results.map((movie) => (
                <Link
                  key={movie.id}
                   to={`/movie-details`}
                   state={{ item: movie, previousPath: "/" }}
                  onClick={handleResultClick}
                  className="flex items-center text-lg p-3 hover:bg-gray-800/50 border-b border-gray-700 last:border-b-0"
                >
                  <img
                    src={movie.poster || "/placeholder-poster.jpg"}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded-md mr-3"
                    onError={(e) => {
                      e.target.src = "/placeholder-poster.jpg";
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="text-white text-sm font-medium truncate">
                      {movie.title}
                    </h4>
                    {movie.releaseDate && (
                      <p className="text-gray-400 text-sm">
                        {movie.releaseDate.substring(0,4)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
              
              {/* {results.length > 0 && (
                <div className="p-3 border-t border-gray-700">
                  <Link
                    to={`/search?q=${encodeURIComponent(query)}`}
                    onClick={handleResultClick}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium text-center block"
                  >
                    View all results for "{query}"
                  </Link>
                </div>
              )} */}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
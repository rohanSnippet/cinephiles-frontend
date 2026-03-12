import React, { useEffect, useState, useCallback } from "react";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaFilm, FaPlus } from "react-icons/fa";
import { MdMovieEdit, MdOutlineDelete, MdChevronLeft, MdChevronRight } from "react-icons/md";
import Swal from "sweetalert2";

const AdminMovieDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Server-Side State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter & Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  // Fetch movies from the backend using pagination parameters
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosSecure.get(`/movie/paginated`, {
        params: {
          page: page,
          size: size,
          sortBy: sortField,
          direction: sortDirection,
          search: appliedSearch,
        }
      });

      setMovies(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to fetch movies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, page, size, sortField, sortDirection, appliedSearch]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    setAppliedSearch(searchTerm);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [field, direction] = value.split("-");
    setSortField(field);
    setSortDirection(direction);
    setPage(0);
  };

  const handleDeleteMovie = (id) => {
    Swal.fire({
      title: "TERMINATE TITLE?",
      text: "This action cannot be undone.",
      background: "rgba(5, 5, 5, 0.95)",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#8b0000",
      cancelButtonColor: "#333",
      confirmButtonText: "YES, DELETE",
      customClass: {
        popup: "border border-neutral-800 !rounded-none",
        title: "poppins-bold tracking-widest uppercase text-sm",
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.delete(`/movie/delete-movie/${id}`);
          if (res.status === 200) {
            Swal.fire({
                toast: true, position: "top-end", timer: 2000, showConfirmButton: false,
                title: "TITLE DELETED", background: "#050505", color: "#fff",
                customClass: { popup: "border border-neutral-800 !rounded-none" }
            });
            fetchMovies();
          }
        } catch (error) {
          Swal.fire({
            toast: true, position: "top-end", timer: 2000, showConfirmButton: false,
            title: "DELETE FAILED", background: "#8b0000", color: "#fff",
            customClass: { popup: "border border-neutral-800 !rounded-none" }
          });
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl poppins-bold text-white uppercase tracking-wider flex items-center gap-3">
            <FaFilm className="text-neutral-500" /> Content Master
          </h1>
          <p className="text-[10px] sm:text-xs text-neutral-500 poppins-medium mt-1 uppercase tracking-[0.2em]">
            Global Movie Database Management
          </p>
        </div>
        <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
                <div className="text-3xl poppins-bold text-white">{totalElements}</div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Total Titles</div>
            </div>
            <Link
                to="/admin/save-movie"
                className="flex items-center gap-2 bg-white text-black px-6 py-3 poppins-semibold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors !rounded-none"
            >
                <FaPlus /> Add Movie
            </Link>
        </div>
      </div>

      {/* Control Bar (Sharp Edges) */}
      <div className="bg-[#0a0a0a] border border-neutral-800 p-4 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 flex">
          <div className="relative w-full">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search database by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141414] border border-neutral-800 text-white pl-10 pr-4 py-2.5 text-xs poppins-medium focus:outline-none focus:border-white transition-colors !rounded-none"
            />
          </div>
          <button type="submit" className="bg-neutral-800 text-white px-6 text-xs uppercase tracking-widest poppins-medium hover:bg-neutral-700 transition-colors border border-l-0 border-neutral-800 !rounded-none">
            Query
          </button>
        </form>

        <select
          value={`${sortField}-${sortDirection}`}
          onChange={handleSortChange}
          className="bg-[#141414] border border-neutral-800 text-white px-4 py-2.5 text-xs poppins-medium uppercase tracking-wider focus:outline-none focus:border-white transition-colors !rounded-none cursor-pointer sm:w-64"
        >
          <option value="id-desc">Latest Added</option>
          <option value="title-asc">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
          <option value="releaseDate-desc">Release Date (Newest)</option>
          <option value="releaseDate-asc">Release Date (Oldest)</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-[#0a0a0a] border border-neutral-800 overflow-hidden flex flex-col min-h-[500px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
             <div className="w-8 h-8 border-[1px] border-white/20 border-t-white animate-spin"></div>
          </div>
        ) : error ? (
           <div className="flex-1 flex justify-center items-center text-xs text-red-500 uppercase tracking-widest">
             {error}
           </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-neutral-300">
                <thead className="bg-[#141414] text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
                  <tr>
                    <th className="px-6 py-4 font-medium w-16">Poster</th>
                    <th className="px-6 py-4 font-medium">Title & Details</th>
                    <th className="px-6 py-4 font-medium">Languages</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.length > 0 ? movies.map((movie) => (
                    <tr key={movie.id} className="border-b border-neutral-800/50 hover:bg-[#141414] transition-colors">
                      <td className="px-6 py-3">
                         <img
                            src={movie.poster || `https://m.media-amazon.com/images/I/3120m+SwqYL._AC_UF1000,1000_QL80_.jpg`}
                            alt={movie.title}
                            className="w-10 h-14 object-cover border border-neutral-700"
                          />
                      </td>
                      <td className="px-6 py-3">
                         <div className="text-sm font-bold text-white tracking-wide">{movie.title}</div>
                         <div className="text-[10px] text-neutral-500 uppercase mt-0.5 flex gap-2">
                             <span>{movie.releaseDate || 'NO DATE'}</span>
                             <span>|</span>
                             <span className="text-neutral-400">{movie.genre?.join(", ")}</span>
                         </div>
                      </td>
                      <td className="px-6 py-3 text-xs text-neutral-400">
                         {movie.languages?.join(", ") || 'N/A'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/Edit-Movie`, { state: { selectedMovie: movie } })}
                            className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-700"
                          >
                            <MdMovieEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(movie.id)}
                            className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/30"
                          >
                            <MdOutlineDelete size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center text-xs uppercase tracking-widest text-neutral-600">
                        No titles match your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="bg-[#0d0d0d] border-t border-neutral-800 p-4 flex justify-between items-center">
                 <div className="text-[10px] uppercase tracking-widest text-neutral-500 font-medium">
                    PAGE {page + 1} OF {totalPages}
                 </div>
                 <div className="flex items-center gap-1">
                    <button
                        onClick={() => setPage(prev => Math.max(0, prev - 1))}
                        disabled={page === 0}
                        className="p-2 border border-neutral-800 text-neutral-400 hover:border-white hover:text-white disabled:opacity-30 disabled:hover:border-neutral-800 disabled:hover:text-neutral-400 transition-colors !rounded-none"
                    >
                        <MdChevronLeft size={16} />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                         if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
                             return (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`w-8 h-8 flex items-center justify-center text-[10px] poppins-bold transition-colors border !rounded-none ${
                                        page === i
                                        ? 'bg-white text-black border-white'
                                        : 'bg-transparent text-neutral-500 border-neutral-800 hover:border-white hover:text-white'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                             )
                         } else if (i === page - 2 || i === page + 2) {
                             return <span key={i} className="text-neutral-600 px-1">...</span>
                         }
                         return null;
                    })}

                    <button
                        onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={page === totalPages - 1}
                        className="p-2 border border-neutral-800 text-neutral-400 hover:border-white hover:text-white disabled:opacity-30 disabled:hover:border-neutral-800 disabled:hover:text-neutral-400 transition-colors !rounded-none"
                    >
                        <MdChevronRight size={16} />
                    </button>
                 </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMovieDashboard;
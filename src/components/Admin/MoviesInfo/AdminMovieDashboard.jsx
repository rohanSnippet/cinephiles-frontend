import React, { useEffect, useState, useMemo } from "react";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { Link, useNavigate } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";
import { MdMovieEdit, MdOutlineDelete } from "react-icons/md";
import { PiFilmReelBold } from "react-icons/pi";
import Swal from "sweetalert2";
import { IoTicketOutline } from "react-icons/io5";

const AdminMovieDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [bookingStatus, setBookingStatus] = useState("All"); // 'All', 'Open', 'Closed'
  const [sortBy, setSortBy] = useState("title-asc"); // 'title-asc', 'title-desc', 'release-asc', 'release-desc'

  // Fetch movies from the backend
  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosSecure.get(`/movie/all-movies`);
      setMovies(res.data); // Store fetched movies in the state
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError("Failed to fetch movies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [axiosSecure]);

  // Extract unique genres and languages for filter dropdowns
  const allGenres = useMemo(() => {
    const genres = new Set();
    movies.forEach((movie) => movie.genre.forEach((g) => genres.add(g)));
    return ["All", ...Array.from(genres).sort()];
  }, [movies]);

  const allLanguages = useMemo(() => {
    const languages = new Set();
    movies.forEach((movie) =>
      movie.languages.forEach((lang) => languages.add(lang))
    );
    return ["All", ...Array.from(languages).sort()];
  }, [movies]);

  // Filter and sort movies based on state
  const filteredAndSortedMovies = useMemo(() => {
    let currentMovies = [...movies];

    // 1. Filter by Search Term
    if (searchTerm) {
      currentMovies = currentMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filter by Genre
    if (selectedGenre !== "All") {
      currentMovies = currentMovies.filter((movie) =>
        movie.genre.includes(selectedGenre)
      );
    }

    // 3. Filter by Language
    if (selectedLanguage !== "All") {
      currentMovies = currentMovies.filter((movie) =>
        movie.languages.includes(selectedLanguage)
      );
    }

    // 4. Filter by Booking Status
    if (bookingStatus === "Open") {
      currentMovies = currentMovies.filter((movie) => movie.bookingOpen);
    } else if (bookingStatus === "Closed") {
      currentMovies = currentMovies.filter((movie) => !movie.bookingOpen);
    }

    // 5. Sort
    currentMovies.sort((a, b) => {
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "title-desc") {
        return b.title.localeCompare(a.title);
      } else if (sortBy === "release-asc") {
        // Assuming 'releaseDate' field exists and is comparable (e.g., ISO string or timestamp)
        return new Date(a.releaseDate) - new Date(b.releaseDate);
      } else if (sortBy === "release-desc") {
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      }
      return 0;
    });

    return currentMovies;
  }, [
    movies,
    searchTerm,
    selectedGenre,
    selectedLanguage,
    bookingStatus,
    sortBy,
  ]);

  const handleDeleteMovie = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#D22B2B",
      cancelButtonColor: "#6B7280", // DaisyUI gray-500 equivalent
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.delete(`/movie/delete-movie/${id}`);
          if (res.status === 200) {
            Swal.fire({
              title: "Deleted!",
              text: "The movie has been deleted.",
              icon: "success",
            });
            fetchMovies(); // Re-fetch movies to update the list
          }
        } catch (error) {
          console.error("Error deleting movie:", error);
          Swal.fire({
            title: "Error!",
            text: "There was an error deleting the movie.",
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <div className="relative p-4 sm:p-6 bg-gray-800 rounded-lg min-h-screen">
      {/* Header */}
      <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black ring-2 ring-gray-700 rounded-xl p-4 mb-6 flex items-center justify-between shadow-lg">
        <h1 className="poppins-bold text-2xl sm:text-3xl text-white flex items-center gap-3">
          <PiFilmReelBold size={32} /> Movie Panel
        </h1>
        <Link
          to="/admin/save-movie"
          className="btn btn-primary btn-sm sm:btn-md bg-teal-600 hover:bg-teal-700 border-none text-white flex items-center gap-2"
        >
          <IoIosAddCircleOutline size={24} />
          <span className="hidden sm:inline">Add New Movie</span>
          <span className="sm:hidden">Add Movie</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All Movies Section */}
        <div className="lg:col-span-2 bg-gray-900 rounded-lg shadow-xl p-4">
          <h2 className="text-center text-xl sm:text-2xl poppins-semibold text-white mb-4">
            All Movies
          </h2>

          {/* Filters and Sort Controls */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6 p-4 bg-gray-800 rounded-lg shadow-inner">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by title..."
              className="input input-bordered w-full sm:flex-1 bg-gray-700 text-white border-gray-600 focus:border-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Genre Filter */}
            <select
              className="select select-bordered w-full sm:flex-1 bg-gray-700 text-white border-gray-600 focus:border-teal-500"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {allGenres.map((genre) => (
                <option key={genre} value={genre}>
                  Genre: {genre}
                </option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              className="select select-bordered w-full sm:flex-1 bg-gray-700 text-white border-gray-600 focus:border-teal-500"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {allLanguages.map((language) => (
                <option key={language} value={language}>
                  Language: {language}
                </option>
              ))}
            </select>

            {/* Booking Status Filter */}
            <select
              className="select select-bordered w-full sm:flex-1 bg-gray-700 text-white border-gray-600 focus:border-teal-500"
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value)}
            >
              <option value="All">Booking Status: All</option>
              <option value="Open">Booking Status: Open</option>
              <option value="Closed">Booking Status: Closed</option>
            </select>

            {/* Sort By */}
            <select
              className="select select-bordered w-full sm:flex-1 bg-gray-700 text-white border-gray-600 focus:border-teal-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="title-asc">Sort by: Title (A-Z)</option>
              <option value="title-desc">Sort by: Title (Z-A)</option>
              {/* Assuming 'releaseDate' field exists for sorting */}
              <option value="release-asc">Sort by: Release Date (Oldest)</option>
              <option value="release-desc">Sort by: Release Date (Newest)</option>
            </select>
          </div>

          {/* Movie List Table */}
          <div className="overflow-x-auto rounded-lg shadow-md">
            {loading ? (
              <div className="text-center text-white py-8">
                <span className="loading loading-spinner loading-lg"></span>
                <p>Loading movies...</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                <p>{error}</p>
              </div>
            ) : (
              <table className="table table-zebra w-full text-center">
                {/* head */}
                <thead className="bg-gray-700">
                  <tr className="text-white roboto-semibold text-base sm:text-lg">
                    <th>Movie</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Languages</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody className="text-white poppins-semibold">
                  {filteredAndSortedMovies.length > 0 ? (
                    filteredAndSortedMovies.map((movie) => (
                      <tr key={movie.id} className="hover:bg-gray-800">
                        <th
                          className={`relative w-24 ${
                            movie.bookingOpen
                              ? `tooltip tooltip-right tooltip-success`
                              : ``
                          }`}
                          data-tip={movie.bookingOpen ? "Booking Open" : ""}
                        >
                          <img
                            src={
                              movie.poster ||
                              `https://m.media-amazon.com/images/I/3120m+SwqYL._AC_UF1000,1000_QL80_.jpg`
                            }
                            alt={movie.title}
                            className="w-16 h-20 object-cover bg-cover rounded-md mx-auto"
                          />
                          {movie.bookingOpen && (
                            <IoTicketOutline
                              size={24}
                              className="absolute right-2 top-1 bg-green-500/80 text-white rounded-full p-0.5"
                            />
                          )}
                        </th>
                        <td>
                          <Link
                            to={`/movie-details/${movie.id}`}
                            className="text-teal-400 hover:text-teal-300 transition-colors duration-200"
                          >
                            {movie.title}
                          </Link>
                        </td>
                        <td>{movie.genre.join(", ")}</td>
                        <td>{movie.languages.join(", ")}</td>
                        <td>
                          <button
                            onClick={() =>
                              navigate(`/admin/Edit-Movie`, {
                                state: { selectedMovie: movie },
                              })
                            }
                            className="btn btn-ghost btn-circle text-teal-500 hover:bg-teal-600/70 hover:text-white transition-colors duration-200"
                          >
                            <MdMovieEdit size={24} />
                          </button>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteMovie(movie.id)}
                            className="btn btn-ghost btn-circle text-red-400 hover:bg-red-500/70 hover:text-white transition-colors duration-200"
                          >
                            <MdOutlineDelete size={24} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-400 py-6">
                        No movies found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add New Movie Card - Placed after the main list for better flow on small screens */}
         <div className="lg:col-span-1 flex justify-center items-start lg:mt-0 mt-6">
          <Link to={`/admin/save-movie`} className="w-full max-w-xs sm:max-w-md lg:max-w-none">
            <div className="card bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-dashed border-gray-700 cursor-pointer shadow-lg text-gray-200 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 ease-in-out h-64 flex flex-col justify-center items-center p-4 rounded-lg">
              <figure className="mb-4">
                <IoIosAddCircleOutline className="h-24 w-24 text-teal-400" />
              </figure>
              <div className="text-center">
                <h2 className="card-title roboto-semibold text-xl sm:text-2xl">
                  Add New Movie
                </h2>
              </div>
            </div>
          </Link>
        </div> 
      </div>
    </div>
  );
};

export default AdminMovieDashboard;
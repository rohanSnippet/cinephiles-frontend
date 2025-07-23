import React, { useEffect, useState } from "react";
import UserNavHeader from "../MovieBooking/UserNavHeader";
import useAxiosSecure from "../Hooks/AxiosSecure";
import MovieCard from "./MovieCard";
import { BsSortAlphaDown } from "react-icons/bs";
import { BsSortAlphaUpAlt } from "react-icons/bs";
import { Link, redirect } from "react-router-dom";

const AllMovies = () => {
  const axiosSecure = useAxiosSecure();
  const [movies, setMovies] = useState([]);
  const [fsMovies, setFsMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(`All`);
  const [selectedSort, setSelectedSort] = useState(`earliest`);


  // Fetch movies from the backend
  const fetchMovies = async () => {
    try {
      const res = await axiosSecure.get(`/movie/upcoming-movies`);
      setMovies(res.data); // Store fetched movies in the state
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [axiosSecure]);

  function sortMovies(key) {
    setSelectedSort(key);
    let sortedMovies = [];
    switch (key) {
      case "earliest":
        sortedMovies = [...fsMovies].sort((m1, m2) =>
          m1.releaseDate.localeCompare(m2.releaseDate)
        );
        break;

      case "latest":
        sortedMovies = [...fsMovies].sort((m1, m2) =>
          m2.releaseDate.localeCompare(m1.releaseDate)
        );
        break;

      case "a-z":
        sortedMovies = [...fsMovies].sort((m1, m2) =>
          m1.title.localeCompare(m2.title)
        );
        break;

      case "z-a":
        sortedMovies = [...fsMovies].sort((m1, m2) =>
          m2.title.localeCompare(m1.title)
        );
        break;
      // Filteration

      default:
        sortedMovies = [...fsMovies].filter((movie) =>
          movie.genre.includes(key)
        );
        break;
    }

    setFsMovies(sortedMovies);
  }

  function filterMovies(val) {
    if (val === "All") {
      setSelectedGenre(val);
      setFsMovies(movies);
    } else {
      setSelectedGenre(val);
      const filteredMovies = movies.filter((movie) =>
        movie.genre.includes(val)
      );

      setFsMovies(filteredMovies);
    }
  }

  useEffect(() => {
    if (movies.length > 0) {
      const sortedMovies = [...movies].sort((m1, m2) =>
        m1.releaseDate.localeCompare(m2.releaseDate)
      );
      setFsMovies(sortedMovies);
    }
  }, [movies]); // Runs whenever 'movies' state is updated

  return (
    <div className="max-w-full h-screen mx-5 ">
      <UserNavHeader navLocation="/" item={null} />
      <div className="flex w-full gap-x-2 text-white min-h-screen">
        <div className="w-1/3 bg-gradient-to-br from-slate-900/90 to-black rounded-xl">
          <div className="w-[98%] h-[98%] my-auto mx-auto bg-gradient-to-br from-white/10 to-slate-100/10 rounded-xl">
            Trending movies
          </div>
        </div>
        <div className="w-2/3 space-y-2">
          <div className="bg-gradient-to-br from-slate-900/90 to-black/60 rounded-lg ">
            {/* segregation */}
            <div className="sticky top-0 z-10 pb-2 rounded-lg flex gap-x-6 px-2">
              {/* Search */}
              <div className="flex grow text-2xl poppins-semibold justify-center roboto-light mt-3">
                UPCOMMING MOVIES
              </div>
              {/* Sorting */}
              <div className="space-x-2 ring-1 mt-2 p-2 ring-white/10 shadow-md shadow-white/10 text-md poppins-light bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-3xl">
                <label>
                  <input
                    type="radio"
                    name="sorting"
                    value="earliest"
                    checked={selectedSort === "earliest"}
                    onChange={(e) => sortMovies(e.target.value)}
                  />
                  <span className="radio-button rounded-2xl ">By Date</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="sorting"
                    value="latest"
                    checked={selectedSort === "latest"}
                    onChange={(e) => sortMovies(e.target.value)}
                  />
                  <span className="radio-button rounded-2xl">New</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="sorting"
                    value="a-z"
                    checked={selectedSort === "a-z"}
                    onChange={(e) => sortMovies(e.target.value)}
                  />
                  <span className="radio-button rounded-2xl align-middle">
                    {" "}
                    <BsSortAlphaDown size={20} />
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="sorting"
                    value="z-a"
                    checked={selectedSort === "z-a"}
                    onChange={(e) => sortMovies(e.target.value)}
                  />
                  <span className="radio-button rounded-2xl align-middle">
                    {" "}
                    <BsSortAlphaUpAlt size={20} />
                  </span>
                </label>
              </div>
              {/* Filter */}
              <div className=" space-x-2 ring-1 mt-2 p-2 ring-white/10 shadow-md shadow-white/10 text-md poppins-light bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-3xl">
                <label>
                  <input
                    type="radio"
                    name="option"
                    value="All"
                    checked={selectedGenre === "All"}
                    onChange={(e) => filterMovies(e.target.value)}
                  />
                  <span className="radio-button rounded-2xl">All</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="option"
                    value="Action"
                    checked={selectedGenre === "Action"}
                    onChange={(e) => filterMovies(e.target.value)}
                  />
                  <span className="radio-button rounded-2xl">Action</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="option"
                    value="Comedy"
                    checked={selectedGenre === "Comedy"}
                    onChange={(e) => filterMovies(e.target.value)}
                  />
                  <span className="radio-button rounded-2xl">Comedy</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="option"
                    value="Horror"
                    checked={selectedGenre === "Horror"}
                    onChange={(e) => filterMovies(e.target.value)}
                  />
                  <span className="radio-button rounded-2xl">Horror</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="option"
                    value="Thriller"
                    checked={selectedGenre === "Thriller"}
                    onChange={(e) => filterMovies(e.target.value)}
                  />
                  <span className="radio-button rounded-2xl">Thriller</span>
                </label>
              </div>
            </div>
            <div className=" bg-gradient-to-br from-slate-900/90 to-black/60 rounded-lg flex pl-16 flex-wrap pt-4">
              {fsMovies.length > 0
                ? fsMovies.map((movie, i) => {
                    return <MovieCard item={movie} key={i} />;
                  })
                : ""}
            </div>
          </div>
        </div>
      </div>
      {/* Tp */}
     <Link to="/pop2" state={{from: "/All-Movies"}}>Navigate </Link>
    </div>
  );
};

export default AllMovies;

import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import useCity from "../Hooks/useCity";
import regions from "../../assets/regions.json";
import regions2 from "../../assets/regions2.json";
import UserNavHeader from "./UserNavHeader";
import { motion, AnimatePresence } from "framer-motion";

const AllShows = () => {
  const location = useLocation();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [dates, setDates] = useState([]);
  const [datesStr, setDatesStr] = useState([]);
  const [selectedDate, setSelectedDate] = useState();
  const [shows, setShows] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [cities, setCities] = useState([]);

  const [isSLoading, setIsSLoading] = useState(false);
  const [isTLoading, setIsTLoading] = useState(false);
  const [isDLoading, setIsDLoading] = useState(false);

  const [uniqueShowDates, setUniqueShowDates] = useState([]);
  const { item } = location?.state || {};
  const [movie, setMovie] = useState(() => item || null);
  const city = useCity();
  const today = new Date();

  function convertToDateString(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    if (!item) {
      const bookingData = sessionStorage.getItem("bookingData");
      if (bookingData) {
        try {
          const parsed = JSON.parse(bookingData);
          if (parsed?.movie) setMovie(parsed.movie);
        } catch (error) {
          console.error("Failed to parse bookingData from sessionStorage", error);
        }
      }
    }
  }, [item]);

  const fetchAllShows = useCallback(async () => {
    try {
      setIsSLoading(true);
      const cityQuery = cities.join(",");
      const res = await axiosSecure.get(
        `/show/by-city?movieId=${movie?.id}&cities=${cityQuery}`
      );
      if (res.data) setShows(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSLoading(false);
    }
  }, [axiosSecure, cities, movie?.id]);

  const filterTheatres = (data) => {
    const movieId = movie?.id || item?.id;
    const theatresWithMovieShows = data.filter((theatre) =>
      theatre.shows.some((show) => show.mid === movieId)
    );
    return theatresWithMovieShows.filter((theatre) =>
      theatre.shows.some((show) => show.showDate === selectedDate)
    );
  };

  const fetchAllTheatres = useCallback(async () => {
    try {
      setIsTLoading(true);
      const cityQuery = cities.join(",");
      const res = await axiosSecure.get(
        `/theatre/get-theatres/by-location?cities=${cityQuery}`
      );
      if (res.data) setTheatres(filterTheatres(res.data));
    } catch (error) {
      console.error(error);
    } finally {
      setIsTLoading(false);
    }
  }, [axiosSecure, cities, movie?.id, selectedDate]);

  const fetchCities = useCallback(() => {
    const foundCities =
      regions.find((r) => r.region === city)?.cities ||
      regions2.find((r) => r.region === city)?.cities;
    setCities(foundCities || [city]);
  }, [city]);

  useEffect(() => {
    fetchCities();
  }, [city, fetchCities]);

  useEffect(() => {
    if (movie && cities.length > 0) {
      fetchAllShows();
      fetchAllTheatres();
    }
  }, [fetchAllShows, cities, fetchAllTheatres, movie?.id, item?.id]);

  useEffect(() => {
    const getDates = () => {
      let dateArr = [];
      let dateSt = [];
      for (let i = 0; i <= 6; i++) {
        let nextDate = new Date();
        nextDate.setDate(today.getDate() + i);
        dateArr.push(nextDate);
        dateSt.push(nextDate.toDateString());
      }
      setDates(dateArr);
      setDatesStr(dateSt);
    };
    getDates();
  }, []);

  useEffect(() => {
    if (shows.length > 0) {
      const newUniqueShowDates = [
        ...new Set(
          shows
            .map((show) => new Date(show.showDate))
            .filter((date) => date >= today)
            .map((date) => convertToDateString(date))
        ),
      ];
      setUniqueShowDates(newUniqueShowDates);
      if (!selectedDate) {
        setSelectedDate(newUniqueShowDates[0] || null);
      }
    }
  }, [shows, selectedDate]);

  const handleBookSeats = (selectedShow) => {
    const username = localStorage.getItem("username");
    const payload = {
      state: {
        selectedShow: selectedShow,
        theatre: theatres.filter((theatre) => theatre.id === selectedShow.tid),
        movie: item,
        selectedDate: selectedDate,
      },
    };

    if (!username) {
      navigate("/login", { ...payload, state: { ...payload.state, path: location.pathname, nextPath: "/bookSeats" }});
    } else {
      navigate("/bookSeats", payload);
    }
  };

  if (!item && !movie) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-slate-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-poppins pb-12">
      <UserNavHeader navLocation={`/movie-details`} item={movie || item} />

      {/* HEADER & DATE SELECTOR */}
      <div className="w-full max-w-7xl mx-auto px-4 mt-4 md:mt-6">
        <div className="flex flex-col items-center mb-6 md:mb-8">

          {/* Title */}
          <h2 className="poppins-bold text-2xl md:text-4xl tracking-widest uppercase mb-4 md:mb-5 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500 drop-shadow-lg text-center">
            {movie?.title || item?.title}
          </h2>

          {/* Date Selector */}
          {isDLoading ? (
            <div className="flex gap-2 md:gap-3 justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-14 h-16 md:w-16 md:h-[72px] rounded-xl bg-slate-800/50 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
              {datesStr
                .filter((date) => uniqueShowDates.includes(convertToDateString(date)))
                .map((date, i) => {
                  const dateStr = convertToDateString(date);
                  const isSelected = selectedDate === dateStr;

                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex flex-col items-center justify-center w-14 h-16 md:w-16 md:h-[72px] rounded-xl border transition-all duration-300 backdrop-blur-md
                        ${isSelected
                          ? 'bg-slate-200 text-slate-900 border-slate-300 shadow-[0_0_15px_rgba(226,232,240,0.15)]'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/80 hover:border-slate-500 hover:text-slate-200'
                        }`}
                    >
                      <span className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-80">
                        {date.substring(4, 7)}
                      </span>
                      <span className="text-lg md:text-xl poppins-bold mt-0.5">
                        {date.substring(8, 10)}
                      </span>
                    </motion.button>
                  );
                })}
            </div>
          )}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* THEATRES LIST */}
          <div className="w-full lg:w-3/4">
            {!isTLoading && !isSLoading ? (
              theatres.length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                  {theatres.map((theatre, i) => {
                    const showsOnThisDay = shows.filter(
                      (show) => show.showDate === selectedDate && show.tid === theatre.id
                    );

                    if (showsOnThisDay.length === 0) return null;

                    return (
                      <motion.div
                        key={theatre.id}
                        variants={cardVariants}
                        className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-7 backdrop-blur-md mb-6 relative overflow-hidden group shadow-lg"
                      >
                        {/* Subtle glass glow effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-5 gap-4">
                          <div>
                            <h2 className="text-xl md:text-2xl font-bold poppins-medium tracking-wide text-slate-100">
                              {theatre.name}
                            </h2>
                            <p className="text-slate-400 poppins-light text-sm mt-1 flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {theatre.address}, {theatre.city}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs poppins-light text-slate-400 border border-slate-700 px-3 py-1.5 rounded-full w-fit bg-slate-800/50">
                            <span className="w-2 h-2 rounded-full bg-emerald-500/70"></span>
                            M-Ticket Available
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 md:gap-4">
                          {showsOnThisDay.map((show, idx) => {
                            const isFastFilling = show.status === "FAST_FILLING";
                            const isAvailable = show.status === "AVAILABLE";

                            // Extract cheapest tier for quick display
                            const priceArr = Object.values(show.price);
                            const minPrice = priceArr.length > 0 ? Math.min(...priceArr) : 0;

                            return (
                              <motion.button
                                key={idx}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleBookSeats(show)}
                                className={`flex flex-col items-center justify-center min-w-[100px] p-3 rounded-xl border transition-colors relative overflow-hidden
                                  ${isFastFilling
                                    ? 'border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/50'
                                    : 'border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-slate-500'
                                  }`}
                                title={Object.entries(show.price).map(([t, a]) => `${t}: ₹${a}`).join(" | ")}
                              >
                                <span className="poppins-medium text-lg tracking-wider text-slate-200">
                                  {show.start}
                                </span>
                                <span className="text-[10px] tracking-widest uppercase text-slate-400 mt-1">
                                  {show.format}
                                </span>

                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] text-slate-300">₹{minPrice}</span>
                                  <span className={`text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded font-medium
                                    ${isFastFilling ? 'bg-orange-500/20 text-orange-400' :
                                      isAvailable ? 'bg-emerald-500/20 text-emerald-400' :
                                      'bg-slate-700 text-slate-400'}`}>
                                    {show.status.replace("_", " ")}
                                  </span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-20 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
                  <span className="text-4xl mb-4 opacity-50 grayscale">🍿</span>
                  <p className="poppins-medium text-xl text-slate-300">No shows available for this date.</p>
                  <p className="text-sm text-slate-500 mt-2">Try selecting a different date from above.</p>
                </div>
              )
            ) : (
              // LOADING SKELETON
              <div className="flex flex-col gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-7">
                    <div className="w-1/3 h-6 bg-slate-800 rounded animate-pulse mb-3"></div>
                    <div className="w-1/4 h-4 bg-slate-800/50 rounded animate-pulse mb-6"></div>
                    <div className="flex gap-4">
                      <div className="w-24 h-16 bg-slate-800 rounded-xl animate-pulse"></div>
                      <div className="w-24 h-16 bg-slate-800 rounded-xl animate-pulse"></div>
                      <div className="w-24 h-16 bg-slate-800 rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FILTERS SIDEBAR */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md sticky top-24 shadow-lg">
              <h3 className="poppins-bold text-lg tracking-widest uppercase mb-6 text-slate-300 border-b border-slate-800 pb-4">
                Filters
              </h3>

              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-3 poppins-medium uppercase tracking-wider">Format</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">2D</span>
                  <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">3D</span>
                  <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">IMAX</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-3 poppins-medium uppercase tracking-wider">Price Range</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">₹0 - ₹200</span>
                  <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">₹201 - ₹400</span>
                  <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">₹400+</span>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-sm text-slate-400 mb-3 poppins-medium uppercase tracking-wider">Showtimes</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">Morning</span>
                  <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">Afternoon</span>
                  <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">Evening</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AllShows;
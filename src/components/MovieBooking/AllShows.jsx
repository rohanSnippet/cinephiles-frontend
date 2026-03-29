import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import useCity from "../Hooks/useCity";
import { getApiCities } from "../Services/Locations";
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

  const fetchCities = useCallback(() => {
    if (!city) return;
    const mappedCities = getApiCities(city);
    setCities(mappedCities.length > 0 ? mappedCities : [city]);
  }, [city]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

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

  const filterTheatres = (data) => {
    const movieId = movie?.id || item?.id;
    const theatresWithMovieShows = data.filter((theatre) =>
      theatre.shows.some((show) => show.mid === movieId)
    );
    return theatresWithMovieShows.filter((theatre) =>
      theatre.shows.some((show) => show.showDate === selectedDate)
    );
  };

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
        theatre: theatres.find((theatre) => theatre.id === selectedShow.tid) ? [theatres.find((theatre) => theatre.id === selectedShow.tid)] : [],
        movie: item || movie,
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

      <div className="w-full max-w-7xl mx-auto px-4 mt-4 md:mt-6">
        <div className="flex flex-col mb-4 md:mb-6">

          {/* Title */}
          <h2 className="poppins-bold text-2xl md:text-4xl tracking-widest uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500 drop-shadow-lg text-center">
            {movie?.title || item?.title}
          </h2>

          {/* STICKY DATE SLIDER */}
          <div className="sticky top-[60px] md:top-[72px] z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/60 pb-3 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-4 transition-all shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
            {isDLoading ? (
              <div className="flex gap-2 md:gap-3 overflow-x-auto px-2 sm:justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="min-w-[60px] h-16 md:min-w-[64px] md:h-[72px] rounded-xl bg-slate-800/50 animate-pulse shrink-0"></div>
                ))}
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-2 md:gap-3 snap-x px-2 pb-1 sm:justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                        className={`flex flex-col items-center justify-center shrink-0 snap-center min-w-[60px] h-16 md:min-w-[64px] md:h-[72px] rounded-xl border transition-all duration-300 backdrop-blur-md
                          ${isSelected
                            ? 'bg-slate-200 text-slate-900 border-slate-300 shadow-[0_0_15px_rgba(226,232,240,0.15)]'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/80 hover:border-slate-500 hover:text-slate-200'
                          }`}
                      >
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-80">
                          {date.substring(4, 7)}
                        </span>
                        <span className="text-base md:text-xl poppins-bold mt-0.5">
                          {date.substring(8, 10)}
                        </span>
                      </motion.button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

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
                        className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 backdrop-blur-md mb-5 relative overflow-hidden group shadow-lg"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-3">
                          <div className="pr-2">
                            <h2 className="text-lg md:text-xl font-bold poppins-medium tracking-wide text-slate-100 line-clamp-1">
                              {theatre.name}
                            </h2>
                            <p className="text-slate-400 poppins-light text-xs mt-1 flex items-center gap-1.5 line-clamp-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {theatre.address}, {theatre.city}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] md:text-xs poppins-light text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full w-fit bg-slate-800/50 shrink-0">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500/70"></span>
                            M-Ticket
                          </div>
                        </div>

                        {/* RESPONSIVE GRID: 3 on Mobile, 4 on MD, 8 on LG */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
                          {showsOnThisDay.map((show, idx) => {
                            const isFastFilling = show.status === "FAST_FILLING";
                            const isAvailable = show.status === "AVAILABLE";

                            const priceArr = Object.values(show.price);
                            const minPrice = priceArr.length > 0 ? Math.min(...priceArr) : 0;

                            return (
                              <motion.button
                                key={idx}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleBookSeats(show)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-colors relative overflow-hidden w-full
                                  ${isFastFilling
                                    ? 'border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 hover:border-orange-500/50'
                                    : 'border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-slate-500'
                                  }`}
                                title={Object.entries(show.price).map(([t, a]) => `${t}: ₹${a}`).join(" | ")}
                              >
                                <span className="poppins-medium text-sm md:text-base tracking-wider text-slate-200">
                                  {show.start}
                                </span>
                                <span className="text-[9px] tracking-widest uppercase text-slate-400 mt-0.5">
                                  {show.format}
                                </span>

                                <div className="flex items-center justify-center gap-1.5 mt-1.5 w-full">
                                  <span className="text-[10px] text-slate-300 hidden sm:block">₹{minPrice}</span>
                                  <span className={`text-[7px] md:text-[8px] tracking-widest uppercase px-1 py-0.5 rounded font-medium truncate max-w-full
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
                <div className="w-full flex flex-col items-center justify-center py-16 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
                  <span className="text-3xl mb-3 opacity-50 grayscale">🍿</span>
                  <p className="poppins-medium text-lg text-slate-300">No shows available for this date.</p>
                  <p className="text-xs text-slate-500 mt-1">Try selecting a different date from above.</p>
                </div>
              )
            ) : (
              // LOADING SKELETON
              <div className="flex flex-col gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                    <div className="w-1/3 h-5 bg-slate-800 rounded animate-pulse mb-3"></div>
                    <div className="w-1/4 h-3 bg-slate-800/50 rounded animate-pulse mb-5"></div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                      <div className="w-full h-14 bg-slate-800 rounded-xl animate-pulse"></div>
                      <div className="w-full h-14 bg-slate-800 rounded-xl animate-pulse"></div>
                      <div className="w-full h-14 bg-slate-800 rounded-xl animate-pulse"></div>
                      <div className="w-full h-14 bg-slate-800 rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FILTERS SIDEBAR */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md sticky top-24 shadow-lg">
              <h3 className="poppins-bold text-sm tracking-widest uppercase mb-5 text-slate-300 border-b border-slate-800 pb-3">
                Filters
              </h3>

              <div className="mb-5">
                <p className="text-xs text-slate-400 mb-2.5 poppins-medium uppercase tracking-wider">Format</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">2D</span>
                  <span className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">3D</span>
                  <span className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">IMAX</span>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs text-slate-400 mb-2.5 poppins-medium uppercase tracking-wider">Price Range</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">₹0 - ₹200</span>
                  <span className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">₹201 - ₹400</span>
                  <span className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">₹400+</span>
                </div>
              </div>

              <div className="mb-2">
                <p className="text-xs text-slate-400 mb-2.5 poppins-medium uppercase tracking-wider">Showtimes</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">Morning</span>
                  <span className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">Afternoon</span>
                  <span className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/50 text-xs text-slate-300 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors">Evening</span>
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
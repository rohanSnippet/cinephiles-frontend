import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import useCity from "../Hooks/useCity";
import regions from "../../assets/regions.json";
import regions2 from "../../assets/regions2.json";
import UserNavHeader from "./UserNavHeader";

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
  const [parseInfo, setParseInfo] = useState();
  const { item } = location?.state || {};
  const[movie, setMovie] = useState(() => item || null);
  const city = useCity();
  const today = new Date(); // Get today's date

  function convertToDateString(dateStr) {
    const date = new Date(dateStr);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

useEffect(() => {
  if (!item) {
    const bookingData = sessionStorage.getItem("bookingData");
    if (bookingData) {
      try {
        const parsed = JSON.parse(bookingData);
        if (parsed?.movie) {
          setMovie(parsed.movie);
        } else {
          console.warn("Parsed bookingData has no movie");
        }
      } catch (error) {
        console.error("Failed to parse bookingData from sessionStorage", error);
      }
    } else {
      console.warn("No bookingData found in sessionStorage");
    }
  }
}, []);


  const fetchAllShows = useCallback(async () => {
    try {
      setIsSLoading(true);
      const cityQuery = cities.join(",");
      const res = await axiosSecure.get(
        `/show/by-city?movieId=${movie?.id}&cities=${cityQuery}`
      );
      if (res.data) {
        setShows(res.data);
      }
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

      if (res.data) {
        setTheatres(filterTheatres(res.data));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTLoading(false);
    }
  }, [axiosSecure, cities, movie?.id, selectedDate]);

  const filterTheatres = (data) => {
   // console.log(data);
    const movieId = movie?.id || item?.id;
    const theatresWithMovieShows = data.filter((theatre) =>
      theatre.shows.some((show) => show.mid === movieId)
    );
    return theatresWithMovieShows.filter((theatre) =>
      theatre.shows.some((show) => show.showDate === selectedDate)
    );
  };

  const fetchCities = useCallback(() => {
    const foundCities =
      regions.find((r) => r.region === city)?.cities ||
      regions2.find((r) => r.region === city)?.cities;

    setCities(foundCities || [city]);
  }, [city]);

  useEffect(() => {
    
    fetchCities();
  }, [city]);

  useEffect(() => {
    if (movie && cities.length > 0) {
      fetchAllShows();
      fetchAllTheatres();
    }
  }, [fetchAllShows, cities, fetchAllTheatres, movie?.id || item?.id]);

  useEffect(() => {
    const getDates = () => {
      const today = new Date();
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
      //setSelectedDate(dateArr[0].toISOString().split("T")[0]);
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

      // Only set selectedDate if it hasn't been set yet
      if (!selectedDate) {
        setSelectedDate(newUniqueShowDates[0] || null);
      }
    }
  }, [shows, selectedDate]);

  const handleBookSeats = (selectedShow) => {
    const username = localStorage.getItem("username");
    if (!username) {
      navigate("/login", {
        state: {
          path: location.pathname,
          nextPath: "/bookSeats",
          selectedShow: selectedShow,
          theatre: theatres.filter((theatre) => theatre.id == selectedShow.tid),
          movie: item,
          selectedDate: selectedDate,
        },
      });
    } else {
      navigate("/bookSeats", {
        state: {
          selectedShow: selectedShow,
          theatre: theatres.filter((theatre) => theatre.id == selectedShow.tid),
          movie: item,
          selectedDate: selectedDate,
        },
      });
    }
  };
  
  if (!item && !movie) {
    return (
      <div className="h-full w-full mt-2">
        <div className="">
          {" "}
          <div className="bg-gradient-to-br from-black via-gray-900 to-black  rounded-xl mx-2">
            {" "}
            <div className="skeleton h-24 w-16"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full w-full mt-2">
      <UserNavHeader navLocation={`/movie-details`} item={movie || item} />
      <div className="">
        {" "}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black  rounded-xl mx-2">
          <h2 className="poppins-bold text-2xl text-white  text-center">
            {movie?.title?.toUpperCase() || item?.title?.toUpperCase()}
          </h2>

          {isDLoading ? (
            <div className="flex gap-x-4 justify-center py-6">
              {uniqueShowDates.map((d) => (
                <div key={d} className="skeleton h-24 w-16"></div>
              ))}
            </div>
          ) : (
            <div className="flex gap-x-4 justify-center py-6">
              {datesStr
                .filter((date) =>
                  uniqueShowDates.includes(convertToDateString(date))
                )
                .map((date, i) => {
                  return (
                    <div
                      key={i}
                      className={`border-2 border-slate-400 rounded-lg px-3 w-16 hover:bg-red-400 hover:bg-opacity-40 text-white ${
                        selectedDate === convertToDateString(date)
                          ? `ring-1 ring-offset-2 ring-offset-red-600 ring-red-700 bg-red-500 bg-opacity-35 ring-opacity-35`
                          : `ring-0`
                      }`}
                    >
                      <button
                        className="text-white"
                        onClick={() => {
                          setSelectedDate(convertToDateString(date));
                        }}
                      >
                        <p className="text-center roboto-regular text-blue-100">
                          {date.substring(0, 4)}{" "}
                        </p>
                        <h3 className="text-center poppins-regular">
                          {" "}
                          <p className="poppins-bold text-center">
                            {date.substring(8, 10)}
                          </p>
                          {date.substring(4, 7)}
                        </h3>
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
      <div className="bg-slate-900 mx-4 text-white gap-x-4 rounded-xl mt-4 flex p-4">
        <div className="w-3/4 text-center bg-gradient-to-br from-black via-gray-900 to-black rounded-md">
          {!isTLoading || !isSLoading ? (
            theatres.length > 0 ? (
              theatres.map((theatre, i) => {
                const showsOnThisDay = shows.filter(
                  (show) =>
                    show.showDate == selectedDate && show.tid === theatre.id
                );
                return (
                  showsOnThisDay.length > 0 && (
                    <div key={i} className="py-3 mb-4 mx-20">
                      <div className="flex relative">
                        <h2 className=" text-xl text-start font-bold roboto-regular pl-4">
                          {theatre.name}{" "}
                          <span className="text-gray-300 poppins-light text-start text-[15px] ml-2">
                            {theatre.address}, {theatre.city}
                          </span>
                        </h2>
                        <p className="absolute text-[13px] text-white right-4 mt-2 poppins-light">
                          Cancellable
                        </p>
                      </div>

                      <div className="flex mx-4  justify-start flex-wrap gap-3 py-3 my-1 ">
                        {shows
                          .filter(
                            (show) =>
                              show.showDate === selectedDate &&
                              show.tid === theatre.id
                          )
                          .map((show, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleBookSeats(show)}
                              className={`tooltip tooltip-top ${
                                show.status == "FAST_FILLING"
                                  ? `tooltip-error`
                                  : `tooltip-success`
                              }  text-center w-1/5 rounded-md py-1 poppins-light show-${
                                show.status
                              }`}
                              data-tip={Object.entries(show.price)
                                .map(
                                  ([tierName, amt]) => `${tierName} ₹ ${amt} `
                                )
                                .join("   /   ")}
                            >
                              {show.start}
                              <span className="text-[14px] ml-2 text-gray-400/80">
                                {show.format}
                              </span>
                              <span
                                className={`text-[10px] ${
                                  show.status == "FAST_FILLING"
                                    ? `text-orange-400`
                                    : show.status == "AVAILABLE"
                                    ? `text-green-400`
                                    : `text-gray-400`
                                }`}
                              >
                                {" "}
                                {show.status == "FAST_FILLING"
                                  ? `FAST FILLING`
                                  : show.status}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )
                );
              })
            ) : (
              <div className="text-center roboto-bold text-3xl">
                {/* <img src={noMovie} alt="" className="w-[250px] m-auto " /> */}
                {/* NO SHOWS AVAILABLE FOR THIS MOVIE */}
                <div className="skeleton h-32 w-full"></div>
              </div>
            )
          ) : (
            <div className=" py-4  pl-20 ">
              <div className="flex gap-x-3 mb-4">
                {" "}
                <div className="skeleton h-4 w-72"></div>{" "}
                <div className="skeleton h-4 w-32  ml-[62vh]"></div>{" "}
              </div>
              <div className="flex gap-5">
                {" "}
                <div className="skeleton h-10 w-40 rounded-none"></div>
                <div className="skeleton h-10 w-40 rounded-none"></div>
                <div className="skeleton h-10 w-40 rounded-none"></div>
                <div className="skeleton h-10 w-40 rounded-none"></div>
                <div className="skeleton h-10 w-40 rounded-none"></div>
              </div>
            </div>
          )}
        </div>

        <div className="w-1/4 bg-gradient-to-br from-stone/10 via-stone/30 to-stone/20 rounded-md">
          <h2>FILTERS</h2>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default AllShows;

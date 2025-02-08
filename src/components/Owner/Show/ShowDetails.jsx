import React, { useCallback, useEffect, useState } from "react";
import { MdMovieEdit, MdOutlineDelete } from "react-icons/md";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import VideoEditorTimeline from "../VideoEditorTimeline";
import { FaChevronDown } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Schedule from "../Schedule";

const ShowDetails = () => {
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [datesStr, setDatesStr] = useState([]);
  const axiosSecure = useAxiosSecure();
  const [movies, setMovies] = useState([]);
  /*   const [shows, setShows] = useState([]);
  const [currShow, setCurrShow] = useState(); */
  const [screens, setScreens] = useState([]);
  const [currScreen, setCurrScreen] = useState();
  const [selectedDate, setSelectedDate] = useState();
  const [theatreData, setTheatreData] = useState([]);
  const [currTheatre, setCurrTheatre] = useState({});
  const [lastShow, setLastShow] = useState();
  const [currMovie, setCurrMovie] = useState();
  const [showStart, setShowStart] = useState();
  const [showEnd, setShowEnd] = useState();

  const [values, setValues] = useState({
    showDate: "",
    start: "",
    end: "",
    movieId: null,
    screenId: null,
    format: "",
    blocked: [],
    price: {},
    theatreId: null,
  });

  const fetchMovies = useCallback(async () => {
    try {
      const res = await axiosSecure.get(`/movie/all-movies`);
      setMovies(res.data.filter((movie) => movie.bookingOpen));
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  }, [axiosSecure]);

  const fetchTheatres = useCallback(async () => {
    const username = localStorage.getItem("username");
    const res = await axiosSecure.get(`/theatre/get-theatres/${username}`);
    setTheatreData(res.data);
  }, [axiosSecure]);

  const fetchLastShow = useCallback(async () => {
    if (!currScreen) return;
    try {
      const res = await axiosSecure.get(
        `/show/last-show?screenId=${currScreen.id}&showDate=${selectedDate}`
      );

      setLastShow(res.data);

      // console.log(res.data);
    } catch (error) {
      console.error("Error fetching screens:", error);
    }
  }, [axiosSecure, currScreen, selectedDate]);

  const fetchScreens = useCallback(async () => {
    if (!currTheatre) return;
    try {
      const res = await axiosSecure.get(
        `/screens/by-theatre/${currTheatre.id}`
      );
      setScreens(res.data);
    } catch (error) {
      console.error("Error fetching screens:", error);
    }
  }, [axiosSecure, currTheatre]);

  useEffect(() => {
    fetchTheatres();

    fetchMovies();
  }, [fetchTheatres, fetchMovies]);

  useEffect(() => {
    if (theatreData.length > 0) {
      setCurrTheatre(theatreData[0]);
    }
  }, [theatreData]);

  useEffect(() => {
    fetchScreens();

    handleButtonClick("theatreId", currTheatre.id);
  }, [currTheatre, fetchScreens]);

  useEffect(() => {
    fetchLastShow();
  }, [currScreen, fetchLastShow]);

  useEffect(() => {
    if (values.screenId != null) {
      handleButtonClick("theatreId", currTheatre.id);
    }
  }, [values.movieId]);

  function convertToDateString(dateStr) {
    const date = new Date(dateStr);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
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

      setSelectedDate(dateArr[0].toISOString().split("T")[0]);
    };

    getDates();
  }, [axiosSecure]);

  useEffect(() => {
    if (selectedDate) {
      handleButtonClick("showDate", selectedDate);
    }
  }, [selectedDate]);

  function addRuntimeToStartTime(startTime, runtime) {
    if (!startTime || !startTime.includes(":")) {
      console.error("Invalid startTime:", startTime);
      return "07:00";
    }

    const [startHours, startMinutes] = startTime.split(":").map(Number);

    let totalMinutes = startHours * 60 + startMinutes + runtime;

    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    const formattedHours = endHours.toString().padStart(2, "0");
    const formattedMinutes = endMinutes.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}`;
  }

  const handleButtonClick = (fieldName, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  const handleAddNewShow = async () => {
    let endTime = addRuntimeToStartTime(values.start, currMovie.runtime);
    const {
      value: formValues,
      isDenied,
      isConfirmed,
    } = await Swal.fire({
      title: `${currScreen.sname}`,
      imageUrl: `${currMovie.banner}`,
      imageWidth: 400,
      imageHeight: 200,
      background: "rgba(43, 43, 46, 0.845)",
      width: "750px",
      color: "#fff",
      html: `
            <div>
                <div class="flex flex-row gap-2 text-white bg-cover bg-center">
                    ${currScreen.tiers
                      .map(
                        (tier, i) => `
                            <label class="poppins-semibold">
                                ${tier.tiername}
                                <input id="swal-input${i}" type="number"
                                       class="swal2-input w-[12vh] h-[5vh] text-white" 
                                       placeholder="${tier.price}" />
                            </label>`
                      )
                      .join("")}
                </div>
                <label class="poppins-semibold mt-4 block text-white">
                    Show Start Time
                    <input id="swal-start-time" type="time" 
                           class="swal2-input w-[16vh] h-[5vh] text-white" 
                           value="${values.start}" />
                </label>
            </div>
        `,
      focusConfirm: false,
      confirmButtonColor: "#28a745",
      showCancelButton: true,
      showDenyButton: true,
      denyButtonText: `Go to ${currScreen.sname}`,
      preConfirm: () => {
        const prices = {};
        currScreen.tiers.forEach((tier, i) => {
          const inputValue = document.getElementById(`swal-input${i}`).value;
          prices[tier.tiername] = inputValue
            ? parseFloat(inputValue)
            : tier.price;
        });
        const startInput = document.getElementById("swal-start-time").value;
        return { prices, startInput };
      },
      preDeny: () => {
        const prices = {};
        currScreen.tiers.forEach((tier, i) => {
          const inputValue = document.getElementById(`swal-input${i}`).value;
          prices[tier.tiername] = inputValue
            ? parseFloat(inputValue)
            : tier.price;
        });
        const startInput = document.getElementById("swal-start-time").value;
        return { prices, startInput };
      },
    });

    if (formValues) {
      await new Promise((resolve) => {
        setValues((prevValues) => ({
          ...prevValues,
          price: formValues.prices,
          start: formValues.startInput,
        }));
        resolve();
      });

      if (isDenied) {
        console.log(values);
        navigate("/owner/ScreenLayoutForShow", {
          state: {
            values: formValues,
            end: endTime,
            showData: {
              ...values,
              start: formValues.startInput,
              price: formValues.prices,
            },
            screen: currScreen,
            movie: currMovie,
          },
        });
        return;
      }

      if (isConfirmed) {
        values.start = formValues.startInput;
        values.price = formValues.prices;
       console.log(showEnd);
       
        try {
          const res = await axiosSecure.post(`/show/create`, values);
          if (res) {
            Swal.fire({
              title: "Done!",
              text: `Show for ${currMovie.title} has been added.`,
              html: `<div class="text-center text-white"><p class="poppins-bold">${currScreen.sname}</p> ${values.start}</div>`,
              icon: "success",
            });

            fetchTheatres();
          }
        } catch (error) {
          console.error("Error adding show:", error);
          Swal.fire({
            title: "Error!",
            text: "There was an error adding the show.",
            icon: "error",
          });
        }
      } else {
        Swal.fire({
          title: "Saved!",
          text: "Your show has been saved.",
          icon: "success",
        });
      }
    }
  };

  const sendAlert = () => {
    Swal.fire({
      title: "No Screen Selected",
      text: "Select a screen to add new show",
      icon: "warning",
      background: "rgba(43, 43, 46, 0.845)",
      color: "white",
      confirmButtonColor: "#28a745",
    });
  };
  const handleFormatButtonClick = (format, movie) => {
    if (!currScreen) {
      sendAlert();
      return;
    }
    console.log(movie);
    handleButtonClick("format", format);
    handleButtonClick("start", addRuntimeToStartTime(lastShow?.end, 10));
    setCurrMovie(movie);
    handleButtonClick("movieId", movie.id);

    handleAddNewShow();
  };
  return (
    <div>
      <div className="ring-2 ring-gray-900 ring-offset-2 rounded-xl flex items-center bg-gradient-to-br from-black via-gray-900 to-black mb-2 shadow-2xl text-white shadow-slate-600 p-4 text-xl poppins-semibold gap-x-8">
        <MdMovieEdit size={32} className="ml-8" /> MANAGE SHOWS
        {theatreData.length > 0 && (
          <div className="dropdown dropdown-hover dropdown-end ml-24">
            <div
              tabIndex={0}
              role="button"
              className="btn m-1 text-white ring-1 ring-white"
            >
              {currTheatre.name} <FaChevronDown size={16} className="mb-1" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
              {theatreData.map((theatre, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setCurrTheatre(theatre);
                  }}
                >
                  <a>{theatre.name}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-x-2 ">
        {" "}
        {/* Shows */}
        <div className="bg-base-300 w-3/4 rounded-xl">
          {" "}
          <div className="bg-slate-800  pb-3 rounded-xl mx-2">
            <div className="text-white poppins-semibold text-md ml-6 my-1">
              Select a Day{" "}
            </div>
            <div className="flex gap-x-4 justify-center">
              {datesStr.map((date, i) => (
                <div
                  key={i}
                  className={`border-2 border-slate-400 rounded-lg px-3 w-16 hover:bg-red-400 hover:bg-opacity-40 text-white ${
                    selectedDate == convertToDateString(date)
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
              ))}
            </div>
          </div>
          <div className="bg-gray-800 my-4  text-center text-white rounded-xl mx-2">
            <h1>
              Manage Shows for{" "}
              <span className="poppins-semibold text-red-300">
                {" "}
                ({selectedDate})
              </span>
              {values.screenId == null && (
                <p className="text-center justify-center mt-2 flex items-center text-red-500 poppins-extralight">
                  <IoWarningOutline size={16} /> Select a screen first
                </p>
              )}
            </h1>
            {screens.length > 0 && (
              <div>
                {screens.map((screen, i) => (
                  <div className="flex overflow-x-scroll" key={i}>
                    {" "}
                    <button
                      onClick={() => {
                        setCurrScreen(screen),
                          handleButtonClick("screenId", screen.id);
                      }}
                      className={`bg-gradient-to-br from-slate-900 via-slate-900 to-gray-900  shadow-sm shadow-slate-600 poppins-bold px-8 ml-2 w-[20vh] h-[16vh] flex items-center z-10 mt-[76px] rounded-lg ${
                        currScreen?.id == screen.id &&
                        `border-2 border-red-600 shadow-lg shadow-red-600`
                      }`}
                    >
                      {screen.sname}
                    </button>
                    <VideoEditorTimeline
                      isSelected={currScreen?.id == screen.id}
                      screen={screen}
                      selectedDate={selectedDate}
                    />
                    {/* <Schedule
                     isSelected={currScreen?.id == screen.id}
                     screen={screen}
                     selectedDate={selectedDate}
                    /> */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Movies  */}
        <div className="bg-slate-800 w-1/4">
          <div className="text-center text-white my-4">Search bar[TBA]</div>
          <div className="justify-center text-white">
            <div className="overflow-x-auto">
              <table className="table table-pin-rows text-center">
                <thead>
                  <tr className="text-white text-center roboto-semibold text-lg">
                    <th></th>
                    <th className="text-end pr-1">ADD </th>
                    <th className="text-start pl-1">SHOW</th>
                  </tr>
                </thead>
                <tbody className="text-white poppins-semibold">
                  {movies.length > 0 ? (
                    movies.map((movie) => (
                      <tr
                        key={movie.id}
                        className={`hover rounded-lg table-row btn cursor-pointer group`} // Added 'group' class
                      >
                        <td></td>
                        <td className="w-20 bg-transparent text-end">
                          <img
                            src={
                              movie.poster ||
                              `https://m.media-amazon.com/images/I/3120m+SwqYL._AC_UF1000,1000_QL80_.jpg`
                            }
                            className="w-[6vh] h-[8vh] object-cover bg-cover rounded-md"
                          />
                        </td>
                        <td className="text-white  hover:text-transparent text-start relative">
                          {movie.title}
                          <div
                            className="flex flex-wrap items-center justify-around opacity-0 absolute inset-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:bg-black group-hover:bg-opacity-70 poppins-regular text-md"
                            id="movie-formats"
                            onClick={() => {
                              if (!currScreen) sendAlert();
                            }}
                          >
                            {" "}
                            {currScreen ? (
                              movie.formats.map((format, i) => (
                                <button
                                  key={i}
                                  // disabled={values.screenId == null}
                                  onClick={() =>
                                    handleFormatButtonClick(format, movie)
                                  }
                                  className=" rounded-md hover:bg-white hover:text-black bg-gray-700 text-white px-2 py-1 m-1 cursor-pointer"
                                >
                                  {format}
                                </button>
                              ))
                            ) : (
                              <button className="flex gap-x-1 items-center justify-center text-red-600 p-1 rounded-md">
                                <IoWarningOutline
                                  size={20}
                                  className="align-middle"
                                />{" "}
                                Select a Screen
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-white">
                        No movies found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowDetails;

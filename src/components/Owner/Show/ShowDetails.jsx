import React, { useCallback, useEffect, useState } from "react";
import { MdMovieEdit } from "react-icons/md";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { FaChevronDown } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Schedule from "../Schedule";
import Loading from "../../Common/Loading"

// --- GLOBAL TIMELINE CONSTANTS ---
export const PIXELS_PER_MINUTE = 2.5;
export const START_HOUR = 6; // Cinema day starts at 6:00 AM
export const TOTAL_HOURS = 24;
export const TIMELINE_WIDTH = TOTAL_HOURS * 60 * PIXELS_PER_MINUTE; // 3600px

const ShowDetails = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [datesStr, setDatesStr] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [movies, setMovies] = useState([]);
  const [screens, setScreens] = useState([]);
  const [theatreData, setTheatreData] = useState([]);
  const [currTheatre, setCurrTheatre] = useState(null);
  const [currScreen, setCurrScreen] = useState(null);
  const [lastShow, setLastShow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  const interval = 15; // 15 min cleaning time

  // Fetch Initialization
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const username = localStorage.getItem("username");
        const [theatreRes, moviesRes] = await Promise.all([
          axiosSecure.get(`/theatre/get-theatres/${username}`),
          axiosSecure.get(`/movie/all-movies`)
        ]);
        setTheatreData(theatreRes.data);
        if (theatreRes.data.length > 0) setCurrTheatre(theatreRes.data[0]);
        setMovies(moviesRes.data.filter(m => m.bookingOpen));
      } catch (err) { console.error(err); }finally{ setIsLoading(false)}
    };
    fetchData();
  }, [axiosSecure]);

  useEffect(() => {
    if (!currTheatre?.id) return;
    axiosSecure.get(`/screens/by-theatre/${currTheatre.id}`)
      .then(res => setScreens(res.data))
      .catch(err => console.error(err));
  }, [currTheatre, axiosSecure]);

  // Date Generator
  useEffect(() => {
    const today = new Date();
    let dateSt = [];
    for (let i = 0; i <= 6; i++) {
      let nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      dateSt.push(nextDate.toDateString());
    }
    setDatesStr(dateSt);
    setSelectedDate(formatDateString(new Date()));
  }, []);

  const formatDateString = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Start Time Logic
  const getNextStartTime = async (screenId) => {
    try {
      const res = await axiosSecure.get(`/show/last-show?screenId=${screenId}&showDate=${selectedDate}`);
      const lShow = res.data;
      if (!lShow || !lShow.end) return "09:00"; // Default Morning start

      let [h, m] = lShow.end.split(":").map(Number);
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    } catch (err) {
      return "09:00";
    }
  };

  // Add Show Handler
  const handleAddShowClick = async (format, movie) => {
    if (!currScreen) {
      return Swal.fire({ title: "Select a Screen", text: "Click a screen on the left to add shows.", icon: "warning", background: "#111", color: "#fff" });
    }

    const proposedStart = await getNextStartTime(currScreen.id);

    const { value: formValues, isDenied, isConfirmed } = await Swal.fire({
      title: `<span style="color:#fff">${movie.title}</span>`,
      text: `Adding to ${currScreen.sname}`,
      background: "#111",
      color: "#fff",
      html: `
        <div class="mt-4 text-left">
            <div class="p-4 bg-white/5 border border-white/10 rounded-xl mb-4">
              <h4 class="poppins-semibold text-xs text-white/50 mb-3 uppercase tracking-widest">Adjust Prices (₹)</h4>
              <div class="grid grid-cols-2 gap-3">
                  ${currScreen.tiers.map((tier, i) => `
                      <div class="flex items-center justify-between">
                        <label class="poppins-medium text-sm">${tier.tiername}</label>
                        <input id="swal-price-${i}" type="number" class="w-20 px-2 py-1 bg-black border border-white/20 rounded text-white text-center" value="${tier.price}" />
                      </div>`
                  ).join("")}
              </div>
            </div>
            <div class="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
              <h4 class="poppins-semibold text-xs text-white/50 uppercase tracking-widest">Start Time</h4>
              <input id="swal-start" type="time" class="px-3 py-1.5 bg-black border border-white/20 rounded text-white poppins-medium" value="${proposedStart}" />
            </div>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: "#dc2626",
      denyButtonColor: "#4b5563",
      confirmButtonText: "Save Show",
      denyButtonText: `Edit Seating`,
      preConfirm: () => {
        const prices = {};
        currScreen.tiers.forEach((tier, i) => {
          prices[tier.tiername] = parseFloat(document.getElementById(`swal-price-${i}`).value);
        });
        return { prices, start: document.getElementById("swal-start").value };
      },
      preDeny: () => {
        const prices = {};
        currScreen.tiers.forEach((tier, i) => {
          prices[tier.tiername] = parseFloat(document.getElementById(`swal-price-${i}`).value);
        });
        return { prices, start: document.getElementById("swal-start").value };
      }
    });

    if (formValues) {
      // Calculate End Time mathematically
      let [startH, startM] = formValues.start.split(":").map(Number);
      let totalMins = startH * 60 + startM + movie.runtime + interval;
      let endH = Math.floor(totalMins / 60) % 24;
      let endM = totalMins % 60;
      let endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

      const finalShowData = {
        showDate: selectedDate,
        start: formValues.start,
        end: endTime,
        movieId: movie.id,
        screenId: currScreen.id,
        theatreId: currTheatre.id,
        format: format,
        price: formValues.prices,
        blocked: []
      };

      if (isDenied) {
        navigate("/owner/ScreenLayoutForShow", { state: { values: formValues, end: endTime, showData: finalShowData, screen: currScreen, movie: movie }});
      } else if (isConfirmed) {
        try {
          await axiosSecure.post(`/show/create`, finalShowData);
          Swal.fire({ title: "Added!", icon: "success", background: "#111", color: "#fff", timer: 1500, showConfirmButton: false });
          // Force a re-render of the specific schedule component by tweaking a state if needed, or window reload.
          // For now, re-fetching screens triggers a clean refresh.
          setScreens([...screens]);
        } catch (err) {
          Swal.fire({ title: "Error", text: "Failed to add show.", icon: "error", background: "#111", color: "#fff" });
        }
      }
    }
  };

  // Render Time Axis Header
  const renderTimeAxis = () => {
    const labels = [];
    for (let i = 0; i <= TOTAL_HOURS; i++) {
      const displayHour = (START_HOUR + i) % 24;
      const left = i * 60 * PIXELS_PER_MINUTE;
      labels.push(
        <div key={i} className="absolute top-0 bottom-0 border-l border-white/10" style={{ left: `${left}px` }}>
          <span className="absolute top-2 -left-4 text-xs poppins-medium text-white/50 bg-[#111] px-1">
            {String(displayHour).padStart(2, "0")}:00
          </span>
        </div>
      );
    }
    return labels;
  };

  return (
    <div className="min-h-screen bg-[#050505] p-2 md:p-6 font-poppins flex flex-col h-screen">

      {/* Top Header */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4 md:p-5 mb-6 shrink-0 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><MdMovieEdit size={28} /></div>
          <div>
            <h1 className="text-xl poppins-bold text-white tracking-wide">Scheduling Matrix</h1>
            <p className="text-xs text-white/50">Manage your theatre timelines</p>
          </div>
        </div>
        {currTheatre && (
          <div className="px-5 py-2.5 bg-white/5 border border-white/20 rounded-full text-white poppins-medium text-sm">
            {currTheatre.name}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0 overflow-hidden">

        {/* LEFT: Unified Cinema Matrix */}
        <div className="flex-1 bg-[#111] border border-white/10 rounded-2xl flex flex-col min-w-0 shadow-2xl relative overflow-hidden">

          {/* Date Selector Row */}
          <div className="p-4 border-b border-white/10 shrink-0 bg-[#151515] flex gap-3 overflow-x-auto custom-scrollbar">
            {datesStr.map((date, i) => {
              const dateVal = formatDateString(new Date(date));
              const isSelected = selectedDate === dateVal;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dateVal)}
                  className={`min-w-[70px] flex flex-col items-center p-2 rounded-xl border transition-all ${
                    isSelected ? "bg-red-500/20 border-red-500 text-red-100" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-[10px] uppercase mb-1">{date.substring(0, 3)}</span>
                  <span className="text-lg poppins-bold">{date.substring(8, 10)}</span>
                </button>
              );
            })}
          </div>

          {/* Matrix Scroll Area */}
          <div className="flex-1 overflow-auto custom-scrollbar relative bg-[#0a0a0a]">
            <div className="min-w-max flex flex-col pb-10">

              {/* Sticky Time Axis Header */}
              <div className="h-10 sticky top-0 z-40 bg-[#111] border-b border-white/10 flex shadow-md">
                {/* Blank space above sticky screen tabs */}
                <div className="w-32 sm:w-48 shrink-0 sticky left-0 z-50 bg-[#111] border-r border-white/10"></div>
                {/* Time Ticks */}
                <div className="relative" style={{ width: `${TIMELINE_WIDTH}px` }}>
                  {renderTimeAxis()}
                </div>
              </div>

             {/* Screen Rows */}
             {isLoading ? (
               <Loading />
             ) : screens.length > 0 ? (
               screens.map(screen => {
                 const isActive = currScreen?.id === screen.id;
                 return (
                   <div
                     key={screen.id}
                     className={`flex border-b border-white/5 transition-colors cursor-pointer ${isActive ? "bg-red-500/5" : "hover:bg-white/5"}`}
                     onClick={() => setCurrScreen(screen)}
                   >
                     {/* Sticky Screen Tab */}
                     <div className={`w-32 sm:w-48 shrink-0 sticky left-0 z-30 p-4 border-r border-white/10 flex flex-col justify-center items-center shadow-[5px_0_15px_rgba(0,0,0,0.5)] transition-colors ${isActive ? "bg-[#1f0f0f]" : "bg-[#1a1a1a]"}`}>
                       <span className={`text-[10px] poppins-bold mb-1 uppercase tracking-widest ${isActive ? "text-red-400" : "text-white/40"}`}>Screen</span>
                       <span className={`text-lg poppins-semibold text-center leading-tight ${isActive ? "text-white" : "text-white/80"}`}>{screen.sname}</span>
                     </div>

                     {/* The Individual Schedule Track */}
                     <div className="relative py-2" style={{ width: `${TIMELINE_WIDTH}px` }}>
                       <Schedule screen={screen} selectedDate={selectedDate} />
                     </div>
                   </div>
                 );
               })
             ) : (
               <div className="p-10 text-center text-white/40">No screens found for this theatre.</div>
             )}

            </div>
          </div>
        </div>

        {/* RIGHT: Movie Picker Sidebar */}
        <div className="w-full lg:w-[350px] shrink-0 bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/10 bg-[#151515]">
            <h2 className="text-white poppins-semibold tracking-wide">Assign Movies</h2>
            <p className="text-[10px] text-white/50 uppercase mt-1">Select a screen on the left first</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 bg-[#0a0a0a]">
            {movies.map(movie => (
              <div key={movie.id} className={`group flex flex-col gap-2 p-3 bg-white/5 border rounded-xl transition-all ${currScreen ? "hover:border-red-400/50 border-white/10" : "border-white/5 opacity-60 grayscale"}`}>
                <div className="flex gap-3">
                  <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded-md" />
                  <div className="flex flex-col justify-center">
                    <h3 className="text-white poppins-medium text-sm line-clamp-1">{movie.title}</h3>
                    <p className="text-white/40 text-[10px] uppercase mt-1">{movie.runtime} Mins</p>
                  </div>
                </div>
                {/* Format Buttons */}
                <div className="flex flex-wrap gap-2 mt-2 border-t border-white/10 pt-2">
                  {movie.formats.map((fmt, i) => (
                    <button
                      key={i}
                      disabled={!currScreen}
                      onClick={() => handleAddShowClick(fmt, movie)}
                      className="px-3 py-1 bg-white/10 hover:bg-red-600 disabled:hover:bg-white/10 text-white text-[10px] poppins-semibold rounded transition-colors"
                    >
                      + {fmt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShowDetails;
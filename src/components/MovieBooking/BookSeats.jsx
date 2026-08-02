import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { IoIosArrowBack } from "react-icons/io";
import Loading from "../Common/Loading.jsx"
import { MdOutlineEdit, MdZoomIn, MdZoomOut, MdOutlineFitScreen } from "react-icons/md";

const BookSeats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const axiosSecure = useAxiosSecure();

 const [pageData, setPageData] = useState(() => {
         if (location.state && location.state.selectedShow) {
           sessionStorage.setItem("bookSeatsData", JSON.stringify(location.state));
           return location.state;
         }
         const cachedData = sessionStorage.getItem("bookSeatsData");
         if (cachedData) {
           return JSON.parse(cachedData);
         }
         return null;
   });

  const [updatedScreen, setUpdatedScreen] = useState(null);
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tickets, setTickets] = useState(2);
  const [loading, setLoading] = useState(true);

  // --- ZOOM & PAN STATE ---
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });

  const [userSeats, setUserSeats] = useState({
    seatsId: [],
    price: null,
    user: "",
    showId: null,
    tierName: "",
  });

 useEffect(() => {
       if (!pageData) {
         navigate("/all-shows", { replace: true });
       }
   }, [pageData, navigate]);

   // 3. EARLY RETURN TO PREVENT CRASHES
   if (!pageData) return null;

   // 4. SAFELY DESTRUCTURE EVERYTHING HERE
   const { selectedShow, movie, selectedDate, theatre } = pageData;

   // 5. HYDRATE THE 'show' STATE IF IT IS NULL
   if (!show) {
       setShow(selectedShow);
   }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberOfTickets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const fetchScreen = useCallback(async () => {
    try {
      const res = await axiosSecure.get(`/screens/${show.sid}`);
      setUpdatedScreen(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching screen data:", error);
      setLoading(false);
    }
  }, [axiosSecure, show]);

  useEffect(() => {
    fetchScreen();
  }, [fetchScreen]);

  // --- DYNAMIC AUTO-ZOOM CALCULATION ---
  useEffect(() => {
    if (updatedScreen && containerRef.current) {
      const maxCols = Math.max(...updatedScreen.tiers.map((t) => t.columns));
      const estimatedWidth = maxCols * 40; // Approx 40px per seat
      const screenWidth = window.innerWidth;

      let idealZoom = (screenWidth * 0.85) / estimatedWidth;
      idealZoom = Math.min(Math.max(idealZoom, 0.4), 1.3);
      setZoom(idealZoom);
    }
  }, [updatedScreen]);

  // --- CANVAS DRAG-TO-PAN LOGIC ---
  const handleMouseDown = (e) => {
    // Prevent panning if clicking directly on a seat or zoom controls
    if (e.target.closest('.seat-element') || e.target.closest('.zoom-controls')) return;
    setIsDragging(true);
    setDragStart({ x: e.pageX, y: e.pageY });
    setScrollStart({
      left: containerRef.current.scrollLeft,
      top: containerRef.current.scrollTop
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const walkX = (e.pageX - dragStart.x) * 1.5;
    const walkY = (e.pageY - dragStart.y) * 1.5;
    containerRef.current.scrollLeft = scrollStart.left - walkX;
    containerRef.current.scrollTop = scrollStart.top - walkY;
  };

  const stopDragging = () => setIsDragging(false);

  // --- SEAT SELECTION LOGIC ---
  const handleSeatClick = (tierIndex, absoluteIndex) => {
    const tier = updatedScreen.tiers[tierIndex];
    const rowSeats = tier.seats;
    let remainingSeatsNeeded = tickets - selectedSeats.length;

    if (remainingSeatsNeeded <= 0) {
      setSelectedSeats([]);
      remainingSeatsNeeded = tickets;
      enableAllTiers();
    }

    const isSameTier = selectedSeats.every((seatId) => parseInt(seatId.split("-")[0]) === tierIndex);

    if (!isSameTier && selectedSeats.length > 0) {
      if (selectedSeats.length === tickets) {
        enableAllTiers();
      } else return;
    }

    const newSelectedSeatIds = [];
    let tempSeat = null;

    const rowNumber = Math.floor(absoluteIndex / tier.columns);
    const rowEndIndex = (rowNumber + 1) * tier.columns;

    for (let i = 0; i < remainingSeatsNeeded; i++) {
      const currentIndex = absoluteIndex + i;
      if (currentIndex >= rowEndIndex || !rowSeats[currentIndex]) break;

      const currentSeat = rowSeats[currentIndex];

      if (tempSeat == null) tempSeat = currentSeat.seatId.replace(/\D/g, "");
      if (tempSeat > parseInt(currentSeat.seatId.replace(/\D/g, ""))) break;

      const isBlocked = show.blocked.includes(currentSeat.seatId);
      const isBooked = show.booked.includes(currentSeat.seatId);

      if (!isBlocked && !isBooked && currentSeat.status !== "NO_SEAT") {
        const seatId = `${tierIndex}-${currentIndex}`;
        tempSeat = currentSeat.seatId.replace(/\D/g, "");
        newSelectedSeatIds.push(seatId);
      } else {
        break;
      }
    }

    setSelectedSeats((prevSelectedSeats) => {
      const updatedSeats = [...new Set([...prevSelectedSeats, ...newSelectedSeatIds])];
      if (updatedSeats.length >= tickets) enableAllTiers();
      return updatedSeats.slice(0, tickets);
    });

    disableOtherTiers(tierIndex);
  };

  const disableOtherTiers = (selectedTierIndex) => {
    updatedScreen.tiers.forEach((tier, index) => {
      tier.disabled = index !== selectedTierIndex;
    });
    setUpdatedScreen({ ...updatedScreen });
  };

  const enableAllTiers = () => {
    updatedScreen.tiers.forEach((tier) => { tier.disabled = false; });
    setUpdatedScreen({ ...updatedScreen });
  };

  const getRowLabel = (index) => {
    let label = "";
    let temp = index;
    while (temp >= 0) {
      label = String.fromCharCode(65 + (temp % 26)) + label;
      temp = Math.floor(temp / 26) - 1;
    }
    return label;
  };

  useEffect(() => {
    if (!updatedScreen || selectedSeats.length === 0) return;

    const seatIds = selectedSeats.map((seatId) => {
      const [tIdx, sIdx] = seatId.split("-").map(Number);
      return updatedScreen.tiers[tIdx].seats[sIdx].seatId;
    });

    const tierIndex = parseInt(selectedSeats[0].split("-")[0]);
    const price = updatedScreen.tiers[tierIndex].price * seatIds.length;

    setUserSeats((prev) => ({
      ...prev,
      seatsId: seatIds,
      price: price,
      user: username,
      showId: show.id,
      tierName: updatedScreen.tiers[tierIndex].tiername,
    }));
  }, [selectedSeats, updatedScreen]);

  useEffect(() => {
    setSelectedSeats([]);
  }, [tickets]);

  const handleSeatStatus = (seat) => {
    if (show?.blocked.includes(seat.seatId)) return "BLOCKED";
    if (show?.booked.includes(seat.seatId)) return "BOOKED";
    if (seat.status === "NO_SEAT") return "NO_SEAT";
    return seat.status;
  };

 // Inside BookSeats.jsx
   const handleProceed = async () => {
     try {
       // 1. Call backend to lock the seats in Redis
       const response = await axiosSecure.post("/bookings/lock-seats", userSeats);

       // 2. Capture the absolute expiration timestamp sent by backend
       const expiresAt = response.data;

       // 3. Navigate and pass the timestamp
       navigate("/bookingReview", {
         state: {
           selectedData: userSeats,
           movie: movie,
           selectedShow: show,
           selectedDate: selectedDate,
           updatedScreen: updatedScreen,
           expiresAt: expiresAt // Add this!
         },
       });
     } catch (error) {
       if (error.response?.status === 409) {
         Swal.fire("Too Slow!", "Someone just grabbed these seats. Please choose different ones.", "error");
         // Re-fetch screen to update disabled seats
         fetchScreen();
       } else {
         Swal.fire("Error", "Could not lock seats. Try again.", "error");
       }
     }
   };

  let globalRowIndex = 0;

  if (loading || !updatedScreen) {
    return (
      <Loading/>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col h-screen w-full bg-[#050505] font-poppins overflow-hidden"
    >
      {/* --- TICKET SELECTION MODAL --- */}
      <dialog id="my_modal_2" className="modal bg-black/60 backdrop-blur-sm">
        <div className="modal-box text-center text-white bg-slate-800 border border-white/10 rounded-2xl shadow-2xl">
          <h3 className="font-bold text-lg mb-6 roboto-regular">Select Tickets</h3>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {numberOfTickets.map((ticket) => (
              <button
                key={ticket}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  tickets === ticket ? "bg-white text-black scale-110 shadow-lg" : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
                onClick={() => { setTickets(ticket); document.getElementById("my_modal_2").close(); }}
              >
                {ticket}
              </button>
            ))}
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* --- COMPACT OG GLASSMORPHIC HEADER --- */}
      <div className="shrink-0 z-40 bg-gradient-to-br from-black/90 via-slate-900 to-black/90 border-b border-white/10 shadow-lg px-4 md:px-8 py-3 m-2 rounded-xl flex items-center justify-between ring-1 ring-white/10">

        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/all-shows", { state: { item: movie } })} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10">
            <IoIosArrowBack size={20} />
          </button>

          <div className="flex flex-col">
            <h1 className="text-white poppins-bold text-lg md:text-xl leading-tight tracking-wide flex items-center gap-3">
              {movie.title}
              <span className="hidden md:inline-block px-2 py-0.5 text-[10px] bg-white/10 border border-white/20 rounded text-white/80">{movie.certification.substring(14)}</span>
            </h1>
            <p className="text-white/60 poppins-light text-xs md:text-sm mt-0.5">
              {theatre[0].name} | {selectedDate} | {show.start}
            </p>
          </div>
        </div>

        <button
          onClick={() => document.getElementById("my_modal_2").showModal()}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all"
        >
          <span className="poppins-medium text-sm">{tickets} Tickets</span>
          <MdOutlineEdit size={16} />
        </button>

      </div>

      {/* --- INFINITE CANVAS (OG THEME) --- */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={`flex-1 overflow-auto custom-scrollbar relative bg-gradient-to-b from-black/90 via-slate-900 to-black/90 w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >

        {/* Floating Zoom Toolbar */}
        <div className="zoom-controls fixed top-38 md:top-22 right-4 md:right-8 z-30 flex flex-col md:flex-row items-center gap-1 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl cursor-default">
          <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.4))} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <MdZoomOut size={22} />
          </button>
          <div className="w-12 select-none text-center poppins-medium text-white/80 text-xs">
            {Math.round(zoom * 100)}%
          </div>
          <button onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <MdZoomIn size={22} />
          </button>
        </div>

        {/* Scalable Grid Container */}
        <div
          className="min-w-max flex flex-col items-center px-[10vw] md:px-[20vw] pb-40 pt-16 transition-transform duration-200 ease-out origin-top"
          style={{ transform: `scale(${zoom})` }}
        >

          {/* Render Tiers */}
          <div className="flex flex-col gap-10 w-full items-center">
            {updatedScreen.tiers.map((tier, tierIdx) => {
              const tierRows = [];
              for (let r = 0; r < tier.rows; r++) {
                const rowSeats = [];
                for (let c = 0; c < tier.columns; c++) {
                  const absoluteIndex = r * tier.columns + c;
                  rowSeats.push({ ...tier.seats[absoluteIndex], absoluteIndex });
                }
                tierRows.push(rowSeats);
              }

              return (
                <div key={tierIdx} className={`flex flex-col items-center w-full transition-opacity duration-300 ${tier.disabled ? 'opacity-30' : 'opacity-100'}`}>

                  {/* Tier Header */}
                  <div className="w-[90%] md:w-[80%] flex items-center gap-4 mb-6">
                    <div className="h-px bg-white/20 flex-1"></div>
                    <div className="flex flex-col items-center">
                      <span className="poppins-regular tracking-wider text-sm text-white/80 select-none">{tier.tiername}</span>
                      <span className="text-white/50 text-xs poppins-light select-none" >₹{tier.price}</span>
                    </div>
                    <div className="h-px bg-white/20 flex-1"></div>
                  </div>

                  {/* Render Rows */}
                  <div className="flex flex-col gap-2 md:gap-3">
                    {tierRows.map((row, rIdx) => {
                      const rowLetter = getRowLabel(globalRowIndex++);
                      return (
                        <div key={rIdx} className="flex items-center gap-4 md:gap-6">
                          <div className="select-none w-4 text-right text-white/40 poppins-medium text-xs shrink-0 select-none">
                            {rowLetter}
                          </div>

                          <div className="flex gap-1.5 md:gap-2 flex-nowrap">
                            {row.map((seat) => {
                              const useatId = `${tierIdx}-${seat.absoluteIndex}`;
                              const isSelected = selectedSeats.includes(useatId);
                              const status = handleSeatStatus(seat);

                              let seatClass = "";
                              let seatText = seat.seatId.replace(/\D/g, "");

                              if (status === "NO_SEAT") {
                                seatClass = "opacity-0 pointer-events-none";
                                seatText = "";
                              } else if (status === "BLOCKED" || status === "BOOKED") {
                                seatClass = "bg-white/10 text-white/20 cursor-not-allowed border-none";
                              } else if (isSelected) {
                                seatClass = "bg-green-500 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]";
                              } else {
                                seatClass = "border border-white/30 bg-transparent text-white/70 hover:bg-white/20";
                              }

                              return (
                                // Changed from <button> to <div> to prevent Safari auto-zoom, and added touch-action-manipulation
                                <div
                                  key={useatId}
                                  onClick={() => { if (status === "AVAILABLE" && !tier.disabled) handleSeatClick(tierIdx, seat.absoluteIndex); }}
                                  className={`seat-element w-7 h-7 md:w-8 md:h-8 rounded-t-lg rounded-b shadow-sm flex items-center justify-center text-[10px] md:text-xs poppins-medium transition-colors shrink-0 select-none cursor-pointer ${seatClass}`}
                                  style={{ touchAction: "manipulation" }}
                                >
                                  {seatText}
                                </div>
                              );
                            })}
                          </div>

                          <div className="w-4 text-left text-white/40 poppins-medium text-xs shrink-0 select-none">
                            {rowLetter}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        {/* 🚨 THE UPDATED SCREEN INDICATOR (Curving like a "U") 🚨 */}
        <div className="w-[80%] min-w-[500px] mt-24 mb-10 flex justify-center relative pointer-events-none">
          {/* The Screen Curve (U-Shape) */}
          <div className="w-full h-12 border-b-[6px] border-white/20 rounded-b-[100%] shadow-[0_-20px_60px_rgba(255,255,255,0.03)] flex justify-center items-end relative">
            {/* Text Pill breaking the bottom line */}
            <span className="select-none text-white/60 poppins-medium tracking-[0.6em] text-[10px] uppercase translate-y-[60%] px-6 py-1.5 bg-[#0a0a0a] backdrop-blur-xl border border-white/10 rounded-full h-fit shadow-lg">
              All eyes this way
            </span>
          </div>
        </div>

        </div>
      </div>

      {/* --- PROCEED TO PAY BOTTOM BAR (Framer Motion) --- */}
      <AnimatePresence>
        {selectedSeats.length === tickets && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 px-4 py-4 md:px-8"
          >
            <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left flex flex-col">
                <span className="text-white poppins-medium text-sm md:text-base">
                  {selectedSeats.length} Ticket{selectedSeats.length > 1 ? 's' : ''} Selected
                </span>
                <span className="text-white/60 text-xs md:text-sm poppins-light">
                  {userSeats.tierName} • {userSeats.seatsId.join(", ")}
                </span>
              </div>
              <button
                onClick={handleProceed}
                className="w-full md:w-auto px-16 py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-lg poppins-bold text-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
              >
                Pay ₹{userSeats.price}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default BookSeats;
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { IoWarningOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { MdOutlineEventSeat, MdBlock, MdDeleteOutline, MdSave, MdZoomIn, MdZoomOut, MdOutlineFitScreen } from "react-icons/md";
import { GiTheater } from "react-icons/gi";

const ScreenLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const { state } = location;
  const screen = state?.screen;
  const theatreId = state?.theatreId;

  const [updatedScreen, setUpdatedScreen] = useState(screen);
  const [blocking, setBlocking] = useState(false);
  const [seatEraser, setSeatEraser] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showAvailableButton, setShowAvailableButton] = useState(false);
  const [noAction, setNoAction] = useState(false);

  // --- ZOOM & PAN STATE ---
  const [zoom, setZoom] = useState(0.5); // Starts zoomed out so the whole theatre fits
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });

  // Helper to generate Row Letters (A, B... Z, AA, AB)
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
    if (!updatedScreen) return;
    const anySelectedBlockedOrNoSeat = selectedSeats.some((seatId) => {
      const [tierIndex, seatIndex] = seatId.split("-").map(Number);
      const seat = updatedScreen.tiers[tierIndex].seats[seatIndex];
      return seat.status === "BLOCKED" || seat.status === "NO_SEAT";
    });
    setShowAvailableButton(anySelectedBlockedOrNoSeat);
  }, [selectedSeats, updatedScreen]);

  if (!screen) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white poppins-medium">
        Error: Screen data not found. Please return to the previous page.
      </div>
    );
  }

  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    background: "#111",
    color: "#fff",
  });

  // --- CANVAS DRAG-TO-PAN LOGIC ---
  const handleMouseDown = (e) => {
    // Prevent panning if clicking directly on a seat
    if (e.target.closest('.seat-element')) return;
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
    const walkX = (e.pageX - dragStart.x) * 1.5; // Drag speed multiplier
    const walkY = (e.pageY - dragStart.y) * 1.5;
    containerRef.current.scrollLeft = scrollStart.left - walkX;
    containerRef.current.scrollTop = scrollStart.top - walkY;
  };

  const stopDragging = () => setIsDragging(false);

  // --- SEAT ACTIONS ---
  const handleBlocking = () => {
    setBlocking(!blocking);
    setSeatEraser(false);
    setNoAction(false);
    setSelectedSeats([]);
    Toast.fire({ icon: !blocking ? "success" : "info", title: !blocking ? "Block Mode: ON" : "Block Mode: OFF" });
  };

  const handleSeatErasing = () => {
    setSeatEraser(!seatEraser);
    setBlocking(false);
    setNoAction(false);
    setSelectedSeats([]);
    Toast.fire({ icon: !seatEraser ? "success" : "info", title: !seatEraser ? "Eraser Mode: ON" : "Eraser Mode: OFF" });
  };

  const handleAvailable = () => {
    const newScreen = { ...updatedScreen };
    selectedSeats.forEach((seatId) => {
      const [tierIndex, seatIndex] = seatId.split("-").map(Number);
      newScreen.tiers[tierIndex].seats[seatIndex].status = "AVAILABLE";
    });
    setUpdatedScreen(newScreen);
    setSelectedSeats([]);
    Toast.fire({ icon: "success", title: "Seats made Available" });
  };

  const handleSeatClick = (tierIndex, seatIndex) => {
    if (!blocking && !seatEraser) {
      setNoAction(true);
      return;
    }
    setNoAction(false);
    const seatId = `${tierIndex}-${seatIndex}`;
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const handleSaveLayout = () => {
    if (selectedSeats.length === 0) return;
    const newScreen = { ...updatedScreen };
    selectedSeats.forEach((seatId) => {
      const [tierIndex, seatIndex] = seatId.split("-").map(Number);
      const seat = newScreen.tiers[tierIndex].seats[seatIndex];
      if (blocking) seat.status = "BLOCKED";
      else if (seatEraser) seat.status = "NO_SEAT";
    });
    setUpdatedScreen(newScreen);
    setSelectedSeats([]);
    Toast.fire({ icon: "success", title: "Changes Applied Temporarily" });
  };

  const handleSaveScreen = async () => {
    try {
      const response = await axiosSecure.post(`/screens/create/${theatreId}`, updatedScreen);
      if (response.status === 200) {
        Swal.fire({ position: "center", icon: "success", title: "Layout Saved to Database", showConfirmButton: false, timer: 2000, background: "#111", color: "#fff" });
        navigate(`/owner/screen-details`);
      } else {
        throw new Error("Failed to save screen.");
      }
    } catch (error) {
      Swal.fire({ title: "Save failed", text: error.message || "An unexpected error occurred.", icon: "error", background: "#111", color: "#fff" });
    }
  };

  let globalRowIndex = 0;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050505] font-poppins overflow-hidden w-full">

      {/* 🚨 LEFT SECTION: The Interactive Canvas 🚨 */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={`flex-1 overflow-auto custom-scrollbar relative flex flex-col bg-[#0a0a0a] border-r border-white/5 shadow-inner ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      >

        {/* Floating Action Warning */}
        {noAction && (
          <div className="sticky top-6 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-md text-white px-6 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce pointer-events-none">
            <IoWarningOutline size={20} /> <span className="text-sm poppins-medium tracking-wide">Select 'Block' or 'Erase' mode first!</span>
          </div>
        )}

        {/* 🚨 FLOATING ZOOM TOOLBAR 🚨 */}
        <div className="sticky bottom-8 left-8 z-50 flex items-center gap-1 bg-[#151515]/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] w-fit mt-auto cursor-default">
          <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors active:scale-95" title="Zoom Out">
            <MdZoomOut size={24} />
          </button>
          <div className="w-14 text-center poppins-semibold text-white/80 text-sm tracking-widest">
            {Math.round(zoom * 100)}%
          </div>
          <button onClick={() => setZoom(z => Math.min(z + 0.1, 2.0))} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors active:scale-95" title="Zoom In">
            <MdZoomIn size={24} />
          </button>
          <div className="w-px h-6 bg-white/10 mx-2"></div>
          <button onClick={() => setZoom(0.5)} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors active:scale-95" title="Fit to Screen">
            <MdOutlineFitScreen size={20} />
          </button>
        </div>

        {/* 🚨 THE SCALABLE SEAT GRID 🚨 */}
        <div
          className="min-w-max flex flex-col items-center px-[20vw] pb-32 pt-16 transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >

          {/* Cinematic Screen Curve */}
          <div className="w-[80%] min-w-[600px] h-16 border-t-[8px] border-white/20 rounded-t-[100%] shadow-[0_-30px_60px_rgba(255,255,255,0.05)] flex justify-center pt-2 mb-20 relative">
            <span className="text-white/30 poppins-semibold tracking-[0.8em] text-xs uppercase bg-[#0a0a0a] px-4 -mt-5">
              Screen This Way
            </span>
          </div>

          {/* Render Tiers */}
          <div className="flex flex-col gap-12 w-full items-center">
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
                <div key={tierIdx} className="flex flex-col items-center w-full">
                  {/* Tier Divider */}
                  <div className="w-full flex items-center gap-4 mb-8 opacity-60">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
                    <span className="poppins-bold tracking-widest uppercase text-sm text-white">
                      {tier.tiername} <span className="text-white/50 ml-2">₹{tier.price}</span>
                    </span>
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
                  </div>

                  {/* Render Rows */}
                  <div className="flex flex-col gap-3">
                    {tierRows.map((row, rIdx) => {
                      const rowLetter = getRowLabel(globalRowIndex++);

                      return (
                        <div key={rIdx} className="flex items-center gap-6">
                          <div className="w-6 text-right text-white/40 poppins-bold text-sm shrink-0 select-none">
                            {rowLetter}
                          </div>

                          <div className="flex gap-2 flex-nowrap">
                            {row.map((seat) => {
                              const useatId = `${tierIdx}-${seat.absoluteIndex}`;
                              const isSelected = selectedSeats.includes(useatId);

                              let seatClass = "border-white/20 bg-white/5 text-white/70 hover:bg-white/20 hover:border-white/50";
                              let seatText = seat.seatId.replace(/\D/g, "");

                              if (seat.status === "NO_SEAT") {
                                seatClass = (seatEraser || blocking) ? "border-dashed border-white/10 text-transparent hover:border-white/30" : "opacity-0 pointer-events-none";
                                seatText = "";
                              } else if (seat.status === "BLOCKED") {
                                seatClass = "border-red-900 bg-red-950 text-red-500/50";
                              }

                              if (isSelected) {
                                if (blocking) seatClass = "bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-110";
                                else if (seatEraser) seatClass = "bg-orange-500 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-110";
                                else seatClass = "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-110";
                              }

                              return (
                                <div
                                  key={useatId}
                                  onClick={() => handleSeatClick(tierIdx, seat.absoluteIndex)}
                                  // Added 'seat-element' class to prevent drag conflicts when clicking
                                  className={`seat-element w-9 h-9 rounded-t-lg rounded-b-sm border flex items-center justify-center text-xs poppins-medium transition-all duration-200 shrink-0 cursor-pointer select-none ${seatClass}`}
                                >
                                  {seatText}
                                </div>
                              );
                            })}
                          </div>

                          <div className="w-6 text-left text-white/40 poppins-bold text-sm shrink-0 select-none">
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
        </div>
      </div>

      {/* 🚨 RIGHT SECTION: The Command Center 🚨 */}
      <div className="w-full md:w-80 lg:w-96 shrink-0 bg-[#111] border-l border-white/5 flex flex-col shadow-2xl z-20">

        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-[#151515]">
          <div className="flex items-center gap-3 mb-2">
            <GiTheater className="text-white/50" size={24} />
            <h2 className="poppins-bold text-xl text-white tracking-wide uppercase">Layout Editor</h2>
          </div>
          <p className="text-white/50 text-xs poppins-light">Editing: <span className="text-white poppins-medium">{screen.sname}</span></p>
        </div>

        {/* Action Toggles */}
        <div className="p-6 flex flex-col gap-4 border-b border-white/5">
          <h3 className="text-[10px] poppins-semibold text-white/40 uppercase tracking-widest">Select Mode</h3>

          <button
            onClick={handleBlocking}
            className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-300 border ${
              blocking ? "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <MdBlock size={20} />
            <span className="poppins-medium text-sm tracking-wide">Block Seats Mode</span>
            {blocking && <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
          </button>

          <button
            onClick={handleSeatErasing}
            className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-300 border ${
              seatEraser ? "bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
            }`}
          >
            <MdDeleteOutline size={20} />
            <span className="poppins-medium text-sm tracking-wide">Delete Seats Mode</span>
            {seatEraser && <span className="ml-auto w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>}
          </button>
        </div>

        {/* Execution Actions */}
        <div className="p-6 flex flex-col gap-4 flex-grow">
          <h3 className="text-[10px] poppins-semibold text-white/40 uppercase tracking-widest flex justify-between">
            Selected Seats <span className="text-white">{selectedSeats.length}</span>
          </h3>

          <button
            onClick={handleSaveLayout}
            disabled={selectedSeats.length === 0}
            className="w-full py-4 rounded-xl bg-white/10 border border-white/20 text-white poppins-semibold uppercase tracking-widest text-xs hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <IoCheckmarkCircleOutline size={18} /> Apply Selection
          </button>

          {showAvailableButton && (
            <button
              onClick={handleAvailable}
              className="w-full py-4 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 poppins-semibold uppercase tracking-widest text-xs hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <MdOutlineEventSeat size={18} /> Make Available
            </button>
          )}
        </div>

        {/* Final Save Button */}
        <div className="p-6 bg-black/50 border-t border-white/5 mt-auto">
          <button
            onClick={handleSaveScreen}
            className="w-full py-4 rounded-xl bg-white text-black poppins-bold uppercase tracking-widest text-sm hover:bg-neutral-300 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
          >
            <MdSave size={20} /> Save Final Layout
          </button>
        </div>

      </div>
    </div>
  );
};

export default ScreenLayout;
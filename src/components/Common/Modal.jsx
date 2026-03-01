import { TextField } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineAirlineSeatReclineNormal, MdAdd, MdClose } from "react-icons/md";
import { GiTheater } from "react-icons/gi";

const Modal = ({ path, theatreId }) => {
  const navigate = useNavigate();

  // Premium Dark Mode Material UI Styles
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "rgba(255,255,255,0.2)", transition: "all 0.3s ease" },
      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
      "&.Mui-focused fieldset": { borderColor: "white", borderWidth: "1px" },
    },
    "& .MuiInputBase-input": { color: "white", fontFamily: "poppins, sans-serif", fontWeight: 300 },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)", fontFamily: "poppins, sans-serif" },
    "&:hover .MuiInputLabel-root": { color: "white" },
    "&.Mui-focused .MuiInputLabel-root": { color: "white" },
  };

  const [screen, setScreen] = useState({ sname: "", tiers: [] });
  const [currentTier, setCurrentTier] = useState({ tiername: "", price: "", rows: "", columns: "" });
  const [totalSeats, setTotalSeats] = useState(0);
  const [lastUsedRowLetter, setLastUsedRowLetter] = useState(65); // Ascii 'A'

  const handleChange = (e) => setScreen({ ...screen, [e.target.name]: e.target.value });
  const handleTierChange = (e) => setCurrentTier({ ...currentTier, [e.target.name]: e.target.value });

  const addTier = () => {
    const rows = parseInt(currentTier.rows) || 0;
    const cols = parseInt(currentTier.columns) || 0;
    const seatsInTier = rows * cols;

    const newLastUsedRowLetter = lastUsedRowLetter + rows;

    setScreen((prev) => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        {
          tiername: currentTier.tiername,
          price: parseInt(currentTier.price),
          rows: rows,
          columns: cols,
          seats: generateSeats(rows, cols, lastUsedRowLetter),
        },
      ],
    }));

    setCurrentTier({ tiername: "", price: "", rows: "", columns: "" });
    setTotalSeats((prev) => prev + seatsInTier);
    setLastUsedRowLetter(newLastUsedRowLetter);
  };

  const generateSeats = (rows, columns, startLetterAscii) => {
    const seats = [];
    let currentRowLetter = startLetterAscii;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        const seatId = `${String.fromCharCode(currentRowLetter)}${j + 1}`;
        seats.push({ seatId, status: "AVAILABLE" });
      }
      currentRowLetter++;
    }
    return seats;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/owner/screen-Layout", { state: { screen, theatreId } });
  };

  const closeModal = () => {
    document.getElementById("my_modal_2").close();
    setScreen({ sname: "", tiers: [] });
    setCurrentTier({ tiername: "", price: "", rows: "", columns: "" });
    setTotalSeats(0);
    setLastUsedRowLetter(65);
  };

  const isTierValid = currentTier.tiername && Number(currentTier.price) > 0 && Number(currentTier.rows) > 0 && Number(currentTier.columns) > 0;
  const isFormValid = screen.sname.trim() !== "" && screen.tiers.length > 0;

  return (
    <dialog id="my_modal_2" className="modal modal-bottom sm:modal-middle backdrop-blur-md">
      {/* 🚨 RESPONSIVE FIX: w-11/12 and max-w-7xl allows it to expand beautifully on massive monitors. max-h-[90vh] prevents vertical cutoff. 🚨 */}
      <div className="modal-box w-11/12 max-w-7xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-t-3xl sm:rounded-3xl p-0 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col">

        {/* Sticky Modal Header */}
        <div className="bg-[#111] p-5 md:p-6 border-b border-white/5 flex justify-between items-center sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
              <GiTheater className="text-red-500" size={20} />
            </div>
            <div>
              <h2 className="poppins-bold text-lg md:text-xl text-white tracking-wide uppercase">Configure Screen</h2>
              <p className="poppins-light text-[10px] md:text-xs text-white/50">Define layout, tiers, and pricing</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-full transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto custom-scrollbar p-5 md:p-8 flex-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-5xl mx-auto w-full">

            {/* Main Screen Setup */}
            <div>
              <h3 className="poppins-medium text-xs md:text-sm text-white/50 uppercase tracking-widest mb-4">1. Screen Identity</h3>
              <TextField
                label="Screen Name (e.g. Screen 1, IMAX, Gold Class)"
                type="text"
                name="sname"
                variant="outlined"
                value={screen.sname}
                onChange={handleChange}
                required
                fullWidth
                sx={textFieldStyles}
              />
            </div>

            <div className="w-full h-px bg-white/5"></div>

            {/* Tier Builder */}
            <div>
              <h3 className="poppins-medium text-xs md:text-sm text-white/50 uppercase tracking-widest mb-4">2. Build Seating Tiers</h3>

              {/* 🚨 RESPONSIVE GRID FIX: Stacks on mobile, 2 cols on tablet, 5 cols on large desktop 🚨 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 items-start">
                <div className="col-span-1">
                  <TextField label="Tier Name" name="tiername" type="text" value={currentTier.tiername} onChange={handleTierChange} fullWidth sx={textFieldStyles} />
                </div>
                <div className="col-span-1">
                  <TextField label="Price (₹)" name="price" type="number" value={currentTier.price} onChange={handleTierChange} fullWidth sx={textFieldStyles} />
                </div>
                <div className="col-span-1">
                  <TextField label="Rows" name="rows" type="number" value={currentTier.rows} onChange={handleTierChange} fullWidth sx={textFieldStyles} />
                </div>
                <div className="col-span-1">
                  <TextField label="Columns" name="columns" type="number" value={currentTier.columns} onChange={handleTierChange} fullWidth sx={textFieldStyles} />
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-center h-full">
                  <button
                    type="button"
                    onClick={addTier}
                    disabled={!isTierValid}
                    className="w-full h-14 rounded-xl flex items-center justify-center gap-2 poppins-semibold uppercase tracking-widest text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white/10 text-white hover:bg-white/20 border border-white/20"
                  >
                    <MdAdd size={18} /> Add Tier
                  </button>
                </div>
              </div>
            </div>

            {/* Active Tiers Summary Container */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5 md:p-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h4 className="poppins-medium text-white/80">Active Tiers</h4>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full w-fit">
                  <span className="poppins-medium text-xs text-red-400 uppercase tracking-widest">Total Capacity</span>
                  <span className="poppins-bold text-white">{totalSeats}</span>
                </div>
              </div>

              {screen.tiers.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {screen.tiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl grow sm:grow-0">
                      <div className="flex flex-col">
                        <span className="poppins-semibold text-white text-sm">{tier.tiername}</span>
                        <span className="poppins-light text-white/50 text-xs">₹ {tier.price}</span>
                      </div>
                      <div className="h-8 w-px bg-white/10 mx-1 md:mx-2"></div>
                      <div className="flex items-center gap-1.5 text-white/80">
                        <MdOutlineAirlineSeatReclineNormal size={18} className="text-red-400" />
                        <span className="poppins-semibold text-sm">{tier.rows * tier.columns}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full py-8 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-center px-4">
                  <span className="poppins-light text-white/30 text-sm">No tiers added yet. Use the form above to build the layout.</span>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-2 border-t border-white/5">
              <button
                type="button"
                className="flex-1 py-4 rounded-xl border border-white/20 text-white poppins-semibold tracking-widest uppercase hover:bg-white/5 transition-colors text-xs md:text-sm"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className="flex-1 py-4 rounded-xl bg-white text-black poppins-semibold tracking-widest uppercase hover:bg-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Generate Layout
              </button>
            </div>

          </form>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
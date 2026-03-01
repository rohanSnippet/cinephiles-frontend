import React from "react";
import { MdOutlineEdit, MdDeleteForever, MdEventSeat } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const ScreenCard = ({ screen }) => {
  const navigate = useNavigate();

  // Prevent card click navigation when interacting with Action Buttons
  const handleEdit = (e) => {
    e.stopPropagation();
    // Add your edit logic here later
    console.log("Edit Screen:", screen.sname);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    // Add your delete logic here later
    console.log("Delete Screen:", screen.sname);
  };

  const navigateToLayout = () => {
    navigate("/owner/seatBookingLayout", { state: { screen: screen } });
  };

  return (
    <div
      onClick={navigateToLayout}
      className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[220px]"
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Top Header Section */}
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] text-white/40 poppins-medium uppercase tracking-widest mb-1">Screen</span>
          <h2 className="poppins-bold text-2xl text-white tracking-wide">{screen.sname}</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 bg-white/5 hover:bg-blue-500/20 text-white/50 hover:text-blue-400 rounded-lg transition-colors border border-transparent hover:border-blue-500/30"
            title="Edit Screen"
          >
            <MdOutlineEdit size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
            title="Delete Screen"
          >
            <MdDeleteForever size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 mt-auto">

        {/* Tier Details */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
            <MdEventSeat size={18} className="text-white/70" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/40 poppins-medium uppercase tracking-wider">Tiers Setup</span>
            <span className="text-sm poppins-semibold text-white/90">{screen.tiers?.length || 0} Levels</span>
          </div>
        </div>

        {/* Hover Arrow Indicator */}
        <div className="text-xs text-red-400 poppins-medium tracking-wide flex items-center gap-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
          Edit Layout <span>&rarr;</span>
        </div>
      </div>
    </div>
  );
};

export default ScreenCard;
import React from "react";
import { MdOutlineEdit } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";
import { Link } from "react-router-dom";

const ScreenCard = ({ screen }) => {
  return (
    <Link
      to="/owner/seatBookingLayout"
      state={{ screen: screen }}
      className="relative card bg-gradient-to-br border-double border-slate-800  border-2 from-gray-800 via-base-100 to-slate-900 w-[46vh] h-[32vh] items-center shadow-xl hover:text-white hover:bg-gradient-to-br hover:from-slate-900 hover:via-slate-800 hover:to-slate-700 hover:shadow-xl hover:border-gray-700 shadow-gray-900"
    >
      <div className="flex top-4 absolute bottom-[30%] gap-3  left-[75%]">
        <MdOutlineEdit className="h-[4vh] w-[4vh] text-indigo-300 hover:text-indigo-600 cursor-pointer" />
        <MdDeleteForever className="h-[4vh] w-[4vh] text-red-300 hover:text-red-600 cursor-pointer" />
      </div>
      <div className="absolute bottom-[30%] roboto-regular text-center">
        <p>Tiers : {screen.tiers.length}</p>
      </div>
      <div className="absolute bottom-9 ">
        <h2 className="poppins-bold text-2xl">{screen.sname}</h2>
      </div>
    </Link>
  );
};

export default ScreenCard;

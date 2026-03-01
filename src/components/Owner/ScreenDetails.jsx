import React, { useEffect, useState } from "react";
import ScreenCard from "./ScreenCard";
import { IoIosAddCircleOutline } from "react-icons/io";
import { GiTheater } from "react-icons/gi";
import Modal from "../Common/Modal";
import useAxiosSecure from "../Hooks/AxiosSecure";

const ScreenDetails = () => {
  const axiosSecure = useAxiosSecure();
  const [screen, setScreen] = useState([]);
  const [theatreData, setTheatreData] = useState([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
    fetchTheatres();
    getAllScreens();
  }, []);

  const fetchTheatres = async () => {
    try {
      const res = await axiosSecure.get(`/theatre/get-theatres/${username}`);
      setTheatreData(res.data);
    } catch (error) {
      console.error("Error fetching theatres:", error);
    }
  };

  const getAllScreens = async () => {
    try {
      const res = await axiosSecure.get(`/screens/all/${username}`);
      setScreen(res.data);
    } catch (error) {
      console.error("Error fetching screens:", error);
    }
  };

  const openModal = () => {
    document.getElementById("my_modal_2").showModal();
  };

  let theatreId;
  if (theatreData.length > 0) {
    theatreId = theatreData[0].id;
  }

  return (
    <div className="min-h-screen bg-[#050505] p-4 md:p-8 font-poppins">

      {/* Hidden Modal Component */}
      <Modal path="screenDetails" theatreId={theatreId} />

      {/* Premium Page Header */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between shadow-xl">
        <div className="flex items-center gap-4 text-white">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <GiTheater size={32} />
          </div>
          <div>
            <h1 className="text-2xl poppins-bold tracking-wide uppercase">Screen Management</h1>
            <p className="text-xs text-white/50 poppins-light mt-1">Configure physical screens and seating tiers</p>
          </div>
        </div>
      </div>

      {/* Screens Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {/* Cinematic 'Add New Screen' Card */}
        <div
          onClick={openModal}
          className="group flex flex-col items-center justify-center min-h-[220px] bg-white/[0.02] border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-white/50 transition-all duration-300 shadow-lg"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/10">
            <IoIosAddCircleOutline size={36} className="text-white/70 group-hover:text-white" />
          </div>
          <h2 className="poppins-semibold text-lg text-white/70 group-hover:text-white tracking-wide">Add New Screen</h2>
          <p className="text-xs text-red-400 mt-2 poppins-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Click to setup</p>
        </div>

        {/* Existing Screens List */}
        {screen.length > 0 && (
          screen.map((screenItem, i) => (
            <ScreenCard key={i} screen={screenItem} />
          ))
        )}
      </div>

      {/* Empty State Fallback (If no screens and it's loading/empty) */}
      {screen.length === 0 && (
        <div className="mt-6 p-8 flex flex-col items-center justify-center border border-white/5 bg-[#0a0a0a] rounded-2xl">
          <p className="text-white/40 poppins-light text-sm">No screens configured yet. Add your first screen to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ScreenDetails;
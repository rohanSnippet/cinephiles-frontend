import React, { useEffect, useState } from "react";
import ScreenCard from "./ScreenCard";
import { IoIosAddCircleOutline } from "react-icons/io";
import Modal from "../Common/Modal";
import useAxiosSecure from "../Hooks/AxiosSecure";

const ScreenDetails = () => {
  const axiosSecure = useAxiosSecure();
  const [screen, setScreen] = useState([]); // Use empty array as initial state
  const [theatreData, setTheatreData] = useState([]); // Initialize as an empty array
  const username = localStorage.getItem("username");
  useEffect(() => {
    fetchTheatres();
    getAllScreens();
  }, []);
  const fetchTheatres = async () => {
    try {
      const res = await axiosSecure.get(`/theatre/get-theatres/${username}`);
      setTheatreData(res.data); // Set theatre data fetched from API
    } catch (error) {
      console.error("Error fetching theatres:", error);
    }
  };

  let theatreId;
  if (theatreData.length > 0) {
    theatreId = theatreData[0].id;
  }
  const getAllScreens = async () => {
    try {
      const res = await axiosSecure.get(`/screens/all/${username}`);
      setScreen(res.data); // Set screens fetched from API
    } catch (error) {
      console.error("Error fetching screens:", error);
    }
  };

  const openModal = () => {
    document.getElementById("my_modal_2").showModal(); // Open modal by ID
  };

  return (
    <div className="px-4">
    <div className="flex flex-col md:flex-row md:justify-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
      {/* Modal */}
      <Modal path="screenDetails" theatreId={theatreId} />
  
      {/* Add Screen Card */}
      <div
        onClick={openModal}
        className="card bg-gradient-to-br border-double border-slate-800 border-2 cursor-pointer from-gray-800 via-base-100 to-slate-900 w-full md:w-[40vh] h-[32vh] shadow-xl text-slate-300 hover:bg-gradient-to-br hover:from-slate-900 hover:via-slate-800 hover:to-slate-700 hover:shadow-xl shadow-slate-900 flex pt-12 justify-center"
      >
        <figure>
          <IoIosAddCircleOutline className="h-28 w-28" />
        </figure>
        <div className="card-body items-center text-center">
          <h2 className="card-title roboto-bold text-2xl">Add Screen</h2>
        </div>
      </div>
    </div>
  
    {/* Screen List */}
    <div className="mt-6">
      {screen.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {screen.map((screenItem, i) => (
            <ScreenCard key={i} screen={screenItem} />
          ))}
        </div>
      ) : (
        <div className="text-white text-center text-lg mt-4">No screens available.</div>
      )}
    </div>
  </div>
  
  );
};

export default ScreenDetails;

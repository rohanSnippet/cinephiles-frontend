import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { IoWarningOutline } from "react-icons/io5";

const ScreenLayout = () => {
  const location = useLocation();
  const { state } = location;
  const screen = state?.screen;
  const { theatreId } = location.state;
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [updatedScreen, setUpdatedScreen] = useState(screen);
  const [blocking, setBlocking] = useState(false);
  const [seatEraser, setSeatEraser] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showAvailableButton, setShowAvailableButton] = useState(false);
  const [noAction, setNoAction] = useState(false);

  useEffect(() => {
    // Check if any selected seats are "BLOCKED" or "noSeat"
    const anySelectedBlockedOrNoSeat = selectedSeats.some((seatId) => {
      const [tierIndex, seatIndex] = seatId.split("-").map(Number);
      const seat = updatedScreen.tiers[tierIndex].seats[seatIndex];
      return seat.status === "BLOCKED" || seat.status === "NO_SEAT";
    });

    setShowAvailableButton(anySelectedBlockedOrNoSeat);
  }, [selectedSeats, updatedScreen]);

  if (!screen) {
    return <p>Error: Screen data not found.</p>;
  }

  const layout = {
    left: "from-left",
    right: "from-right",
    center: "in-center",
  };
  const Toast = Swal.mixin({
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 1200,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  const handleBlocking = () => {
    setBlocking(!blocking);
    setNoAction(false);
    blocking
      ? Toast.fire({
          icon: "warning",
          title: "Seat Blocking is OFF",
        })
      : Toast.fire({
          icon: "success",
          title: "Seat Blocking is ON",
        });
    setSeatEraser(false);
    setSelectedSeats([]); // Reset selection when mode changes
  };

  const handleAvailable = () => {
    const newScreen = { ...updatedScreen };

    selectedSeats.forEach((seatId) => {
      const [tierIndex, seatIndex] = seatId.split("-").map(Number);
      const seat = newScreen.tiers[tierIndex].seats[seatIndex];

      seat.status = "AVAILABLE"; // Set the seat back to available
    });

    setUpdatedScreen(newScreen);
    setSelectedSeats([]); // Reset selection after making available

    console.log("Seats made available:", newScreen);
    alert("Selected seats are now available!");
  };

  const handleSeatErasing = () => {
    setSeatEraser(!seatEraser);
    setNoAction(false);
    seatEraser
      ? Toast.fire({
          icon: "warning",
          title: "Seat Deletion is OFF",
        })
      : Toast.fire({
          icon: "success",
          title: "Seat Deletion is ON",
        });
    setBlocking(false);
    setSelectedSeats([]); // Reset selection when mode changes
  };

  const handleSeatClick = (tierIndex, seatIndex) => {
    if (blocking == false && seatEraser == false) {
      setNoAction(true);
    } else {
      setNoAction(false);
      const seatId = `${tierIndex}-${seatIndex}`;
      if (selectedSeats.includes(seatId)) {
        setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
      } else {
        setSelectedSeats([...selectedSeats, seatId]);
      }
    }
  };

  const handleSaveLayout = () => {
    const newScreen = { ...updatedScreen };

    selectedSeats.forEach((seatId) => {
      const [tierIndex, seatIndex] = seatId.split("-").map(Number);
      const seat = newScreen.tiers[tierIndex].seats[seatIndex];

      if (blocking) {
        seat.status = "BLOCKED";
      } else if (seatEraser) {
        seat.status = "NO_SEAT";
      }
    });

    setUpdatedScreen(newScreen);
    setSelectedSeats([]); // Reset selection after saving

    console.log("Saved Layout:", newScreen);
    alert("Layout saved temporarily!");
  };
  let curIdx = 0;
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const handleSaveScreen = async () => {
    try {
      const response = await axiosSecure.post(
        `/screens/create/${theatreId}`,
        updatedScreen
      );
      console.log(response);
      if (response.status === 200) {
        // Check status code for successful response
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Your work has been saved",
          showConfirmButton: false,
          timer: 2000,
        });
        navigate(`/owner/screen-details`);
      } else {
        throw new Error("Failed to save screen.");
      }
    } catch (error) {
      Swal.fire({
        title: "Save failed",
        text: error.message || "An unexpected error occurred.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="flex relative gap-2 overflow-y-hidden overflow-x-auto">
      {/* left-section */}
      <div
        className={`text-white bg-gradient-to-b ${
          seatEraser
            ? `eraser-gradient`
            : blocking
            ? `blocking-gradient`
            : `from-black/90 via-slate-900 to-black/90`
        } w-[130vh] poppins-regular rounded-lg overflow-y-scroll overflow-x-scroll`}
      >
        {noAction && (
          <p className="text-center justify-center mt-2 flex items-center text-red-500 poppins-extralight">
            <IoWarningOutline size={16} /> Choose Action to perform in Edit
            Panel
          </p>
        )}
        {updatedScreen.tiers.map((tier, index) => {
          const gridColumns = tier.columns + 1;
          // Reset index for each tier
          return (
            <div key={index} className={`mt-4 ${layout.center} z-90 `}>
              <h2>
                {tier.tiername} (₹{tier.price})
              </h2>
              <hr className="border-gray-600 border-double text-white" />
              <div id="seatArr" className="mb-8 overflow-x-auto">
                  {tier.seats.map((seat, seatIndex) => {
                    const isFirstInRow = seatIndex % tier.columns === 0;
                    const isLastInRow = (seatIndex + 1) % tier.columns === 0;

                    const useatId = `${index}-${seatIndex}`;
                    const isSelected = selectedSeats.includes(useatId);

                    return (
                      <React.Fragment key={useatId}>
                        {isFirstInRow && (
                          <span className="text-sm font-semibold mr-2 z-30">
                            {alphabet[curIdx++]}
                          </span>
                        )}
                        <span
                          onClick={() => handleSeatClick(index, seatIndex)}
                          className={`seat ${
                            seat.status
                          } text-sm cursor-pointer z-30 relative ${
                            isSelected ? "selected-seat" : ""
                          }`}
                        >
                          {seat.seatId.replace(/\D/g, "")}
                        </span>
                        {isLastInRow && <br />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
          );
        })}
        <h1 className="absolute poppins-bold text-[20vh] top-[20%] left-[12%] opacity-40">
          {screen.sname}
        </h1>
        <h1 className="absolute roboto-regular text-lg bottom-[8%] left-[36%] ">
          Screen here
        </h1>{" "}
        <div className="relative ml-16 mt-4">
          <span className="absolute bottom-[-40vh] left-[18vh] w-full">
            <svg
              width="60%"
              height="100%"
              viewBox="0 0 200 100"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M 10 10 C 80 40, 120 40, 190 10"
                stroke="white"
                strokeWidth="1"
                fill="transparent"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* right-section */}
      <div className="text-black rounded-md bg-slate-700 border-left border-solid border-gray-700 h-[97vh] w-[30vh]">
        <div className="text-center mt-1 mx-1 rounded-md py-2 bg-base-200 text-white roboto-regular">
          <h2>Edit Panel</h2>
        </div>
        <div className="relative text-center h-[70vh] mt-1 mx-1 rounded-md py-2 bg-base-100">
          <button
            onClick={handleBlocking}
            id="blockSeat"
            className={`absolute top-[4vh] left-[23%] poppins-regular rounded-md px-3 py-1 bg-opacity-10 text-sky-100 ${
              blocking
                ? "bg-gradient-to-tr from-teal-600 via-sky-600 to-indigo-400"
                : "bg-gradient-to-r from-gray-600 to-gray-700"
            }`}
          >
            Block Seats
          </button>
          <button
            onClick={handleSeatErasing}
            id="noSeat"
            className={`absolute left-[22%] top-[10vh] poppins-regular bg-gradient-to-r from-gray-600 to-gray-700 rounded-md px-3 py-1 bg-opacity-10 text-sky-100 ${
              seatEraser
                ? "bg-gradient-to-tr from-pink-600 via-orange-600 to-red-600"
                : "bg-gradient-to-r from-gray-600 to-gray-700"
            }`}
          >
            Delete Seats
          </button>
          {showAvailableButton && (
            <button
              onClick={handleAvailable}
              id="available"
              className={`absolute left-[32%] top-[16vh] poppins-regular bg-gradient-to-r from-gray-600 to-gray-700 rounded-md px-3 py-1 bg-opacity-10 text-sky-100`}
            >
              Make Available
            </button>
          )}
          <button
            onClick={handleSaveLayout}
            className={`absolute bottom-[16vh] left-[23%] poppins-regular text-sm bg-gradient-to-r text-white  ${
              selectedSeats.length <= 0
                ? `btn-disabled from-gray-600 to-gray-700 cursor-no-drop text-opacity-50`
                : `  from-orange-600 to-orange-400 `
            } rounded-md px-1 py-1 bg-opacity-10 `}
          >
            Apply Changes
          </button>
          <button
            onClick={handleSaveScreen}
            className="absolute bottom-[5vh] left-[24%] poppins-regular bg-gradient-to-r from-green-600 to-green-700 rounded-md px-3 py-1 bg-opacity-10 text-white"
          >
            Save Layout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenLayout;

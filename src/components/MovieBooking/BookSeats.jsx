import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { MdOutlineEdit } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";

const BookSeats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const { selectedShow, movie, theatre, selectedDate } = location.state;
  const axiosSecure = useAxiosSecure();
  const [updatedScreen, setUpdatedScreen] = useState(null);
  const [show, setShow] = useState(selectedShow);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tickets, setTickets] = useState(2);
  const [loading, setLoading] = useState(false);
  const [userSeats, setUserSeats] = useState({
    seatsId: [],
    price: null,
    user: "",
    showId: null,
    tierName:""
  });

  const numberOfTickets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let curIdx = 0;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let seatIds = [];
  const guidelines = [
    "The seat layout page for Cinephiles cinemas is for representational purposes only, and the actual seat layout might vary.",
    "A ticket is compulsory for children of 3 years & above.",
    "Patrons below the age of 18 years cannot be admitted to movies certified A.",
    "A baggage counter facility is not available at this cinema.",
    "For 3D movies, the ticket price includes charges for 3D glasses.",
    "Outside food and beverages are not allowed on the cinema premises.",
    "Restricted items include laptops, cameras, knives, lighters, matchboxes, cigarettes, firearms, and inflammable objects.",
    "Items like carry bags, eatables, helmets, and handbags are not allowed inside the theaters.",
    "Patrons under the influence of alcohol or drugs will not be allowed inside the cinema premises.",
    "Tickets once purchased at the cinema box office cannot be canceled, exchanged, or refunded.",
    "Cinephiles may contact guests for feedback to improve services.",
    "Decisions made by Cinephiles are final, and rights of admission are reserved.",
  ];
  const fetchScreen = useCallback(async () => {
    try {
      const res = await axiosSecure.get(`/screens/${show.sid}`);
      setUpdatedScreen(res.data);
    } catch (error) {
      console.error("Error fetching screen data:", error);
    }
  }, [axiosSecure, show]);

  const handleChangeShow = (data) => {
    if (show.id != data.id) {
      setLoading(true);
      setShow(data);
      setSelectedSeats([]);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    fetchScreen();
  }, [fetchScreen]);


  //Seat click logic
  const handleSeatClick = (tierIndex, seatIndex) => {
    const rowSeats = updatedScreen.tiers[tierIndex].seats;


    let remainingSeatsNeeded = tickets - selectedSeats.length;

    if (remainingSeatsNeeded <= 0) {
      setSelectedSeats([]);
      remainingSeatsNeeded = tickets;
      enableAllTiers();
    }

    const isSameTier = selectedSeats.every((seatId) => {
      const [selectedTierIndex] = seatId.split("-").map(Number);
      return selectedTierIndex === tierIndex;
    });

    if (!isSameTier && selectedSeats.length > 0) {
      if (selectedSeats.length == tickets) {
        enableAllTiers();
      } else {
        return;
      }
    }
    const newSelectedSeatIds = [];
//console.log(seatIndex)

    //if (seatIndex + remainingSeatsNeeded <= rowSeats.length) {
    let tempSeat = null;
    for (let i = 0; i < remainingSeatsNeeded; i++) {
      //console.log(seatIndex+i)
      if(rowSeats[seatIndex+i]==undefined) {
        //console.log("break the statement for :"+seatIndex+i)
        break;
      }
      const currentSeat = rowSeats[seatIndex + i];
      //  console.log("current seat :", currentSeat, "temp Seat :", tempSeat);
      if (tempSeat == null) {
        tempSeat = currentSeat.seatId.replace(/\D/g, "");
      }
      if (tempSeat > parseInt(currentSeat.seatId.replace(/\D/g, ""))) {
        break;
      }
      const isBlocked = show.blocked.includes(currentSeat.seatId);
      const isBooked = show.booked.includes(currentSeat.seatId);
      if (!isBlocked && !isBooked && currentSeat.status != "NO_SEAT") {
        const seatId = `${tierIndex}-${seatIndex + i}`;

        tempSeat = currentSeat.seatId.replace(/\D/g, "");
        // console.log("current seat :", currentSeat, "temp Seat :", tempSeat);
        newSelectedSeatIds.push(seatId);
      } else {
       
        break;
      }
    }
    //}

    setSelectedSeats((prevSelectedSeats) => {
      const updatedSeats = [
        ...new Set([...prevSelectedSeats, ...newSelectedSeatIds]),
      ];
      if (updatedSeats.length >= tickets) {
        enableAllTiers();
      }
      return updatedSeats.slice(0, tickets);
    });

    disableOtherTiers(tierIndex);
  };

  const disableOtherTiers = (selectedTierIndex) => {
    updatedScreen.tiers.forEach((tier, index) => {
      if (index !== selectedTierIndex) {
        tier.disabled = true;
      }
    });
    setUpdatedScreen((prevScreen) => ({
      ...prevScreen,
      tiers: [...prevScreen.tiers],
    }));
  };

  const enableAllTiers = () => {
    updatedScreen.tiers.forEach((tier) => {
      tier.disabled = false;
    });
    setUpdatedScreen((prevScreen) => ({
      ...prevScreen,
      tiers: [...prevScreen.tiers],
    }));
  };

  const layout = {
    left: "from-left",
    right: "from-right",
    center: "in-center",
  };

  const getSelectedSeatIds = () => {
    if (!updatedScreen) return [];

    return selectedSeats
      .map((seatId) => {
        const [tierIndex, seatIndex] = seatId.split("-").map(Number);
        const seat = updatedScreen?.tiers?.[tierIndex]?.seats?.[seatIndex];

        return seat?.seatId;
      })
      .filter(Boolean);
  };

  /* const getTierIdsBySelectedSeats = (selectedSeats) => {
    const tierIds = new Set();

    selectedSeats.forEach((seatId) => {
      const [tierIndex] = seatId.split("-").map(Number);
      console.log("tier Index ",tierIndex)
      const tier = updatedScreen.tiers[tierIndex];

      if (tier) {
        tierIds.add(tier.price);
      }
    });

    return Array.from(tierIds);
  }; */

  const getTierIdsBySelectedSeats = (selectedSeats) => {
  const seen = new Set();        // track tierIndex we've already added
  const result = [];

  for (const seatId of selectedSeats) {
    const [tierIndex] = seatId.split("-").map(Number);
    const tier = updatedScreen.tiers[tierIndex];
    if (!tier) continue;

    if (!seen.has(tierIndex)) {
      seen.add(tierIndex);
      result.push({ tierIndex, price: tier.price });
    }
  }
    
  return result;
};

// usage
const tierInfo = getTierIdsBySelectedSeats(selectedSeats);
// e.g. [{ tierIndex: 0, price: 100 }, { tierIndex: 1, price: 150 }]

  //const tierIds = getTierIdsBySelectedSeats(selectedSeats);

  useEffect(() => {
    seatIds = getSelectedSeatIds();
    setUserSeats((prev) => ({
      ...prev,
      seatsId: seatIds,
      price: tierInfo[0]?.price * seatIds.length,
      user: username,
      showId: show.id,
      tierName: updatedScreen?.tiers?.[tierInfo[0]?.tierIndex]?.tiername
    }));
  }, [selectedSeats, updatedScreen]);

  useEffect(() => {
    setSelectedSeats([]);
  }, [tickets]);

  if (!updatedScreen) {
    return <p>Loading screen data...</p>;
  }
  console.log(userSeats?.tierName)
 // console.log(selectedShow);
  const handleSeatStatus = (seat) => {
    if (show?.blocked.includes(seat.seatId)) return "BLOCKED";
    if (show?.booked.includes(seat.seatId)) return "BOOKED";
    if (seat.status == "NO_SEAT") return "NO_SEAT";
    return seat.status;
  };
  //showID,username,totalamount,seats
  const handleProceed = () => {
    // console.log(userSeats);
    Swal.fire({
      title: `Do you accept terms`,
      html: `<div class="text-[14px] poppins-light text-white text-start flex-wrap">${guidelines
        .map((g, i) => {
          return `<p>${i + 1}. ${g}</p>`;
        })
        .join("")}</div>`,
      width: "600px",
      background: "rgba(43, 43, 46, 0.845)",
      color: "white",
      showCancelButton: true,
      confirmButtonColor: "rgb(28, 188, 28, 0.941)",
      cancelButtonColor: "#d33",
      cancelButtonText: "Decline",
      confirmButtonText: "Proceed",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.post(
            `/bookings/lock-seats?showId=${show.id}`,
            userSeats
          );

          if (res.data) {
            console.log(res.data);
            navigate("/bookingReview", {
              state: { selectedData: userSeats, movie: movie },
            });
          } else {
            Swal.fire({
              title: "Try again with different Seats",
              text: "Something went wrong...",
              icon: "error",
            });
          }
        } catch (error) {
          console.error("Error adding show:", error);
          Swal.fire({
            title: "Seat Unavailable",
            text: "The seat you selected is currently locked by another user. Please choose a different seat.",
            icon: "error",
          });
        }
      }
    });
  };

  //console.log(selectedSeats)

  const navigateBack = () => {
    navigate("/all-shows", { state: { item: movie } });
  };
  return (
    <div className="gap-2 justify-center">
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box text-center text-white bg-opacity-85">
          <h3 className="font-bold text-lg mb-4 roboto-regular">
            Select Tickets
          </h3>
          {numberOfTickets.map((ticket) => (
            <button
              key={ticket}
              className={`py-1 rounded-md px-2 ml-3 bg-white text-black poppins-light text-md border-2 border-black`}
              onClick={() => {
                setTickets(ticket),
                  document.getElementById("my_modal_2").close();
              }}
            >
              {ticket}
            </button>
          ))}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      {/* nav */}

      {/* filters & shows */}
      <div className="flex text-white bg-gradient-to-br gap-x-2 from-black/90 via-transparent to-black/90 h-[18vh] w-[98%] poppins-regular rounded-lg mx-auto my-2 ring-2 ring-white/25">
        <IoIosArrowBack
          className="w-16 h-24 pt-8 cursor-pointer"
          onClick={navigateBack}
        />
        <div className="ring-2 ring-slate-600/60 w-3/5 m-2 rounded-md bg-gradient-to-tr from-tranparent via-slate-900 to-tranparent shadow-md shadow-slate-700">
          <div className="justify-between flex">
            <div className="mt-2 ml-16 poppins-extralight ">
              <span className="text-xl poppins-regular">
                {" "}
                {theatre[0].name}
              </span>{" "}
              {theatre[0].address}, {theatre[0].city}
            </div>
            <button
              onClick={() => document.getElementById("my_modal_2").showModal()}
              className="btn btn-sm bg-slate-600/50 mr-2 border-2 border-white/80 shadow-md shadow-white/30 rounded-3xl text-white hover:bg-white/80 hover:text-black text-md mt-2"
            >
              {" "}
              <MdOutlineEdit size={18} />
              {tickets} Tickets
            </button>
          </div>
          <div className="flex-wrap w-[80%] space-x-2 mt-1 mx-12">
            {theatre[0].shows
              .filter((s) => s.mid == movie.id && s.showDate == selectedDate)
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleChangeShow(s)}
                  className={` text-center w-1/6 rounded-md py-1 poppins-regular ${
                    s.id == show.id
                      ? `show-${s.status} curr-show shadow-md `
                      : `show-${s.status}`
                  }`}
                >
                  {s.start}
                  {/*  <span className="text-[10px] ml-2 text-gray-400/80">
                    {s.status}
                  </span> */}
                </button>
              ))}
          </div>
        </div>
        <div className="ring-2 ring-slate-600/60 w-2/5 m-2 rounded-md bg-gradient-to-tr from-tranparent via-slate-900 to-transparent shadow-md shadow-slate-700/60">
          <div className="flex gap-x-8 ml-5">
            {" "}
            <h2 className="text-center roboto-light text-3xl mt-4">
              {show.title}
            </h2>
            <div className="justify-center gap-x-8 flex mt-6 ml-6">
              {" "}
              <p className="text-center badge  badge-outline text-white/80 w-16 h-6 roboto-bold">
                {movie.certification == "CERTIFICATION_UA"
                  ? "U/A"
                  : movie.certification.substring(14)}
              </p>
              <p className="bg-gray-500 text-white/95 badge badge-lg">
                {movie.runtime} Minutes
              </p>
            </div>
          </div>
          <p className="poppins-light text-center mt-6">
            Show starts at{" "}
            <span className="roboto-bold">
              {show.start}&nbsp;
              {show.start.substring(0, 2) > 11 &&
              show.start.substring(0, 2) <= 23
                ? `PM`
                : `AM`}
            </span>
          </p>
        </div>
      </div>
      {/* Seats Section */}
      {!loading ? (
        <div className=" text-white bg-gradient-to-b from-black/90 via-slate-900 to-black/90 h-[100vh] w-[100%] poppins-regular overflow-y-scroll overflow-x-auto ring-2 ring-white/25">
          {updatedScreen.tiers.map((tier, index) => {
            return (
              <div key={index} className={`mt-4 ${layout.center} z-90`}>
                <h2>
                  {tier.tiername} (₹{tier.price})
                </h2>
                <hr className="border-gray-600 border-double" />
                <div id="seatArr" className="mb-8">
                  {tier.seats.map((seat, seatIndex) => {
                    const isFirstInRow = seatIndex % tier.columns === 0;
                    const isLastInRow = (seatIndex + 1) % tier.columns === 0;
                    const seatId = `${index}-${seatIndex}`;
                    const isSelected = selectedSeats.includes(seatId);
                    const seatStatus = handleSeatStatus(seat);
                    
                    return (
                      <React.Fragment key={seatId}>
                        {isFirstInRow && (
                          <span className="text-sm font-semibold mr-2 z-30">
                            {alphabet[curIdx++]}
                          </span>
                        )}
                        <button
                          onClick={() => handleSeatClick(index, seatIndex)}
                          disabled={
                            seatStatus == "BLOCKED" ||
                            seatStatus == "BOOKED" ||
                            seatStatus == "NO_SEAT" ||
                            updatedScreen.tiers[index]?.disabled
                          }
                          className={`seat ${seatStatus} ${
                            seatStatus == "BOOKED" || seatStatus == "BLOCKED"
                              ? `tooltip-top tooltip tooltip-error`
                              : ``
                          } text-sm cursor-pointer z-30 relative ${
                            isSelected ? "selected-seat" : ""
                          }`}
                          data-tip="Seat is booked"
                        >
                          {seat.seatId.replace(/\D/g, "")}
                        </button>
                        {isLastInRow && <br />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="">
            {" "}
            <h1 className=" roboto-regular text-center text-lg">SCREEN HERE</h1>
            <div className="relative bg-fuchsia-300">
              <div className="mx-auto w-[60%] absolute left-[31%]">
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
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className=" text-white bg-gradient-to-b from-black/90 via-slate-900 to-black/90 h-[100vh] w-[100%] poppins-regular overflow-y-scroll overflow-x-auto ring-2 ring-white/25">
          {updatedScreen.tiers.map((tier, index) => {
            return (
              <div key={index} className={`mt-4 ${layout.center} z-90`}>
                <h2 className="skeleton w-[16vh] h-[3vh] ml-[92vh]"></h2>
                <hr className="border-gray-600 border-double" />
                <div id="seatArr" className="mb-8">
                  {tier.seats.map((seat, seatIndex) => {
                    const isFirstInRow = seatIndex % tier.columns === 0;
                    const isLastInRow = (seatIndex + 1) % tier.columns === 0;
                    const seatId = `${index}-${seatIndex}`;
                    /* const isSelected = selectedSeats.includes(seatId);
                    const seatStatus = handleSeatStatus(seat);
 */
                    return (
                      <React.Fragment key={seatId}>
                        {isFirstInRow && (
                          <span className="text-sm font-semibold mr-2 z-30 ">
                            {/* {alphabet[curIdx++]} */}
                          </span>
                        )}
                        <button
                          className={`seat skeleton text-sm bg-slate-600 cursor-pointer z-30 relative`}
                        ></button>
                        {isLastInRow && <br />}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="">
            {" "}
            <h1 className=" roboto-regular text-center text-lg">SCREEN HERE</h1>
            <div className="relative bg-fuchsia-300">
              <div className="mx-auto w-[60%] absolute left-[31%]">
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
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedSeats.length == tickets && (
        <div className="w-full h-[11vh] bg-black/70 sticky bottom-0 z-50 text-center">
          <button
            onClick={handleProceed}
            className=" absolute py-2 mt-2 rounded-lg px-32 -ml-36 poppins-regular text-white text-lg bg-gradient-to-tr from-green-600 via-green-600 to-green-600"
          >
            Pay Rs. {userSeats.price * userSeats.seatsId.length}
          </button>
        </div>
      )}
    </div>
  );
};

export default BookSeats;

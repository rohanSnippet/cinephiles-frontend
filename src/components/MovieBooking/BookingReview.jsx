import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { cashfree } from "../Services/cashfree";
import Swal from "sweetalert2";

const BookingReview = ({ fallback = "/all-shows" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [bookingData, setBookingData] = useState(() => {
    if (location.state?.selectedData) {
      let data = {
        selectedData: location.state.selectedData,
        movie: location.state.movie,
        updatedScreen: location.state.updatedScreen,
        selectedDate: location.state.selectedDate,
        selectedShow: location.state.selectedShow,
      };
      sessionStorage.getItem("bookingData", JSON.stringify(data))
      return data;
    } else {
      const cached = sessionStorage.getItem("bookingData");
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    }
  });

  const { selectedData, movie, selectedShow, selectedDate, updatedScreen } =
    bookingData || {};

  const baseAmt = selectedData?.price || 0;
  const taxes = {
    cgst: baseAmt * 0.09,
    sgst: baseAmt * 0.09,
  };

  const [time, setTime] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false); // State for mobile snacks bar

  const pushedRef = useRef(false);
  const isAlertOpen = useRef(false);
  const unlockCalled = useRef(false);

  const fallbackPath = location.state?.from ?? fallback;

  const unlockSeats = useCallback(async () => {
    if (unlockCalled.current || !selectedData) {
      return;
    }
    unlockCalled.current = true;

    try {
      const response = await axiosSecure.delete(
        `/bookings/unlock-seats?showId=${selectedData.showId}&user=${selectedData.user}`
      );
      const ok = response.data === "Seats unlocked using unlock seats....";

      if (ok) {
        Swal.fire({
          icon: "info",
          title: "Session Expired!",
          text: "Your booking session has expired. The selected seats have been released.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          sessionStorage.removeItem("bookingData");
          navigate(fallbackPath, { replace: true, state: { item: movie } });
        });
      } else {
        console.warn("Unlock seats response not 'ok':", response.data);
        Swal.fire({
          icon: "warning",
          title: "Booking Interrupted!",
          text: "Your booking could not be completed. Please try again.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          sessionStorage.removeItem("bookingData");
          navigate(fallbackPath, { replace: true, state: { item: movie } });
        });
      }
    } catch (error) {
      console.error("Unlock seats failed:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Could not release seats. Please check your network.",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        sessionStorage.removeItem("bookingData");
        navigate(fallbackPath, { replace: true, state: { item: movie } });
      });
    }
  }, [selectedData, axiosSecure, navigate, fallbackPath, movie]);

  useEffect(() => {
    if (!pushedRef.current) {
      window.history.pushState(null, "", window.location.href);
      pushedRef.current = true;
    }

    const handlePopState = (event) => {
      if (isAlertOpen.current) {
        window.history.pushState(null, "", window.location.href);
        return;
      }

      isAlertOpen.current = true;
      Swal.fire({
        title: "Cancel Booking?",
        text: "Going back will cancel your current transaction and release the selected seats. Do you want to continue?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel and leave",
        cancelButtonText: "No, stay here",
        confirmButtonColor: "#EF4444",
        cancelButtonColor: "#3085de",
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        preConfirm: async () => {
          try {
            const response = await axiosSecure.delete(
              `/bookings/unlock-seats?showId=${selectedData.showId}&user=${selectedData.user}`
            );
            if (response.data !== "Seats unlocked using unlock seats....") {
              throw new Error("Server declined seat unlock.");
            }
            sessionStorage.removeItem("bookingData");
            return true;
          } catch (err) {
            Swal.showValidationMessage(`Action failed: ${err.message}`);
            return false;
          }
        },
      }).then((result) => {
        isAlertOpen.current = false;

        if (result.isConfirmed && result.value) {
          window.removeEventListener("popstate", handlePopState);
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate(fallbackPath, { replace: true, state: { item: movie } });
          }
        } else {
          window.history.pushState(null, "", window.location.href);
        }
      });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, fallbackPath, axiosSecure, selectedData, movie]);

  useEffect(() => {
    if (!selectedData) return;

    sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

    const fetchRemainingTime = async () => {
      try {
        const response = await axiosSecure.get(
          `/bookings/remaining-time?showId=${selectedData.showId}&user=${selectedData.user}`
        );
        setTime(response.data);
      } catch (error) {
        console.error("Error fetching remaining time:", error);
        unlockSeats();
      }
    };

    fetchRemainingTime();

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev > 0) return prev - 1;
        clearInterval(interval);
        if (!unlockCalled.current) {
          unlockSeats();
        }
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedData, axiosSecure, bookingData, unlockSeats]);

 /*  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedData && !unlockCalled.current) {
        const payload = JSON.stringify({
          showId: selectedData.showId,
          user: selectedData.user,
        });
        navigator.sendBeacon(
          `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/bookings/unlock-seats-beacon`,
          payload
        );
        //sessionStorage.removeItem("bookingData");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedData]); */

  useEffect(() => {
    /* if (!selectedData) {
      navigate(fallbackPath, { state:{item:movie},replace: true });
    } */
    if (bookingData === null) {
    navigate(fallbackPath, { state: { item: movie }, replace: true });
  }
  }, [selectedData, navigate, fallbackPath]);

  const handleBack = async () => {
    if (!selectedData) {
      navigate(fallbackPath, { replace: true, state: { item: movie } });
      return;
    }

    const result = await Swal.fire({
      title: "Cancel Booking?",
      text: "Going back will cancel your booking and release the seats. Continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel and go back",
      cancelButtonText: "No, stay here",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#3085de",
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: () =>
        axiosSecure.delete(`/bookings/unlock-seats?showId=${selectedData.showId}&user=${selectedData.user}`)
          .then((response) => {
            if (response.data !== "Seats unlocked using unlock seats....") {
              throw new Error("Seat unlock failed");
            }
            return true;
          })
          .catch((err) => {
            Swal.showValidationMessage(`Unlock failed: ${err.message}`);
            throw err;
          }),
    });

    console.log(result)

    if (result.isConfirmed) {
      console.log(window.history.length)
      
      if (window.history.length > 1) {
        console.log("navigate -1 called")
        navigate(-1);
      } else {
        navigate(fallbackPath, { replace: true, state: { item: movie } });
      }
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { minutes, secs };
  };
  const { minutes, secs } = formatTime(time);

  if (
    !selectedData ||
    !movie ||
    !selectedShow ||
    !selectedDate ||
    !updatedScreen
  ) {
    return null;
  }

  const handlePayNow = async () => {
    setIsPaying(true);

    try {
      const totalAmount = baseAmt + taxes.cgst + taxes.sgst;
      const payload = {
        username: selectedData.user,
        amount: totalAmount,
        showId: selectedData.showId,
        seatsIds: selectedData.seatsId,
        tierName: selectedData.tierName,
        cgst: taxes.cgst,
        sgst: taxes.sgst,
      };

      const { data } = await axiosSecure.post(
        "/api/payment/create-order",
        payload
      );

      cashfree
        .checkout({
          paymentSessionId: data.paymentSessionId,
          returnUrl:
            data.returnUrl ??
            `${
              import.meta.env.VITE_APP_BASE_URL
            }/booking-confirmation?orderId=${encodeURIComponent(data.orderId)}`,
        })
        .then((result) => {
          if (result.error) {
            console.error("Cashfree checkout error:", result.error);
            Swal.fire({
              icon: "error",
              title: "Payment Failed",
              text: result.error.message || "An error occurred during payment.",
              confirmButtonColor: "#EF4444",
            });
            setIsPaying(false);
          }
        })
        .catch((err) => {
          console.error("Cashfree Promise Rejection:", err);
          Swal.fire({
            icon: "error",
            title: "Payment Initialization Error",
            text: "Could not start payment process. Please try again.",
            confirmButtonColor: "#EF4444",
          });
          setIsPaying(false);
        });
    } catch (err) {
      console.error("Failed to initiate payment:", err);
      Swal.fire({
        icon: "error",
        title: "Payment Error",
        text: "Failed to create payment order. Please try again.",
        confirmButtonColor: "#EF4444",
      });
      setIsPaying(false);
    }
  };

  const snacks = [
    { name: "Crispy Popcorn", price: 200, emoji: "🍿", bgColor: "bg-orange-600" },
    { name: "Spicy Samosas (2 Pcs)", price: 120, emoji: "🥟", bgColor: "bg-red-600" },
    { name: "Veg Sandwich", price: 150, emoji: "🥪", bgColor: "bg-green-600" },
    { name: "Soft Drink (Large)", price: 90, emoji: "🥤", bgColor: "bg-blue-600" },
  ];

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      <div className="fixed top-4 left-4 z-50">
      <button
        onClick={handleBack}
        className="flex items-center text-white bg-slate-700 hover:bg-slate-600 transition rounded-full px-3 py-1 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="hidden sm:inline">Back</span>
      </button>
    </div>

      {/* Mobile Snack Bar Toggle Button */}
      <div className="md:hidden w-full bg-slate-800 p-3 text-center">
        <button
          className="btn btn-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          onClick={() => setIsSnackbarOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          Grab Snacks!
        </button>
      </div>

      {/* Left Side - Snacks (Desktop) */}
      <div className="hidden md:block md:w-3/5 lg:w-2/4 overflow-y-auto min-h-screen bg-slate-900 shadow-xl">
         
        <div className="bg-gradient-to-br from-fuchsia-900 to-purple-800 text-white p-6 h-1/5 flex items-center justify-center text-3xl font-bold poppins-bold">
        Delicious Treats Await!
        </div>
        <div className="p-6 h-4/5">
          <h3 className="text-2xl font-semibold text-white mb-6 poppins-medium">
            Choose Your Snacks:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snacks.map((snack, index) => (
              <div
                key={index}
                className={`relative ${snack.bgColor} rounded-lg p-4 shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl`}
              >
                <div className="text-5xl mb-2">{snack.emoji}</div>
                <h4 className="text-xl font-bold text-white poppins-semibold">
                  {snack.name}
                </h4>
                <p className="text-white text-lg poppins-regular mt-1">
                  &#x20B9; {snack.price.toFixed(2)}
                </p>
                <button className="absolute bottom-3 right-3 bg-white text-slate-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg hover:bg-gray-200 transition-colors">
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Snacks Sidebar (Bottom Sheet) */}
      <div
        className={`fixed inset-x-0 bottom-0 bg-slate-900 transform transition-transform duration-300 ease-in-out z-50 md:hidden p-4 rounded-t-2xl shadow-lg
        ${isSnackbarOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-white poppins-medium">
            Snacks & Beverages
          </h3>
          <button
            className="text-white text-3xl font-bold"
            onClick={() => setIsSnackbarOpen(false)}
          >
            &times;
          </button>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto pb-4">
          {snacks.map((snack, index) => (
            <div
              key={index}
              className={`flex items-center justify-between ${snack.bgColor} rounded-lg p-3 shadow-md`}
            >
              <div className="flex items-center">
                <span className="text-4xl mr-3">{snack.emoji}</span>
                <div>
                  <h4 className="text-lg font-bold text-white poppins-semibold">
                    {snack.name}
                  </h4>
                  <p className="text-white text-md poppins-regular">
                    &#x20B9; {snack.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <button className="bg-white text-slate-800 rounded-full w-7 h-7 flex items-center justify-center font-bold text-lg hover:bg-gray-200 transition-colors">
                +
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 p-2 bg-slate-800 rounded-lg text-center">
          <button
            className="btn w-full bg-blue-600 text-white border-none hover:bg-blue-700"
            onClick={() => setIsSnackbarOpen(false)}
          >
            Continue
          </button>
        </div>
      </div>

      {/* Right Side - Movie Details */}
      <div className="flex-1 md:w-2/5 lg:w-1/4 bg-gradient-to-br from-slate-800 to-slate-900 text-white min-h-screen px-6 py-2 shadow-xl relative">
        <div className="bg-slate-800/90 rounded-xl p-6 space-y-6 shadow-2xl backdrop-blur-sm backdrop-filter border border-slate-700">
          {/* Timer Section */}
          <div className="text-center bg-slate-700/60 rounded-lg py-2 px-3 mb-2 shadow-inner">
            <p className="text-lg poppins-regular mb-2 text-slate-300">
              You have
            </p>
            <div className="flex justify-center items-center gap-4">
              <div
                className={`flex flex-col items-center ${
                  minutes < 1 ? `text-red-400` : `text-green-400`
                }`}
              >
                <span className="countdown font-mono font-bold text-3xl">
                  <span style={{ "--value": minutes % 60 }}></span>
                </span>
                <span className="poppins-medium text-lg">min</span>
              </div>
              <span
                className={`font-mono font-bold text-3xl ${
                  minutes < 1 ? `text-red-400` : `text-green-400`
                }`}
              >
                :
              </span>
              <div
                className={`flex flex-col items-center ${
                  minutes < 1 ? `text-red-400` : `text-green-400`
                }`}
              >
                <span className="countdown font-mono font-bold text-3xl">
                  <span style={{ "--value": secs }}></span>
                </span>
                <span className="poppins-medium text-lg">sec</span>
              </div>
            </div>
            <p className="text-lg poppins-regular mt-2 text-slate-300">
              to book your show
            </p>
          </div>

          {/* Movie Info Section */}
          <div className="rounded-lg shadow-xl bg-slate-700/40 px-5 py-2 border border-slate-600">
            <h3 className="text-2xl font-bold mb-4 text-green-300 poppins-bold">
              Booking Summary
            </h3>
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-5">
              {/* Poster */}
              <div className="w-full sm:w-1/2 lg:w-full xl:w-1/2 flex-shrink-0">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-auto rounded-lg object-cover shadow-xl max-w-xs mx-auto sm:max-w-none md:max-w-[180px] lg:max-w-[220px] xl:max-w-[180px]"
                />
              </div>

              {/* Details */}
              <div className="w-full sm:w-1/2 lg:w-full xl:w-1/2 text-white poppins-regular text-center sm:text-left">
                <h2 className="font-bold text-xl md:text-2xl lg:text-2xl mb-3 text-white poppins-semibold">
                  {movie.title}
                </h2>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm md:text-base">
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-gray-400">Certification</p>
                    <span className="badge badge-lg bg-white text-slate-800 font-semibold px-3 py-1 rounded-full">
                      {movie.certification === "CERTIFICATION_UA"
                        ? "U/A"
                        : movie.certification.substring(14)}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-gray-400">Show Time</p>
                    <p className="text-lg font-semibold">
                      {selectedShow?.start}&nbsp;
                      {selectedShow?.start.substring(0, 2) > 11 &&
                      selectedShow?.start.substring(0, 2) <= 23
                        ? `PM`
                        : `AM`}
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-gray-400">Date</p>
                    <p className="text-lg font-semibold">{selectedDate}</p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-gray-400">Format</p>
                    <p className="text-lg font-semibold">{movie.formats}</p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-gray-400">Screen</p>
                    <p className="text-lg font-semibold">
                      {updatedScreen.sname}
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-gray-400">Duration</p>
                    <p className="text-lg font-semibold">
                      {movie.runtime} Mins
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-gray-400">Seats ({selectedData.seatsId.length})</p>
                    <p className="text-lg font-semibold break-words">
                      {selectedData.seatsId.map((seat, index) => (
                        <span key={index}>
                          {seat}
                          {index < selectedData.seatsId.length - 1 && ", "}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fare Breakdown Accordion */}
          <div className="bg-slate-700/60 rounded-xl overflow-hidden shadow-xl border border-slate-600">
            <details className="group">
              <summary className="flex justify-between items-center p-4 cursor-pointer border-b border-slate-600/50">
                <span className="poppins-bold text-2xl text-green-400">
                  Pay &#x20B9; {(baseAmt + taxes.sgst + taxes.cgst).toFixed(2)}
                </span>
                <span className="poppins-light text-sm ml-auto mr-2 text-slate-300 hidden sm:block">
                  View fare breakup
                </span>
                <svg
                  className="w-6 h-6 transition-transform duration-300 group-open:rotate-180 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>

              <div className="p-4 bg-slate-700/40">
                <div className="grid grid-cols-2 gap-y-2 poppins-regular text-md">
                  <div className="text-gray-300">Base Amount:</div>
                  <div className="text-right">
                    &#x20B9; {baseAmt.toFixed(2)}
                  </div>

                  <div className="text-gray-300">SGST (9%):</div>
                  <div className="text-right">
                    &#x20B9; {taxes.sgst.toFixed(2)}
                  </div>

                  <div className="text-gray-300">CGST (9%):</div>
                  <div className="text-right">
                    &#x20B9; {taxes.cgst.toFixed(2)}
                  </div>

                  <div className="col-span-2 border-t border-slate-600 pt-3 mt-3">
                    <div className="flex justify-between font-bold text-xl text-green-300">
                      <span>Total:</span>
                      <span>
                        &#x20B9; {(baseAmt + taxes.sgst + taxes.cgst).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div className="text-center mt-6">
            <button
              className="btn w-full py-3 text-lg font-bold bg-green-600 rounded-lg text-white border-none hover:bg-green-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50"
              onClick={handlePayNow}
              disabled={isPaying || time <= 0}
            >
              {isPaying ? "Processing..." : "Book Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;
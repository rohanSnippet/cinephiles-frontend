import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { cashfree } from "../Services/cashfree";
import Swal from "sweetalert2";

const BookingReview = ({ fallback = "/all-shows" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // const { selectedData, movie } = location.state || {};
  const axiosSecure = useAxiosSecure();
  let selectedData, movie, selectedShow, selectedDate, updatedScreen, seatsLen;

  if (
    location.state?.selectedData &&
    location.state?.updatedScreen &&
    location.state?.movie &&
    location.state?.selectedShow &&
    location.state?.selectedDate
  ) {
    selectedData = location.state.selectedData;
    movie = location.state.movie;
    updatedScreen = location.state.updatedScreen;
    selectedDate = location.state.selectedDate;
    selectedShow = location.state.selectedShow;
    seatsLen = updatedScreen?.seatsId?.length - 1 || 0;
  } else {
    const cached = sessionStorage.getItem("bookingData");
    if (cached) {
      const parsed = JSON.parse(cached);
      selectedData = parsed.selectedData;
      movie = parsed.movie;
    }
  }
  console.log(location.state);
  const [time, setTime] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [bookingDetails] = useState({ selectedData, movie });
  const [baseAmt] = useState(
    selectedData?.price * selectedData?.seatsId.length || 0
  );
  const [taxes, setTaxes] = useState({
    cgst: baseAmt * 0.09,
    sgst: baseAmt * 0.09,
  });

  const pushedRef = useRef(false);
  const isAlertOpen = useRef(false);
  const fallbackPath = location.state?.from ?? fallback;
  const unlockCalled = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      if (isAlertOpen.current) {
        window.history.pushState(null, "", window.location.href);
        return;
      }

      isAlertOpen.current = true;

      Swal.fire({
        title: "Are you sure?",
        text: "Going back will cancel your current transaction. Do you want to continue?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel transaction",
        cancelButtonText: "Stay here",
        confirmButtonColor: "#3085de",
        cancelButtonColor: "#d33",
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        preConfirm: async () => {
          try {
            const response = await axiosSecure.delete(
              `/bookings/unlock-seats?showId=${selectedData.showId}&user=${selectedData.user}`
            );
            const ok =
              response.data === "Seats unlocked using unlock seats....";
            if (!ok) throw new Error("Server declined unlock.");
            return true;
          } catch (err) {
            Swal.showValidationMessage(`Can't leave yet: ${err.message}`);
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

    if (!pushedRef.current) {
      window.history.pushState(null, "", window.location.href);
      pushedRef.current = true;
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate, fallbackPath, axiosSecure]);

  const unlockSeats = async () => {
    try {
      const response = await axiosSecure.delete(
        `/bookings/unlock-seats?showId=${selectedData.showId}&user=${selectedData.user}`
      );
      const ok = response.data === "Seats unlocked using unlock seats....";
      console.log(response);

      if (ok) {
        // navigate("/all-shows", { state: { item: movie } });
      } else {
        //  navigate("/");
      }
    } catch (error) {
      console.error("Unlock seats failed:", error);
      // navigate("/");
    }
  };

  useEffect(() => {
    if (bookingDetails) {
      sessionStorage.setItem("bookingData", JSON.stringify(bookingDetails));
    }

    const fetchRemainingTime = async () => {
      if (!selectedData) return;
      try {
        const response = await axiosSecure.get(
          `/bookings/remaining-time?showId=${selectedData.showId}&user=${selectedData.user}`
        );
        setTime(response.data);
      } catch (error) {
        console.error("Error fetching remaining time:", error);
      }
    };

    fetchRemainingTime();

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev > 0) return prev - 1;
        clearInterval(interval);
        unlockSeats();
        //  navigate("/all-shows",{state:{item:movie}})
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedData, axiosSecure, baseAmt]);

  useEffect(() => {
    const handleUnload = () => {
      unlockSeats(true); // use sendBeacon
    };

    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { minutes, secs };
  };
  const { minutes, secs } = formatTime(time);

  if (!selectedData) {
    navigate(`/all-shows`, { state: { item: movie } });
    return null;
  }

  const handlePayNow = async () => {
    if (!selectedData) return;
    setIsPaying(true);

    try {
      const totalAmount = selectedData.price * selectedData.seatsId.length;
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
      const checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        returnUrl:
          data.returnUrl ??
          `${
            import.meta.env.VITE_APP_BASE_URL
          }/booking-confirmation?orderId=${encodeURIComponent(data.orderId)}`,
      };

      cashfree.checkout(checkoutOptions).then((result) => {
        if (result.error) {
          console.error("Cashfree checkout error:", result.error);
          setIsPaying(false);
        }
      });
    } catch (err) {
      console.error("Failed to initiate payment:", err);
      setIsPaying(false);
    }
  };

  return (
    <div className="flex w-[100%] h-screen">
      {/* Left Side - Snacks */}
      <div className="sm:w-3/5 md:2/4 overflow-y-auto h-[100vh] w-0">
        <div className="bg-fuchsia-800 h-1/5">Snacks Banner</div>
        <div className="bg-stone-500 h-4/5">Snacks</div>
      </div>
      {/* Right Side -  Movie Details */}
      <div className="relative sm:w-2/5 md:2/4 w-full bg-gradient-to-tr from-slate-800 to-slate-700 h-full overflow-y-scroll overflow-x-hidden">
        <div className="px-2 bg-gradient-to-tr from-base-100/90 via-base-100/90 to-slate-800/90 max-h-max py-3 mx-4 my-1 space-y-2 rounded-sm w-[95%]">
          <div
            className={`grid grid-flow-col gap-5 ml-5 auto-cols-max text-start`}
          > <span className="text-xl text-white poppins-regular mt-3 ">You have</span>
            <div className={`flex flex-col ${
              minutes < 4 ? `text-red-500` : `text-white`
            }`}>
              <span className="countdown font-mono font-semibold text-3xl ">
                <span style={{ "--value": minutes % 60 }}></span>
              </span>
              <span className="poppins-medium ">min</span>
            </div>
            <div className={`flex flex-col ${
              minutes < 4 ? `text-red-500` : `text-white`
            }`}>
              <span className="countdown font-mono font-semibold text-3xl">
                <span style={{ "--value": secs }}></span>
              </span>
              <span className="poppins-medium ">sec</span>
            </div>
            <div className="text-xl text-white poppins-regular mt-3 ">to book your show</div>
          </div>
          {/* Movie Posters  */}
          <div className="p-4 rounded-lg shadow-md">
            {/* Movie Info Section */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Poster */}
              <div className="md:w-1/2">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-auto rounded-md object-cover shadow-md"
                />
              </div>

              {/* Details */}
              <div className="md:w-1/2 bg-gray-900 p-4 rounded-md text-white poppins-regular">
                <h2 className="font-bold text-xl md:text-2xl lg:text-3xl mb-2">
                  {movie.title}
                </h2>

                <div className="grid grid-cols-2 gap-2 text-sm md:text-base">
                  <div>
                    {/* <p className="text-gray-400">Certification</p> */}
                    <p className="badge badge-ghost text-lg bg-white text-slate-800">
                      {movie.certification === "CERTIFICATION_UA"
                        ? "U/A"
                        : movie.certification.substring(14)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Show Time</p>
                    <p>
                      {selectedShow?.start}&nbsp;
                      {selectedShow?.start.substring(0, 2) > 11 &&
                      selectedShow?.start.substring(0, 2) <= 23
                        ? `PM`
                        : `AM`}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Date</p>
                    <p>{selectedDate}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Format</p>
                    <p>{movie.formats}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Screen</p>
                    <p>{updatedScreen.sname}</p>
                  </div>

                  <div>
                    <p className="text-gray-400">Duration</p>
                    <p>{movie.runtime} Minutes</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-gray-400">Seats</p>
                    <p>
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

            {/* Fare Breakdown Accordion */}
            <div className="mt-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-md overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center p-3 cursor-pointer border-b-2 border-white/30">
                  <span className="poppins-bold text-xl text-green-400/70">
                    Pay &#x20B9; {baseAmt + taxes.sgst + taxes.cgst}
                  </span>
                  <span className="poppins-light text-sm ml-40">View fare breakup</span>
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-open:rotate-180"
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

                <div className="p-3 bg-gradient-to-r from-slate-800 to-slate-700">
                  <div className="grid grid-cols-2 gap-2 poppins-regular text-md">
                    <div>
                      <p className="text-gray-200">Base Amount:</p>
                    </div>
                    <div>
                      <p>Rs. {baseAmt}</p>
                    </div>

                    <div>
                      <p className="text-gray-200">SGST:</p>
                    </div>
                    <div>
                      <p>Rs. {taxes.sgst}</p>
                    </div>

                    <div>
                      <p className="text-gray-200">CGST:</p>
                    </div>
                    <div>
                      <p>Rs. {taxes.cgst}</p>
                    </div>

                    <div className="col-span-2 border-t border-white/40 pt-2 mt-1">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>Rs. {baseAmt + taxes.sgst + taxes.cgst}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
          <div className="text-center">
            <button
              className="btn bg-green-600 rounded-md text-white"
              onClick={handlePayNow}
              disabled={isPaying}
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

import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { cashfree } from "../Services/cashfree";
import Swal from "sweetalert2";

const BookingReview = ({ fallback = "/all-shows" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedData, movie } = location.state || {};
  const axiosSecure = useAxiosSecure();
  const [time, setTime] = useState(0);
  const [item, setItem] = useState(movie);
  const [isPaying, setIsPaying] = useState(false);
  const [bookingDetails, seatBookingDetails] = useState({
    selectedData: selectedData,
    movie: movie,
  });
  const [baseAmt, setBaseAmt] = useState(
    selectedData?.price * selectedData?.seatsId.length || 0
  );
  const [taxes, setTaxes] = useState({
    cgst: baseAmt * 0.09,
    sgst: baseAmt * 0.09,
  });
  const pushedRef = useRef(false);
  const isAlertOpen = useRef(false);
  const fallbackPath = location.state?.from ?? fallback;

  // ******** Unlock Seats *********
  const unlockSeats = async () => {
    if (!selectedData) return;
    try {
      console.log("Unlock seats called...")
      const response = await axiosSecure.delete(
        `/bookings/unlock-seats?showId=${selectedData.showId}&user=${selectedData.user}`
      );
      const ok = response.data === "Seats unlocked using unlock seats....";
      if (!ok) throw new Error("Server declined unlock.");
      else navigate('/all-shows', {state:{item}})
    } catch (error) {
      console.error("Error unlocking seats:", error);
    }
  };

  // ******** For timeout *****************
  useEffect(() => {
    if (bookingDetails) {
      sessionStorage.setItem("bookingData", JSON.stringify(bookingDetails));
    }
    setTaxes({
      cgst: baseAmt * 0.09,
      sgst: baseAmt * 0.09,
    });

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
      setTime((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(interval);
          unlockSeats();
         // navigate("/all-shows", { state: { item } });
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedData, axiosSecure, baseAmt]);

  // *********** back navigation logic
  useEffect(() => {
    const handlePopState = () => {
      if (isAlertOpen.current) {
        // Prevent going back while alert is open
        window.history.pushState({ guard: true }, "", window.location.href);
        return;
      }

      isAlertOpen.current = true; // Mark alert as active

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
        allowOutsideClick: false, // Prevent dismissing by clicking outside
        preConfirm: async () => {
          try {
            //  const { data } = await axiosSecure.get("/bookings/unlock");
            const response = await axiosSecure.delete(
              `/bookings/unlock-seats?showId=${selectedData.showId}&user=${selectedData.user}`
            );
            const ok =
              response.data === "Seats unlocked using unlock seats....";
            if (!ok) throw new Error("Server declined unlock.");
            return true;
          } catch (err) {
            Swal.showValidationMessage(
              `Can't leave yet: ${err.message || "request failed"}`
            );
            return false;
          }
        },
      }).then((result) => {
        isAlertOpen.current = false; // Alert closed

        if (result.isConfirmed && result.value) {
          window.removeEventListener("popstate", handlePopState);

          if (window.history.length > 1) {
            navigate("/all-shows", { state: { item } });
          } else {
            navigate(fallbackPath, { replace: true, state: { item } });
          }
        } else {
          // Re-arm back trap
          window.history.pushState({ guard: true }, "", window.location.href);
        }
      });
    };

    if (!pushedRef.current) {
      window.history.pushState({ guard: true }, "", window.location.href);
      pushedRef.current = true;
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate, fallbackPath, axiosSecure]);

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

  // ******** Handle Payment ********
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
      console.table(data);
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
          return;
        }
        if (result.redirect) {
          console.log("Redirecting to Cashfree checkout…");
        }
      });
    } catch (err) {
      console.error("Failed to initiate payment:", err);
      setIsPaying(false);
    }
  };

  return (
    <div className="flex w-[100%] h-screen">
      <div className="w-3/5 overflow-y-auto h-[100vh]">
        <div className="bg-fuchsia-800 h-1/5">Snacks Banner</div>
        <div className="bg-stone-500 h-4/5">Snacks</div>
      </div>
      <div className="relative w-2/5 bg-gradient-to-tr from-stone-400 via-amber-50 to-orange-100/80 h-full overflow-y-scroll overflow-x-hidden">
        <div className="px-6 bg-gradient-to-tr from-base-100/90 via-base-100/90 to-slate-800/90 max-h-max py-3 mx-4 my-1 space-y-2 rounded-sm w-[95%]">
          <div
            className={`grid grid-flow-col gap-5 ${
              minutes < 4 ? `text-red-500` : `text-white`
            } auto-cols-max text-start`}
          >
            <div className="flex flex-col">
              <span className="countdown font-mono text-3xl">
                <span style={{ "--value": minutes % 60 }}></span>
              </span>
              Min
            </div>
            <div className="flex flex-col">
              <span className="countdown font-mono text-3xl">
                <span style={{ "--value": secs }}></span>
              </span>
              Sec
            </div>
          </div>
          <div className="mx-2 justify-between p-2 flex bg-green-500 space-x-2">
            <div className="bg-indigo-700 w-1/2">Hello</div>
            <div className="bg-red-600 w-1/2">hello</div>
          </div>
          <div className="bg-blue-600">
            {" "}
            Pay Rs. {baseAmt + taxes.sgst + taxes.cgst}
          </div>
          <div className="text-center">
            <button
              className="btn bg-green rounded-md text-white"
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

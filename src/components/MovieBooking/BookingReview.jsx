import { useEffect, useState, useRef } from "react";
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
  const [isPaying, setIsPaying] = useState(false);
  const [bookingDetails] = useState({ selectedData, movie });
  const [baseAmt] = useState(selectedData?.price * selectedData?.seatsId.length || 0);
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
    // Prevent duplicate modals
    if (isAlertOpen.current) {
      window.history.pushState(null, '', window.location.href);
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
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          const response = await axiosSecure.delete(
            `/bookings/unlock-seats?showId=${selectedData.showId}&user=${selectedData.user}`
          );
          const ok = response.data === "Seats unlocked using unlock seats....";
          if (!ok) throw new Error("Unlock rejected");
          return true;
        } catch (err) {
          Swal.showValidationMessage(`Unlock failed: ${err.message}`);
          return false;
        }
      },
    }).then((result) => {
      isAlertOpen.current = false;

      if (result.isConfirmed && result.value) {
        window.removeEventListener('popstate', handlePopState);
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate(fallbackPath, { replace: true, state: { item: movie } });
        }
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    });
  };

  // Push a dummy state to trap back button
  if (!pushedRef.current) {
    window.history.pushState(null, '', window.location.href);
    pushedRef.current = true;
  }

  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, [navigate, fallbackPath, axiosSecure, selectedData, movie]);

  /* useEffect(() => {
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
            const ok = response.data === "Seats unlocked using unlock seats....";
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
 */

  const unlockSeats = async (useBeacon = false) => {
    if (!selectedData || unlockCalled.current) return;
    unlockCalled.current = true;

    const url = `/bookings/unlock-seats?showId=${selectedData.showId}&user=${selectedData.user}`;
    if (useBeacon && navigator.sendBeacon) {
      const blob = new Blob([], { type: "application/json" });
      navigator.sendBeacon(axiosSecure.defaults.baseURL + url, blob);
    } else {
      try {
        console.log("Unlocking seats via HTTP DELETE...");
        await axiosSecure.delete(url);
      } catch (error) {
        console.error("Error unlocking seats:", error);
      }
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
        navigate("/all-shows",{state:{item:movie}})
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

      const { data } = await axiosSecure.post("/api/payment/create-order", payload);
      const checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        returnUrl:
          data.returnUrl ??
          `${import.meta.env.VITE_APP_BASE_URL}/booking-confirmation?orderId=${encodeURIComponent(data.orderId)}`,
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
      <div className="w-3/5 overflow-y-auto h-[100vh]">
        <div className="bg-fuchsia-800 h-1/5">Snacks Banner</div>
        <div className="bg-stone-500 h-4/5">Snacks</div>
      </div>
      <div className="relative w-2/5 bg-gradient-to-tr from-stone-400 via-amber-50 to-orange-100/80 h-full overflow-y-scroll overflow-x-hidden">
        <div className="px-6 bg-gradient-to-tr from-base-100/90 via-base-100/90 to-slate-800/90 max-h-max py-3 mx-4 my-1 space-y-2 rounded-sm w-[95%]">
          <div className={`grid grid-flow-col gap-5 ${minutes < 4 ? `text-red-500` : `text-white`} auto-cols-max text-start`}>
            <div className="flex flex-col">
              <span className="countdown font-mono font-semibold text-3xl">
                <span style={{ "--value": minutes % 60 }}></span>
              </span>
              <span className="poppins-medium ">min</span>
            </div>
            <div className="flex flex-col">
              <span className="countdown font-mono font-semibold text-3xl">
                <span style={{ "--value": secs }}></span>
              </span>
             <span className="poppins-medium ">sec</span>
            </div>
          </div>
          <div className="mx-2 justify-between p-2 flex bg-green-500 space-x-2">
            <div className="bg-indigo-700 w-1/2">Hello</div>
            <div className="bg-red-600 w-1/2">hello</div>
          </div>
          <div className="bg-blue-600"> Pay Rs. {baseAmt + taxes.sgst + taxes.cgst}</div>
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

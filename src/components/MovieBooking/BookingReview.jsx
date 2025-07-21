import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { cashfree } from "../Services/cashfree";

const BookingReview = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { selectedData, movie } = location.state || {};
  const axiosSecure = useAxiosSecure();
  const [time, setTime] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [baseAmt, setBaseAmt] = useState((selectedData?.price * selectedData?.seatsId.length) || 0);
  const [taxes, setTaxes] = useState({
    cgst: baseAmt * 0.09,
    sgst: baseAmt * 0.09
  })



  // ******** For timeout *****************
  const handleTimeout = async () => {
    try {
      const response = await axiosSecure.delete(
        `/bookings/unlock-seats?showId=${selectedData.showId}&user=${selectedData.user}`
      );
      if (response.status === 200) {
        console.log("success :", response);
      }
      return response; // Return the entire response if needed
    } catch (error) {
      console.error("Error hitting API on timeout:", error);
      return { error: true, message: error.message }; // Or return null/error object
    }
  };
  useEffect(() => {

    setTaxes(prev => ({
      ...prev, 
      cgst: baseAmt * 0.09,
      sgst: baseAmt * 0.09
    }))
    const fetchRemainingTime = async () => {
      if (!selectedData) return; // Ensure selectedData is present
      try {
        //console.log(selectedData.showId ,"  ", selectedData.user)
        console.log(selectedData)
        const response = await axiosSecure.get(
          `/bookings/remaining-time?showId=${selectedData.showId}&user=${selectedData.user}`
        );
        const remainingTime = response.data;
        setTime(remainingTime);
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
          clearInterval(interval); // Clear the interval when time is up
          handleTimeout(); // Call the function to hit the API
          return 0; // Ensure time is set to 0
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedData, axiosSecure]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { minutes, secs };
  };
  //console.log(movie)
  const { minutes, secs } = formatTime(time);
  if (!selectedData) {
    navigate(`/all-shows`, { state: { item: movie } });
    return null; 
  }

 //Handle Payment redirection
    const handlePayNow = async () => {
    if (!selectedData) return;
    setIsPaying(true);
   

    try {
     let totalamount = selectedData.price * selectedData.seatsId.length;
     
      const payload = {
        username: selectedData.user,
        amount: totalamount,
        showId: selectedData.showId,
        seatsIds: selectedData.seatsId, 
        tierName: selectedData.tierName,
        cgst:taxes.cgst,
        sgst:taxes.sgst
      };

      const { data } = await axiosSecure.post("/api/payment/create-order", payload);
      // expect: { paymentSessionId, orderId, returnUrl }
       console.table(data);
      const checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        // If backend returned a returnUrl, prefer that:
        returnUrl: data.returnUrl ??
          `${import.meta.env.VITE_APP_BASE_URL}/booking-confirmation?orderId=${encodeURIComponent(
            data.orderId
          )}`,
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

     const handleBooking = async () => {
      try {
        const response = await axiosSecure.post(
          `/bookings/book-seats`,
          selectedData
        );
        if (response.status === 200) {
          console.log("Seats Booked successfully:", response.data);
          navigate("/booking-confirmation");
        }
      } catch (error) {
        console.error("Error hitting API on timeout:", error);
      }
    }; 

  return (
    <div className="flex w-[100%] h-screen">
      <div className="w-3/5 overflow-y-auto h-[100vh]">
        <div className="bg-fuchsia-800 h-1/5">Snacks Banner</div>
        <div className="bg-stone-500 h-4/5">Snacks</div>
      </div>
      {/* Right section */}
      <div className="relative w-2/5 bg-gradient-to-tr from-stone-400 via-amber-50 to-orange-100/80 h-full overflow-y-scroll overflow-x-hidden">
        <div className="px-6 bg-gradient-to-tr from-base-100/90 via-base-100/90 to-slate-800/90 max-h-max py-3 mx-4 my-1 space-y-2 rounded-sm w-[95%]">
        {/* Timer section */}
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
          {/* details */}
          {/* Movie section */}
          <div className="mx-2 justify-between p-2 flex bg-green-500 space-x-2">
            <div className="bg-indigo-700 w-1/2">Hello</div>
            <div className="bg-red-600 w-1/2">hello</div>
          </div>
           <div className="bg-blue-600"> hello</div>
          {/* price section */}
        
          <div className="text-center">
            <button
              className="btn bg-green rounded-md text-white"
              onClick={handlePayNow}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;

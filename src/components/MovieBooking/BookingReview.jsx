import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { cashfree } from "../Services/cashfree";

const BookingReview = () => {
  const [time, setTime] = useState(0);
  const [isPaying, setIsPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedData, movie } = location.state || {};
  const axiosSecure = useAxiosSecure();

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
    setErrorMsg("");

    try {
     let totalamount = selectedData.price * selectedData.seatsId.length;
      const payload = {
        username: selectedData.user,
        amount: totalamount,
        showId: selectedData.showId,
        seats: selectedData.seatsId, 
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
          setErrorMsg(result.error.message || "Payment could not be started.");
          setIsPaying(false);
          return;
        }
        if (result.redirect) {
          console.log("Redirecting to Cashfree checkout…");
        }
      });
    } catch (err) {
      console.error("Failed to initiate payment:", err);
      setErrorMsg("Could not start payment. Please try again.");
      setIsPaying(false);
    }
  }; 


     // Handle payment redirection
/*   const handleRedirect = async () => {
    try {
      const orderId = selectedData.user.substring(0, 4) + Date.now();
      const response = await axiosSecure.post(
        "https://sandbox.cashfree.com/pg/orders",
        {
          orderId,
          orderAmount: selectedData.price * selectedData.seatsId.length,
          customerId: selectedData.user,
          customerPhone: "0000000000",
        },
        {
          headers: {
            "x-client-id": import.meta.env.VITE_CASHFREE_API_KEY,
            "x-client-secret": import.meta.env.VITE_CASHFREE_CLIENT_SECRET,
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-api-version": "2023-08-01",
          },
        }
      );
    
      console.log("Payment session created:", response.data);
      const returnUrl = `http://localhost:5173/payment-success?orderId=${encodeURIComponent(orderId)}&mId=${encodeURIComponent(movie.id)}`;
      let checkoutOptions = {
        paymentSessionId: response.data.payment_session_id,
        // returnUrl: `http://localhost:5173/payment-success?orderId=${orderId}&mId=${movie.id}`, // Redirect here after payment
        returnUrl
      };

      cashfree.checkout(checkoutOptions).then(function (result) {
        if (result.error) {
          alert(result.error.message);
          //navigate("/all-shows", { state: { item: movie } }); // Navigate back on error
        }
        if (result.redirect) {
          console.log("Redirection happening...");
        }
      });
    } catch (error) {
      console.error("Error creating payment session:", error);
      navigate("/all-shows", { state: { item: movie } }); // Navigate back on error
    }
  };  */

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
      <div className="relative w-2/5 bg-gradient-to-tr from-stone-400 via-amber-50 to-orange-100/80 h-full overflow-y-scroll overflow-x-hidden">
        <div className="px-6 bg-gradient-to-tr from-base-100/90 via-base-100/90 to-slate-800/90 max-h-max py-3 mx-4 my-1 space-y-20 rounded-sm w-[95%]">
          <div
            className={`grid grid-flow-col gap-5 ${
              minutes < 4 ? `text-red-500` : `text-white`
            } auto-cols-max text-start`}
          >
            <div className="flex flex-col">
              <span className="countdown font-mono text-3xl">
                <span style={{ "--value": minutes % 60 }}></span>
              </span>
              min
            </div>
            <div className="flex flex-col">
              <span className="countdown font-mono text-3xl">
                <span style={{ "--value": secs }}></span>
              </span>
              sec
            </div>
          </div>
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

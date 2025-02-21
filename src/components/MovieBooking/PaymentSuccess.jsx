import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";

const PaymentSuccess = () => {
  const [item, setItem] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const getMovieById = async (movieId) => {
    try {
      const res = await axiosSecure.get(`/movie/get-movie/${movieId}`);
      console.log(res);
      if (res) {
        setItem(res.data); // Ensure setItem is defined
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = new URLSearchParams(location.search).get("orderId");
      const movieId = new URLSearchParams(location.search).get("mId");
  

      console.log(movieId,"    ",orderId)
      if (!orderId || !movieId) {
        console.log("no orderId found");
        getMovieById(movieId); // Fetch movie details
        navigate(`/movie-details`, { state: { item } }); // Navigate to movie details page
        return;
      }
  
      try {
        // Verify payment status with Cashfree API
        const response = await axiosSecure.get(`/payment/verify?orderId=${orderId}`);
        if (response.data.status === "SUCCESS") {
          // Payment is successful, proceed with booking
          const bookingResponse = await axiosSecure.post("/bookings/book-seats", {
            showId: response.data.showId,
            userId: response.data.userId,
            seatsId: response.data.seatsId,
          });
          if (bookingResponse.status === 200) {
            console.log("Seats booked successfully:", bookingResponse.data);
            navigate("/booking-confirmation", {
              state: { booking: bookingResponse.data },
            });
          }
        } else {
          // Payment failed or incomplete
          navigate("/all-shows", { state: { item } });
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        navigate("/all-shows", { state: { item } });
      }
    };
  
    verifyPayment();
  }, [location, navigate, axiosSecure, item]); // Add item to dependencies
  
  
  return (
    <div>
      <span className="loading loading-ring loading-lg"></span>
    </div>
  );
};

export default PaymentSuccess;

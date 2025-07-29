import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";

const PaymentSuccess = ({ fallbackPath = "/" }) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'failed'
  const [message, setMessage] = useState("");
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [selectedData, setSelectedData] = useState(null);
  const [unlockAttempted, setUnlockAttempted] = useState(false); // To prevent multiple unlock attempts

  // Load booking data from sessionStorage on component mount
  useEffect(() => {
    if (sessionStorage.getItem("bookingData") != null) {
      setSelectedData(JSON.parse(sessionStorage.getItem("bookingData")));
      console.log(JSON.parse(sessionStorage.getItem("bookingData")))
    }
  }, []); // Empty dependency array means this runs once on mount

  // Function to unlock seats
  const unlockSeats = useCallback(async () => {
    if (!selectedData || unlockAttempted) {
      return;
    }
    setUnlockAttempted(true); // Mark that an unlock attempt has been made

    console.log("Attempting to unlock seats:", selectedData);
    try {
      const response = await axiosSecure.delete(
        `/bookings/unlock-seats?showId=${selectedData?.selectedData?.showId}&user=${selectedData?.selectedData?.user}`
      );
      const ok = response.data === "Seats unlocked using unlock seats....";

      if (ok) {
        Swal.fire({
          icon: "warning",
          title: "Booking Failed!",
          text: "Your transaction is failed. The selected seats have been released.",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          sessionStorage.removeItem("bookingData"); // Corrected typo
          navigate(fallbackPath, { replace: true, state:{item:movie} }); // Removed undefined 'movie'
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
          sessionStorage.removeItem("bookingData"); // Corrected typo
          navigate(fallbackPath, { replace: true, state:{item:movie} }); // Removed undefined 'movie'
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
        sessionStorage.removeItem("bookingData"); // Corrected typo
        navigate(fallbackPath, { replace: true, state:{item:movie} }); // Removed undefined 'movie'
      });
    }
  }, [selectedData, axiosSecure, navigate, fallbackPath, unlockAttempted]);

  // Effect for verifying payment
  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      setMessage("Order ID not found in URL.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await axiosSecure.get(`/api/payment/verify/${orderId}`);
        console.log("Payment verification response:", response.data);
        const res = response.data;
        if (res.success) {
          setStatus("success");
          setMessage(res.message);
          // Clear booking data on successful payment
          sessionStorage.removeItem("bookingData");
          navigate('/booking-confirmation', { state: { res } });
        } else {
          setStatus("failed");
          setMessage(res.message); // Corrected 'data.message' to 'res.message'
        }
      } catch (err) {
        console.error("Payment verification failed:", err);
        setStatus("failed");
        setMessage("Error verifying payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [orderId, axiosSecure, navigate]); // Added axiosSecure and navigate to dependencies

  // Effect to trigger unlockSeats only when status becomes 'failed'
  useEffect(() => {
    if (status === "failed" && !unlockAttempted) {
      unlockSeats();
    }
  }, [status, unlockSeats, unlockAttempted]);


  if (status === "loading")
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-900 text-white">
        <span className="loading loading-ring loading-xl text-center text-blue-500 mb-4"></span>
        <p className="poppins-bold text-lg text-center">Booking Your Show ...</p>
      </div>
    );

  return (
    <div className="payment-result flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {status === "success" ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-4xl font-bold mb-4 text-green-500">✅ Payment Successful</h2>
          <p className="text-lg mb-6">{message}</p>
          {/* Removed redundant Link as navigate handles redirection */}
          <p className="text-md text-gray-400">Redirecting to booking confirmation...</p>
        </div>
      ) : status == "failed" ? unlockSeats().then(()=>navigate("/")):(
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <h2 className="text-4xl font-bold mb-4 text-red-500">❌ Payment Failed</h2>
          <p className="text-lg mb-6">{message}</p>
          <Link to={fallbackPath} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-300">
            Go to Home Page
          </Link>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;
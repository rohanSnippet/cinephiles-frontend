import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { data } from "autoprefixer";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'failed'
  const [message, setMessage] = useState("");
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  console.log(orderId);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      setMessage("Order ID not found in URL.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await axiosSecure.get(`/api/payment/verify/${orderId}`);
        console.log(response.data);
         if (resdata.success) {
          setStatus("success");
          setMessage(data.message);
          navigate('/booking-confirmation',{state:{data}})
        } else {
          setStatus("failed");
          setMessage(data.message);
        } 
      } catch (err) {
        console.error("Payment verification failed:", err);
        setStatus("failed");
        setMessage("Error verifying payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [orderId]);

  if (status === "loading")
    return (
      <div className="h-screen w-screen">
        <div className="flex justify-center items-center">
          <span className="loading loading-ring loading-xl text-center"></span>
           <p className="justify-center items-center align-middle text-center poppins-bold text-lg text-white">Booking Your Show ...</p>
        </div>
       
      </div>
    );

  return (
    <div className="payment-result">
        {status === "success" ? (
        <div>
          <h2>✅ Payment Successful</h2>
          <p>{message}</p>
          <Link to="/booking-confirmation" className="btn">View Booking</Link>
        </div>
      ) : (
        <div>
          <h2>❌ Payment Failed</h2>
          <p>{message}</p>
        
        </div>
      )} 
    </div>
  );
};

export default PaymentSuccess;

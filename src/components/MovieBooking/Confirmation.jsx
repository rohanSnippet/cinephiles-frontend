import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../Hooks/AxiosSecure';
import { FaCheckCircle, FaTimesCircle, FaTicketAlt, FaHome } from 'react-icons/fa';

const Confirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'failed'
  const [bookingDetails, setBookingDetails] = useState(null);
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    const verifyPayment = async () => {
      if (verifyAttempted.current) return;
      verifyAttempted.current = true;

      try {
        // Backend verifies status with Cashfree securely
        const response = await axiosSecure.post(`/api/payment/verify`, { orderId });

        if (response.data.paymentStatus === 'SUCCESS') {
           setStatus("success");
           setBookingDetails(response.data.booking);

           // Clear session storage securely upon success
           sessionStorage.removeItem("bookingData");
        } else {
           setStatus("failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [orderId, axiosSecure]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-white/20">

      {/* Background Cinematic Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-12 text-center shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] relative z-10">

        {status === "verifying" && (
          <div className="flex flex-col items-center">
             <div className="relative flex justify-center items-center mb-8">
                <div className="w-20 h-20 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
                <FaTicketAlt size={24} className="absolute text-white/50" />
             </div>
             <h2 className="text-2xl poppins-bold text-white mb-2">Verifying Payment</h2>
             <p className="text-sm text-neutral-400 poppins-light">Please do not refresh or close this page.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-fade-in-up">
             <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 mb-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <FaCheckCircle size={36} className="text-green-400" />
             </div>
             <h2 className="text-3xl poppins-bold text-white mb-2">Booking Confirmed!</h2>
             <p className="text-sm text-neutral-400 poppins-light mb-8">Your tickets have been securely booked. A confirmation email has been sent.</p>

             {bookingDetails && (
               <div className="w-full bg-black/40 rounded-2xl p-5 border border-white/5 mb-8 text-left">
                  <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 poppins-medium">Order ID</div>
                  <div className="text-sm font-mono text-neutral-300 mb-4">{orderId}</div>

                  <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 poppins-medium">Movie</div>
                  <div className="text-sm poppins-semibold text-white mb-4">{bookingDetails.movieTitle}</div>

                  <div className="flex justify-between">
                     <div>
                        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 poppins-medium">Seats</div>
                        <div className="text-sm poppins-semibold text-white">{bookingDetails.seats?.join(", ")}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 poppins-medium">Amount</div>
                        <div className="text-sm font-mono text-white">&#x20B9;{bookingDetails.amount?.toFixed(2)}</div>
                     </div>
                  </div>
               </div>
             )}

             <button onClick={() => navigate("/")} className="w-full py-4 rounded-full text-sm font-bold bg-white text-black hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] poppins-semibold flex justify-center items-center gap-2">
                <FaHome size={16} /> Return to Home
             </button>
          </div>
        )}

        {status === "failed" && (
          <div className="flex flex-col items-center animate-fade-in-up">
             <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <FaTimesCircle size={36} className="text-red-400" />
             </div>
             <h2 className="text-3xl poppins-bold text-white mb-2">Payment Failed</h2>
             <p className="text-sm text-neutral-400 poppins-light mb-8">We could not verify your payment. If money was deducted, it will be refunded within 3-5 business days.</p>

             <div className="flex w-full gap-4">
                <button onClick={() => navigate(-1)} className="flex-1 py-4 rounded-full text-sm font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all poppins-semibold">
                   Try Again
                </button>
                <button onClick={() => navigate("/")} className="flex-1 py-4 rounded-full text-sm font-bold bg-white text-black hover:bg-neutral-200 transition-all poppins-semibold">
                   Home
                </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Confirmation;
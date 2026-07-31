import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../Hooks/AxiosSecure';
import Swal from 'sweetalert2'; // FIX: Imported Swal
import {FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaTicketAlt, FaHome } from 'react-icons/fa';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  // Extract order_id from the URL (handles both casing variations)
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'failed'
  const [bookingDetails, setBookingDetails] = useState(null);
  const [message, setMessage] = useState("");
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      setMessage("Order ID not found in URL.");
      return;
    }

    const handleFailure = async (errMsg) => {
        setStatus("failed");
        setMessage(errMsg);

        // FIX: Securely cancel seats using the correct endpoint in the background
        try {
          const bookingDataStr = sessionStorage.getItem("bookingData");
          if (bookingDataStr) {
            const bData = JSON.parse(bookingDataStr);
            const sData = bData.selectedData;

            if (sData) {
              await axiosSecure.delete(`/bookings/cancel-seats?showId=${sData.showId}&user=${sData.user}`);
            }
            sessionStorage.removeItem("bookingData");
          }
        } catch (e) {
          console.error("Failed to release seats:", e);
        }
    };

    const verifyPayment = async () => {
      // Prevent double API calls in React Strict Mode
      if (verifyAttempted.current) return;
      verifyAttempted.current = true;

      try {
        const response = await axiosSecure.get(`/api/payment/verify/${orderId}`);

        if (response.data && response.data.success) {
           setStatus("success");
           setBookingDetails(response.data);
           sessionStorage.removeItem("bookingData");
        } else {
           handleFailure(response.data.message || "Payment verification failed.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        handleFailure("Error verifying payment. Please contact support.");
      }
    };

    verifyPayment();
  }, [orderId, axiosSecure]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-white/20 font-poppins">

      {/* Background Cinematic Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-12 text-center shadow-[0_30px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] relative z-10">

        {/* --- STATE 1: VERIFYING --- */}
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

        {/* --- STATE 2: SUCCESS --- */}
        {status === "success" && (
          <div className="flex flex-col items-center animate-fade-in-up">
             <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <FaCheckCircle size={36} className="text-emerald-400" />
             </div>
             <h2 className="text-3xl poppins-bold text-white mb-2">Booking Confirmed!</h2>
             <p className="text-sm text-neutral-400 poppins-light mb-8">Your tickets have been securely booked. A confirmation email has been sent.</p>

             {bookingDetails && (
               <div className="w-full bg-black/40 rounded-2xl p-5 border border-white/5 mb-8 text-left">
                  <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 poppins-medium">Booking ID</div>
                  <div className="text-sm font-mono text-neutral-300 mb-4">{bookingDetails.bookingId}</div>

                  <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 poppins-medium">Movie</div>
                  <div className="text-sm poppins-semibold text-white mb-4">{bookingDetails.movieTitle}</div>

                  <div className="flex justify-between">
                     <div>
                        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 poppins-medium">Seats</div>
                        <div className="text-sm poppins-semibold text-white">
                            {bookingDetails.seats?.replace(/\[|\]/g, '')}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1 poppins-medium">Amount</div>
                        <div className="text-sm font-mono text-white">&#x20B9;{bookingDetails.price?.toFixed(2)}</div>
                     </div>
                  </div>
               </div>
             )}

             <button
                onClick={() => navigate("/")}
                className="w-full py-4 rounded-full text-sm font-bold bg-white text-black hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] poppins-semibold flex justify-center items-center gap-2"
             >
                <FaHome size={16} /> Return to Home
             </button>
          </div>
        )}

        {/* --- STATE 3: FAILED --- */}
{/*         {status === "failed" && ( */}
{/*           <div className="flex flex-col items-center animate-fade-in-up"> */}
{/*              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]"> */}
{/*                 <FaTimesCircle size={36} className="text-red-400" /> */}
{/*              </div> */}
{/*              <h2 className="text-3xl poppins-bold text-white mb-2">Payment Failed</h2> */}
{/*              <p className="text-sm text-neutral-400 poppins-light mb-8">{message}</p> */}

{/*              <div className="flex w-full gap-4"> */}
{/*                 <button */}
{/*                   onClick={() => navigate("/")} */}
{/*                   className="flex-1 py-4 rounded-full text-sm font-bold bg-white text-black hover:bg-neutral-200 transition-all poppins-semibold" */}
{/*                 > */}
{/*                    Home */}
{/*                 </button> */}
{/*              </div> */}
{/*           </div> */}
{/*         )} */}

        {status === "failed" && (
          <div className="flex flex-col items-center animate-fade-in-up">
            {/* If message indicates timeout/refund, show an Amber warning state */}
            {message.includes("expired") || message.includes("refund") ? (
              <>
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 mb-8 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                  <FaExclamationTriangle size={36} className="text-amber-400" />
                </div>
                <h2 className="text-3xl poppins-bold text-white mb-2">Payment Timeout</h2>
                <p className="text-sm text-neutral-300 poppins-light mb-6 text-center max-w-md">
                  Your payment was processed, but your 7-minute seat reservation expired before completion. A full refund has been initiated.
                </p>
{/*                 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left w-full text-xs text-neutral-400 space-y-2"> */}
{/*                   <p><strong className="text-white">Amount Deducted:</strong> ₹{bookingDetails?.amount || orderAmount}</p> */}
{/*                   <p><strong className="text-white">Refund Status:</strong> Initiated (3-5 working days)</p> */}
{/*                   <p><strong className="text-white">Reason:</strong> Payment completed after the 7-minute seat lock expired.</p> */}
{/*                 </div> */}
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-4 rounded-full text-sm font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all poppins-semibold"
                >
                  Select Seats Again
                </button>
              </>
            ) : (
              /* Standard Payment Failure (Card Declined, OTP Failed, etc.) */
              <>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 mb-8 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <FaTimesCircle size={36} className="text-red-400" />
                </div>
                <h2 className="text-3xl poppins-bold text-white mb-2">Payment Failed</h2>
                <p className="text-sm text-neutral-400 poppins-light mb-8">{message}</p>
                <button onClick={() => navigate("/")} className="w-full py-4 rounded-full text-sm font-bold bg-white text-black hover:bg-neutral-200">
                  Home
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentSuccess;
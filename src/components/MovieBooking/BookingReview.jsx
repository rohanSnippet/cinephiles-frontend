import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { cashfree } from "../Services/cashfree";
import Swal from "sweetalert2";
import { FaChevronLeft, FaPlus, FaMinus, FaClock, FaTimes, FaHamburger } from "react-icons/fa";

const BookingReview = ({ fallback = "/all-shows" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  const [bookingData, setBookingData] = useState(() => {
    if (location.state?.selectedData) {
      let data = {
        selectedData: location.state.selectedData,
        movie: location.state.movie,
        updatedScreen: location.state.updatedScreen,
        selectedDate: location.state.selectedDate,
        selectedShow: location.state.selectedShow,
        expiresAt: location.state.expiresAt,
      };
      sessionStorage.setItem("bookingData", JSON.stringify(data));
      return data;
    } else {
      const cached = sessionStorage.getItem("bookingData");
      return cached ? JSON.parse(cached) : null;
    }
  });

  const { selectedData, movie, selectedShow, selectedDate, updatedScreen, expiresAt } = bookingData || {};

  const baseAmt = selectedData?.price || 0;
  const taxes = { cgst: baseAmt * 0.09, sgst: baseAmt * 0.09 };

  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  });

  const [isPaying, setIsPaying] = useState(false);
  const [selectedSnacks, setSelectedSnacks] = useState({});
  const [isSnackModalOpen, setIsSnackModalOpen] = useState(false);

  const fallbackPath = location.state?.from ?? fallback;
  const handledTimeout = useRef(false);

  // 🚨 CRITICAL: Prevents seats from being released during Cashfree modal operation
  const isRedirectingToPayment = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // ONLY release seats if they are closing the tab, NOT interacting with the payment modal
      if (selectedData && !isRedirectingToPayment.current) {
        fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/bookings/cancel-seats?showId=${selectedData.showId}&user=${selectedData.user}`, {
          method: 'DELETE',
          keepalive: true,
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access-token')}` }
        }).catch(err => console.log("Unload cancel failed:", err));
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedData]);

  const handleSessionExpired = useCallback(() => {
    if (handledTimeout.current || isRedirectingToPayment.current) return;
    handledTimeout.current = true;

    Swal.fire({
      title: "SESSION EXPIRED",
      text: "Your booking window has closed. The selected seats have been released.",
      background: "#050505",
      color: "#fff",
      timer: 3500,
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {
        popup: "border border-white/10 rounded-2xl backdrop-blur-xl",
        title: "poppins-bold text-xl text-red-500 uppercase tracking-widest",
      }
    }).then(() => {
      sessionStorage.removeItem("bookingData");
      navigate(fallbackPath, { replace: true, state: { item: movie } });
    });
  }, [navigate, fallbackPath, movie]);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleSessionExpired();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, handleSessionExpired]);

  const handleBack = async (e) => {
    if (e) e.preventDefault();
    if (!selectedData) {
      navigate(fallbackPath, { replace: true, state: { item: movie } });
      return;
    }

    Swal.fire({
      title: "Cancel Booking?",
      text: "Leaving now will release your reserved seats. Do you want to continue?",
      background: "#050505",
      color: "#fff",
      showCancelButton: true,
      confirmButtonText: "Yes, release seats",
      cancelButtonText: "No, stay here",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#262626",
      allowOutsideClick: false,
      customClass: {
        popup: "border border-white/10 rounded-2xl backdrop-blur-xl",
        title: "poppins-bold text-xl",
        confirmButton: "rounded-full poppins-semibold px-6",
        cancelButton: "rounded-full poppins-semibold px-6 border border-white/10",
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosSecure.delete(`/bookings/cancel-seats?showId=${selectedData.showId}&user=${selectedData.user}`);
        } catch (err) {}
        sessionStorage.removeItem("bookingData");
        handledTimeout.current = true;
        navigate(fallbackPath, { replace: true, state: { item: movie } });
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    });
  };

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  const formatTime = (seconds) => {
    if (seconds === null || seconds <= 0) return { minutes: 0, secs: 0 };
    return { minutes: Math.floor(seconds / 60), secs: seconds % 60 };
  };
  const { minutes, secs } = formatTime(timeRemaining);
  const isTimeCritical = timeRemaining <= 120;

  if (!selectedData || !movie || !selectedShow || !selectedDate || !updatedScreen) return null;

  const snacksList = [
    { id: 's1', name: "Classic Salted Popcorn", desc: "Large tub, freshly popped and buttery.", price: 250, emoji: "🍿" },
    { id: 's2', name: "Caramel Crunch", desc: "Sweet, premium caramel glazed popcorn.", price: 290, emoji: "🍯" },
    { id: 's3', name: "Nachos with Salsa", desc: "Crispy corn chips with tangy salsa dip.", price: 180, emoji: "🌮" },
    { id: 's4', name: "Cold Beverage", desc: "750ml fountain drink of your choice.", price: 120, emoji: "🥤" },
  ];

  const snacksTotal = snacksList.reduce((acc, snack) => acc + (selectedSnacks[snack.id] || 0) * snack.price, 0);
  const finalTotalAmount = baseAmt + taxes.cgst + taxes.sgst + snacksTotal;

  const handleSnackChange = (id, delta) => {
    setSelectedSnacks(prev => {
      const next = (prev[id] || 0) + delta;
      return next < 0 ? prev : { ...prev, [id]: next };
    });
  };

  // --- UPDATED CASHFREE INTEGRATION LOGIC ---
  const handlePayNow = async () => {
    if (timeRemaining <= 0) return;
    setIsPaying(true);

    try {
      const payload = {
        username: selectedData.user,
        amount: finalTotalAmount,
        showId: selectedData.showId,
        seatsIds: selectedData.seatsId,
        tierName: selectedData.tierName,
        cgst: taxes.cgst,
        sgst: taxes.sgst,
      };

      const { data } = await axiosSecure.post("/api/payment/create-order", payload);

      // SECURITY GUARD: Turn off beforeunload seat release while modal is active
      isRedirectingToPayment.current = true;

      // OPEN CASHFREE IN MODAL MODE
      cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_modal",
      }).then((result) => {
          if (result.error) {
            // User closed the modal or network failed. Turn guard back off.
            isRedirectingToPayment.current = false;
            setIsPaying(false);
            Swal.fire({
              icon: "error",
              title: "Payment Interrupted",
              text: result.error.message || "The payment process was not completed.",
              background: "#050505",
              color: "#fff",
              customClass: { popup: "border border-white/10 rounded-2xl" }
            });
          }
          if (result.paymentDetails) {
            // Payment was successful in the modal!
            // Manually route them to the verification page with the order ID.
            navigate(`/payment-success?order_id=${data.orderId}`);
          }
      }).catch(() => {
          isRedirectingToPayment.current = false;
          setIsPaying(false);
      });
    } catch (err) {
      isRedirectingToPayment.current = false;
      setIsPaying(false);
      Swal.fire({
        icon: "error", title: "Checkout Error", text: "Failed to initialize secure checkout. Please try again.",
        background: "#050505", color: "#fff", customClass: { popup: "border border-white/10 rounded-2xl" }
      });
    }
  };

  const SnacksMenu = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {snacksList.map((snack) => {
        const qty = selectedSnacks[snack.id] || 0;
        return (
          <div key={snack.id} className={`p-4 sm:p-5 rounded-2xl transition-all duration-300 border ${qty > 0 ? 'bg-white/[0.08] border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`}>
            <div className="text-3xl mb-3">{snack.emoji}</div>
            <h4 className="text-base sm:text-lg font-bold text-white poppins-semibold tracking-wide">{snack.name}</h4>
            <p className="text-xs text-neutral-400 mt-1 mb-5 sm:mb-6 leading-relaxed line-clamp-2 min-h-[2rem]">{snack.desc}</p>

            <div className="flex items-center justify-between mt-auto">
              <div className="text-base sm:text-lg poppins-medium text-white">&#x20B9;{snack.price}</div>

              {qty === 0 ? (
                <button
                  onClick={() => handleSnackChange(snack.id, 1)}
                  className="text-xs poppins-semibold rounded-full border border-white/20 px-4 sm:px-5 py-2 hover:bg-white hover:text-black transition-all"
                >
                  Add
                </button>
              ) : (
                <div className="flex items-center bg-white/10 rounded-full p-1 border border-white/10">
                  <button onClick={() => handleSnackChange(snack.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"><FaMinus size={10}/></button>
                  <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                  <button onClick={() => handleSnackChange(snack.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"><FaPlus size={10}/></button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 relative">

      {/* --- PREMIUM NAVBAR --- */}
      <div className="fixed top-0 left-0 w-full h-20 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-12">
        <button
          onClick={handleBack}
          disabled={isPaying}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors poppins-medium text-sm disabled:opacity-50"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
             <FaChevronLeft size={12} />
          </div>
          <span className="hidden sm:block">Back</span>
        </button>
      </div>

      {/* --- PROMINENT FLOATING TIMER --- */}
      <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center px-6 sm:px-8 py-2 rounded-full border backdrop-blur-2xl shadow-2xl transition-all duration-500 w-max ${
        isTimeCritical
          ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.25)] text-red-500 scale-105'
          : 'bg-white/[0.05] border-white/20 text-white'
      }`}>
        <div className={`text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-bold mb-0.5 ${isTimeCritical ? 'text-red-400' : 'text-neutral-400'}`}>
          {isTimeCritical ? "Expiring Soon" : "Seats Reserved"}
        </div>
        <div className="flex items-center gap-2 text-xl sm:text-2xl font-mono font-bold tracking-tight">
           <FaClock size={16} className={isTimeCritical ? 'animate-pulse text-red-500' : 'text-neutral-300'} />
           <span>
             {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
           </span>
        </div>
      </div>

      {/* --- LEFT SIDE: CONCESSIONS (DESKTOP ONLY) --- */}
      <div className="hidden lg:block w-3/5 pt-44 px-12 pb-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
             <h1 className="text-4xl poppins-bold tracking-tight text-white mb-2">Enhance your experience</h1>
             <p className="text-sm text-neutral-400 poppins-light">Pre-book your favorite snacks and skip the queue at the counter.</p>
          </div>
          <SnacksMenu />
        </div>
      </div>

      {/* --- RIGHT SIDE / MOBILE MAIN: ORDER SUMMARY --- */}
      <div className="w-full lg:w-2/5 pt-44 px-4 sm:px-6 lg:px-10 pb-32 lg:pb-12 lg:border-l border-white/10 lg:bg-white/[0.02] lg:h-screen lg:sticky lg:top-0 z-30 flex flex-col">

        <div className="flex-1 flex flex-col w-full max-w-md mx-auto">

          <h2 className="text-2xl poppins-bold text-white mb-6">Booking Summary</h2>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 lg:pr-2 space-y-6 pb-4">

            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl">
              <div className="flex gap-4">
                 <img src={movie.poster} alt={movie.title} className="w-20 sm:w-24 h-28 sm:h-32 object-cover rounded-xl shadow-lg border border-white/5" />
                 <div className="flex flex-col justify-center flex-1">
                    <h3 className="text-lg sm:text-xl poppins-bold text-white leading-tight mb-2 line-clamp-2">{movie.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                       <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/20 text-neutral-300">
                         {movie.certification === "CERTIFICATION_UA" ? "U/A" : movie.certification.substring(14)}
                       </span>
                       <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">
                         {movie.formats}
                       </span>
                    </div>
                    <div className="text-xs text-neutral-300 poppins-medium">{updatedScreen.sname}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{selectedDate} • {selectedShow?.start}</div>
                 </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                 <div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 poppins-medium">Seats ({selectedData.seatsId.length})</div>
                    <div className="text-sm text-white poppins-semibold">{selectedData.seatsId.join(", ")}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 poppins-medium">Category</div>
                    <div className="text-sm text-white poppins-semibold">{selectedData.tierName}</div>
                 </div>
              </div>
            </div>

            <button
              onClick={() => setIsSnackModalOpen(true)}
              className="lg:hidden w-full flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg"><FaHamburger className="text-neutral-300"/></div>
                 <div className="text-left">
                    <div className="text-sm poppins-semibold text-white">Add Food & Beverages</div>
                    <div className="text-[10px] text-neutral-400 poppins-light">Grab a bite for the movie</div>
                 </div>
              </div>
              <FaPlus className="text-neutral-400" />
            </button>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 shadow-lg">
               <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-4 poppins-medium border-b border-white/5 pb-2">Billing Details</div>
               <div className="space-y-3 px-1">
                 <div className="flex justify-between items-center text-sm poppins-regular text-neutral-300">
                    <span>Tickets ({selectedData.seatsId.length} × &#x20B9;{selectedData.price / selectedData.seatsId.length})</span>
                    <span className="font-mono text-white">&#x20B9;{baseAmt.toFixed(2)}</span>
                 </div>
                 {snacksTotal > 0 && (
                   <div className="flex justify-between items-center text-sm poppins-regular text-neutral-300">
                      <span>Food & Beverage</span>
                      <span className="font-mono text-white">&#x20B9;{snacksTotal.toFixed(2)}</span>
                   </div>
                 )}
                 <div className="flex justify-between items-center text-sm poppins-regular text-neutral-500">
                    <span>Central GST (9%)</span>
                    <span className="font-mono">&#x20B9;{taxes.cgst.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm poppins-regular text-neutral-500">
                    <span>State GST (9%)</span>
                    <span className="font-mono">&#x20B9;{taxes.sgst.toFixed(2)}</span>
                 </div>
               </div>

               <div className="border-t border-dashed border-white/10 pt-4 mt-4 flex justify-between items-end px-1">
                 <div>
                    <div className="text-sm poppins-semibold text-white mb-0.5">Total Amount</div>
                    <div className="text-[9px] text-neutral-500 uppercase tracking-widest">Inclusive of all taxes</div>
                 </div>
                 <div className="text-2xl sm:text-3xl poppins-bold text-white font-mono tracking-tighter">
                    &#x20B9;{finalTotalAmount.toFixed(2)}
                 </div>
               </div>
            </div>

          </div>

          <div className="fixed bottom-0 left-0 w-full lg:relative lg:w-auto p-4 lg:p-0 bg-[#050505]/90 backdrop-blur-xl lg:bg-transparent border-t border-white/10 lg:border-t-0 z-40 lg:mt-6">
             <button
               className="w-full py-4 rounded-full text-sm font-bold bg-white text-black hover:bg-neutral-200 hover:scale-[1.02] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-3 poppins-semibold max-w-md mx-auto lg:max-w-none"
               onClick={handlePayNow}
               disabled={isPaying || timeRemaining <= 0}
             >
               {isPaying ? (
                  <><div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full"></div> Processing...</>
               ) : (
                  `Secure Checkout`
               )}
             </button>
          </div>

        </div>
      </div>

      {/* --- MOBILE SNACKS BOTTOM SHEET MODAL --- */}
      <div className={`fixed inset-0 z-[60] flex items-end justify-center pointer-events-none lg:hidden`}>
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto transition-opacity duration-300 ${isSnackModalOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
          onClick={() => setIsSnackModalOpen(false)}
        ></div>

        <div className={`w-full max-h-[85vh] bg-[#0a0a0a] border-t border-white/10 rounded-t-[2rem] pointer-events-auto flex flex-col transform transition-transform duration-300 ease-out shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${isSnackModalOpen ? 'translate-y-0' : 'translate-y-full'}`}>
           <div className="flex justify-between items-center p-6 border-b border-white/5">
             <h2 className="text-xl poppins-bold text-white">Concessions</h2>
             <button onClick={() => setIsSnackModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-neutral-400 hover:text-white transition-colors">
               <FaTimes size={12} />
             </button>
           </div>

           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
             <SnacksMenu />
           </div>

           <div className="p-6 border-t border-white/5 bg-[#050505]">
             <button
               onClick={() => setIsSnackModalOpen(false)}
               className="w-full py-4 rounded-full text-sm font-bold bg-white text-black poppins-semibold"
             >
               Done
             </button>
           </div>
        </div>
      </div>

    </div>
  );
};

export default BookingReview;
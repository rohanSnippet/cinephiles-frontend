import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { cashfree } from "../Services/cashfree";
import Swal from "sweetalert2";
import { FaChevronLeft, FaPlus, FaMinus, FaClock, FaTimes, FaShieldAlt,FaHamburger  } from "react-icons/fa";

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
  const isRedirectingToPayment = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
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
      text: "Your booking window has closed.",
      background: "#020617",
      color: "#f1f5f9",
      timer: 3500,
      showConfirmButton: false,
      customClass: { popup: "border border-slate-800 rounded-none", title: "poppins-bold uppercase tracking-widest text-slate-100" }
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
    if (!selectedData) { navigate(fallbackPath, { replace: true, state: { item: movie } }); return; }
    Swal.fire({
      title: "CANCEL ORDER?",
      text: "Your reserved seats will be released.",
      background: "#020617",
      color: "#f1f5f9",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#1e293b",
      customClass: { popup: "border border-slate-800 rounded-none" }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try { await axiosSecure.delete(`/bookings/cancel-seats?showId=${selectedData.showId}&user=${selectedData.user}`); } catch (err) {}
        sessionStorage.removeItem("bookingData");
        handledTimeout.current = true;
        navigate(fallbackPath, { replace: true, state: { item: movie } });
      } else { window.history.pushState(null, "", window.location.href); }
    });
  };

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, []);

  const formatTime = (seconds) => {
    if (seconds === null || seconds <= 0) return { min: 0, sec: 0 };
    return { min: Math.floor(seconds / 60), sec: seconds % 60 };
  };
  const { min, sec } = formatTime(timeRemaining);
  const isTimeCritical = timeRemaining <= 120;

  if (!selectedData || !movie || !selectedShow || !selectedDate || !updatedScreen) return null;

  const snacksList = [
    { id: 's1', name: "CLASSIC POPCORN", desc: "Butter-infused large tub.", price: 250, emoji: "🍿" },
    { id: 's2', name: "CARAMEL CRUNCH", desc: "Glazed premium kernels.", price: 290, emoji: "🍯" },
    { id: 's3', name: "SPICY NACHOS", desc: "Served with jalapeño salsa.", price: 180, emoji: "🌮" },
    { id: 's4', name: "Fountain Drink", desc: "Chilled 750ml beverage.", price: 120, emoji: "🥤" },
  ];

  const snacksTotal = snacksList.reduce((acc, snack) => acc + (selectedSnacks[snack.id] || 0) * snack.price, 0);
  const finalTotalAmount = baseAmt + taxes.cgst + taxes.sgst + snacksTotal;

  const handleSnackChange = (id, delta) => {
    setSelectedSnacks(prev => {
      const next = (prev[id] || 0) + delta;
      return next < 0 ? prev : { ...prev, [id]: next };
    });
  };

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
      isRedirectingToPayment.current = true;
      cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_modal" })
        .then((result) => {
          if (result.error) { isRedirectingToPayment.current = false; setIsPaying(false); }
          if (result.paymentDetails) navigate(`/payment-success?order_id=${data.orderId}`);
        }).catch(() => { isRedirectingToPayment.current = false; setIsPaying(false); });
    } catch (err) { isRedirectingToPayment.current = false; setIsPaying(false); }
  };

  const SnacksMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {snacksList.map((snack) => {
        const qty = selectedSnacks[snack.id] || 0;
        return (
          <div key={snack.id} className={`p-5 border transition-all duration-500 relative overflow-hidden ${qty > 0 ? 'bg-slate-900 border-white/20' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
            {qty > 0 && <div className="absolute top-0 left-0 w-1 h-full bg-white/40"></div>}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-[0.2em] mb-1">{snack.name}</h4>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">{snack.desc}</p>
                </div>
                <span className="text-2xl opacity-80">{snack.emoji}</span>
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="text-sm font-mono font-bold text-slate-100">₹{snack.price.toFixed(2)}</span>
              <div className="flex items-center border border-slate-800 bg-slate-950">
                  <button onClick={() => handleSnackChange(snack.id, -1)} className="p-2 hover:bg-slate-900 text-slate-500 transition-colors"><FaMinus size={8}/></button>
                  <span className="w-8 text-center text-[10px] font-bold text-white font-mono">{qty}</span>
                  <button onClick={() => handleSnackChange(snack.id, 1)} className="p-2 hover:bg-slate-900 text-slate-500 transition-colors"><FaPlus size={8}/></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-slate-800">

      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-50 flex items-center justify-between px-8">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-white uppercase tracking-[0.3em] text-[10px] font-bold transition-all">
          <FaChevronLeft size={10} /> Back
        </button>

        <div className={`flex items-center gap-4 px-6 py-1.5 border transition-all duration-700 ${isTimeCritical ? 'border-red-500/50 text-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-800 text-slate-400'}`}>
           <span className="text-[9px] font-bold tracking-[0.2em] uppercase hidden sm:block">Session Timeout</span>
           <div className="flex items-center gap-2 font-mono text-base font-bold tracking-tighter">
              <FaClock size={12} className={isTimeCritical ? 'animate-pulse' : 'opacity-40'} />
              <span>{String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}</span>
           </div>
        </div>
      </div>

      {/* LEFT: CONCESSIONS */}
      <div className="hidden lg:block w-3/5 pt-28 px-16 pb-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-bold uppercase tracking-[0.3em] text-white mb-2 poppins-bold">Concessions</h1>
            <div className="w-12 h-1 bg-white/20 mb-4"></div>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium">Curate your in-theatre dining experience</p>
          </header>
          <SnacksMenu />
        </div>
      </div>

      {/* RIGHT: SUMMARY (The "Receipt" Dashboard) */}
      <div className="w-full lg:w-2/5 pt-28 px-8 pb-32 lg:pb-12 lg:border-l border-slate-900 bg-slate-900/20 flex flex-col h-screen lg:sticky lg:top-0">
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mb-8 border-b border-slate-900 pb-4">Order Intelligence</h2>

          <div className="flex-1 overflow-y-auto space-y-8 pb-4 custom-scrollbar">
            {/* Movie Info Card */}
            <div className="flex gap-6 p-1 border-b border-slate-900 pb-8">
               <img src={movie.poster} className="w-24 h-32 object-cover border border-slate-800 grayscale-[0.3] hover:grayscale-0 transition-all duration-700 shadow-2xl" />
               <div className="flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider leading-tight mb-3 poppins-bold">{movie.title}</h3>
                  <div className="flex gap-2 mb-4">
                     <span className="px-2 py-0.5 border border-slate-800 text-[8px] font-bold uppercase tracking-widest">{movie.certification?.replace("CERTIFICATION_", "") || "U/A"}</span>
                     <span className="px-2 py-0.5 border border-slate-800 bg-slate-900 text-[8px] font-bold uppercase tracking-widest">{movie.formats}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold tracking-[0.1em] uppercase mb-1">{updatedScreen.sname}</div>
                  <div className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">{selectedDate} — {selectedShow?.start}</div>
               </div>
            </div>

            {/* Tactical Detail Bar */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-900 pb-8">
                <div>
                   <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Assigned Seats</span>
                   <span className="text-xs text-slate-200 font-mono tracking-widest uppercase">{selectedData.seatsId.join(", ")}</span>
                </div>
                <div className="text-right">
                   <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest block mb-1">Ticket Class</span>
                   <span className="text-xs text-slate-200 font-bold uppercase tracking-widest">{selectedData.tierName}</span>
                </div>
            </div>

            {/* Mobile Snacks Action */}
            <button onClick={() => setIsSnackModalOpen(true)} className="lg:hidden w-full flex items-center justify-between p-5 border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white transition-all group">
               <div className="flex items-center gap-4">
                  <FaHamburger className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Add Concessions</span>
               </div>
               <FaPlus size={10} />
            </button>

            {/* Financials */}
            <div className="space-y-4">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span>Base Tickets</span>
                  <span className="text-slate-300 font-mono">₹{baseAmt.toFixed(2)}</span>
               </div>
               {snacksTotal > 0 && (
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Add-on Concessions</span>
                    <span className="text-slate-300 font-mono">₹{snacksTotal.toFixed(2)}</span>
                 </div>
               )}
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-600 border-t border-slate-900 pt-4">
                  <span>Service Tax (GST 18%)</span>
                  <span className="font-mono">₹{(taxes.cgst + taxes.sgst).toFixed(2)}</span>
               </div>
            </div>
          </div>

          {/* Grand Total & Final Action */}
          <div className="mt-auto pt-8 border-t border-slate-900">
             <div className="flex justify-between items-end mb-8">
                <div>
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white block mb-1">Final Payable</span>
                   <span className="text-[8px] text-slate-600 uppercase tracking-widest">Secure encrypted checkout</span>
                </div>
                <span className="text-4xl font-bold text-white tracking-tighter font-mono">₹{finalTotalAmount.toFixed(2)}</span>
             </div>

             <button
               onClick={handlePayNow}
               disabled={isPaying || timeRemaining <= 0}
               className="w-full py-5 bg-white text-slate-950 font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-slate-200 disabled:opacity-30 transition-all flex justify-center items-center gap-3 active:scale-[0.98]"
             >
               {isPaying ? (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent animate-spin"></div>
                    VERIFYING...
                  </div>
               ) : (
                  <>
                    <FaShieldAlt size={12} className="opacity-40" />
                    CONFIRM & PAY NOW
                  </>
               )}
             </button>
          </div>
        </div>
      </div>

      {/* MOBILE CONCESSIONS MODAL */}
      <div className={`fixed inset-0 z-[100] flex items-end lg:hidden transition-all duration-500 ${isSnackModalOpen ? 'visible bg-slate-950/95' : 'invisible bg-transparent pointer-events-none'}`}>
        <div className={`w-full max-h-[85vh] bg-slate-950 border-t border-white/10 p-8 z-10 transition-transform duration-500 ease-out ${isSnackModalOpen ? 'translate-y-0' : 'translate-y-full'}`}>
           <div className="flex justify-between items-center mb-10 pb-4 border-b border-slate-900">
             <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-white">Concessions Menu</h2>
             <button onClick={() => setIsSnackModalOpen(false)} className="text-slate-500 hover:text-white transition-colors"><FaTimes size={16}/></button>
           </div>
           <div className="overflow-y-auto max-h-[60vh] custom-scrollbar"><SnacksMenu /></div>
           <button onClick={() => setIsSnackModalOpen(false)} className="w-full py-5 mt-8 bg-slate-900 text-white font-bold uppercase tracking-[0.2em] text-[10px] border border-slate-800">Confirm Additions</button>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { cashfree } from "../Services/cashfree";
import Swal from "sweetalert2";
import { FaChevronLeft, FaPlus, FaMinus, FaClock, FaTimes, FaShieldAlt, FaHamburger } from "react-icons/fa";

// Dummy Data with Categories and Realistic Images
const CONCESSIONS_DATA = [
  {
    category: "Combos",
    items: [
      { id: 'c1', name: "Couples Combo", desc: "2 Large Popcorn + 2 Drinks", price: 650, image: "https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=400&auto=format&fit=crop" },
      { id: 'c2', name: "Family Fiesta", desc: "2 Large Popcorn + 4 Drinks + Nachos", price: 1100, image: "https://images.unsplash.com/photo-1572177812156-58036aae439c?q=80&w=400&auto=format&fit=crop" },
    ]
  },
  {
    category: "Popcorn",
    items: [
      { id: 'p1', name: "Classic Salted", desc: "Freshly popped, lightly salted.", price: 250, image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?q=80&w=400&auto=format&fit=crop" },
      { id: 'p2', name: "Caramel Crunch", desc: "Glazed premium kernels.", price: 290, image: "https://images.unsplash.com/photo-1570146316719-74e2d3df2438?q=80&w=400&auto=format&fit=crop" },
      { id: 'p3', name: "Cheese Bomb", desc: "Loaded with cheddar dust.", price: 310, image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400&auto=format&fit=crop" },
    ]
  },
  {
    category: "Beverages",
    items: [
      { id: 'b1', name: "Fountain Coke", desc: "Chilled 750ml.", price: 180, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop" },
      { id: 'b2', name: "Cold Coffee", desc: "Creamy frappe with ice.", price: 220, image: "https://images.unsplash.com/photo-1461023058943-0708e5223e74?q=80&w=400&auto=format&fit=crop" },
    ]
  },
  {
    category: "Snacks",
    items: [
      { id: 's1', name: "Spicy Nachos", desc: "Served with jalapeño salsa.", price: 210, image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=400&auto=format&fit=crop" },
      { id: 's2', name: "French Fries", desc: "Crispy golden salted fries.", price: 150, image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=400&auto=format&fit=crop" },
    ]
  }
];

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
  const [activeCategory, setActiveCategory] = useState(CONCESSIONS_DATA[0].category);

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
      background: "#050505",
      color: "#fff",
      timer: 3500,
      showConfirmButton: false,
      customClass: { popup: "border border-white/10 rounded-2xl", title: "poppins-bold uppercase tracking-widest text-white" }
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
      background: "#050505",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#111",
      customClass: { popup: "border border-white/10 rounded-2xl" }
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

  // Calculate Snack Totals dynamically
  const snacksTotal = CONCESSIONS_DATA.flatMap(c => c.items).reduce((acc, snack) => acc + (selectedSnacks[snack.id] || 0) * snack.price, 0);
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

  const activeSnackList = CONCESSIONS_DATA.find(c => c.category === activeCategory)?.items || [];

  const SnacksMenu = () => (
    <div className="w-full">
      {/* Category Pills */}
      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-4 mb-4 select-none">
        {CONCESSIONS_DATA.map((cat) => (
          <button
            key={cat.category}
            onClick={() => setActiveCategory(cat.category)}
            className={`px-5 py-2 rounded-full poppins-semibold text-xs tracking-widest uppercase transition-all whitespace-nowrap border ${
              activeCategory === cat.category
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Slider Format for Products */}
      <div className="flex gap-6 overflow-x-auto snap-x custom-scrollbar pb-6 select-none">
        {activeSnackList.map((snack) => {
          const qty = selectedSnacks[snack.id] || 0;
          return (
            <div
              key={snack.id}
              className={`snap-start min-w-[240px] md:min-w-[280px] p-4 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                qty > 0 ? 'bg-[#111] border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'bg-[#0a0a0a] border-white/5 hover:border-white/20 hover:bg-[#111]'
              }`}
            >
              <div>
                <div className="w-full h-40 rounded-2xl overflow-hidden mb-4 bg-[#050505] border border-white/5">
                  <img src={snack.image} alt={snack.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h4 className="text-sm poppins-bold text-white uppercase tracking-widest mb-1 line-clamp-1">{snack.name}</h4>
                <p className="text-[10px] text-white/50 poppins-light uppercase tracking-widest line-clamp-2 min-h-[30px]">{snack.desc}</p>
              </div>

              <div className="flex items-center justify-between mt-6 border-t border-white/5 pt-4">
                <span className="text-sm font-mono font-bold text-white">&#x20B9;{snack.price.toFixed(2)}</span>

                {qty > 0 ? (
                  <div className="flex items-center bg-[#050505] border border-white/10 rounded-full p-1">
                    <button onClick={() => handleSnackChange(snack.id, -1)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors active:scale-95"><FaMinus size={10}/></button>
                    <span className="w-8 text-center text-[12px] font-bold text-white font-mono">{qty}</span>
                    <button onClick={() => handleSnackChange(snack.id, 1)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black hover:bg-neutral-300 transition-colors active:scale-95"><FaPlus size={10}/></button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSnackChange(snack.id, 1)}
                    className="px-5 py-2 text-[10px] poppins-bold uppercase tracking-widest rounded-full border border-white/20 hover:bg-white text-white hover:text-black transition-all active:scale-95"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-[#050505] text-white font-poppins selection:bg-white/20">
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full h-16 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6 md:px-12 select-none">
        <button onClick={handleBack} className="flex items-center gap-2 text-white/50 hover:text-white uppercase tracking-[0.3em] text-[10px] poppins-bold transition-all active:scale-95">
          <FaChevronLeft size={10} /> Back
        </button>
        <div className={`flex items-center gap-4 px-6 py-1.5 border rounded-full transition-all duration-700 ${isTimeCritical ? 'border-red-500/50 text-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/10 text-white/60 bg-[#111]'}`}>
           <span className="text-[9px] poppins-bold tracking-[0.2em] uppercase hidden sm:block">Session Timeout</span>
           <div className="flex items-center gap-2 font-mono text-base font-bold tracking-tighter">
              <FaClock size={12} className={isTimeCritical ? 'animate-pulse' : 'opacity-40'} />
              <span>{String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}</span>
           </div>
        </div>
      </div>

      {/* LEFT: CONCESSIONS (Bento-Box Styled) */}
      <div className="hidden lg:block w-3/5 pt-28 px-12 xl:px-20 pb-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10 select-none">
            <h1 className="text-3xl poppins-bold uppercase tracking-[0.2em] text-white mb-2">Concessions</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] poppins-medium">Curate your in-theatre dining experience</p>
          </header>
          <SnacksMenu />
        </div>
      </div>

      {/* RIGHT: SUMMARY (The Receipt Dashboard) */}
      <div className="w-full lg:w-2/5 pt-28 px-6 md:px-12 pb-32 lg:pb-12 lg:border-l border-white/5 bg-[#0a0a0a] flex flex-col h-screen lg:sticky lg:top-0 select-none">
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto">
          <h2 className="text-[10px] poppins-bold uppercase tracking-[0.4em] text-white/50 mb-8 border-b border-white/5 pb-4">Order Intelligence</h2>

          <div className="flex-1 overflow-y-auto space-y-8 pb-4 custom-scrollbar pr-2">

            {/* Movie Info Card (Bento style) */}
            <div className="flex gap-6 p-4 bg-[#111] border border-white/5 rounded-3xl shadow-lg">
               <img src={movie.poster} className="w-24 h-32 object-cover rounded-xl border border-white/10 shadow-md" alt={movie.title} />
               <div className="flex flex-col justify-center">
                  <h3 className="text-lg poppins-bold text-white uppercase tracking-wider leading-tight mb-2 line-clamp-2">{movie.title}</h3>
                  <div className="flex gap-2 mb-3">
                     <span className="px-2 py-0.5 border border-white/20 text-[9px] poppins-bold uppercase tracking-widest rounded">{movie.certification?.replace("CERTIFICATION_", "") || "U/A"}</span>
                     <span className="px-2 py-0.5 border border-white/10 bg-white/5 text-[9px] poppins-bold uppercase tracking-widest rounded">{movie.formats}</span>
                  </div>
                  <div className="text-[10px] text-white/50 poppins-semibold tracking-[0.1em] uppercase mb-1">{updatedScreen.sname}</div>
                  <div className="text-[10px] text-white/70 poppins-medium uppercase tracking-widest">{selectedDate} &bull; {selectedShow?.start}</div>
               </div>
            </div>

            {/* Tactical Detail Bar */}
            <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-8">
                <div className="bg-[#111] border border-white/5 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                   <span className="text-[9px] poppins-semibold text-white/40 uppercase tracking-widest mb-2 block">Assigned Seats</span>
                   <span className="text-sm text-white font-mono tracking-widest uppercase">{selectedData.seatsId.join(", ")}</span>
                </div>
                <div className="bg-[#111] border border-white/5 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                   <span className="text-[9px] poppins-semibold text-white/40 uppercase tracking-widest mb-2 block">Ticket Class</span>
                   <span className="text-sm text-white poppins-bold uppercase tracking-widest">{selectedData.tierName}</span>
                </div>
            </div>

            {/* Mobile Snacks Action */}
            <button onClick={() => setIsSnackModalOpen(true)} className="lg:hidden w-full flex items-center justify-between p-5 border border-white/10 rounded-2xl bg-[#111] text-white/60 hover:text-white transition-all group active:scale-[0.98]">
               <div className="flex items-center gap-4">
                  <FaHamburger className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[10px] poppins-bold uppercase tracking-[0.2em]">Add Concessions</span>
               </div>
               <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                 <FaPlus size={10} />
               </div>
            </button>

            {/* Financials */}
            <div className="space-y-4 bg-[#111] border border-white/5 p-5 rounded-3xl">
               <div className="flex justify-between text-[10px] poppins-bold uppercase tracking-widest text-white/60">
                  <span>Base Tickets</span>
                  <span className="text-white font-mono">&#x20B9;{baseAmt.toFixed(2)}</span>
               </div>
               {snacksTotal > 0 && (
                 <div className="flex justify-between text-[10px] poppins-bold uppercase tracking-widest text-white/60">
                    <span>Add-on Concessions</span>
                    <span className="text-white font-mono">&#x20B9;{snacksTotal.toFixed(2)}</span>
                 </div>
               )}
               <div className="flex justify-between text-[10px] poppins-bold uppercase tracking-widest text-white/40 border-t border-white/5 pt-4">
                  <span>Service Tax (GST 18%)</span>
                  <span className="font-mono">&#x20B9;{(taxes.cgst + taxes.sgst).toFixed(2)}</span>
               </div>
            </div>
          </div>

          {/* Grand Total & Final Action */}
          <div className="mt-auto pt-6 border-t border-white/5">
             <div className="flex justify-between items-end mb-6">
                <div>
                   <span className="text-[10px] poppins-bold uppercase tracking-[0.3em] text-white block mb-1">Final Payable</span>
                   <span className="text-[8px] text-white/40 uppercase tracking-widest">Secure encrypted checkout</span>
                </div>
                <span className="text-3xl font-bold text-white tracking-tighter font-mono">&#x20B9;{finalTotalAmount.toFixed(2)}</span>
             </div>
             <button
               onClick={handlePayNow}
               disabled={isPaying || timeRemaining <= 0}
               className="w-full py-5 rounded-2xl bg-white text-black poppins-bold uppercase tracking-[0.2em] text-[12px] hover:bg-neutral-300 disabled:opacity-30 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex justify-center items-center gap-3 active:scale-[0.98]"
             >
               {isPaying ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    VERIFYING...
                  </div>
               ) : (
                  <>
                    <FaShieldAlt size={14} className="opacity-60" />
                    CONFIRM & PAY NOW
                  </>
               )}
             </button>
          </div>
        </div>
      </div>

      {/* MOBILE CONCESSIONS MODAL */}
      <div className={`fixed inset-0 z-[100] flex items-end lg:hidden transition-all duration-500 ${isSnackModalOpen ? 'visible bg-black/95 backdrop-blur-sm' : 'invisible bg-transparent pointer-events-none'} select-none`}>
        <div className={`w-full max-h-[90vh] bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl p-6 z-10 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isSnackModalOpen ? 'translate-y-0' : 'translate-y-full'}`}>
           <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
             <h2 className="text-xs poppins-bold uppercase tracking-[0.3em] text-white">Concessions Menu</h2>
             <button onClick={() => setIsSnackModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors active:scale-95"><FaTimes size={12}/></button>
           </div>
           <div className="overflow-y-auto max-h-[65vh] custom-scrollbar pb-6"><SnacksMenu /></div>
           <button onClick={() => setIsSnackModalOpen(false)} className="w-full py-4 mt-2 bg-white text-black rounded-2xl poppins-bold uppercase tracking-[0.2em] text-[10px] active:scale-[0.98] transition-transform">Confirm Additions</button>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;
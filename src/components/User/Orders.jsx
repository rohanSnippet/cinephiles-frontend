import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { AuthContext } from "../Context/AuthProvider";
import Loading from "../Common/Loading";
import { FaChevronLeft, FaTicketAlt, FaQuoteLeft } from "react-icons/fa";

// Array of iconic movie dialogues
const movieQuotes = [
  { text: "May the Force be with you.", movie: "Star Wars" },
  { text: "I'm gonna make him an offer he can't refuse.", movie: "The Godfather" },
  { text: "Here's looking at you, kid.", movie: "Casablanca" },
  { text: "Why so serious?", movie: "The Dark Knight" },
  { text: "To infinity and beyond!", movie: "Toy Story" },
  { text: "I am your father.", movie: "Star Wars: The Empire Strikes Back" },
  { text: "Just keep swimming.", movie: "Finding Nemo" },
  { text: "I'll be back.", movie: "The Terminator" },
  { text: "You can't handle the truth!", movie: "A Few Good Men" },
  { text: "Life is like a box of chocolates.", movie: "Forrest Gump" },
  { text: "Roads? Where we're going we don't need roads.", movie: "Back to the Future" },
  { text: "I feel the need - the need for speed!", movie: "Top Gun" }
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState({});

  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const username = user?.username || localStorage.getItem("username");

  // Select a random quote on mount
  useEffect(() => {
    const randomQuote = movieQuotes[Math.floor(Math.random() * movieQuotes.length)];
    setQuote(randomQuote);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    if (!username) {
      setLoading(false);
      setError("Username not available to fetch orders.");
      return;
    }
    try {
      const response = await axiosSecure.get(`/order/getOrder/${username}`);
      setOrders(response.data);
      console.log(response.data)
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      if (err.response) {
        if (err.response.status === 404) {
          setOrders([]);
        } else {
          setError(err.response.data.message || `Error: ${err.response.status}`);
        }
      } else if (err.request) {
        setError("No response from server. Please check your network connection.");
      } else {
        setError(err.message || "An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchOrders();
    } else {
      setLoading(false);
      setError("User not logged in or username not found.");
    }
  }, [username]);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
      case 'BOOKED':
      case 'SUCCESS':
        return 'text-green-500 border-green-500';
      case 'PENDING':
        return 'text-yellow-500 border-yellow-500';
      case 'FAILED':
      case 'CANCELLED':
        return 'text-red-500 border-red-500';
      default:
        return 'text-neutral-400 border-neutral-600';
    }
  };

  // Helper to generate a fake barcode pattern
  const renderBarcode = () => {
    const bars = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 1];
    return (
      <div className="flex h-12 items-center justify-center opacity-60">
        {bars.map((width, i) => (
          <div key={i} className="bg-white h-full" style={{ width: `${width * 2}px`, marginRight: '2px' }}></div>
        ))}
      </div>
    );
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6">
        <div className="bg-[#0a0a0a] border border-neutral-800 p-8 rounded-sm max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl poppins-bold mb-2 uppercase tracking-widest text-white">Error Fetching Tickets</h2>
          <p className="text-neutral-400 poppins-light mb-6">{error}</p>
          <button
            onClick={() => { setError(null); fetchOrders(); }}
            className="w-full py-3 bg-white text-black poppins-bold uppercase tracking-widest hover:bg-neutral-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 font-sans selection:bg-white/20 pb-20">

      {/* Strict Minimal Navbar */}
      <div className="sticky top-0 w-full h-16 bg-[#050505]/90 backdrop-blur-xl border-b border-neutral-800 z-50 flex items-center px-4 sm:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors poppins-semibold text-xs uppercase tracking-widest"
        >
          <FaChevronLeft size={12} /> BACK
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12">

        {/* Header Section */}
        <div className="mb-12 border-b border-neutral-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl poppins-bold tracking-widest uppercase text-white mb-2 flex items-center gap-3">
               <FaTicketAlt className="text-neutral-600" />
               ADMISSION TICKETS
            </h1>
            <p className="text-xs text-neutral-500 poppins-medium uppercase tracking-[0.2em]">
              Passenger: <span className="text-white">{username?.split('@')[0]}</span>
            </p>
          </div>

          {/* Random Movie Quote Box */}
          <div className="bg-[#0a0a0a] border border-neutral-800 p-4 max-w-md w-full relative">
             <FaQuoteLeft className="absolute top-4 left-4 text-neutral-700 opacity-30" size={24} />
             <p className="text-sm poppins-light italic text-neutral-300 pl-8 leading-relaxed">
               "{quote.text}"
             </p>
             <p className="text-[10px] poppins-bold uppercase tracking-widest text-neutral-500 text-right mt-2">
               — {quote.movie}
             </p>
          </div>
        </div>

        {/* Tickets List */}
        <div className="flex flex-col gap-6">
          {!orders || orders.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-24 bg-[#0a0a0a] border border-neutral-800 border-dashed rounded-sm">
              <FaTicketAlt className="text-5xl text-neutral-800 mb-4" />
              <p className="text-lg poppins-bold uppercase tracking-widest text-neutral-400">No Tickets Found</p>
              <button onClick={() => navigate("/")} className="mt-6 px-8 py-3 bg-white text-black poppins-bold uppercase tracking-widest text-xs hover:bg-neutral-300 transition-colors">
                Box Office
              </button>
            </div>
          ) : (
            orders.map((orderItem) => (

              /* --- REAL TICKET LAYOUT --- */
              <div
                key={orderItem._id || orderItem.orderId}
                className="flex flex-col sm:flex-row w-full bg-[#0a0a0a] border border-neutral-800 shadow-2xl relative"
              >

                {/* 1. MAIN TICKET BODY */}
                <div className="flex-1 p-5 flex gap-5">
                  <img
                    src={orderItem.poster}
                    alt={orderItem.movieTitle}
                    className="w-20 h-28 sm:w-28 sm:h-40 object-cover border border-neutral-700 shadow-md grayscale-[20%] hover:grayscale-0 transition-all"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x150/111/FFF?text=POSTER"; }}
                  />

                  <div className="flex flex-col justify-center w-full">
                    <h3 className="text-xl sm:text-3xl poppins-bold text-white uppercase tracking-tight leading-none mb-1">
                      {orderItem.movieTitle}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-neutral-400 poppins-medium uppercase tracking-widest mb-4">
                      {orderItem.cinema || "CINEPHILES THEATRE"}
                    </p>

                    <div className="grid grid-cols-2 gap-y-4 mt-auto">
                       <div>
                         <p className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] poppins-semibold mb-0.5">Showtime</p>
                         <p className="text-xs sm:text-sm font-mono font-bold text-white">{orderItem.showtime || "TBA"}</p>
                       </div>
                       <div>
                         <p className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] poppins-semibold mb-0.5">Admit</p>
                         <p className="text-xs sm:text-sm font-mono font-bold text-white">{orderItem.seats.split(',').length} Person(s)</p>
                       </div>
                       <div className="col-span-2">
                         <p className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] poppins-semibold mb-0.5">Row / Seat(s)</p>
                         <p className="text-xs sm:text-sm font-mono font-bold text-white tracking-widest break-words">{orderItem.seats}</p>
                       </div>
                    </div>
                  </div>
                </div>

                {/* 2. THE PERFORATION (Tear Line) */}
                {/* Desktop vertical tear line */}
                <div className="hidden sm:flex relative w-8 flex-col justify-center items-center border-l border-dashed border-neutral-700">
                   {/* Top hole */}
                   <div className="absolute -top-4 w-6 h-6 bg-[#050505] rounded-full border-b border-neutral-800"></div>
                   {/* Bottom hole */}
                   <div className="absolute -bottom-4 w-6 h-6 bg-[#050505] rounded-full border-t border-neutral-800"></div>
                </div>

                {/* Mobile horizontal tear line */}
                <div className="sm:hidden relative w-full h-8 flex justify-center items-center border-t border-dashed border-neutral-700 mt-2">
                   <div className="absolute -left-4 w-6 h-6 bg-[#050505] rounded-full border-r border-neutral-800"></div>
                   <div className="absolute -right-4 w-6 h-6 bg-[#050505] rounded-full border-l border-neutral-800"></div>
                </div>

                {/* 3. TICKET STUB */}
                <div className="w-full sm:w-48 bg-[#0a0a0a] sm:bg-[#0f0f0f] p-5 flex flex-row sm:flex-col justify-between sm:justify-center items-center">

                   <div className="flex flex-col text-left sm:text-center sm:mb-6 w-full">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-[0.2em] poppins-semibold mb-1">Total Paid</p>
                      <p className="text-2xl font-mono text-white font-bold tracking-tighter">
                         &#x20B9;{orderItem.totalAmount?.toFixed(2) || "0.00"}
                      </p>

                      <div className={`mt-2 text-[10px] px-2 py-1 border font-bold uppercase tracking-widest w-max sm:mx-auto ${getStatusStyle(orderItem.status)}`}>
                         {orderItem.status || "UNKNOWN"}
                      </div>
                   </div>

                   {/* Barcode and Order ID */}
                   <div className="flex flex-col items-center">
                      <div className="hidden sm:block w-full mb-2">
                         {renderBarcode()}
                      </div>
                      <p className="text-[9px] text-neutral-500 font-mono tracking-widest">
                        ID: {orderItem.orderId}
                      </p>
                   </div>

                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
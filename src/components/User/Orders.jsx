import { useState, useEffect, useContext } from "react";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { AuthContext } from "../Context/AuthProvider"; // Make sure AuthContext is correctly providing user data
import Loading from "../Common/Loading";

const Orders = () => {
  const [orders, setOrders] = useState([]); // Use 'orders' for an array, not 'order' for a single object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();
  const { user } = useContext(AuthContext); // Get user from AuthContext, which should contain username
  const username = user?.username || localStorage.getItem("username"); // Prefer context, fallback to localStorage

  // console.log("Current username:", username);

  const fetchOrders = async () => {
    // Renamed for clarity as it fetches multiple orders
    setLoading(true);
    setError(null);

    if (!username) {
      // Prevent fetch if username is not available
      setLoading(false);
      setError("Username not available to fetch orders.");
      return;
    }
    try {
      const response = await axiosSecure.get(`/order/getOrder/${username}`);
      const data = response.data;
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      if (err.response) {
        setError(
          err.response.data.message ||
            `Error: ${err.response.status} - ${err.response.statusText}`
        );
        if (err.response.status === 404) {
          setOrders([]); // Set to empty array if 404 implies no orders
          setError("No orders found for this user."); // More user-friendly message
        }
      } else if (err.request) {
        setError(
          "No response from server. Please check your network connection."
        );
      } else {
        setError(err.message || "An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      setTimeout(() => {
        fetchOrders();
      }, 250);
    } else {
      setLoading(false); // If no username, stop loading and potentially show a message
      setError("User not logged in or username not found.");
    }
  }, [username]); // Depend on username to re-fetch if it changes

  // --- Render Logic ---

  if (loading) {
    return (
    <Loading/>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error Fetching Orders</h2>
        <p>{error}</p>
        <button
          onClick={() => {
            // Reset error and re-attempt fetch
            setError(null);
            fetchOrders();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

    const getStatusColor = (status) => {
    switch (status) {
      case 'Booked':
        return 'text-green-600';
      case 'Pending':
        return 'text-yellow-600';
      case 'Cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };


  // If no orders after loading, display a message
  if (!orders || orders.length === 0) {
    return (
      <div className="no-data-message">No orders found for this user.</div>
    );
  }

  // Display orders
  return (
     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 font-inter p-4 sm:p-6 lg:p-8">
      {/* Tailwind CSS CDN for styling */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Google Fonts - Inter */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Custom CSS for Inter font */}
      <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
            Your Movie Bookings
          </h1>
          <p className="text-xl sm:text-2xl mt-2 text-gray-300">Welcome back, <span className="font-semibold text-white">{username}</span>!</p>
        </div>

        {/* Order Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.length === 0 ? (
            <p className="col-span-full text-center text-gray-400 text-lg">No movie bookings found.</p>
          ) : (
            orders.map((orderItem) => (
              <div
                key={orderItem._id}
                className="order-item bg-gray-700 bg-opacity-70 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-600"
              >
                <div className="flex flex-col sm:flex-row items-center p-4">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                    <img
                      src={orderItem.poster}
                      alt={`${orderItem.movieTitle} Poster`}
                      className="w-24 h-36 object-cover rounded-lg shadow-md"
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x150/333/FFF?text=No+Poster"; }}
                    />
                  </div>

                  {/* Order Details */}
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="text-xl font-semibold text-white mb-1">{orderItem.movieTitle}</h3>
                    <p className="text-gray-300 text-sm mb-2">{orderItem.showtime}</p>
                    <p className="text-gray-400 text-sm">Cinema: <span className="font-medium text-gray-200">{orderItem.cinema}</span></p>
                    <p className="text-gray-400 text-sm">Seats: <span className="font-medium text-gray-200">{orderItem.seats}</span></p>
                    <p className="text-gray-400 text-sm mt-2">Order ID: <span className="font-mono text-gray-200">{orderItem.orderId}</span></p>
                    <p className="text-lg font-bold text-white mt-2">Total: <span className="text-green-400">${orderItem.totalAmount.toFixed(2)}</span></p>
                    <p className="text-md font-medium mt-1">Status: <span className={`${getStatusColor(orderItem.status)}`}>{orderItem.status}</span></p>
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

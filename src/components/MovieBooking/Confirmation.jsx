import React from 'react'
import { FaCheck } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'

const Confirmation = () => {

  /* 
  {
    "pathname": "/booking-confirmation",
    "search": "",
    "hash": "",
    "state": {
        "res": {
            "success": true,
            "message": "Payment made successfully.",
            "movieTitle": "Coolie",
            "moviePoster": "http://res.cloudinary.com/cinephiles-app/image/upload/v1752917938/cinephiles-movie-poster/mur2fvyl5l39mvghqxsm.webp",
            "movieCertification": "CERTIFICATION_UA",
            "theatre": "Metro Inox",
            "location": "Near Bail bazaar, Chakki Naka",
            "theatreCity": "Kalyan",
            "screenName": "Audi 1",
            "seatIds": "D7,D8",
            "showFormat": "2D",
            "showTime": "07:00",
            "showDate": "2025-07-21",
            "bookingId": "HPQYT20430"
        }
    },
    "key": "boona5ts"
} */
  const location = useLocation();
  console.log(location)

  const data = location.state.res;
  let seatNums = data.seatIds.split(",");
  

  return (
    <div>
      <div className="bg-gray-100 p-6">
  <div className="max-w-xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border">
    {/* <!-- Header --> */}
    <div className="p-4 text-center border-b">
      <img src="https://in.bmscdn.com/webin/common/icons/logo.svg" alt="BookMyShow Logo" className="mx-auto w-40"/>
      <h2 className="text-green-600 font-semibold text-lg mt-2">Your booking is confirmed!</h2>
      <p className="text-gray-700 text-sm mt-1">Booking ID <span className="font-bold">{data.bookingId}</span></p>
    </div>

    {/* <!-- Movie Info --> */}
    <div className="flex p-4 items-center gap-4">
      <img src={data.moviePoster} alt="Movie Poster" className="w-20 h-28 rounded-md object-cover"/>
      <div>
        <h3 className="text-lg font-semibold">{data.movieTitle} ({data.movieCertification === "CERTIFICATION_UA" ? "U/A" : data.movieCertification.substring(14,data.movieCertification.length)})</h3>
        <p className="text-gray-600 text-sm">{data.showTime} AM | Thu, 19 Jul, 2018</p>
        <p className="text-gray-600 text-sm">{data.theatre} ({data.location})</p>
        <p className="text-gray-600 text-sm">{data.theatreCity}, {data.theatreCity}</p>
      </div>
    </div>

    {/* <!-- Ticket Info --> */}
    <div className="px-4 pb-4 flex justify-between items-center border-b">
      <div>
        <p className="font-bold text-xl">{seatNums.length}</p>
        <p className="text-gray-600 text-sm">Tickets</p>
      </div>
      <div>
        <p className="text-gray-700 text-sm">LOWER BA - {data.seatIds}</p>
      </div>
      <div className="text-center">
        <div className="text-green-600 font-bold border-2 border-green-600 px-2 py-1 rounded-md">Booking Confirmed</div>
      </div>
    </div>

    {/* <!-- Coupon Info --> */}
    <div className="px-4 py-3 border-b flex justify-between items-center">
      <p className="text-gray-700 text-sm">Congrats! Coupons Unlocked.</p>
      <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Select Coupons</button>
    </div>

    {/* <!-- Order Summary --> */}
    <div className="p-4 border-b">
      <h4 className="font-semibold text-gray-800 mb-2">ORDER SUMMARY</h4>
      <div className="text-sm text-gray-700 space-y-2">
        <div className="flex justify-between">
          <span>TICKET AMOUNT</span>
          <span>Rs.200.00</span>
        </div>
        <div className="flex justify-between">
          <span>Internet Handling Fees</span>
          <span>Rs.32.92</span>
        </div>
        <div className="flex justify-between text-gray-900 font-bold">
          <span>Amount Paid</span>
          <span>Rs.232.92</span>
        </div>
      </div>
    </div>

    {/* <!-- Booking Details --> */}
    <div className="p-4 border-b text-sm text-gray-700">
      <p><span className="font-semibold">Booking Date & Time:</span> Thu, 19 Jul, 2018 | 8:44am</p>
      <p><span className="font-semibold">Payment Type:</span> Amazon Pay</p>
      <p><span className="font-semibold">Confirmation#:</span> 76256</p>
    </div>

    {/* <!-- Important Instructions --> */}
    <div className="p-4 text-xs text-gray-600">
      <p className="font-semibold">IMPORTANT INSTRUCTIONS</p>
      <ul className="list-decimal list-inside space-y-1 mt-2">
        <li>Please collect physical tickets from the box office.</li>
        <li>Please carry your CC/DC card which was used for booking tickets.</li>
        <li>Only BookMyShow server messages are allowed. Printed and forwarded messages are not allowed.</li>
        <li>Children of ages 3 and above will require a separate ticket.</li>
      </ul>
      <p className="mt-3">This transaction cannot be cancelled as per cinema cancellation policy.</p>
    </div>
  </div>
</div>
    </div>
   )
}

export default Confirmation

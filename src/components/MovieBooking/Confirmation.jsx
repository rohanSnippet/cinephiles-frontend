import React from "react";
import { FaCheck } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import confirmed from "../../assets/confirmed.png";

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state.res;
  let seatNums = data.seatIds.split(",");
  console.log(data)

  return (
    <div>
      <div className="bg-gray-600 p-6">
        <div className="max-w-xl mx-auto bg-slate-800 text-white shadow-lg rounded-lg overflow-hidden border">
          {/* <!-- Header --> */}
          <div className="p-4 text-center border-b ">
            <div className="text-lg poppins-bold">Cinephiles</div>
            <h2 className="text-green-600 font-semibold text-lg mt-2">
              Your booking is confirmed!
            </h2>
            <p className="text-gray-100 text-sm mt-1">
              Booking ID <span className="font-bold">{data.bookingId}</span>
            </p>
          </div>

          {/* <!-- Movie Info --> */}
          <div className="flex p-4 items-center gap-4 ">
            <img
              src={data.moviePoster}
              alt="Movie Poster"
              className="w-20 h-28 rounded-md object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold">
                {data.movieTitle} (
                {data.movieCertification === "CERTIFICATION_UA"
                  ? "U/A"
                  : data.movieCertification.substring(
                      14,
                      data.movieCertification.length
                    )}
                )
              </h3>
              <p className="text-gray-200 text-sm">
                {data.showTime} AM | Thu, 19 Jul, 2018
              </p>
              <p className="text-gray-200 text-sm">
                {data.theatre} ({data.location})
              </p>
              <p className="text-gray-200 text-sm">
                {data.theatreCity}, {data.theatreCity}
              </p>
            </div>
          </div>

          {/* <!-- Ticket Info --> */}
          <div className="px-4 pb-4 flex justify-between items-center border-b">
            <div className="text-amber-300">
              <p className="poppins-bold md:text-2xl text-xl">
                {seatNums.length}
              </p>
              <p className="md:text-md text-sm poppins-regular">Tickets</p>
            </div>
            <div>
              <p className="text-gray-300 text-lg poppins-medium">
                {data.tierName} - {data.seatIds}
              </p>
            </div>
            <div className="text-center">
              <img
                src={confirmed}
                alt="Booking Confirmed"
                srcset=""
                className="w-32"
              />
            </div>
          </div>

          {/* <!-- Coupon Info --> */}
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <p className="text-gray-100 text-sm">Congrats! Coupons Unlocked.</p>
            <button
              className="bg-amber-500/80 text-white px-3 py-1 rounded text-sm poppins-light"
              onClick={() => navigate("/")}
            >
              Home Page
            </button>
          </div>

          {/* <!-- Order Summary --> */}
          <div className="p-4 border-b">
            <h4 className="font-semibold text-gray-200 mb-2">ORDER SUMMARY</h4>
            <div className="text-sm text-gray-200 space-y-2">
              <div className="flex justify-between">
                <span>TICKET AMOUNT</span>
                <span>Rs.{data.amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Internet Handling Fees</span>
                <span>Rs.{data.cgst + data.sgst}</span>
              </div>
              <div className="flex justify-between text-gray-300 font-bold">
                <span>Amount Paid</span>
                <span>Rs.{data.amount + data.cgst + data.sgst}</span>
              </div>
            </div>
          </div>

          {/* <!-- Booking Details --> */}
          <div className="p-4 border-b text-sm text-gray-100">
            <p>
              <span className="font-semibold">Booking Date & Time:</span> Thu,
              19 Jul, 2018 | 8:44am
            </p>
            <p>
              <span className="font-semibold">Payment Type:</span> Amazon Pay
            </p>
            <p>
              <span className="font-semibold">Confirmation#:</span> 76256
            </p>
          </div>

          {/* <!-- Important Instructions --> */}
          <div className="p-4 text-xs text-gray-400">
            <p className="font-semibold">IMPORTANT INSTRUCTIONS</p>
            <ul className="list-decimal list-inside space-y-1 mt-2">
              <li>Please collect physical tickets from the box office.</li>
              <li>
                Please carry your CC/DC card which was used for booking tickets.
              </li>
              <li>
                Only Cinephiles server messages are allowed. Printed and
                forwarded messages are not allowed.
              </li>
              <li>
                Children of ages 3 and above will require a separate ticket.
              </li>
            </ul>
            <p className="mt-3">
              This transaction cannot be cancelled as per cinema cancellation
              policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;

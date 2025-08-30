import React, { useEffect, useState } from "react";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { GiCheckMark } from "react-icons/gi";
import { ImCross } from "react-icons/im";
import { MdMovieEdit } from "react-icons/md";
import Swal from "sweetalert2";

const TheatresInfo = () => {
  const axiosSecure = useAxiosSecure();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axiosSecure.get(`/get-requests`);
      const data = res.data;
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setTimeout(() => {}, 1000);
    fetchData();
  }, [axiosSecure]);

  const handleMakeOwner = async (request) => {
    try {
      setLoading(true);
      const res1 = await axiosSecure.put(
        `/admin/make-owner?username=${request.username}&&id=${request.id}`
      );
      if (res1) {
        Swal.fire({
          title: `Granted permissions!`,
          icon: "success",
          width: "600px",
          background: "rgba(43, 43, 46, 0.845)",
          color: "white",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      fetchData();
    }
  };

  // Add this function to handle reject requests
  const handleRejectRequest = async (request) => {
    // Implement your reject logic here
    console.log("Reject request:", request);
  };

  return (
    <div className="relative w-full p-4 sm:p-6 lg:p-8 bg-gray-800 rounded-lg min-h-screen">
      {/* Header */}
      <div className="ring-2 ring-gray-900 ring-offset-2 rounded-xl flex flex-col sm:flex-row items-center justify-center sm:justify-start bg-gradient-to-br from-black via-gray-900 to-black mb-6 shadow-2xl text-white shadow-slate-600 p-4 sm:p-5 text-xl sm:text-2xl poppins-semibold gap-x-4">
        <MdMovieEdit size={32} className="mb-2 sm:mb-0 sm:ml-4 flex-shrink-0" />
        <span className="text-center sm:text-left">
          MANAGE THEATRE REQUESTS
        </span>
      </div>

      {loading && (
        <div className="w-full flex items-center justify-center p-8 min-h-[200px] rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="loading loading-spinner loading-md sm:loading-lg md:loading-xl text-white/80"></div>
            <div className="poppins-bold text-xl text-white/80">
              Loading Theatre Requests...
            </div>
          </div>
        </div>
      )}

      {/* Table Container for Responsiveness */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg shadow-md">
        <table className="table w-full text-center">
          {/* Table Head - Fixed whitespace issue here */}
          <thead className="bg-gray-700 text-white roboto-semibold text-sm sm:text-base">
            <tr>{/* No whitespace between tr and th */}
              <th className="px-4 py-3 text-left">Theatre</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">User</th>
              <th className="px-4 py-3">Screens</th>
              <th className="px-4 py-3">Accept</th>
              <th className="px-4 py-3">Reject</th>
            </tr>
          </thead>

          {/* Table Body */}
          {requests && requests.length > 0 ? (
            <tbody>
              {requests.map(
                (request, index) =>
                  request.status === "PENDING" ? (
                    <tr
                      key={request._id || index}
                      className="roboto-regular text-white border-b border-gray-700 hover:bg-gray-800 transition-colors duration-200"
                    >{/* No whitespace between tr and td */}
                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <img
                              src="https://img.daisyui.com/images/profile/demo/2@94.webp"
                              alt="Theatre Avatar"
                              className="w-10 h-10 sm:w-12 sm:h-12 mask mask-squircle object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-base sm:text-lg whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] sm:max-w-xs">
                              {request.tname}
                            </div>
                            <div className="text-sm opacity-60">
                              {request.tlocation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-left">
                        <div className="flex flex-col">
                          <span className="font-medium text-base">
                            {request.username}
                          </span>
                          <span className="badge badge-ghost badge-sm text-gray-400 mt-1">
                            {request.contact}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-lg font-bold">
                        {request.tscreens}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="btn btn-ghost btn-circle text-green-400 hover:bg-green-600/20 hover:text-green-300 transition-colors duration-200"
                          onClick={() => handleMakeOwner(request)}
                          aria-label="Accept Request"
                        >
                          <GiCheckMark size={24} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="btn btn-ghost btn-circle text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-colors duration-200"
                          onClick={() => handleRejectRequest(request)}
                          aria-label="Reject Request"
                        >
                          <ImCross size={20} />
                        </button>
                      </td>
                    </tr>
                  ) : null
              )}
            </tbody>
          ) : (
            <tbody>
              <tr>{/* No whitespace between tr and td */}
                <td colSpan="5" className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-900 rounded-lg shadow-inner text-white">
                  <div className="flex flex-col items-center p-8 text-center">
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/7486/7486809.png"
                      alt="No Owners Found"
                      className="w-24 h-24 mb-4 opacity-70"
                    />
                    <div className="poppins-bold text-xl sm:text-2xl">
                      No Pending Requests Found
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default TheatresInfo;
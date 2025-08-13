import React, { useEffect, useState } from "react";
import { PiFilmReelBold } from "react-icons/pi";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { IoIosMail } from "react-icons/io";

const OwnersInfo = () => {
  const [allOwners, setAllOwners] = useState([]);
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);

  const getAllOwners = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get(`/owner/get-owners`);
      if (res) {
        setAllOwners(res.data);
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {}, 3000);
    getAllOwners();
  }, []);

  return (
    // Outer container: Ensure it takes full available width and adds consistent horizontal padding
    <div className="relative w-full p-4 sm:p-6 lg:p-8 bg-gray-800 rounded-lg min-h-screen">
      {/* Header */}
      <div className="ring-2 ring-gray-900 ring-offset-2 rounded-xl flex flex-col sm:flex-row items-center justify-center sm:justify-start bg-gradient-to-br from-black via-gray-900 to-black mb-6 shadow-2xl text-white shadow-slate-600 p-4 sm:p-5 text-xl sm:text-2xl poppins-semibold gap-x-4">
        <PiFilmReelBold size={32} /> MANAGE OWNERS & THEATRES{" "}
      </div>
      {loading && (
        <div className="w-full flex items-center justify-center p-8 min-h-[200px] rounded-lg">
          <div className="flex flex-col items-center gap-4">
            {" "}
            {/* Added flex-col and gap for stacking */}
            <div className="loading loading-spinner loading-md sm:loading-lg md:loading-xl text-white/80"></div>
            <div className="poppins-bold text-xl text-white/80">
              Loading owners...
            </div>{" "}
            {/* Added text-white for visibility */}
          </div>
        </div>
      )}

      {allOwners === null ||
        (allOwners.length === 0 && (
          <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-900 rounded-lg shadow-inner text-white">
            <div className="flex flex-col items-center p-8 text-center">
              <img
                src="https://cdn-icons-png.flaticon.com/128/7486/7486809.png"
                alt="No Owners Found"
                className="w-24 h-24 mb-4 opacity-70"
              />
              <div className="poppins-bold text-xl sm:text-2xl">
                No Owners Found
              </div>
            </div>
          </div>
        ))}

      {/* All Theatres with Owners */}
      {/* Ensure this container and its children take full width */}
      <div className="grid grid-cols-1">
        {allOwners.map((owner, i) => (
          <div
            key={owner.user._id || i}
            className="collapse collapse-arrow mt-4 bg-gradient-to-br from-black/50 via-gray-900/40 to-slate-900 rounded-lg w-full overflow-hidden"
          >
            <input type="checkbox" className="min-h-12" />
            <div className="collapse-title relative flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-y-2 ring-white/30 ring-1 w-full px-10 py-3 sm:py-4">
              {/* Owner Name Section */}
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                <div className="text-lg poppins-bold text-white flex-shrink-0">
                  {i + 1}.
                </div>
                <div className="flex flex-wrap items-center gap-x-1 sm:gap-x-2 min-w-0">
                  <span className="poppins-bold text-lg sm:text-xl text-white truncate max-w-full">
                    {owner.user.firstName}
                  </span>
                  <span className="poppins-bold text-lg sm:text-xl text-white truncate max-w-full">
                    {owner.user.lastName}
                  </span>
                </div>
              </div>

              {/* Contact Info (Mail & Phone) - Grouped for better responsiveness */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-1 flex-grow sm:flex-grow-0 sm:ml-auto">
                {/* Username (Email) */}
                <div className="flex items-center gap-1 poppins-light text-sm sm:text-md text-white/90 truncate max-w-[200px] sm:max-w-none">
                  <IoIosMail size={20} className="flex-shrink-0" />
                  {owner.user.username}
                </div>

                {/* Phone */}
                <div className="poppins-light text-sm sm:text-md text-white/90 truncate max-w-[200px] sm:max-w-none">
                  {owner.user.phone || "Contact Not Provided"}
                </div>
              </div>

              {/* Theatre Count Section */}
              <div className="flex items-center justify-end py-1 mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
                <div className="poppins-semibold text-base sm:text-lg text-white whitespace-nowrap">
                  {owner.theatres.length} Theatre(s)
                </div>
              </div>
            </div>

            {/* Collapse Content: Theatre List */}
            <div className="collapse-content px-4 py-2  sm:px-6 w-full border-t border-white/10 pt-4">
              {owner.theatres.length > 0 ? (
                <div className="space-y-4">
                  {" "}
                  {/* Added space-y for consistent spacing */}
                  {owner.theatres.map((theatre, index) => (
                    <div
                      key={theatre._id || index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-md roboto-bold text-white/70 bg-gray-800/50 p-3 rounded-md border border-gray-700/50"
                    >
                      <div className="flex items-center gap-3 mb-1 sm:mb-0">
                        <span className="flex-shrink-0 text-base">
                          {index + 1}.
                        </span>
                        <div>
                          <div className="text-white text-base sm:text-lg">
                            {theatre.name}
                          </div>
                          <div className="roboto-light text-sm text-white/60">
                            {theatre.city}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-4">
                        <span className="flex-shrink-0 roboto-regular text-sm text-white/80">
                          Screens:
                        </span>
                        <span className="text-white">{theatre.tscreens}</span>
                      </div>
                      <div className="roboto-regular text-sm mt-2 sm:mt-0 sm:ml-4">
                        {theatre.contact || "No Contact Provided"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white/70 text-center py-4 roboto-light">
                  No theatres registered for this owner.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnersInfo;

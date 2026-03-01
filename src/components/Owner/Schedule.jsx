import { useEffect, useState } from "react";
import useAxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";
import { MdOutlineDelete } from "react-icons/md";
import { PIXELS_PER_MINUTE, START_HOUR, TOTAL_HOURS, TIMELINE_WIDTH } from "../Owner/Show/ShowDetails";

const Schedule = ({ screen, selectedDate }) => {
  const [shows, setShows] = useState([]);
  const axiosSecure = useAxiosSecure();
  const interval = 15; // 15 mins cleaning time

  // Mathematical Time Conversion (Base: 06:00 AM)
  const getMinutesFromStart = (timeStr) => {
    if (!timeStr) return 0;
    let [h, m] = timeStr.split(":").map(Number);
    if (h < START_HOUR) h += 24; // Handle post-midnight shows
    return (h - START_HOUR) * 60 + m;
  };

  const fetchShows = async () => {
    try {
      const res = await axiosSecure.get(`/show/byScreen?screenId=${screen.id}&showDate=${selectedDate}`);
      setShows(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (screen?.id && selectedDate) fetchShows();
  }, [screen?.id, selectedDate]);

  const deleteShow = async (showId) => {
    try {
      await axiosSecure.delete(`/show/delete-show/${showId}`);
      fetchShows();
    } catch (err) {
      Swal.fire("Error", "Failed to delete show", "error");
    }
  };

  // Render Background Grid Lines (Every 15 mins)
  const renderBackgroundLines = () => {
    const lines = [];
    for (let i = 0; i <= TOTAL_HOURS * 4; i++) { // Every 15 mins
      const isHour = i % 4 === 0;
      lines.push(
        <div
          key={i}
          className={`absolute top-0 bottom-0 border-l ${isHour ? "border-white/10" : "border-white/5 border-dashed"}`}
          style={{ left: `${i * 15 * PIXELS_PER_MINUTE}px` }}
        />
      );
    }
    return lines;
  };

  return (
    <div className="h-20 relative w-full group">

      {/* Background Sub-Grid */}
      {renderBackgroundLines()}

      {/* Show Blocks */}
      {shows.map((show) => {
        const startMins = getMinutesFromStart(show.start);
        const movieWidth = show.runtime * PIXELS_PER_MINUTE;
        const cleaningWidth = interval * PIXELS_PER_MINUTE;
        const leftPos = startMins * PIXELS_PER_MINUTE;

        return (
          <div
            key={show.id}
            className="absolute top-2 bottom-2 flex shadow-lg hover:z-30 hover:-translate-y-1 transition-transform"
            style={{ left: `${leftPos}px`, width: `${movieWidth + cleaningWidth}px` }}
          >
            {/* The Actual Movie Block */}
            <div
              className="h-full bg-gradient-to-r from-red-700 to-red-900 border border-red-500 rounded-lg flex flex-col justify-center px-2 sm:px-3 overflow-hidden relative shadow-[0_0_15px_rgba(220,38,38,0.2)]"
              style={{ width: `${movieWidth}px` }}
              title={`${show.title} (${show.start} - ${show.end})`}
            >
              <span className="text-white poppins-bold text-xs sm:text-sm truncate leading-tight drop-shadow">
                {show.title}
              </span>
              <span className="text-red-200 poppins-medium text-[9px] sm:text-[10px] tracking-wider truncate">
                {show.start} - {show.end}
              </span>

              {/* Hover Delete Action */}
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={() => deleteShow(show.id)}
                  className="p-1.5 bg-red-600 text-white rounded hover:bg-red-500 transition-colors shadow-lg flex items-center gap-1 text-[10px] poppins-semibold uppercase"
                >
                  <MdOutlineDelete size={14} /> Remove
                </button>
              </div>
            </div>

            {/* The Cleaning Interval Block (Prevents Artificial Overlaps) */}
            <div
              className="h-full flex items-center pl-1 opacity-50"
              style={{ width: `${cleaningWidth}px` }}
              title="Cleaning & Transition Time"
            >
              <div className="w-full h-1/2 border-y border-r border-dashed border-white/40 rounded-r-md bg-white/5"></div>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default Schedule;
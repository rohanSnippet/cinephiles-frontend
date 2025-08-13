import { useEffect, useState, useMemo } from "react";
import useAxiosSecure from "../Hooks/AxiosSecure";
import Swal from "sweetalert2";
import { MdEdit, MdInfoOutline, MdOutlineDelete } from "react-icons/md";

const Schedule = ({ screen, selectedDate, isSelected, setShowsDetails }) => {
  const [shows, setShows] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [offsetX, setOffsetX] = useState(0);
  const axiosSecure = useAxiosSecure();
  let interval = 15;
  // Utility functions
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const calculateEndTime = (startTime, runtime) => {
 
    const startMinutes = timeToMinutes(startTime);
    const totalMinutes = startMinutes + runtime + interval;
    const isNextDay = totalMinutes >= 1440; // 24*60

    return {
      endTime:
        `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")}:` +
        `${String(totalMinutes % 60).padStart(2, "0")}`,
      isNextDay,
      totalMinutes,
    };
  };

  // Memoized timeline generation
  const timeline = useMemo(() => {
    const entries = [];
    for (let hour = 0; hour < 27; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const adjustedHour = hour >= 24 ? hour - 24 : hour;
        entries.push({
          time: `${String(adjustedHour).padStart(2, "0")}:${String(
            minute
          ).padStart(2, "0")}`,
          hour: hour % 24,
          minute,
          isNextDay: hour >= 24,
          totalMinutes: hour * 60 + minute,
        });
      }
    }
    return entries;
  }, []);

  // Precompute blocked next day ranges
  const blockedNextDayRanges = useMemo(() => {
    return shows
      .map((show) => {
        const { isNextDay, totalMinutes } = calculateEndTime(
          show.start,
          show.runtime
       
        );
        if (!isNextDay) return null;
        return {
          start: 0,
          end: totalMinutes - 1440, // 24*60
          startTotal: 1440,
          endTotal: totalMinutes,
        };
      })
      .filter(Boolean);
  }, [shows]);

  const fetchShows = async () => {
    try {
      const res = await axiosSecure.get(
        `/show/byScreen?screenId=${screen.id}&showDate=${selectedDate}`
      );
      // Sort shows by start time
      const sortedShows = res.data.sort(
        (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)
      );
      setShows(sortedShows);
      setShowsDetails(sortedShows);
    } catch (error) {
      console.error("Error fetching shows:", error);
      Swal.fire({ title: "Error loading shows", icon: "error", timer: 2000 });
    }
  };

  useEffect(() => {
    fetchShows();
  }, [screen.id, selectedDate]);

  // Position calculations
  const INTERVAL_WIDTH = 5.9;
  const calculateStartPosition = (startTime) => {
    const minutes = timeToMinutes(startTime);

    //return minutes / 5 * INTERVAL_WIDTH - INTERVAL_WIDTH;
    return (minutes / 5) * INTERVAL_WIDTH;
  };

  const calculateMovieWidth = (runtime) => (runtime / 5) * INTERVAL_WIDTH;

  // Drag handling
  const handleMouseDown = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    setDragging(index);
    setOffsetX(offsetX);
  };

/*   const handleMouseMove = (e) => {
    if (dragging === null) return;

    setShows((prevShows) => {
      const newShows = [...prevShows];
      const show = newShows[dragging];
      const container = document.querySelector(".timeline-container");
      const containerRect = container.getBoundingClientRect();

      let newX = e.clientX - containerRect.left - offsetX;
      newX = Math.max(
        0,
        Math.min(newX, containerRect.width - calculateMovieWidth(show.runtime))
      );

      // Snap to 5-minute intervals
      const snapPosition = Math.round(newX / INTERVAL_WIDTH) * INTERVAL_WIDTH;
      const snappedMinutes = Math.round(snapPosition / INTERVAL_WIDTH) * 5;

      // Update show time
      const newStart =
        `${String(Math.floor(snappedMinutes / 60)).padStart(2, "0")}:` +
        `${String(snappedMinutes % 60).padStart(2, "0")}`;

      // Check for overlaps
      const newEnd = timeToMinutes(newStart) + show.runtime;
      const hasOverlap = newShows.some(
        (s, i) =>
          i !== dragging &&
          timeToMinutes(s.start) < newEnd &&
          timeToMinutes(s.end) > timeToMinutes(newStart)
      );

      if (!hasOverlap) {
        show.start = newStart;
        show.end = calculateEndTime(newStart, show.runtime).endTime;
      }

      return newShows;
    });
  };

  const handleMouseUp = async () => {
    if (dragging !== null) {
      try {
        const show = shows[dragging];
        await axiosSecure.patch(`/show/update/${show.id}`, {
          start: show.start,
        });
        fetchShows(); // Refresh to ensure consistency
      } catch (error) {
        console.error("Error updating show:", error);
        Swal.fire({
          title: "Error saving position",
          icon: "error",
          timer: 2000,
        });
      }
      setDragging(null);
    }
  }; */

  const deleteShow = async (show) => {
    const confirmation = await Swal.fire({
      title: "Delete Show?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
    });

    if (confirmation.isConfirmed) {
      try {
        await axiosSecure.delete(`/show/delete-show/${show.id}`);
        fetchShows();
        Swal.fire({ title: "Show deleted", icon: "success", timer: 2000 });
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({ title: "Delete failed", icon: "error", timer: 2000 });
      }
    }
  };
 /*  function addMinutesToTime(timeStr, minutesToAdd) {
    const [hours, minutes] = timeStr.split(":").map(Number); // Convert string to numbers
    const date = new Date(); // Create a new Date object
    date.setHours(hours, minutes, 0); // Set hours & minutes
  
    date.setMinutes(date.getMinutes() + minutesToAdd); // Add minutes
  
    // Format the new time as HH:MM
    return date.toTimeString().slice(0, 5);
  }
 */
  
  // Timeline rendering
  return (
    <div className="space-y-4">
      <div className="flex mt-20 ml-2 text-white">
        <div
          className={`relative h-20 timeline-container ${
            isSelected ? "selected-screen" : ""
          }`}
        >
          {/* Timeline markers */}
          {timeline.map((entry, index) => {
            const isHour = entry.minute === 0;
            const isQuarter =
              entry.minute === 15 || entry.minute === 30 || entry.minute === 45;
            const isBlocked =
              entry.isNextDay &&
              blockedNextDayRanges.some(
                (range) =>
                  entry.totalMinutes >= range.startTotal &&
                  entry.totalMinutes < range.endTotal
              );

            return (
              <div
                key={index}
                className="absolute h-10 timeline-marker"
                style={{
                  left: `${(entry.totalMinutes / 5) * INTERVAL_WIDTH}px`,
                }}
              >
                <div
                  className={`border-l ${
                    isHour
                      ? "border-2 h-10 border-red-500"
                      : isQuarter
                      ? "border-2 h-6 border-orange-400"
                      : "border h-4 border-gray-600"
                  } ${isBlocked ? "bg-red-500" : ""}`}
                />
                {isHour && (
                  <div className="absolute -top-6 text-xs">
                    {entry.time}
                    {entry.isNextDay ? " (+1)" : ""}
                  </div>
                )}
              </div>
            );
          })}

          {/* Show blocks */}
          {shows.map((show, index) => {
            const startPos = calculateStartPosition(show.start);
            const width = calculateMovieWidth(show.runtime+interval);

            return (
              <div
                key={show.id}
                className="absolute h-full rounded-xl sm:bg-gradient-to-b sm:from-slate-900/90 sm:to-purple-800/30 bg-gradient-to-r from-black/50 via-transparent to-black/40 tooltip tooltip-top"
              data-tip={`Actual runtime : ${show.runtime} minutes`}
                style={{
                  left: startPos,
                  width,
                  backgroundImage: `url(${show.banner})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                  zIndex: dragging === index ? 10 : 1,
                }}
                onMouseDown={(e) => handleMouseDown(e, index)}
              >
                <div className="relative flex flex-col justify-center h-full p-2 bg-gradient-to-b from-black/80 via-gray-600/10 to-black/80 hover:opacity-100 opacity-0 ease-in-out translate-transform duration-300 hover:border-2 hover:border-slate-400/50 rounded-sm">
                  {/* Show Title */}
                 

                  {/* Buttons Container */}
                  <div className="flex gap-2 items-center justify-center p-2">
                    {/* Info Button */}
                    <button
                      aria-label="Show Info"
                      className="p-1 hover:bg-blue-500/50 rounded"
                      onClick={() => showInfo(show)}
                    >
                      <MdInfoOutline className="text-2xl text-blue-200 hover:text-white" />
                    </button>

                    {/* Edit Button */}
                    <button
                      aria-label="Edit Show"
                      className="p-1 hover:bg-yellow-500/50 rounded"
                      onClick={() => editShow(show)}
                    >
                      <MdEdit className="text-2xl text-yellow-200 hover:text-white" />
                    </button>

                    {/* Delete Button */}
                    <button
                      aria-label="Delete Show"
                      className="p-1 hover:bg-red-500/50 rounded"
                      onClick={() => deleteShow(show)}
                    >
                      <MdOutlineDelete className="text-2xl text-red-200 hover:text-white" />
                    </button>
                  </div>
                  <div
                    className="text-md poppins-semibold drop-shadow
                  p-2 text-center break-words whitespace-normal 
                  max-w-full max-h-16 overflow-hidden"
                  >
                    {show.title}
                  </div>
                 
                </div>
                <div
                    className="text-sm poppins-regular drop-shadow
                   text-center break-words whitespace-normal 
                  max-w-full max-h-16 overflow-hidden"
                  >
                    {show.start}    -     {show.end}
                  </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;

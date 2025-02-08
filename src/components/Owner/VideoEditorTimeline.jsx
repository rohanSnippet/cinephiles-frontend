import React, { useState, useEffect, useCallback, useRef } from "react";
import useAxiosSecure from "../Hooks/AxiosSecure";
import { MdOutlineDelete } from "react-icons/md";
import Swal from "sweetalert2";

const VideoEditorTimeline = ({ screen, selectedDate, isSelected }) => {
  const [shows, setShows] = useState([]);

  const axiosSecure = useAxiosSecure();

  const fetchShows = async () => {
    try {
      const res = await axiosSecure.get(
        `/show/byScreen?screenId=${screen.id}&showDate=${selectedDate}`
      );
      setShows(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchShows();
  }, [axiosSecure, screen.id, selectedDate]);

  const timeline = [];
  for (let hour = 0; hour < 27; hour++) {
    // Extend to 27 hours (00:00 to 03:00 next day)
    for (let minute = 0; minute < 60; minute += 5) {
      const adjustedHour = hour >= 24 ? hour - 24 : hour; // Handle overflow after 24 hours
      const formattedHour = String(adjustedHour).padStart(2, "0");
      const formattedMinute = String(minute).padStart(2, "0");

      timeline.push({
        time: `${formattedHour}:${formattedMinute}`,
        hour: hour % 24, // Store hour in 24-hour format for easier comparison
        minute,
        isNextDay: hour >= 24, // Flag hours beyond 24:00 as next day
      });
    }
  }

  // Function to calculate movie's end time
  const calculateEndTime = (startTime, runtime) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    let totalMinutes = startHour * 60 + startMinute + runtime;

    let endHour = Math.floor(totalMinutes / 60) % 24;
    let endMinute = totalMinutes % 60;

    const isNextDay = totalMinutes >= 24 * 60; // If movie goes past midnight

    const formattedEndTime = `${String(endHour).padStart(2, "0")}:${String(
      endMinute
    ).padStart(2, "0")}`;
    console.log(formattedEndTime);
    return { endTime: formattedEndTime, isNextDay, totalMinutes };
  };

  // Function to check if time slot is blocked on next day
  const isBlockedOnNextDay = (startTime, runtime) => {
    const { isNextDay, totalMinutes } = calculateEndTime(startTime, runtime);
    return isNextDay ? totalMinutes - 24 * 60 : null;
  };

  const INTERVAL_WIDTH = 5.9;
  const containerWidth = 1790;
  const divWidth = 100;
  const [dragging, setDragging] = useState(null);
  const [offsetX, setOffsetX] = useState(0);

  const calculateStartPosition = (startTime) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const intervals = totalMinutes / 5;
    const pos = intervals * INTERVAL_WIDTH - 5.9;
    return pos;
  };

  const calculateMovieWidth = (runtime) => {
    const intervals = runtime / 5;
    return intervals * INTERVAL_WIDTH;
  };

  const handleMouseDown = async (e, index) => {
    const divPosition = calculateStartPosition(shows[index].start);
    const mouseX = e.clientX;
    setDragging(index);
    setOffsetX(mouseX - divPosition);
  };

  const handleMouseMove = (e) => {
    if (dragging !== null) {
      const newShows = [...shows];
      let newPosition = e.clientX - offsetX;

      if (newPosition >= 0 && newPosition <= containerWidth - divWidth) {
        const nearestInterval = Math.round(newPosition / INTERVAL_WIDTH) * 5;
        const newHours = Math.floor(nearestInterval / 60);
        const newMinutes = nearestInterval % 60;
        const formattedStart = `${String(newHours).padStart(2, "0")}:${String(
          newMinutes
        ).padStart(2, "0")}`;

        newShows[dragging].start = formattedStart;
        newShows[dragging].end = calculateEndTime(
          formattedStart,
          newShows[dragging].runtime
        ).endTime;

        let isOverlapping = false;
        let overlapIndex = -1;
        for (let i = 0; i < newShows.length; i++) {
          if (i !== dragging) {
            const otherDivStart = calculateStartPosition(newShows[i].start);
            const otherDivEnd =
              otherDivStart + calculateMovieWidth(newShows[i].runtime);
            const draggingDivEnd =
              newPosition + calculateMovieWidth(newShows[dragging].runtime);

            // Check if dragging div overlaps more than halfway
            if (newPosition < otherDivEnd && draggingDivEnd > otherDivStart) {
              const overlapAmount =
                Math.min(draggingDivEnd, otherDivEnd) -
                Math.max(newPosition, otherDivStart);
              const halfWidth =
                calculateMovieWidth(newShows[dragging].runtime) / 2;

              if (overlapAmount > halfWidth) {
                isOverlapping = true;
                overlapIndex = i;
                break;
              }
            }
          }
        }

        if (isOverlapping) {
          const otherDivStart = calculateStartPosition(
            newShows[overlapIndex].start
          );
          newPosition =
            otherDivStart + calculateMovieWidth(newShows[overlapIndex].runtime);
          const newNearestInterval =
            Math.round(newPosition / INTERVAL_WIDTH) * 5;
          const newOverlappingHours = Math.floor(newNearestInterval / 60);
          const newOverlappingMinutes = newNearestInterval % 60;
          newShows[dragging].start = `${String(newOverlappingHours).padStart(
            2,
            "0"
          )}:${String(newOverlappingMinutes).padStart(2, "0")}`;
        }
       // console.log(newShows);
        setShows(newShows);
      }
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };
  const deleteShow = async (s) => {
    try {
      const res = await axiosSecure.delete(`/show/delete-show/${s.id}`);
      console.log(res)
      if (res.status==204) {
        Swal.fire({
          title: "Show deleted",
          icon: "success",
          timer: 2000,
        });
        fetchShows();
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Show not deleted",
        icon: "error",
        timer: 2000,
      });
    }
  };

  useEffect(() => {
    if (dragging !== null) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <div className="space-y-4 ">
      <div className="flex mt-20 ml-2 text-white">
        <div
          className={` flex items-start space-x-1 rounded-md ${
            isSelected ? `selected-screen` : `timeline-container`
          }`}
        >
          {timeline.map((entry, index) => {
            const isHour = entry.minute === 0;
            const isQuarterHour =
              entry.minute === 15 || entry.minute === 30 || entry.minute === 45;
            let isBlocked = false;
            if (shows.length > 0) {
              if (entry.isNextDay) {
                const blockedMinutes = isBlockedOnNextDay(
                  shows[shows.length - 1].start,
                  shows[shows.length - 1].runtime
                );
                if (
                  blockedMinutes &&
                  entry.hour * 60 + entry.minute <= blockedMinutes
                ) {
                  isBlocked = true;
                }
              }
            }
            return (
              <div
                key={index}
                className={`timeline-item relative  ${
                  isHour ? "w-20" : isQuarterHour ? "w-10 " : "w-6"
                }`}
              >
                {isHour && (
                  <div className="absolute -top-6 text-xs poppins-regular text-white">
                    {entry.time} {entry.isNextDay ? "" : ""}
                  </div>
                )}
                <div
                  className={`border-l ${
                    isHour
                      ? "border-2 border-red-500 h-10 hour"
                      : isQuarterHour
                      ? "border-2 border-orange-400 h-6 quarter"
                      : "border border-gray-600 h-4 fivemin"
                  }${isBlocked ? "bg-red-500" : ""}`}
                ></div>
              </div>
            );
          })}
          <div
            className={`flex absolute w-[100%] text-center h-[100%]  container `}
          >
            {shows.length > 0 &&
              shows.map((show, index) => (
                <div
                  key={index}
                  onMouseDown={(e) => handleMouseDown(e, index)}
                  className={`h-[100%] text-white poppins-semibold shadow-sm shadow-red-700 hover:border-2 border-[0.1px] border-transparent hover:border-indigo-200 absolute cursor-grab rounded-lg`}
                  style={{
                    width: calculateMovieWidth(show.runtime),
                    left: `${calculateStartPosition(show.start)}px`,
                    backgroundImage: `url(${show.banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <div className="absolute w-[100%] h-[100%]  rounded-lg bg-gradient-to-b from-slate-900/90 via-transparent to-purple-800/30">
                    {" "}
                    {show.title}
                    <button
                      className="btn bg-transparent transition-opacity border-transparent hover:bg-transparent hover:border-transparent "
                      onClick={() => deleteShow(show)}
                    >
                      <MdOutlineDelete
                        size={28}
                        className="rounded-ss-md  rounded-ee-md hover:bg-red-500/70 hover:text-white text-red-600/80"
                      />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditorTimeline;

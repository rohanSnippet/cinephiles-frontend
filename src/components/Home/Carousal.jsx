import React, { useState, useEffect } from "react";
import videobg1 from "../../assets/carousal1.mp4";
import videobg2 from "../../assets/carousal2.mp4";
import videobg3 from "../../assets/carousal3.mp4";
import videobg4 from "../../assets/carousal4.mp4";
import img1 from "../../assets/carousal1.png";
import img2 from "../../assets/carousal2.png";
import img3 from "../../assets/carousal3.png";
import img4 from "../../assets/carousal4.png";
import Header from "../Header.jsx";

import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const Carousal = ({ onDownArrowClick, showArrow }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videos = [
    {
      name: `Kalki 2898 AD`,
      clip: videobg1,
      poster: img1,
      desc: "A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces.",
    },
    {
      name: `Pushpa 2: The Rule`,
      clip: videobg2,
      poster: img2,
      desc: "A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces.",
    },
    {
      name: `Devra Part-I`,
      clip: videobg3,
      poster: img3,
      desc: "A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces.",
    },
    {
      name: `Kantara Chapter 1`,
      clip: videobg4,
      poster: img4,
      desc: "A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces.",
    },
  ];
  // Logic for carousal starts //
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, 16500); // Change video every 20 seconds

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, [videos.length]);

  const handleNext = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const handlePrevious = () => {
    setCurrentVideoIndex(
      (prevIndex) => (prevIndex - 1 + videos.length) % videos.length
    );
  };
  // Logic for carousal ends //***************

  return (
    <div
      id="cor"
      className="mx-auto md:w-[99%] md:h-[73%] h-[50%] w-[100%] xl:h-[80%] rounded-xl overflow-hidden relative cursor-pointer "
    >
      <div id="header" className="absolute top-0 left-0 w-full z-10">
        {/* Header */}
        <Header />
      </div>
      <div
        id="content"
        className="absolute flex  text-white justify-center h-[70%]  bottom-[0%] w-full"
      >
        <div id="name" className="md:pt-16 md:pl-8 w-[60%] pt-0 pl-2 ">
          <span className="  text-xl md:text-7xl roboto-semibold md:roboto-semibold ml-12 opacity-70">
            {" "}
            {videos[currentVideoIndex].name}
          </span>
          <div className=" pt-4 ml-12 text-xl text-justify w-[60%] poppins-light  text-white">
           {/*  <p className=" mb-12 text-sm md:text-base poppins-regular opacity-70">
              U/A{" "}
              <span className="ml-4 py-2 md:badge md:badge-ghost border-none text-white md:text-white md:bg-opacity-50">
                {" "}
                Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali
              </span>
            </p> */}
            <p className="md:text-xl">{videos[currentVideoIndex].desc}</p>
          </div>
        </div>
        <div id="poster" className=" justify-start ">
          <img
            className="object-cover h-[60%] md:h-full rounded-3xl opacity-75"
            src={videos[currentVideoIndex].poster}
            alt=""
          />
        </div>
      </div>
      {/* Video Background */}
      <video
        id="top"
        src={videos[currentVideoIndex].clip}
        className="w-full h-full object-cover"
        autoPlay
        loop
        muted
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/80"></div>
      {showArrow && (
        <div
          onClick={onDownArrowClick}
          className="fixed bottom-4 left-[50%] transform -translate-x-1/2 rounded-full border-white border-2 text-center h-[36px] w-[36px] cursor-pointer z-50"
        >
          <MdOutlineKeyboardArrowDown className="text-white" size={32} />
        </div>
      )}
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        className="absolute  left-4 top-1/2 transform -translate-y-1/2 bg-transparent text-white px-3 py-2 rounded-full focus:outline-none z-40"
      >
        &#8249;
      </button>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-transparent text-white px-3 py-2 rounded-full focus:outline-none z-10"
      >
        &#8250;
      </button>
    </div>
  );
};

export default Carousal;

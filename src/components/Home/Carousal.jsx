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
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { set } from "react-hook-form";

const Carousal = ({ onDownArrowClick, showArrow }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 16500);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
      setIsTransitioning(false);
    }, 500);
  };

  const handlePrevious = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideoIndex(
        (prevIndex) => (prevIndex - 1 + videos.length) % videos.length
      );
      setIsTransitioning(false);
    }, 500);
  };
  // Logic for carousal ends //***************

  return (
    <div
      id="cor"
      className="mx-auto md:w-[99%] md:h-[73%] h-[50%] w-[100%] xl:h-[80%] rounded-xl overflow-hidden relative cursor-pointer "
    >
      <div id="header" className="absolute top-0 left-0 w-full z-max">
        {/* Header */}
        <Header />
      </div>
      <div
        id="content"
        className="absolute flex  text-white justify-center h-[70%]  bottom-[0%] w-full"
      >
        {/*  <div id="name" className="md:pt-16 md:pl-8 w-[60%] pt-0 pl-2 ">
          <span className="text-xl sm:text-7xl sm:poppins-bold roboto-semibold ml-12 opacity-70">
            {" "}
            {videos[currentVideoIndex].name}
          </span>
          <div className=" pt-4 ml-12 text-justify w-[60%] poppins-light  text-white">
            <p className="md:text-lg text-xs lg:text-xl">{videos[currentVideoIndex].desc}</p>
          </div>
        </div> */}

        <div
          id="name"
          className="w-full md:w-[60%] pt-2 sm:pt-6 md:pt-12 lg:pt-16 px-4 sm:px-6 md:pl-8"
        >
          {/* Name - Responsive font sizes */}
          <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl poppins-bold md:poppins-bold roboto-semibold opacity-70 block mb-2 sm:mb-3 md:mb-4 lg:mb-6">
            {videos[currentVideoIndex].name}
          </span>

          {/* Description - Responsive text and width */}
          <div className="text-justify w-full sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[55%] 2xl:w-[50%] poppins-light text-white">
            <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-md xl:text-xl leading-relaxed sm:leading-loose md:leading-loose">
              {videos[currentVideoIndex].desc}
            </p>
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

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80"></div>
      {showArrow && (
        <div
          onClick={onDownArrowClick}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 rounded-full text-center h-14 w-14 flex items-center justify-center cursor-pointer z-40 animate-float"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
            filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))",
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 animate-ping-slow rounded-full bg-white opacity-20"></div>
            <div
              className="rounded-full border-2 border-white/80 h-12 w-12 flex items-center justify-center relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)",
                backgroundSize: "200% 200%",
                animation: "shine 2s linear infinite",
              }}
            >
              <MdOutlineKeyboardArrowDown
                className="text-white"
                size={32}
                style={{
                  filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))",
                }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        className="absolute hidden sm:block left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-3 sm:p-4 rounded-full transition-all duration-300 focus:outline-none group"
        aria-label="Previous slide"
      >
        <FaChevronLeft
          size={32}
          className="group-hover:scale-110 transition-transform"
        />
      </button>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="absolute hidden sm:block right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-3 sm:p-4 rounded-full transition-all duration-300 focus:outline-none group"
        aria-label="Next slide"
      >
        <FaChevronRight
          size={32}
          className="group-hover:scale-110 transition-transform"
        />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-30 hidden sm:flex space-x-3">
        {videos.map((_, index) => (
          <button
            key={index}
            className={`h-3 w-3 sm:h-2 sm:w-2 rounded-full transition-all duration-300 ${
              index === currentVideoIndex ? "bg-white scale-125" : "bg-white/50"
            }`}
            onClick={() => {
              if (!isTransitioning && index !== currentVideoIndex) {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentVideoIndex(index);
                  setIsTransitioning(false);
                }, 500);
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousal;

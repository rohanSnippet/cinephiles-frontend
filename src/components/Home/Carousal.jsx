import React, { useState, useEffect } from "react";
import videobg1 from "../../assets/carousal1.mp4";
import videobg2 from "../../assets/carousal2.mp4";
import videobg3 from "../../assets/carousal3.mp4";
import videobg4 from "../../assets/carousal4.mp4";
import Header from "../Header.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const Carousal = ({ onDownArrowClick, showArrow }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const videos = [
    {
      name: `Kalki 2898 AD`,
      clip: videobg1,
      desc: "A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to earth to protect the world from evil forces.",
    },
    {
      name: `Pushpa 2: The Rule`,
      clip: videobg2,
      desc: "The clash between Pushpa Raj and Bhanwar Singh Shekhawat continues in this epic action saga.",
    },
    {
      name: `Devara Part-I`,
      clip: videobg3,
      desc: "An epic action saga set against coastal lands, chronicling a tale of courage, legacy, and vengeance.",
    },
    {
      name: `Kantara Chapter 1`,
      clip: videobg4,
      desc: "Discover the origins of the legend in this gripping prequel exploring the deep-rooted folklore of Tulunadu.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 12000); // 12 seconds per slide is smoother
    return () => clearInterval(interval);
  }, [currentVideoIndex]);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
      setIsTransitioning(false);
    }, 600); // Smoother fade time
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentVideoIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
      setIsTransitioning(false);
    }, 600);
  };

  return (
    <div className="relative w-full h-[65vh] md:h-[85vh] bg-[#050505] overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>

      {/* Video Background with Fade Transition */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <video
          key={videos[currentVideoIndex].clip} // Forces video reload on change
          src={videos[currentVideoIndex].clip}
          className="w-full h-full object-cover opacity-80"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* Deep Cinematic Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent w-full md:w-3/4 z-10"></div>

      {/* Content - Bottom Left Aligned */}
      <div className="absolute bottom-12 md:bottom-24 left-6 md:left-16 lg:left-24 z-20 max-w-4xl pr-6">
        <div className={`transition-all duration-1000 transform ${isTransitioning ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"}`}>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded text-white text-xs poppins-medium uppercase tracking-widest mb-4 inline-block">
            Now Showing
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl poppins-bold text-white tracking-tight leading-none mb-4 drop-shadow-2xl">
            {videos[currentVideoIndex].name}
          </h1>
          <p className="text-sm md:text-lg poppins-light text-neutral-300 max-w-2xl leading-relaxed drop-shadow-md">
            {videos[currentVideoIndex].desc}
          </p>
        </div>
      </div>

      {/* Scroll Down Arrow */}
      {showArrow && (
        <div
          onClick={onDownArrowClick}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 cursor-pointer animate-bounce text-white/50 hover:text-white transition-colors"
        >
          <MdOutlineKeyboardArrowDown size={40} />
        </div>
      )}

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-6 md:right-16 z-30 flex items-center gap-4">
        <button
          onClick={handlePrevious}
          className="p-3 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all duration-300"
        >
          <FaChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all duration-300"
        >
          <FaChevronRight size={20} />
        </button>
      </div>

      {/* Dash Indicators */}
      <div className="absolute bottom-6 left-6 md:left-16 lg:left-24 z-30 flex gap-2">
        {videos.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-500 ${
              currentVideoIndex === idx ? "w-8 bg-white" : "w-4 bg-white/30" // <-- FIXED HERE
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousal;
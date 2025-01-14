import Carousal from "./Carousal.jsx";
import React, { useEffect, useRef, useState } from "react";
import RecentMovies from "./RecentMovies.jsx";
import ExploreGeneres from "./ExploreGeneres.jsx";
import Experiences from "./Experiences.jsx";
import Footer from "../Footer.jsx";
import useAxiosSecure from "../Hooks/AxiosSecure.jsx";
import { frontURL } from "../Services/URL.js";

const Home = () => {
  const recentMoviesRef = useRef(null);
  const axiosSecure = useAxiosSecure()
  const [showArrow, setShowArrow] = useState(true);
  const handleScrollAndHideArrow = () => {
    if (recentMoviesRef.current) {
      recentMoviesRef.current.scrollIntoView({ behavior: "smooth" });
      setShowArrow(false); // Hide arrow after scrolling
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setShowArrow(true); // At the top
      } else {
        setShowArrow(false); // Not at the top
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);



  return (
    <div className=" bg-gradient-to-b from-black via-gray-950 to-black w-full h-[100vh] pt-3">
      {/* carousal */}
      <Carousal
        onDownArrowClick={handleScrollAndHideArrow}
        showArrow={showArrow}
      />
      {/* Movie browsing */}
      <div
        id="browse-movies"
        className="text-center relative mt-6 bg-gradient-to-b from-black via-gray-950 to-black "
        ref={recentMoviesRef}
      >
        <RecentMovies />
      </div>
      <div className=" rounded-xl bg-gradient-to-tl from-slate-900 via-slate-800 to-slate-700">
        <ExploreGeneres />
      </div>
      <div className=" rounded-xl bg-gradient-to-tl from-slate-900 via-slate-800 to-slate-700">
        <Experiences />
      </div>
      <Footer />
    </div>
  );
};

export default Home;

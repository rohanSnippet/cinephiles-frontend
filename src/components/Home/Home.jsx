import Carousal from "./Carousal.jsx";
import React, { useEffect, useRef, useState } from "react";
import RecentMovies from "./RecentMovies.jsx";
import ExploreGeneres from "./ExploreGeneres.jsx";
import Experiences from "./Experiences.jsx";
import Footer from "../Footer.jsx";

const Home = () => {
  const recentMoviesRef = useRef(null);
  const [showArrow, setShowArrow] = useState(true);

  const handleScrollAndHideArrow = () => {
    if (recentMoviesRef.current) {
      recentMoviesRef.current.scrollIntoView({ behavior: "smooth" });
      setShowArrow(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowArrow(window.scrollY === 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // Pure black background is the standard for premium media apps
    <div className="min-h-screen bg-black w-full overflow-x-hidden">

      {/* Hero Section */}
      <Carousal
        onDownArrowClick={handleScrollAndHideArrow}
        showArrow={showArrow}
      />

      {/* Trending Movies */}
      <div ref={recentMoviesRef} className="bg-black relative z-20">
        <RecentMovies />
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8"></div>

      {/* Genres */}
      <div className="bg-black relative z-20">
        <ExploreGeneres />
      </div>

      {/* Experiences */}
      <div className="bg-black relative z-20 pb-12">
        <Experiences />
      </div>

      <Footer />
    </div>
  );
};

export default Home;
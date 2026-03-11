import React, { useState, useEffect } from "react";
import Header from "../Header.jsx";
import { FaChevronLeft, FaChevronRight, FaPlay } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import useAxiosPublic from "../Hooks/AxiosPublic";
import { locationHierarchy } from "../Services/Locations"; // Import your hierarchy

const Carousal = ({ onDownArrowClick, showArrow }) => {
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);

  const [rawCity, setRawCity] = useState(localStorage.getItem("city") || "Mumbai");
  const axiosPublic = useAxiosPublic();

  // THE MAGIC FUNCTION: Maps sub-cities to parent regions
  const getMacroRegion = (cityName) => {
    if (!cityName) return "Mumbai";
    const lowerCity = cityName.toLowerCase();

    for (const regionObj of locationHierarchy) {
      // If it's already a macro region (e.g., "Mumbai")
      if (regionObj.region.toLowerCase() === lowerCity) return regionObj.region;

      // If it's a sub-city (e.g., "Kalyan"), return its parent region
      const match = regionObj.cities?.find(c => c.toLowerCase() === lowerCity);
      if (match) return regionObj.region;
    }
    return cityName; // Fallback if city not found in hierarchy
  };

  // We use the macro region to fetch from the DB
  const macroRegion = getMacroRegion(rawCity);

  // Listen for custom location updates
  useEffect(() => {
    const handleLocationChange = () => setRawCity(localStorage.getItem("city") || "Mumbai");
    window.addEventListener("locationUpdated", handleLocationChange);
    return () => window.removeEventListener("locationUpdated", handleLocationChange);
  }, []);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      setLoading(true);
      try {
        // Fetch using the MACRO region (e.g. "Mumbai" even if rawCity is "Kalyan")
        const response = await axiosPublic.get(`/movie/featured?region=${macroRegion}`);
        const dynamicSlides = response.data.map((movie) => {
          const trailerUrl = movie.trailers && movie.trailers.length > 0 ? movie.trailers[0].trailerUrl[0] : null;
          const ytId = getYouTubeId(trailerUrl);
          return {
            id: movie.id,
            name: movie.title,
            image: movie.banner || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : movie.poster),
            desc: movie.description,
            trailerUrl: trailerUrl
          };
        });

        setSlides(dynamicSlides.slice(0, 5));
        setCurrentSlideIndex(0);
      } catch (error) {
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedMovies();
  }, [axiosPublic, macroRegion]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => handleNext(), 5000);
    return () => clearInterval(interval);
  }, [currentSlideIndex, slides.length]);

  const handleNext = () => {
    if (isTransitioning || slides.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 800);
  };

  const handlePrevious = () => {
    if (isTransitioning || slides.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 800);
  };

  const handleWatchTrailer = (trailerUrl) => {
    if (trailerUrl) {
      window.open(trailerUrl, "_blank");
    }
  };

  if (loading) return <div className="w-full h-[65vh] md:h-[85vh] bg-[#050505]"></div>;

  // ==========================================
  // FALLBACK UI WHEN NO FEATURED MOVIES EXIST
  // ==========================================
  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[65vh] md:h-[85vh] bg-[#050505] overflow-hidden flex flex-col justify-center">
        <div className="absolute top-0 left-0 w-full z-50">
          <Header />
        </div>
        <div className="absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent z-10"></div>
        <div className="relative z-20 text-center px-6 max-w-3xl mx-auto translate-y-8">
          <h1 className="text-4xl sm:text-6xl md:text-7xl poppins-bold text-white tracking-tight leading-none mb-6 drop-shadow-2xl">
            Welcome to Cinephiles
          </h1>
          <p className="text-sm md:text-lg poppins-light text-neutral-300 leading-relaxed drop-shadow-md mb-8">
            Experience the magic of cinema in <span className="font-semibold text-white">{rawCity}</span>. Discover the best movies, explore top-rated blockbusters, and book your tickets today.
          </p>
          {showArrow && (
            <button
              onClick={onDownArrowClick}
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black rounded-full poppins-semibold text-sm uppercase tracking-widest hover:bg-neutral-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Explore Movies <MdOutlineKeyboardArrowDown size={18} className="mt-0.5"/>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN CAROUSEL UI
  // ==========================================
  return (
    <div className="relative w-full h-[65vh] md:h-[85vh] bg-[#050505] overflow-hidden">
      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        .animate-kenburns {
          animation: kenburns 20s ease-out forwards;
        }
      `}</style>
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>
      {slides.map((slide, idx) => (
        <div
          key={slide.id || idx}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            currentSlideIndex === idx ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.name}
            className={`w-full h-full object-cover opacity-60 ${
              currentSlideIndex === idx ? "animate-kenburns" : ""
            }`}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/40 to-transparent w-full md:w-3/4 z-10"></div>
      <div className="absolute bottom-16 md:bottom-28 left-6 md:left-16 lg:left-24 z-20 max-w-4xl pr-6">
        <div className={`transition-all duration-1000 transform ${isTransitioning ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"}`}>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded text-white text-xs poppins-medium uppercase tracking-widest mb-4 inline-block shadow-lg">
            Featured
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl poppins-bold text-white tracking-tight leading-none mb-6 drop-shadow-2xl">
            {slides[currentSlideIndex].name}
          </h1>
          <p className="text-sm md:text-lg poppins-light text-neutral-300 max-w-2xl leading-relaxed drop-shadow-md mb-8 line-clamp-3">
            {slides[currentSlideIndex].desc}
          </p>
          <div className="flex items-center gap-4">
            {slides[currentSlideIndex].trailerUrl && (
              <button
                onClick={() => handleWatchTrailer(slides[currentSlideIndex].trailerUrl)}
                className="flex items-center gap-3 px-8 py-3.5 bg-white text-black rounded-full poppins-semibold text-sm uppercase tracking-widest hover:bg-neutral-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <FaPlay size={14} />
                Watch Trailer
              </button>
            )}
          </div>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-16 right-6 md:right-16 z-30 flex items-center gap-4 hidden sm:flex">
          <button onClick={handlePrevious} className="p-4 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white transition-all duration-300">
            <FaChevronLeft size={18} />
          </button>
          <button onClick={handleNext} className="p-4 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white transition-all duration-300">
            <FaChevronRight size={18} />
          </button>
        </div>
      )}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-6 md:left-16 lg:left-24 z-30 flex gap-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-full transition-all duration-500 ${
                currentSlideIndex === idx ? "w-10 bg-white" : "w-4 bg-white/30 hover:bg-white/50 cursor-pointer"
              }`}
              onClick={() => setCurrentSlideIndex(idx)}
            />
          ))}
        </div>
      )}
      {showArrow && (
        <div onClick={onDownArrowClick} className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 cursor-pointer animate-bounce text-white/50 hover:text-white transition-colors">
          <MdOutlineKeyboardArrowDown size={36} />
        </div>
      )}
    </div>
  );
};

export default Carousal;
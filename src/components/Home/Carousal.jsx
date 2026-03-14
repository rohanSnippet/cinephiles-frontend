import React, { useState, useEffect } from "react";
import Header from "../Header.jsx";
import { FaChevronLeft, FaChevronRight, FaPlay } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import useAxiosPublic from "../Hooks/AxiosPublic";
import { locationHierarchy } from "../Services/Locations";

// Curated 4K cinematic placeholder images for the dreamish infinite scroll
const FALLBACK_POSTERS = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop",
  "https://stat4.bollywoodhungama.in/wp-content/uploads/2016/03/Dangal-1.jpg?q=80&w=800&auto=format&fit=crop",
  "https://wallpaperaccess.com/full/16701612.jpg?q=80&w=800&auto=format&fit=crop",
  "https://posterspy.com/wp-content/uploads/2023/11/Dune-Part-II.jpg?q=80&w=800&auto=format&fit=crop",
  "https://tse2.mm.bing.net/th/id/OIP.pzHzXKTcOWnvKPz1Tfyp0QHaLH?rs=1&pid=ImgDetMain&o=7&rm=3?q=80&w=800&auto=format&fit=crop",
  "https://s3.amazonaws.com/nightjarprod/content/uploads/sites/130/2021/08/19085635/gEU2QniE6E77NI6lCU6MxlNBvIx-scaled.jpg?q=80&w=800&auto=format&fit=crop",
  "https://wallpapercave.com/wp/wp4027523.jpg?q=80&w=800&auto=format&fit=crop",
];

const Carousal = ({ onDownArrowClick, showArrow }) => {
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);

  const [rawCity, setRawCity] = useState(localStorage.getItem("city") || "Mumbai");
  const axiosPublic = useAxiosPublic();

  const getMacroRegion = (cityName) => {
    if (!cityName) return "Mumbai";
    const lowerCity = cityName.toLowerCase();

    for (const regionObj of locationHierarchy) {
      if (regionObj.region.toLowerCase() === lowerCity) return regionObj.region;
      const match = regionObj.cities?.find(c => c.toLowerCase() === lowerCity);
      if (match) return regionObj.region;
    }
    return cityName;
  };

  const macroRegion = getMacroRegion(rawCity);

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
    const interval = setInterval(() => handleNext(), 6000);
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
  // PREMIUM DREAMISH FALLBACK UI
  // ==========================================
  if (slides.length === 0) {
    const doubledPosters = [...FALLBACK_POSTERS, ...FALLBACK_POSTERS];

    return (
      <div className="relative w-full h-[65vh] md:h-[85vh] bg-[#050505] overflow-hidden">

        {/* Hardware-accelerated CSS animations */}
        <style>{`
          @keyframes scrollLeft {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scrollRight {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          @keyframes fadeInUpFade {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-scroll-left { animation: scrollLeft 45s linear infinite; will-change: transform; }
          .animate-scroll-right { animation: scrollRight 45s linear infinite; will-change: transform; }
          .animate-fade-in-up { animation: fadeInUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        <div className="absolute top-0 left-0 w-full z-50">
          <Header />
        </div>

        {/* --- 3D INFINITE SCROLL LAYER --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] flex flex-col gap-6 transform -rotate-12 scale-110 justify-center">

            <div className="flex w-max animate-scroll-left gap-6">
              {doubledPosters.map((img, i) => (
                <img key={`r1-${i}`} src={img} className="w-48 sm:w-64 h-72 sm:h-96 object-cover rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.9)]" alt="" loading="lazy" />
              ))}
            </div>

            <div className="flex w-max animate-scroll-right gap-6 ml-[-20%]">
              {doubledPosters.reverse().map((img, i) => (
                <img key={`r2-${i}`} src={img} className="w-48 sm:w-64 h-72 sm:h-96 object-cover rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.9)]" alt="" loading="lazy" />
              ))}
            </div>

            <div className="flex w-max animate-scroll-left gap-6 ml-[-10%]">
              {doubledPosters.reverse().map((img, i) => (
                <img key={`r3-${i}`} src={img} className="w-48 sm:w-64 h-72 sm:h-96 object-cover rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.9)]" alt="" loading="lazy" />
              ))}
            </div>

          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-10 shadow-3xl shadow-black"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/40 to-transparent w-full md:w-3/4 z-10"></div>
        <div className="absolute bottom-16 md:bottom-28 left-6 md:left-16 lg:left-24 z-20 max-w-4xl pr-6">
          <div className="animate-fade-in-up">

            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded text-white text-xs poppins-medium uppercase tracking-widest mb-4 inline-block shadow-lg">
              Welcome to Cinephiles
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] poppins-bold text-white tracking-tighter leading-none mb-4 drop-shadow-2xl uppercase">
              {rawCity}
            </h1>

            <p className="text-sm md:text-lg poppins-light text-neutral-300 max-w-2xl leading-relaxed drop-shadow-md mb-8">
              Experience the magic of cinema. Discover the best movies, explore top-rated blockbusters, and secure your tickets today.
            </p>

            {showArrow && (
              <button
                onClick={onDownArrowClick}
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black rounded-full poppins-semibold text-sm uppercase tracking-widest hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              >
                Explore Movies <MdOutlineKeyboardArrowDown size={18} className="mt-0.5"/>
              </button>
            )}

          </div>
        </div>
      </div>
    );
  }

  // ============================
  //MAIN CAROUSEL ui
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent w-full md:w-3/4 z-10"></div>
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
{/*       {slides.length > 1 && ( */}
{/*         <div className="absolute bottom-16 right-6 md:right-16 z-30 flex items-center gap-4 hidden sm:flex"> */}
{/*           <button onClick={handlePrevious} className="p-4 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white transition-all duration-300"> */}
{/*             <FaChevronLeft size={18} /> */}
{/*           </button> */}
{/*           <button onClick={handleNext} className="p-4 rounded-full bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white transition-all duration-300"> */}
{/*             <FaChevronRight size={18} /> */}
{/*           </button> */}
{/*         </div> */}
{/*       )} */}
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
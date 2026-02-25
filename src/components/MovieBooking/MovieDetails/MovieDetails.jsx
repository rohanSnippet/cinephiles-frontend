import React, { useContext, useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UserNavHeader from "../UserNavHeader";
import like from "../../../assets/like.png";
import useAxiosPublic from "../../Hooks/AxiosPublic";
import userPlaceholder from "../../../assets/user_2.png";
import { AuthContext } from "../../Context/AuthProvider";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import useCity from "../../Hooks/useCity";

// Framer Motion Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const MovieDetails = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const location = useLocation();
  const axiosSecure = useAxiosSecure();
  const city = useCity();

  // Extract state passed from router (e.g., from SearchBar click)
  const { item: locationItem, previousPath } = location.state || {};

  // Component State
  const [item, setItem] = useState(locationItem);
  const [castImages, setCastImages] = useState({});
  const [crewImages, setCrewImages] = useState({});
  const [isShowAvl, setIsShowAvl] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  // 1. Handle Navigation/Route Changes (The Search Bar Fix)
  useEffect(() => {
    if (locationItem) {
      setItem(locationItem);
      // Reset images when a new movie is loaded
      setCastImages({});
      setCrewImages({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [locationItem]);

  // Memoize release date
  const releaseDateObj = useMemo(() => {
    return item ? new Date(item.releaseDate) : null;
  }, [item?.releaseDate]);

  // 2. Data Fetching (Incremental/Streaming Logic)
  useEffect(() => {
    if (!item) return;

    // Check Ticket Availability
    const checkAvl = async () => {
      if (!item?.id || (!userData?.currLocation && !city)) return;
      try {
        const res = await axiosSecure.get(
          `/show/by-city?movieId=${item.id}&cities=${userData.currLocation || city}`
        );
        setIsShowAvl(res.data?.length > 0);
      } catch (err) {
        console.error("Availability error:", err);
      }
    };
    checkAvl();

    // Fetch Cast Incrementally (Fire & Forget)
    if (item.cast) {
      Object.keys(item.cast).forEach(async (actorName) => {
        try {
          const res = await axiosPublic.get(
            `/actor/scrape-single?name=${encodeURIComponent(actorName)}&isCrew=false`
          );
          setCastImages((prev) => ({ ...prev, [actorName]: res.data.url }));
        } catch (error) {
          setCastImages((prev) => ({ ...prev, [actorName]: "No Image" }));
        }
      });
    }

    // Fetch Crew Incrementally (Fire & Forget)
    if (item.crew) {
      item.crew.forEach(async (crewMember) => {
        try {
          const res = await axiosPublic.get(
            `/actor/scrape-single?name=${encodeURIComponent(crewMember.name)}&isCrew=true`
          );
          setCrewImages((prev) => ({ ...prev, [crewMember.name]: res.data.url }));
        } catch (error) {
          setCrewImages((prev) => ({ ...prev, [crewMember.name]: "No Image" }));
        }
      });
    }
  }, [item, axiosPublic, axiosSecure, city, userData?.currLocation]);

  const handleGetTheatres = () => {
    navigate("/all-shows", { state: { item } });
  };

  // Fallback for missing movie data
  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-white text-center">
          <p className="text-2xl poppins-semibold text-slate-300">Movie not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-8 py-3 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30 poppins-medium"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const trailerCount = useMemo(() => {
    if (!item.trailers) return 0;
    return item.trailers.reduce(
      (total, trailer) => total + (trailer.trailerUrl?.length || 0),
      0
    );
  }, [item.trailers]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full bg-[#0a0f1a] pb-12 overflow-x-hidden"
    >
      <UserNavHeader navLocation={previousPath || "/"} item={item} />

      {/* Hero Banner Section */}
      <div className="relative w-full min-h-[55vh] sm:min-h-[60vh] lg:min-h-[75vh] flex flex-col justify-end">
        {/* Background Layer */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <motion.div
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full bg-no-repeat bg-cover bg-top lg:bg-center"
            style={{
              backgroundImage: item.banner ? `url('${item.banner}')` : item.poster ? `url('${item.poster}')` : "gray",
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/80 lg:via-[#0a0f1a]/60 to-transparent"></div>
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#0a0f1a] via-[#0a0f1a]/80 to-transparent w-3/4"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-12 pb-8 lg:pb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-12">

          {/* Left/Top Content: Details */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col flex-1 max-w-3xl mt-24 lg:mt-0"
          >
            <h1 className={`text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-300 drop-shadow-lg mb-4
              ${item.title.length > 20 ? "text-4xl sm:text-5xl lg:text-6xl" : "text-5xl sm:text-6xl lg:text-7xl"}
              roboto-bold tracking-tight text-center lg:text-left`}
            >
              {item.title.toUpperCase()}
            </h1>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-6 poppins-medium">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-white text-sm">
                {item.certification === "CERTIFICATION_UA" ? "U/A" : item.certification.substring(14)} Rated
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-white text-sm flex gap-2">
                {item.languages.map((lang, i) => <span key={i}>{lang}</span>)}
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-white text-sm flex gap-2">
                {item.formats.map((format, i) => <span key={i}>{format}</span>)}
              </span>
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-md text-white text-sm flex items-center gap-1">
                <img src={like} className="h-4 w-4" alt="Like" loading="lazy" />
                {item.likes >= 1000000 ? (item.likes / 1000000).toFixed(1).replace(/\.0$/, "") + "M" : item.likes >= 1000 ? (item.likes / 1000).toFixed(1).replace(/\.0$/, "") + "k" : item.likes}
              </span>
            </div>

            {/* Description */}
            <p className="hidden sm:block text-slate-300 text-base md:text-lg poppins-light leading-relaxed mb-8 text-center lg:text-left drop-shadow-md">
              {item.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {isShowAvl && (
                <button
                  onClick={handleGetTheatres}
                  className="btn border-none bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all duration-300 w-full sm:w-auto px-10 h-14 poppins-semibold text-lg"
                >
                  Book Tickets
                </button>
              )}
              <button
                disabled={trailerCount === 0}
                onClick={() => document.getElementById("trailer_modal").showModal()}
                className="btn border border-white/30 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white rounded-lg transition-all duration-300 w-full sm:w-auto px-8 h-14 poppins-medium"
              >
                {trailerCount > 0 ? `Watch Trailer (${trailerCount})` : "No Trailers"}
              </button>
            </div>
          </motion.div>

          {/* Right Content: Floating Poster */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex flex-col items-center shrink-0 z-20"
          >
            <div className="w-64 xl:w-72 aspect-[2/3] rounded-xl shadow-2xl shadow-black/80 ring-1 ring-white/20 overflow-hidden relative group">
              <img src={item.poster} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex justify-between items-end">
                <span className="text-white poppins-medium text-sm">Release Date</span>
                <span className="text-white poppins-bold text-sm">
                  {releaseDateObj?.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Description */}
      <div className="sm:hidden px-4 mt-4">
        <p className="text-slate-300 text-sm poppins-light leading-relaxed text-center">
          {item.description}
        </p>
      </div>

      {/* --- CAST SECTION (Incremental Load) --- */}
      <div className="w-full max-w-[90rem] mx-auto mt-12 px-4 sm:px-6 lg:px-12">
        <h2 className="poppins-semibold text-3xl md:text-4xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          Cast
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
          {Object.entries(item.cast || {}).map(([member, char], i) => {
            const imgUrl = castImages[member];
            const isLoaded = imgUrl !== undefined; // Undefined means it's still fetching

            return (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" key={i} className="flex flex-col items-center text-center group">
                <a href={`https://www.google.com/search?q=${member.trim().split(" ").join("+")}`} target="_blank" rel="noopener noreferrer" className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mb-3 overflow-hidden rounded-full ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all duration-300 shadow-lg bg-slate-800">
                  <AnimatePresence mode="wait">
                    {!isLoaded ? (
                      <motion.div key="skeleton" exit={{ opacity: 0 }} className="w-full h-full bg-slate-700 animate-pulse" />
                    ) : (
                      <motion.img
                        key="image"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                        src={imgUrl === "No Image" ? userPlaceholder : imgUrl}
                        alt={member}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                  </AnimatePresence>
                </a>
                <h3 className="font-medium text-white text-sm sm:text-base line-clamp-1">{member}</h3>
                <p className="poppins-light text-slate-400 text-xs sm:text-sm line-clamp-1 mt-0.5">{char}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* --- CREW SECTION (Incremental Load) --- */}
      <div className="w-full max-w-[90rem] mx-auto mt-16 mb-12 px-4 sm:px-6 lg:px-12">
        <h2 className="poppins-semibold text-3xl md:text-4xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          Crew
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {(item.crew || []).map((member, i) => {
            const imgUrl = crewImages[member.name];
            const isLoaded = imgUrl !== undefined;

            return (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" key={i} className="flex flex-col items-center text-center group cursor-pointer">
                <a href={`https://www.google.com/search?q=${member.name.trim().split(" ").join("+")}`} target="_blank" rel="noopener noreferrer" className="relative w-full aspect-[3/4] max-w-[180px] mb-3 overflow-hidden rounded-xl shadow-lg ring-1 ring-white/10 group-hover:ring-indigo-500/50 transition-all duration-300 bg-slate-800">
                  <AnimatePresence mode="wait">
                    {!isLoaded ? (
                      <motion.div key="skeleton" exit={{ opacity: 0 }} className="w-full h-full bg-slate-700 animate-pulse" />
                    ) : (
                      <motion.img
                        key="image"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                        src={imgUrl === "No Image" ? userPlaceholder : imgUrl}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                  </AnimatePresence>
                </a>
                <h3 className="font-medium text-white text-sm sm:text-base line-clamp-1 w-full px-2">{member.name}</h3>
                <p className="poppins-light text-indigo-300 text-xs sm:text-sm line-clamp-1 w-full mt-0.5">
                  {member.roles.join(", ")}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal item={item} selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} />
    </motion.div>
  );
};

// --- MASSIVE TRAILER MODAL ---
const TrailerModal = React.memo(({ item, selectedLanguage, setSelectedLanguage }) => {
  const filteredTrailers = React.useMemo(() => {
    if (!item.trailers) return [];
    return item.trailers.filter((trailer) => selectedLanguage === "All" || trailer.language === selectedLanguage);
  }, [item.trailers, selectedLanguage]);

  return (
    <dialog id="trailer_modal" className="modal bg-black/80 backdrop-blur-md">
      <div className="modal-box bg-[#0a0f1a] text-white w-[95vw] max-w-7xl h-[90vh] border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-0 rounded-2xl overflow-hidden flex flex-col relative">

        {/* Sticky Modal Header */}
        <div className="shrink-0 z-50 bg-[#0a0f1a]/95 backdrop-blur-xl px-6 py-4 sm:px-10 sm:py-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <h3 className="poppins-bold text-xl sm:text-2xl text-white tracking-wide uppercase flex items-center gap-3">
            <span className="text-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z" clipRule="evenodd" />
              </svg>
            </span>
            Trailers & Clips
          </h3>

          {/* Language Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["All", ...item.languages].map((language, i) => (
              <label key={i} className="cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  value={language}
                  checked={selectedLanguage === language}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="peer sr-only"
                />
                <span className="px-5 py-2 rounded-full text-sm poppins-medium bg-slate-800/60 text-slate-300 peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:shadow-[0_0_15px_rgba(79,70,229,0.5)] hover:bg-slate-700 transition-all duration-300">
                  {language}
                </span>
              </label>
            ))}
          </div>

          <form method="dialog" className="absolute top-4 right-4 sm:static">
            <button className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-white hover:bg-slate-800 bg-slate-900/50">✕</button>
          </form>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 bg-[#06090f]">
          {filteredTrailers.length > 0 ? (
            <div className="flex flex-col gap-16 items-center w-full">
              {filteredTrailers.map((trailer, i) => (
                <div key={i} className="w-full flex flex-col items-center">
                  <h4 className="text-xl poppins-semibold text-slate-200 mb-6 flex items-center gap-3 w-full max-w-5xl">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_12px_#6366f1]"></span>
                    {trailer.language}
                    <span className="text-slate-600 font-normal ml-1">| Official Trailers</span>
                  </h4>

                  <div className="flex flex-col gap-12 w-full items-center">
                    {trailer.trailerUrl.map((link, idx) => (
                      <div key={idx} className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.6)] bg-black border border-slate-800 ring-1 ring-transparent hover:ring-indigo-500/30 transition-all duration-500">
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${link.substring(17)}?autoplay=0&rel=0&modestbranding=1`}
                          title={`${trailer.language} Trailer ${idx + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-slate-500">
              <svg className="w-20 h-20 mb-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <p className="poppins-medium text-xl text-slate-400">No Videos available in {selectedLanguage}</p>
            </div>
          )}
        </div>
      </div>

      <form method="dialog" className="modal-backdrop bg-transparent">
        <button className="cursor-default">close</button>
      </form>
    </dialog>
  );
});

export default MovieDetails;
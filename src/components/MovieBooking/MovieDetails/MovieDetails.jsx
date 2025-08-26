import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserNavHeader from "../UserNavHeader";
import like from "../../../assets/like.png";
import useAxiosPublic from "../../Hooks/AxiosPublic";
import user from "../../../assets/user_2.png";
import { AuthContext } from "../../Context/AuthProvider";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import useCity from "../../Hooks/useCity";
import Loading from "../../Common/Loading";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const location = useLocation();
  const axiosSecure = useAxiosSecure();
  const city = useCity();
  const { item: locationItem, previousPath } = location.state || {};
  
  // Use a ref to prevent unnecessary re-renders from location.state
  const itemRef = React.useRef(locationItem);
  const [item] = useState(itemRef.current);
  
  const [castMembers, setCastMembers] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]);
  const [isLoadingContent, setIsLoadingContent] = useState(!locationItem);
  const [isShowAvl, setIsShowAvl] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  // Memoize the release date to prevent unnecessary recalculations
  const releaseDateObj = useMemo(() => {
    return item ? new Date(item.releaseDate) : null;
  }, [item?.releaseDate]);

  useEffect(() => {
    if (!item) {
      console.error("Movie item not found in location state.");
      setIsLoadingContent(false);
      return;
    }
    window.scrollTo(0, 0);
  }, [item]);

  const handleGetTheatres = () => {
    navigate("/all-shows", { state: { item } });
  };

  const scrapeActors = useCallback(async () => {
    if (!item?.cast) return [];
    try {
      const res = await axiosPublic.post(`/actor/scrape`, item.cast);
      return res.data?.urls || [];
    } catch (error) {
      console.error("Error scraping actors:", error);
      return [];
    }
  }, [axiosPublic, item?.cast]);

  const scrapeCrew = useCallback(async () => {
    if (!item?.crew) return [];
    try {
      const res = await axiosPublic.post(`/actor/scrape-crew`, item.crew);
      return res.data?.urls || [];
    } catch (error) {
      console.error("Error scraping crew:", error);
      return [];
    }
  }, [axiosPublic, item?.crew]);

  const checkShowAvailability = useCallback(async () => {
    if (!item?.id || (!userData?.currLocation && !city)) return false;
    try {
      const res = await axiosSecure.get(
        `/show/by-city?movieId=${item.id}&cities=${
          userData.currLocation || city
        }`
      );
      return res.data?.length > 0;
    } catch (error) {
      console.error("Error fetching show availability:", error);
      return false;
    }
  }, [axiosSecure, item?.id, userData?.currLocation, city]);

  useEffect(() => {
    const fetchData = async () => {
      if (!item) {
        return;
      }

      // Show initial content immediately, then load additional data
      setIsLoadingContent(true);

      try {
        // Prioritize showing availability first
        const showAvailability = await checkShowAvailability();
        setIsShowAvl(showAvailability);
        
        // Then load cast and crew in parallel
        const [fetchedCastMembers, fetchedCrewMembers] = await Promise.all([
          scrapeActors(),
          scrapeCrew(),
        ]);

        setCastMembers(fetchedCastMembers);
        setCrewMembers(fetchedCrewMembers);
      } catch (error) {
        console.error("Failed to fetch all movie details:", error);
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchData();
  }, [item, scrapeActors, scrapeCrew, checkShowAvailability]);

  // Early return if no item
  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">No movie found.</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Memoize the trailer count to avoid recalculating
  const trailerCount = useMemo(() => {
    if (!item.trailers) return 0;
    return item.trailers.reduce(
      (total, trailer) => total + (trailer.trailerUrl?.length || 0),
      0
    );
  }, [item.trailers]);

  return (
    <div className="h-full w-full">
      <UserNavHeader navLocation={previousPath || "/"} item={item} />

      {/* Movie Name above banner for mobile/medium screens */}
      <div className="lg:hidden text-center mt-4 px-4">
        <h1 className="text-white text-4xl sm:text-5xl font-bold roboto-semibold">
          {item.title.toUpperCase()}
        </h1>
      </div>

      {/* Main movie banner and details section */}
      <div
        className="relative w-[96%] max-w-7xl mx-auto rounded-xl shadow-lg shadow-slate-500/20 mt-4 overflow-hidden
                      min-h-[400px] md:min-h-[500px] lg:min-h-[60vh] flex lg:items-end"
      >
        {/* Background Image with responsive gradients */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage: item.banner
              ? `url('${item.banner}')`
              : item.poster
              ? `url('${item.poster}')`
              : "gray",
          }}
        >
          {/* Gradient overlay for large screens */}
          <div className="hidden lg:block absolute inset-0 rounded-xl bg-gradient-to-r from-slate-950 via-transparent to-black"></div>
          {/* Darker gradient for mobile/medium screens */}
          <div className="lg:hidden absolute inset-0 rounded-xl bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
        </div>
        
        {/* --- Large Screen Layout (lg and up) --- */}
        <div className="relative z-10 w-full h-full hidden lg:flex">
          {/* Details for large screens */}
          <div className="flex flex-col justify-end pb-8 pl-8 pr-4 w-[60%]">
            {/* Title */}
            <span
              className={`
                        bg-gradient-to-r from-indigo-200/90 via-white to-white bg-clip-text text-transparent
                        text-5xl lg:text-6xl xl:text-7xl
                        ${
                          item.title.length > 23
                            ? "roboto-bold"
                            : "roboto-semibold"
                        }
                        mb-4
                    `}
            >
              {item.title.toUpperCase()}
            </span>
            
            {/* Metadata: Certification, Languages, Formats */}
            <p className="text-white text-base poppins-regular opacity-80 mb-6 flex flex-wrap items-center gap-4">
              <span className="flex items-center">
                {item.certification === "CERTIFICATION_UA"
                  ? "U/A"
                  : item.certification.substring(14)}{" "}
                Rated
              </span>
              <span className="badge badge-ghost text-white text-sm border-none bg-white/20">
                {item.languages.map((lang, i) => (
                  <span key={i} className="px-1">
                    {lang}
                  </span>
                ))}
              </span>
              <span className="badge badge-ghost text-white text-sm border-none bg-white/20">
                {item.formats.map((format, i) => (
                  <span key={i} className="px-1">
                    {format}
                  </span>
                ))}
              </span>
            </p>
            
            {/* Description */}
            <p className="text-white text-base poppins-extralight mb-8 max-w-xl">
              {item.description}
            </p>
            
            {/* Book Tickets Button */}
            {isShowAvl && (
              <button
                onClick={handleGetTheatres}
                className="btn w-64 border border-white/20 hover:border-white text-white rounded-lg overflow-hidden
                            backdrop-blur-md bg-white/10 hover:bg-white/20
                            shadow-[0_0_10px_rgba(255,255,255,0.3)]
                            hover:shadow-[0_0_20px_rgba(255,255,255,0.6)]
                            transition-all duration-300 flex items-center justify-center
                            mt-auto"
              >
                <span className="text-xl poppins-bold transform transition-transform duration-100">
                  Book Tickets
                </span>
              </button>
            )}
          </div>
          
          {/* Poster and Trailer Button for large screens */}
          <div
            className="relative -right-28 top-0 shrink-0
                    w-[250px] h-[375px]
                    bg-center bg-cover bg-no-repeat rounded-xl shadow-slate-800/80 shadow-xl
                    ring-indigo-900/20 ring-1 ring-offset-1 ring-offset-slate-800/50"
            style={{
              backgroundImage: `url('${item.poster}')`,
            }}
          >
            <button
              type="button"
              disabled={trailerCount === 0}
              onClick={() => document.getElementById("my_modal_2").showModal()}
              className="badge badge-neutral bg-black/60 w-2/3 h-7 border-none text-white roboto-regular
                        absolute bottom-2 top-44 left-1/2 -translate-x-1/2"
            >
              {trailerCount > 0 ? `${trailerCount} Trailer(s)` : "No Trailers"}
            </button>

            <div className="absolute bg-black bg-opacity-50 h-8 w-full rounded-b-xl bottom-0"></div>
            <div className="h-[10vh] rounded-xl absolute bottom-0 w-full flex items-center justify-between px-4">
              <p className="text-white poppins-regular text-md flex items-center">
                <img src={like} className="h-5 w-5 mr-1" alt="Like icon" loading="lazy" />
                {item.likes >= 1000000
                  ? (item.likes / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
                  : item.likes >= 1000
                  ? (item.likes / 1000).toFixed(1).replace(/\.0$/, "") + "k"
                  : item.likes}
              </p>
              <div className="text-white poppins-regular text-md">
                {releaseDateObj?.toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* --- Mobile/Medium Screen Layout (hidden on lg and up) --- */}
        <div className="relative z-20 w-full h-full flex flex-col justify-between items-center px-4 py-8 lg:hidden">
          {/* Trailer Button in center */}
          <div className="flex-grow flex items-center justify-center w-full">
            <button
              type="button"
              disabled={trailerCount === 0}
              onClick={() => document.getElementById("my_modal_2").showModal()}
              className="badge badge-neutral bg-black/60 w-2/3 h-7 border-none text-white roboto-regular
                        absolute bottom-2 top-44 left-1/2 -translate-x-1/2"
            >
              {trailerCount > 0 ? `${trailerCount} Trailer(s)` : "No Trailers"}
            </button>
          </div>

          {/* Release Date at bottom with black bar */}
          <div className="w-full bg-black/70 rounded-b-xl py-2 flex justify-center items-center">
            <div className="text-white poppins-regular text-sm sm:text-base">
              Release Date:{" "}
              {releaseDateObj?.toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Details (Description, Metadata, Book Tickets) for Mobile/Medium screens */}
      <div className="lg:hidden w-[96%] max-w-7xl mx-auto p-4 sm:p-6 bg-base-200 rounded-xl shadow-lg mt-4">
        {/* Metadata: Certification, Languages, Formats */}
        <p className="text-white text-sm sm:text-base poppins-regular opacity-80 mb-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4">
          <span className="flex items-center">
            {item.certification === "CERTIFICATION_UA"
              ? "U/A"
              : item.certification.substring(14)}{" "}
            Rated
          </span>
          <span className="badge badge-ghost text-white text-xs sm:text-sm border-none bg-white/20">
            {item.languages.map((lang, i) => (
              <span key={i} className="px-1">
                {lang}
              </span>
            ))}
          </span>
          <span className="badge badge-ghost text-white text-xs sm:text-sm border-none bg-white/20">
            {item.formats.map((format, i) => (
              <span key={i} className="px-1">
                {format}
              </span>
            ))}
          </span>
        </p>

        {/* Description */}
        <p className="text-white text-sm sm:text-base poppins-extralight mb-6">
          {item.description}
        </p>

        {/* Book Tickets Button */}
        {isShowAvl && (
          <button
            onClick={handleGetTheatres}
            className="btn w-full border border-white/20 hover:border-white text-white rounded-lg overflow-hidden
              backdrop-blur-md bg-white/10 hover:bg-white/20
              shadow-[0_0_10px_rgba(255,255,255,0.3)]
              hover:shadow-[0_0_20px_rgba(255,255,255,0.6)]
              transition-all duration-300 flex items-center justify-center"
          >
            <span className="text-xl poppins-bold transform transition-transform duration-100">
              Book Tickets
            </span>
          </button>
        )}
      </div>

      {/* Cast Section */}
      <div className="w-[96%] max-w-7xl mx-auto mt-8 px-4 py-6 rounded-xl bg-gradient-to-tr from-slate-900/30 via-slate-700/30 to-base-300">
        <div className="poppins-semibold text-2xl sm:text-3xl md:text-4xl py-3 text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-400 to-slate-800/50">
          CAST
        </div>
        <div className="text-white poppins-bold text-sm sm:text-base flex flex-wrap justify-center sm:justify-start">
          {isLoadingContent
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1/2 sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-1/8 p-2 flex flex-col items-center text-center"
                >
                  <div className="avatar mb-2">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-md skeleton"></div>
                  </div>
                  <div className="skeleton h-4 w-3/4 mb-1"></div>
                  <div className="skeleton h-3 w-1/2"></div>
                </div>
              ))
            : Object.entries(item.cast).map(([member, char], i) => (
                <div
                  key={i}
                  className="w-1/2 sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-1/8 p-2 flex flex-col items-center text-center
                           hover:scale-[1.03] transition-all duration-200 ease-in-out"
                >
                  <div className="avatar mb-2">
                    <div className="w-20 sm:w-24 rounded-full shadow-md">
                      <a
                        href={`https://www.google.com/search?q=${member
                          .trim()
                          .split(" ")
                          .join("+")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={
                            Object.entries(castMembers).find(
                              ([key, url]) =>
                                key === member && url !== "No Image"
                            )?.[1] || user
                          }
                          alt={`${member}'s profile`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </a>
                    </div>
                  </div>
                  <div className="font-semibold text-sm sm:text-base line-clamp-2">
                    {member}
                  </div>
                  <span className="poppins-extralight-italic text-slate-100/80 text-xs sm:text-sm line-clamp-1">
                    {char}
                  </span>
                </div>
              ))}
        </div>
      </div>

      {/* Crew Section */}
      <div className="w-[96%] max-w-7xl mx-auto mt-8 px-4 py-6 rounded-xl bg-gradient-to-tr from-slate-900/30 via-slate-700/30 to-white/10 mb-8">
        <div className="poppins-semibold text-2xl sm:text-3xl md:text-4xl py-3 text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-400 to-slate-800/50">
          CREW
        </div>
        <div className="text-white poppins-bold text-sm sm:text-base flex flex-wrap justify-center sm:justify-start">
          {isLoadingContent
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1/2 sm:w-1/4 md:w-1/5 lg:w-1/6 p-2 flex flex-col items-center text-center"
                >
                  <div className="avatar mb-2">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl ring-slate-800/80 ring-2 skeleton"></div>
                  </div>
                  <div className="skeleton h-4 w-3/4 mb-1"></div>
                  <div className="skeleton h-3 w-1/2"></div>
                </div>
              ))
            : item.crew.map((member, i) => (
                <div
                  key={i}
                  className="w-1/2 sm:w-1/4 md:w-1/5 lg:w-1/6 p-2 flex flex-col items-center text-center
                           hover:scale-[1.04] hover:translate-y-[-2px] transition-all duration-200 ease-in-out"
                >
                  <div className="avatar mb-2">
                    <div className="w-24 sm:w-28 rounded-xl ring-slate-800/80 ring-2">
                      <a
                        href={`https://www.google.com/search?q=${member.name
                          .trim()
                          .split(" ")
                          .join("+")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={
                            Object.entries(crewMembers).find(
                              ([key, url]) =>
                                key === member.name && url !== "No Image"
                            )?.[1] || user
                          }
                          alt={`${member.name}'s profile`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </a>
                    </div>
                  </div>
                  <div className="font-semibold text-sm sm:text-base line-clamp-2">
                    {member.name}
                  </div>
                  <span className="poppins-extralight-italic text-slate-100/80 text-xs sm:text-sm line-clamp-1">
                    {member.roles.includes("Director") ? (
                      <span className="text-transparent poppins-light-italic bg-clip-text bg-gradient-to-r from-indigo-100 via-sky-200 to-teal-100">
                        {member.roles.join(", ")}
                      </span>
                    ) : (
                      <span>{member.roles.join(", ")}</span>
                    )}
                  </span>
                </div>
              ))}
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal 
        item={item} 
        selectedLanguage={selectedLanguage} 
        setSelectedLanguage={setSelectedLanguage} 
      />
    </div>
  );
};

// Extracted TrailerModal component to reduce main component complexity
const TrailerModal = React.memo(({ item, selectedLanguage, setSelectedLanguage }) => {
  const filteredTrailers = React.useMemo(() => {
    if (!item.trailers) return [];
    return item.trailers.filter(
      (trailer) =>
        selectedLanguage === "All" ||
        trailer.language === selectedLanguage
    );
  }, [item.trailers, selectedLanguage]);

  return (
    <dialog id="my_modal_2" className="modal language-modal">
      <div className="modal-box max-w-5xl">
        <div className="sticky -top-6 bg-base-100 py-2 border-b-2 border-white/40">
          <h3 className="roboto-bold text-lg text-white text-center">
            VIDEOS
          </h3>
          <div className="flex flex-wrap gap-2 my-2 justify-center">
            {["All", ...item.languages].map((language, i) => (
              <div key={i}>
                <label>
                  <input
                    type="radio"
                    name="language"
                    value={language}
                    checked={selectedLanguage === language}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  />
                  <span className="radio-button rounded-2xl">{language}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="sm:ml-32">
          {filteredTrailers.length > 0 ? (
            filteredTrailers.map((trailer, i) => (
              <div key={i} className="my-4">
                <h3 className="text-xl font-semibold text-white">
                  {trailer.language} Trailers
                </h3>
                <div className="flex flex-wrap space-x-4 mt-2">
                  {trailer.trailerUrl.map((link, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <iframe
                        className="rounded-md mt-2 sm:w-[700px] w-[300px] h-[160] sm:h-[365px]"
                        src={`https://www.youtube.com/embed/${link.substring(17)}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div
              className="flex text-white poppins-semibold text-xl rounded-lg items-center justify-center"
              style={{ width: 700, height: 385 }}
            >
              <p className="align-middle">No Videos in {selectedLanguage}</p>
            </div>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
});

export default MovieDetails;
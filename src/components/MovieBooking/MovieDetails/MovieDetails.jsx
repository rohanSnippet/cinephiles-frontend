import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserNavHeader from "../UserNavHeader";
import like from "../../../assets/like.png";
import useAxiosPublic from "../../Hooks/AxiosPublic";
import user from "../../../assets/user_2.png";
import { AuthContext } from "../../Context/AuthProvider";
import useAxiosSecure from "../../Hooks/AxiosSecure";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const location = useLocation();
  const [activeVideo, setActiveVideo] = useState(null);
  const [castMembers, setCastMembers] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cLoading, setCLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("All"); // Default to "All" or any preferred language
  const [isShowAvl, setIsShowAvl] = useState(false);
  const { item, previousPath } = location.state;
  const releaseDateObj = new Date(item.releaseDate);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    // Scroll to the top when the component mounts
    window.scrollTo(0, 0);
  }, []);
  const handleGetTheatres = () => {
    navigate("/all-shows", { state: { item } });
  };
  // const profile = "https://en.wikipedia.org/wiki/Allu_Arjun"; // Make sure to include http/https

  const scrapeActors = async () => {
    try {
      setLoading(true);
      const res = await axiosPublic.post(`/actor/scrape`, item.cast);
      if (res.data.urls != null) {
        setCastMembers(res.data.urls);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const scrapeCrew = async () => {
    try {
      setCLoading(true);
      const res = await axiosPublic.post(`/actor/scrape-crew`, item.crew);
      if (res.data.urls != null) {
        setCrewMembers(res.data.urls);
        setCLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getShowAvlability = async () => {
      try {
        const res = await axiosSecure.get(
          `/show/get-show-avl/${item.id}/${userData.username}`
        );
        console.log(res.data); // Check the structure of `res` here to make sure it's returning what's expected
        setIsShowAvl(res.data);
      } catch (error) {
        console.log(error);
        setIsShowAvl(res.data); // In case of an error, assume button should not be shown
      }
    };

    getShowAvlability();
  }, [item.id, userData.username]); // Make sure this effect re-runs when `item.id` or `userData.username` changes

  useEffect(() => {
    scrapeActors();
    scrapeCrew();
  }, []);
console.log(item.trailers)

  return (
    <div className="h-full w-full">
      <UserNavHeader navLocation={previousPath || "/"} item={item} />

      <div className="relative w-[96%] h-[60vh] bg-black mx-auto rounded-xl shadow-lg shadow-slate-500/20">
        <div
          className="w-[80%] h-[100%] rounded-xl bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage: item.banner
              ? `url('${item?.banner}')`
              : item.poster
              ? `url('${item?.poster}')`
              : "gray",
          }}
        >
          <div className="absolute w-[80%] h-[100%] rounded-xl bg-gradient-to-r from-slate-950 via-transparent to-black"></div>
          {/* details */}
          <div id="name" className="md:pt-16 md:pl-8 w-[60%] pt-0 pl-2 ">
            <span className=" bg-gradient-to-r from-indigo-200/90 via-white to-white bg-clip-text text-transparent text-xl md:text-7xl roboto-semibold md:roboto-semibold ml-12 absolute">
              {" "}
              {item.title.toUpperCase()}
            </span>
            <div className=" pt-8 ml-12 mt-16 text-xl text-justify w-[60%]  text-white">
              <p className=" mb-12 md:text-base poppins-regular text-lg text-opacity-100 opacity-80">
                <span className="flex align-baseline">
                  {" "}
                  {item.certification == "CERTIFICATION_UA"
                    ? "U/A"
                    : item.certification.substring(14)}
                  &nbsp;Rated
                  <span className="ml-4 space-x-2 py-2 md:badge md:badge-ghost md:badge-lg border-none text-white md:text-white md:bg-opacity-50">
                    {" "}
                    {item.languages.map((lang, i) => {
                      return <span key={i}>{lang}</span>;
                    })}
                  </span>
                  <span className="ml-4 space-x-2 py-2 md:badge md:badge-ghost md:badge-lg border-none text-white md:text-white md:bg-opacity-50">
                    {" "}
                    {item.formats.map((format, i) => {
                      return <span key={i}>{format}</span>;
                    })}
                  </span>
                </span>
              </p>
              <p className="md:text-2xl word-class w-[80vh] text-white absolute poppins-extralight">
                {item.description}
              </p>
            </div>
            <div className="m-20 absolute left-[40%]">
              <button
                onClick={handleGetTheatres}
                className="btn bg-slate-950/60 shadow-md hover:-translate-y-1 hover:scale-x-105 transition-all duration-300 ease-in-out shadow-slate-800/90 w-64 border-none hover:bg-white/60 hover:text-black rounded-lg text-white overflow-hidden"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="scale-100 text-xl poppins-bold transform transition-transform duration-100">
                  Book &nbsp;Tickets
                </span>
              </button>
            </div>
          </div>
          {/* poster */}
          <div
            className="absolute flex items-center justify-center w-[35vh] ring-indigo-900/20 ring-1 ring-offset-1 ring-offset-slate-800/50 h-[90%] bg-center bg-cover bg-no-repeat rounded-xl shadow-slate-800/80 shadow-xl"
            style={{
              backgroundImage: `url('${item?.poster}')`,
              right: "10%",
              top: "14%",
              transform: "translateY(-10%)",
            }}
          >
            <button
              type="button"
              disabled={Object.values(item.trailers).includes("tba") == true}
              onClick={() => document.getElementById("my_modal_2").showModal()}
              className="badge badge-neutral bg-black/60 w-2/3 h-7 border-none text-white roboto-regular"
            >
             {/*  {Object.values(item.trailers).includes("tba")
                ? `No Trailer(s)`
                : `(${Object.entries(item.trailers).length}) Trailer(s)`} */}
              {item.trailers.length > 0 
  ? `${item.trailers.reduce((total, trailer) => total + trailer.trailerUrl.length, 0)} Trailer(s)` 
  : ''}

            </button>

            <div className="absolute bg-black bg-opacity-50 h-8 w-full rounded-b-xl bottom-0"></div>
            <div className=" btn-ghost h-[10vh] rounded-xl inset-0 opacity-100  ">
              {" "}
              <p className="text-white absolute bottom-1 poppins-regular text-md left-[24%]">
                {item.likes >= 1000000
                  ? (item.likes / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
                  : item.likes >= 1000
                  ? (item.likes / 1000).toFixed(1).replace(/\.0$/, "") + "k"
                  : item.likes}
              </p>
              <img
                src={like}
                className=" bottom-1 left-[6%] absolute h-[31px] w-[31px]"
              />
              <div className=" text-white absolute right-5 bottom-1 poppins-regular text-md">
                {releaseDateObj.toString().substring(8, 10)}{" "}
                {releaseDateObj.toString().substring(4, 8)}
                {item.releaseDate.substring(0, 4)}
              </div>
            </div>
          </div>
        </div>
        {/* cast */}
        <div className="w-[100%] mt-8 px-16 py-2 rounded-ss-md rounded-e-full rounded-es-2xl bg-gradient-to-tr from-slate-900/30 via-slate-700/30 to-base-300 ">
          <div className="poppins-semibold text-4xl py-3 text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-400 to-slate-800/50">
            CAST
          </div>
          <div className="text-white poppins-bold text-xl flex-wrap flex">
            {Object.entries(item.cast).map(([member, char], i) => (
              <div
                key={i}
                className="poppins-medium my-5 w-1/6  hover:scale-[1.03] transition-all duration-200 ease-in-out"
              >
                <div className="avatar ">
                  <div className="w-32 rounded-xl shadow-md ">
                    <a
                      href={`https://www.google.com/search?q=${member
                        .trim()
                        .split(" ")
                        .join("+")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      <img
                        src={
                          !loading
                            ? Object.entries(castMembers).find(
                                ([key, url]) =>
                                  key === member && url !== "No Image"
                              )?.[1] || user
                            : user
                        }
                      />
                    </a>
                  </div>
                </div>
                <div className="word-class w-36"> {member} </div>
                <span className="poppins-extralight-italic text-slate-100/80 word-class w-8">
                  {char}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* crew */}
        <div className="w-full mt-8 px-16 py-2 rounded-ss-md rounded-e-full rounded-es-2xl bg-gradient-to-tr from-slate-900/30 via-slate-700/30 to-white/10 ">
          <div className="poppins-semibold text-4xl py-3 text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-400 to-slate-800/50">
            CREW
          </div>
          <div className="text-white poppins-bold text-xl flex flex-wrap">
            {item.crew.map((member, i) => (
              <div
                key={i}
                className="poppins-medium my-5 w-1/6 hover:scale-[1.04] hover:translate-y-[-2px] transition-all duration-200 ease-in-out"
              >
                <div className="avatar">
                  <div className="w-32 rounded-xl ring-slate-800/80 ring-2">
                    <a
                      href={`https://www.google.com/search?q=${member.name
                        .trim()
                        .split(" ")
                        .join("+")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      <img
                        src={
                          !cLoading
                            ? Object.entries(crewMembers).find(
                                ([key, url]) =>
                                  key === member.name && url !== "No Image"
                              )?.[1] || user // Fallback to `user` if "No Image"
                            : user // Display `user` if `cLoading` is true
                        }
                        alt={`${member.name}'s profile`}
                      />
                    </a>
                  </div>
                </div>
                <div className="word-class w-36">{member.name}</div>
                <span className="poppins-extralight-italic text-slate-100/80 w-8 word-class">
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
      </div>

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

          <div className="ml-32 ">
            {/* Filtered trailers based on selected language */}
            {/*   {Object.entries(item.trailers).filter(
              ([trailerLang]) =>
                selectedLanguage === "All" || trailerLang === selectedLanguage
            ).length > 0 ? (
              
              // If there are filtered trailers, render them
              Object.entries(item.trailers)
                .filter(
                  ([trailerLang]) =>
                    selectedLanguage === "All" ||
                    trailerLang === selectedLanguage
                )
                .map(([trailerLang, link], i) => (
                  <iframe
                    key={activeVideo === link ? `${link}-active` : link}
                    onClick={() => setActiveVideo(link)}
                    className=" mt-2 rounded-md "
                    width="700"
                    height="365"
                    src={`https://www.youtube.com/embed/${link.substring(17)}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  ></iframe>
                ))
            ) : (
              // If no trailers match, show "No videos" message
              <div
                className="flex text-white poppins-semibold text-xl rounded-lg items-center justify-center bg-slate-800 "
                style={{ width: 700, height: 385 }}
              >
                <p className="align-middle">No Vedios in {selectedLanguage}</p>
              </div>
            )} */}
            {item.trailers.filter(
              (trailer) =>
                selectedLanguage === "All" || trailer.language === selectedLanguage
            ).length > 0 ? (
              // If there are filtered trailers, render them
              item.trailers
                .filter(
                  (trailer) =>
                    selectedLanguage === "All" ||
                    trailer.language === selectedLanguage
                )
                .map((trailer, i) => (
                  <div key={i} className="my-4">
                    <h3 className="text-xl font-semibold text-white">
                      {trailer.language} Trailers:
                    </h3>
                    <div className="flex flex-wrap space-x-4 mt-2">
                      {trailer.trailerUrl.map((link, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <iframe
                            onClick={() => setActiveVideo(link)}
                            className="rounded-md mt-2"
                            width="700"
                            height="365"
                            src={`https://www.youtube.com/embed/${link.substring(
                              17
                            )}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          ></iframe>
                          {/* <p className="text-white mt-2">Trailer {idx + 1}</p> */}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              // If no trailers match, show "No videos" message
              <div
                className="flex text-white poppins-semibold text-xl rounded-lg items-center justify-center bg-slate-800"
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
    </div>
  );
};

export default MovieDetails;

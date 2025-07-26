import React from "react";
import like from "../../assets/like.png";
import star from "../../assets/star.png";
import { Link } from "react-router-dom";
import noPoster from "../../assets/noPoster.png";

const RecomendedMovieCard = ({ item }) => {
  const { releaseDate, likes } = item;
  const releaseDateObj = new Date(releaseDate);
  const now = Date.now();

  const displayText = releaseDateObj <= now ? "votes" : "interests";

  return (
    <div className="carousel-item ring-2 ring-white/20 rounded-sm relative group w-[20vh] h-[33vh] md:w-[33vh] md:h-[53vh] hover:shadow-md hover:shadow-white/40">
      {item.promoted ? (
        <p
          className={`absolute bottom-13 poppins-light text-md px-2 text-white bg-green-600 rounded-ss-xl rounded-ee-xl`}
        >
          promoted
        </p>
      ) : (
        ``
      )}
      <img
        src={item.poster || noPoster}
        alt="Burger"
        loading="lazy"
        className="object-cover w-full h-full rounded-sm"
      />
      <div className="absolute btn-ghost rounded-lg backdrop-blur-sm shadow-xl shadow-slate-800/20 hover:bg-slate-700/5 hover:bg-opacity-60 inset-0 opacity-0 hover:opacity-100 group-hover:text-white transition-opacity duration-300">
        {" "}
        {releaseDateObj <= now ? (
          <img
            src={star}
            alt=""
            className="bottom-[3vh] left-[39%] absolute h-[55px] w-[55px] opacity-80"
          />
        ) : (
          <img
            src={like}
            className=" bottom-[3vh] left-[4%] absolute h-[26px] w-[26px]"
          />
        )}
        <p className="absolute bottom-5 poppins-regular text-lg left-[18%]">
          {likes >= 1000000
            ? (likes / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
            : likes >= 1000
            ? (likes / 1000).toFixed(1).replace(/\.0$/, "") + "k"
            : likes}
        </p>
        <p className="absolute bottom-5 poppins-regular text-lg right-[2%]">
          {releaseDateObj.toString().substring(8, 10)}{" "}
          {releaseDateObj.toString().substring(4, 8)}
          {releaseDate.substring(0, 4)}
        </p>
        <Link
          to={`/movie-details`}
          state={{ item: item, previousPath: `/` }}
          className="absolute top-[50%] poppins-light hover:font-bold text-2xl left-[32%] bg-black bg-opacity-60 px-4 py-1 rounded-md hover:-translate-y-3 hover:shadow-sm hover:shadow-white/60 duration-300 hover:bg-white hover:text-black hover:bg-opacity-50"
        >
          Book{" "}
        </Link>
        <p className=" absolute top-[0%] w-full poppins-bold text-xl text-white">
          {item.title.toUpperCase()}
        </p>
        {releaseDateObj <= now ? (
          <p className=" absolute bottom-[9%] w-full roboto-regular text-[15px] text-white">
            {item.ratings}
          </p>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default RecomendedMovieCard;

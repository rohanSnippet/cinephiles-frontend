import React from "react";
import { Link } from "react-router-dom";
import like from "../../assets/like.png";
import star from "../../assets/star.png";
import noPoster from "../../assets/noPoster.png";

const RecomendedMovieCard = ({ item }) => {
  const { releaseDate, likes, title, ratings, poster, promoted } = item;
  const releaseDateObj = new Date(releaseDate);
  const now = Date.now();
  const isReleased = releaseDateObj <= now;

  // Format likes cleanly
  const formatLikes = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return num;
  };

  // Format date cleanly (e.g., "12 Dec 2026")
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <Link
      to={`/movie-details`}
      state={{ item: item, previousPath: `/` }}
      className="group relative block w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#0a0a0a] cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.4)] transform transition-transform duration-500 hover:-translate-y-2"
    >
      {/* Promoted Badge */}
      {promoted && (
        <div className="absolute top-2 right-2 z-20 px-2 py-0.5 bg-white/20 backdrop-blur-md border border-white/20 rounded text-[9px] text-white poppins-medium uppercase tracking-widest">
          Promoted
        </div>
      )}

      {/* Poster Image */}
      <img
        src={poster || noPoster}
        alt={title}
        loading="lazy"
        className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
      />

      {/* Deep Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Content Container (Bottom Aligned, tighter padding for smaller cards) */}
      <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-3 group-hover:translate-y-0">

        <h3 className="w-full poppins-semibold text-base md:text-lg text-white tracking-wide line-clamp-2 mb-1.5 leading-tight">
          {title}
        </h3>

        <div className="flex items-center justify-between w-full mt-1">
          {/* Rating or Likes */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
            <img
              src={isReleased ? star : like}
              alt={isReleased ? "Rating" : "Likes"}
              className="w-3.5 h-3.5 object-contain opacity-90"
            />
            <span className="text-white text-[11px] poppins-medium pt-[1px]">
              {isReleased ? (ratings ? ratings.toFixed(1) : "N/A") : formatLikes(likes)}
            </span>
          </div>

          {/* Release Date */}
          <span className="text-white/70 text-[10px] sm:text-[11px] poppins-medium tracking-wide">
            {formatDate(releaseDate)}
          </span>
        </div>

      </div>
    </Link>
  );
};

export default RecomendedMovieCard;
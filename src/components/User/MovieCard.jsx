import React from "react";
import noPoster from "../../assets/noPoster.png";
import like from "../../assets/like.png";
import { Link } from "react-router-dom";

const MovieCard = ({ item }) => {
  const { likes } = item;
  
  // Format the likes count
  const formatLikes = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return count;
  };

  // Format the date to be more readable
  const formatDate = (dateString) => {
    return dateString.replaceAll("-", ".");
  };

  return (
    <Link
      to={`/movie-details`}
      state={{ item: item, previousPath: "/All-Movies" }}
      className="block transition-transform duration-300 hover:scale-105" // Removed width classes
    >
      <div className="relative group rounded-xl overflow-hidden">
        {/* Movie poster */}
        <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-800">
          <img
            src={item.poster || noPoster}
            alt={item.title}
            loading="lazy"
            className="object-cover w-full h-full rounded-xl transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-b-xl"></div>
        
        {/* Movie info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={like}
              alt="Likes"
              className="h-5 w-5 mr-2 filter brightness-0 invert" // White icon
            />
            <span className="poppins-medium text-sm text-white">
              {formatLikes(likes)}
            </span>
          </div>
          <span className="poppins-medium text-sm text-white bg-black/40 px-2 py-1 rounded-md">
            {formatDate(item.releaseDate)}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
          <div className="text-white text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="poppins-bold text-lg mb-2">VIEW DETAILS</div>
            <div className="w-12 h-1 bg-white mx-auto mb-3"></div>
            {/* <div className="text-xs opacity-80">Click to book tickets</div> */}
          </div>
        </div>
      </div>
      
      {/* Movie title */}
      <div className="poppins-medium text-base mt-3 text-center text-white line-clamp-2 leading-tight">
        {item.title.toUpperCase()}
      </div>
    </Link>
  );
};

export default MovieCard;
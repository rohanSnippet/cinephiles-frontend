import React from "react";
import EnGCard from "./EnGCard";
import generes from "../../assets/generes.json";

const ExploreGeneres = () => {
  return (
    <div className="py-8 md:py-12 bg-gradient-to-bl from-black/80 via-slate-800/40 to-black/70 px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl sm:text-5xl lg:text-6xl poppins-bold text-center text-white">GENRES</h2>
      <h4 className="text-lg sm:text-xl roboto-light text-center text-white my-3 sm:my-4 pb-4">
        Endless Stories Await: Find the Perfect Genre for You
      </h4>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {generes.map((g, i) => (
            <div key={i} className="rounded-xl transform transition-transform duration-300 hover:scale-105">
              <EnGCard genere={g} />
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-7 py-3 text-center">
        <button className="badge bg-transparent border-double border-white text-white hover:transition-transform hover:scale-105 hover:bg-gradient-to-br hover:from-white/10 hover:via-white/20 hover:to-white/35 hover:bg-opacity-15 poppins-regular text-xl sm:text-2xl py-3 px-5 sm:py-4 sm:px-6 md:py-5 md:px-7">
          More Genres
        </button>
      </div>
    </div>
  );
};

export default ExploreGeneres;
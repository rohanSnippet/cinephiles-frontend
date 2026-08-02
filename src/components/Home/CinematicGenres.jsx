import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPlay } from "react-icons/fa";

const genres = [
  { id: 1, title: "Action", image: "https://wallpapers-clan.com/wp-content/uploads/2023/12/john-wick-red-art-desktop-wallpaper-cover.jpg", count: "124 Movies" },
  { id: 2, title: "Period Drama", image: "https://wallpapers.com/images/hd/baahubali-prabhas-hd-battle-scene-hxopdqkgvq7chv4q.jpg", count: "89 Movies" },
  { id: 3, title: "Horror", image: "https://images.squarespace-cdn.com/content/v1/59d7e2c7e45a7c0ce235bb55/1679067876756-ATJ5VCORIAIKBU5Q0G9N/SXSW-2023-Film-Review-Evil-Dead-Rise.jpg", count: "56 Movies" },
  { id: 4, title: "Romance", image: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=800&auto=format&fit=crop", count: "112 Movies" },
  { id: 5, title: "Comedy", image: "https://i.redd.it/en2b082k3cu01.jpg", count: "204 Movies" },
  { id: 6, title: "Explore More", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop", count: "204 Movies" },
];

const CinematicGenres = () => {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  return (
    <div className="max-w-[95rem] mx-auto px-4 lg:px-10 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-white text-3xl md:text-4xl poppins-bold tracking-wide uppercase">Explore Realms</h2>
          <p className="text-neutral-400 poppins-light text-sm mt-2">Dive into our curated cinematic universes.</p>
        </div>
      </div>

      {/* Hover Accordion Container */}
      <div className="flex flex-col md:flex-row w-full h-[60vh] gap-2 md:gap-4 transition-all duration-500">
        {genres.map((genre, index) => {
          const isActive = hoveredIndex === index;
          return (
            <motion.div
              key={genre.id}
              onMouseEnter={() => setHoveredIndex(index)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                ${isActive ? "md:flex-[4] flex-[2]" : "md:flex-[1] flex-1"}
              `}
            >
              {/* Background Image */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 ${isActive ? "scale-105" : "scale-100 grayscale-[50%]"}`}
                style={{ backgroundImage: `url(${genre.image})` }}
              ></div>
              
              {/* Overlays */}
              <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? "bg-gradient-to-t from-black/90 via-black/20 to-transparent" : "bg-black/60"}`}></div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end h-full">
                <div className={`transition-all duration-500 ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 md:opacity-100"}`}>
                  {isActive && (
                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded text-[10px] text-white poppins-medium uppercase tracking-widest mb-3">
                      {genre.count}
                    </span>
                  )}
                  <h3 className="text-2xl md:text-4xl poppins-bold text-white tracking-wide whitespace-nowrap">
                    {genre.title}
                  </h3>
                  
                  {isActive && (
                    <motion.button 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-4 flex items-center gap-2 text-xs poppins-semibold uppercase tracking-widest text-white hover:text-indigo-400 transition-colors"
                    >
                      <FaPlay size={10} /> Explore Genre
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CinematicGenres;
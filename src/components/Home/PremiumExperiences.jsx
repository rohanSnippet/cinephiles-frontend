import React from "react";
import { motion } from "framer-motion";

const PremiumExperiences = () => {
  return (
    <div className="max-w-[95rem] mx-auto px-4 lg:px-10">
      <div className="text-center mb-12">
        <h2 className="text-white text-3xl md:text-5xl poppins-bold tracking-widest uppercase mb-4">The Ultimate Format</h2>
        <p className="text-neutral-400 poppins-light text-sm max-w-2xl mx-auto">Experience cinema exactly as the director intended with our industry-leading viewing technologies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-6 h-auto md:h-[60vh]">
        
        {/* Main Huge Feature - IMAX */}
        <motion.div 
          whileHover={{ scale: 0.98 }}
          className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer bg-[#111] border border-white/5 min-h-[300px]"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
            <span className="text-indigo-500 poppins-bold tracking-[0.3em] text-xs uppercase mb-2 block">Maximum Immersion</span>
            <h3 className="text-5xl md:text-7xl poppins-bold text-white tracking-tighter mb-4">IMAX <span className="font-light">With Laser</span></h3>
            <p className="text-neutral-300 poppins-light max-w-md text-sm leading-relaxed">Crystal clear images meet precision audio. Watch the biggest blockbusters on screens spanning wall-to-wall.</p>
          </div>
        </motion.div>

        {/* Top Right Feature - Dolby */}
        <motion.div 
          whileHover={{ scale: 0.96 }}
          className="relative rounded-3xl overflow-hidden group cursor-pointer bg-[#0a0a0a] border border-white/10 min-h-[200px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="p-8 flex flex-col justify-end h-full relative z-10">
            <h4 className="text-2xl poppins-bold text-white mb-2">Dolby Atmos</h4>
            <p className="text-xs text-neutral-400 poppins-light">Sound that moves around you in three-dimensional space.</p>
          </div>
        </motion.div>

        {/* Bottom Right Feature - 4DX */}
        <motion.div 
          whileHover={{ scale: 0.96 }}
          className="relative rounded-3xl overflow-hidden group cursor-pointer bg-[#0a0a0a] border border-white/10 min-h-[200px]"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-red-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="p-8 flex flex-col justify-end h-full relative z-10">
            <h4 className="text-2xl poppins-bold text-white mb-2">4DX Experience</h4>
            <p className="text-xs text-neutral-400 poppins-light">Motion seats and environmental effects sync with the action.</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default PremiumExperiences;
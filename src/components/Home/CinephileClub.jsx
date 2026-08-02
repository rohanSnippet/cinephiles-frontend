import React from "react";
import { motion } from "framer-motion";

const CinephileClub = () => {
  return (
    <div className="max-w-[85rem] mx-auto px-4 lg:px-10 mt-12">
      <div className="relative rounded-[2rem] overflow-hidden bg-[#0a0a0a] border border-white/5 p-8 md:p-16 text-center isolate shadow-2xl">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60vw] md:w-[40vw] h-[60vh] bg-indigo-600/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
        
        <span className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-indigo-300 poppins-medium uppercase tracking-widest mb-6">
          Premium Membership
        </span>
        
        <h2 className="text-3xl md:text-5xl poppins-bold text-white tracking-wide mb-6">
          Join the Cinephiles Club
        </h2>
        
        <p className="text-neutral-400 poppins-light text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
          Unlock early access to blockbuster tickets, zero convenience fees on premium formats, and exclusive invites to director's cut premieres.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-10 py-4 bg-white text-black poppins-semibold uppercase tracking-widest text-xs rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-neutral-200 transition-colors"
          >
            Claim Your Pass
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white/20 text-white poppins-semibold uppercase tracking-widest text-xs rounded-full hover:bg-white/5 transition-colors"
          >
            Learn More
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CinephileClub;
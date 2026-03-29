import React from "react";
import { motion } from "framer-motion";
import { BsFire } from "react-icons/bs";

const LiveFireIcon = () => {
  return (
    <div className="relative flex items-center justify-center w-6 h-6">
      {/* The Ambient Glowing Pulse */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-4 h-4 bg-orange-500 rounded-full blur-md"
      />
      
      {/* The Actual Fire Icon */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          color: ["#f97316", "#ef4444", "#f59e0b", "#f97316"], // Shifts between Orange, Red, and Amber
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 drop-shadow-[0_0_8px_rgba(249,115,22,0.9)]"
      >
        <BsFire size={20} />
      </motion.div>
    </div>
  );
};

export default LiveFireIcon;
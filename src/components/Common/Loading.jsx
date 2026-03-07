import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] backdrop-blur-xl">

      {/* Camera Lens / Projector Focus Effect */}
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Outer static ring */}
        <div className="absolute w-full h-full border-[1px] border-white/10 rounded-full"></div>

        {/* Spinning focus ring */}
        <div className="absolute w-full h-full border-[1px] border-transparent border-t-white/80 border-b-white/20 rounded-full animate-[spin_1.5s_cubic-bezier(0.68,-0.55,0.26,1.55)_infinite]"></div>

        {/* Inner glowing projector bulb */}
        <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_4px_rgba(255,255,255,0.4)] animate-pulse"></div>
      </div>

      {/* Sleek Cinematic Typography */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <h3 className="text-white tracking-[0.5em] uppercase poppins-medium text-xs opacity-80">
          Cinephiles
        </h3>

        {/* Minimalist 3-dot progress */}
        <div className="flex gap-2">
          <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: "0ms", animationDuration: "1.5s" }}></div>
          <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: "300ms", animationDuration: "1.5s" }}></div>
          <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: "600ms", animationDuration: "1.5s" }}></div>
        </div>
      </div>

    </div>
  );
};

export default Loading;
import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] bg-opacity-90 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute w-20 h-20 border border-white/10 rounded-full animate-[spin_3s_linear_infinite]"></div>
        {/* Inner fast spinner */}
        <div className="w-14 h-14 border-2 border-transparent border-t-white border-r-white/50 rounded-full animate-spin"></div>
      </div>
      <h3 className="mt-6 text-white tracking-[0.3em] uppercase poppins-medium text-sm animate-pulse opacity-80">
        Loading
      </h3>
    </div>
  );
};

export default Loading;
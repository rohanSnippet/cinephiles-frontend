import React from "react";
import experiences from "../../assets/experiences.json";
import EnGCard from "./EnGCard";

const Experiences = () => {
  return (
    <div className="py-8 md:py-12 bg-gradient-to-br from-black via-slate-800/30 to-black px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl sm:text-5xl lg:text-6xl poppins-bold text-center text-white">
        EXPERIENCES
      </h2>
      <h4 className="text-lg sm:text-xl roboto-light text-center text-white my-3 sm:my-4 pb-4">
        Get the best cinema viewing experiences
      </h4>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {experiences.map((e, i) => (
            <div key={i} className="rounded-xl transition-transform duration-300 hover:scale-105">
              <EnGCard experiences={e} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Experiences;
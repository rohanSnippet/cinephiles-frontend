import React from "react";

const EnGCard = ({ genere, experiences }) => {
  return (
    <div className="relative rounded-xl w-full h-0 pb-[71%]"> {/* 71% = (30/42)*100 for aspect ratio */}
      {genere ? (
        <div
          className="z-10 text-white/80 hover:transform hover:-translate-y-2 hover:scale-[1.05] transition-all duration-300 ease-in-out absolute top-0 left-0 h-full w-full text-center hover:text-white rounded-xl overflow-hidden"
          style={{
            backgroundImage: `url('${genere.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h2 className="z-30 absolute poppins-bold text-xl sm:text-2xl md:text-3xl w-full bottom-4 md:bottom-10 left-0 opacity-100 px-2">
            {genere.genre}
          </h2>
          <div className="z-20 rounded-xl bg-gradient-to-r from-black/80 via-black/50 to-transparent h-full w-full absolute opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      ) : (
        <div
          className="z-10 text-white/80 hover:transform hover:-translate-y-2 hover:scale-[1.05] transition-all duration-300 ease-in-out absolute top-0 left-0 h-full w-full text-center hover:text-white rounded-xl overflow-hidden"
          style={{
            backgroundImage: `url('${experiences.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h2 className="z-30 absolute poppins-bold text-xl sm:text-2xl md:text-3xl w-full bottom-4 md:bottom-10 left-0 opacity-100 px-2">
            {experiences.experiences}
          </h2>
          <div className="z-20 rounded-xl bg-gradient-to-r from-black/80 via-black/50 to-transparent h-full w-full absolute opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}
    </div>
  );
};

export default EnGCard;
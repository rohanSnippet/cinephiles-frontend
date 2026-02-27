import React, { useState } from "react";
import regions from "../../assets/regions.json";
import regions2 from "../../assets/regions2.json";
import { Link } from "react-router-dom";
import { MdOutlineMyLocation } from "react-icons/md";

const Location = () => {
  const [add, setAdd] = useState("");

  const fetchLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => setAdd(data.address))
        .catch((err) => console.error("Error fetching address:", err));
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 sm:px-8 lg:px-16 pt-24">
      <div className="max-w-7xl mx-auto flex flex-col items-center">

        <h1 className="text-3xl md:text-5xl poppins-semibold tracking-wide mb-4 text-center">
          Choose Your Location
        </h1>
        <p className="text-neutral-400 poppins-light text-sm md:text-base mb-10 text-center max-w-lg">
          Select your city to discover the best movies, events, and cinematic experiences near you.
        </p>

        {/* Search & Auto-Detect Container */}
        <div className="w-full max-w-2xl flex flex-col md:flex-row gap-4 mb-16">
          <input
            className="w-full h-14 rounded-full bg-white/5 border border-white/10 px-6 text-white placeholder:text-neutral-500 poppins-light focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            type="text"
            placeholder="Search for your city..."
          />
          <button
            onClick={fetchLocation}
            className="h-14 px-8 rounded-full bg-white text-black poppins-medium flex items-center justify-center gap-2 hover:bg-neutral-300 transition-colors whitespace-nowrap"
          >
            <MdOutlineMyLocation size={20} />
            Detect My Location
          </button>
        </div>

        {add && (
          <div className="mb-12 p-4 bg-white/5 border border-white/10 rounded-xl max-w-2xl text-center poppins-light text-sm text-neutral-300">
            Current Location: {JSON.stringify(add)}
          </div>
        )}

        {/* Regions Grid */}
        <div className="w-full">
          <h2 className="text-xl poppins-medium tracking-widest uppercase mb-6 text-white/80 border-b border-white/10 pb-2">
            Popular Regions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...regions, ...regions2].map((region, i) => (
              <Link
                to={`/location/cities${i < regions.length ? '1' : '2'}/${i < regions.length ? i : i - regions.length}`}
                key={i}
                className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-white/5 bg-[#111] hover:border-white/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <div
                  className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  style={{ backgroundImage: `url('${region.pic}')` }}
                ></div>
                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                <h2 className="absolute bottom-4 left-4 right-4 text-center poppins-semibold text-lg md:text-xl text-white tracking-wide drop-shadow-lg">
                  {region.region}
                </h2>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Location;
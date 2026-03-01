import React from "react";
import { RiMovieFill } from "react-icons/ri";
import theatreIcon from "../../assets/movie.png";
import ticketsIcon from "../../assets/movie-tickets.png";
import ratingIcon from "../../assets/thumbs-up.png";

const Owner = () => {
  const stats = [
    {
      title: "Active Theatres",
      value: "3",
      icon: theatreIcon,
      color: "from-red-500/20 to-red-900/5",
      textColor: "text-red-400",
      borderColor: "border-red-500/20",
    },
    {
      title: "Total Bookings",
      value: "1,248",
      icon: ticketsIcon,
      color: "from-teal-500/20 to-teal-900/5",
      textColor: "text-teal-400",
      borderColor: "border-teal-500/20",
    },
    {
      title: "Average Rating",
      value: "4.8",
      icon: ratingIcon,
      color: "from-indigo-500/20 to-indigo-900/5",
      textColor: "text-indigo-400",
      borderColor: "border-indigo-500/20",
    },
  ];

  return (
    <div className="p-4 md:p-8 font-poppins min-h-full">

      {/* Page Header */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-8 flex items-center gap-4 shadow-xl">
        <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
          <RiMovieFill size={32} />
        </div>
        <div>
          <h1 className="text-2xl poppins-bold text-white tracking-wide uppercase">Dashboard Overview</h1>
          <p className="text-sm text-white/50 poppins-light mt-1">Monitor your theatres and booking metrics</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl bg-[#0a0a0a] border ${stat.borderColor} p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group hover:-translate-y-1 transition-transform duration-300`}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="flex justify-between items-start">
                <h2 className="text-white/60 poppins-medium text-sm tracking-widest uppercase">{stat.title}</h2>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center p-2 border border-white/10 backdrop-blur-sm">
                  <img src={stat.icon} alt={stat.title} className="w-full h-full object-contain opacity-80" />
                </div>
              </div>

              <div>
                <h1 className={`text-5xl md:text-6xl poppins-bold ${stat.textColor} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
                  {stat.value}
                </h1>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty Data Sections (For Future Charts/Graphs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-[#0a0a0a] border border-white/5 h-80 flex flex-col items-center justify-center p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent"></div>
          <div className="w-16 h-16 rounded-full border border-white/10 bg-[#111] flex items-center justify-center mb-4 text-white/30 group-hover:text-white/60 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
          </div>
          <h3 className="text-white/50 poppins-medium tracking-wide">Revenue Chart Placeholder</h3>
        </div>

        <div className="rounded-2xl bg-[#0a0a0a] border border-white/5 h-80 flex flex-col items-center justify-center p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent"></div>
          <div className="w-16 h-16 rounded-full border border-white/10 bg-[#111] flex items-center justify-center mb-4 text-white/30 group-hover:text-white/60 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-white/50 poppins-medium tracking-wide">Recent Activity Placeholder</h3>
        </div>
      </div>

    </div>
  );
};

export default Owner;
import React from "react";
import { RiMovieFill } from "react-icons/ri";
import theatre from "../../assets/movie.png";
import tickets from "../../assets/movie-tickets.png"
import rating from "../../assets/thumbs-up.png"


const Owner = () => {
  return <div> 
             <div className="ring-2 ring-gray-900 ring-offset-2 rounded-xl flex items-center bg-gradient-to-br from-black via-gray-900 to-black mb-2 shadow-2xl text-white shadow-slate-600 p-4 text-xl poppins-semibold gap-x-8">
        <RiMovieFill size={32} className="ml-8" /> OWNER DASHBOARD
      </div>
<div className="mx-auto flex space-x-4 justify-between w-full">
  {/* Theatres */}
  <div className="flex-1 rounded-xl bg-opacity-80 bg-gradient-to-br from-black via-gray-900 to-slate-900 shadow-md space-y-10 shadow-red-400/50 h-44 flex items-center justify-center">
    <div className="text-center">
      <img src={theatre} className="w-16 mx-auto" />
    <h2 className="p-5 text-4xl poppins-bold bg-gradient-to-r items-center from-white via-red-200 to-red-300  bg-clip-text text-transparent ">Theatres</h2>
  </div>
<div>  <span class="absolute mx-auto py-4 flex border w-fit bg-gradient-to-r blur-lg from-red-500 via-orange-500 to-pink-500 bg-clip-text text-6xl box-content font-extrabold text-transparent text-center select-none">
   3
  </span>
    <h1
        class="relative poppins-semibold top-0 w-fit h-auto py-4 justify-center flex bg-gradient-to-r items-center from-red-400 via-red-400/80 to-red-400/70 bg-clip-text text-6xl font-extrabold text-transparent text-center select-auto">
        3
    </h1></div>

</div>

{/* Bookings */}
<div className="flex-1 rounded-xl bg-opacity-80 bg-gradient-to-br from-black via-gray-900 to-slate-900 shadow-md space-y-10 shadow-teal-400/50 h-44 flex items-center justify-center">
    <div className="text-center">
      <img src={tickets} className="w-16 mx-auto" />
    <h2 className="p-5 text-4xl poppins-bold bg-gradient-to-r items-center from-white via-teal-200 to-teal-300  bg-clip-text text-transparent ">Bookings</h2>
  </div>
<div>  <span class="absolute mx-auto py-4 flex border w-fit bg-gradient-to-r blur-lg from-teal-500 via-sky-500 to-aqua-500 bg-clip-text text-6xl box-content font-extrabold text-transparent text-center select-none">
   3
  </span>
    <h1
        class="relative poppins-semibold top-0 w-fit h-auto py-4 justify-center flex bg-gradient-to-r items-center from-teal-400 via-teal-400/80 to-red-teal/90 bg-clip-text text-6xl font-extrabold text-transparent text-center select-auto">
        3
    </h1></div>

</div>

{/* liked */}

<div className="flex-1 rounded-xl bg-opacity-80 bg-gradient-to-br from-black via-gray-900 to-slate-900 shadow-md space-y-10 shadow-violet-400/50 h-44 flex items-center justify-center">
    <div className="text-center">
      <img src={rating} className="w-16 mx-auto" />
    <h2 className="p-5 text-4xl poppins-bold bg-gradient-to-r items-center from-white via-violet-200 to-violet-300  bg-clip-text text-transparent ">Ratings</h2>
  </div>
<div>  <span class="absolute mx-auto py-4 flex border w-fit bg-gradient-to-r blur-lg from-violet-500 via-purple-500 to-purple-500 bg-clip-text text-6xl box-content font-extrabold text-transparent text-center select-none">
   3
  </span>
    <h1
        class="relative poppins-semibold top-0 w-fit h-auto py-4 justify-center flex bg-gradient-to-r items-center from-violet-400 via-purple-400/80 to-purple-400/90 bg-clip-text text-6xl font-extrabold text-transparent text-center select-auto">
        3
    </h1></div>

</div></div>

<div className="mx-auto flex space-x-4 justify-between w-full my-3">
  <div className="rounded-xl bg-opacity-80 bg-gradient-to-br from-black via-gray-900 to-slate-900 space-y-10 w-2/3 h-44 flex items-center justify-center"></div>

  <div className="rounded-xl bg-opacity-80 bg-gradient-to-br from-black via-gray-900 to-slate-900 space-y-10 w-1/3 h-44 flex items-center justify-center"></div>
</div>

</div>;
};

export default Owner;

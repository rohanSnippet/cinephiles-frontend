import React from "react";
import { RiMovieFill } from "react-icons/ri";

const Owner = () => {
  return <div> 
             <div className="ring-2 ring-gray-900 ring-offset-2 rounded-xl flex items-center bg-gradient-to-br from-black via-gray-900 to-black mb-2 shadow-2xl text-white shadow-slate-600 p-4 text-xl poppins-semibold gap-x-8">
        <RiMovieFill size={32} className="ml-8" /> OWNER DASHBOARD
      </div>
      <div
          className="max-w-[160%] pl-12  mx-auto rounded-xl bg-gradient-to-br from-black via-gray-900 to-slate-900 shadow-2xl space-y-10 shadow-slate-600 p-8"
        ><div>hello</div>
        <div>hello</div>
        <div>hello</div></div>
        </div>;
};

export default Owner;

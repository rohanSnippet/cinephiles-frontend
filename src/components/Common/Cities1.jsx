import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import regions from "../../assets/regions.json";
import useAxiosSecure from "../Hooks/AxiosSecure";
import useAuth from "../Hooks/useAuth";

const Cities1 = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const user = useAuth();
  const { id } = useParams();
  const region = regions[id];
  const handleLocation = async (e) => {
    console.log(e.target.value);
    const res = await axiosSecure.put(`/user/update-location/${user.id}`, {
      currLocation: e.target.value,
    });
    console.log("User updated successfully", res.data);
    navigate("/");
  };

  if (!region) {
    return <div>Region not found</div>;
  }

  return (
   <div className="min-h-screen bg-[#050505] text-white py-24 px-6 flex flex-col items-center">
         <h1 className="text-4xl poppins-bold tracking-widest uppercase mb-12 text-center">
           {region?.region}
         </h1>

         <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
           {region?.cities.map((city, index) => (
             <button
               key={index}
               value={city}
               onClick={handleLocation}
               className="px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white text-white hover:text-black poppins-medium transition-all duration-300 shadow-lg"
             >
               {city}
             </button>
           ))}
         </div>
       </div>
  );
};

export default Cities1;

import React, { useEffect, useState } from "react";
import { PiFilmReelBold } from "react-icons/pi";
import useAxiosSecure from "../../Hooks/AxiosSecure";
import { IoIosMail } from "react-icons/io";

const OwnersInfo = () => {
  const [allOwners, setAllOwners] = useState([]);
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(false);

  const getAllOwners = async () => {
    try {
      const res = await axiosSecure.get(`/owner/get-owners`);
      if (res) {
        setAllOwners(res.data);
        console.log(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  console.log(allOwners);
  useEffect(() => {
    getAllOwners();
  }, []);

  return (
    <div className="relative mx-auto">
      {" "}
      <div className="w-full h-16 bg-gradient-to-br from-black via-gray-900 to-black ring-2 ring-gray-900 ring-offset-2 rounded-xl">
        <h1 className="poppins-bold text-xl pl-6 pt-4 text-white flex">
          <PiFilmReelBold size={28} className="mr-3" /> MANAGE OWNERS & THEATRES
        </h1>
      </div>
      {/* filter & sort options */}
      <div></div>
      {/* all theatres with owners */}
      {allOwners.map((owner, i) => {
        return (
          <div className="collapse mt-4 collapse-arrow bg-gradient-to-br from-black/50 via-gray-900/40 to-slate-900 rounded-lg mx-auto w-[95%]">
          <input type="checkbox" />
          <div
            key={i}
            className="collapse-title relative mx-auto flex items-center justify-between ring-white/30 ring-1 w-full"
          >
            {/* Title Section */}
            <div className="flex items-center gap-4 pl-8 pt-1">
              <div className="text-lg poppins-bold text-white">{i + 1}</div>
              <div className="flex items-center gap-2">
                <div className="poppins-bold text-xl text-white">
                  {owner.user.firstName}
                </div>
                <div className="poppins-bold text-xl text-white">
                  {owner.user.lastName}
                </div>
              </div>
            </div>
        
            {/* Username and Mail Section */}
            <div className="flex items-center gap-2 justify-center">
              <div className="flex items-center gap-x-2 poppins-light text-md text-white/90">
                <IoIosMail size={24} />
                {owner.user.username}
              </div>
            </div>
        
            {/* Phone Section */}
            <div className="flex justify-end items-center gap-2 pr-8">
              <div className="poppins-light text-md text-white/90">
                {owner.user.phone || "Contact Not Provided"}
              </div>
            </div>
        
            {/* Theatre Count Section */}
            <div className="flex justify-end items-center gap-2 pr-8">
              <div className="poppins-semibold text-lg text-white">
                {owner.theatres.length} Theatre(s)
              </div>
            </div>
          </div>
        
          {/* Collapse Content: Theatre List */}
          <div className="collapse-content w-[95%] mx-auto">
            {owner.theatres.map((theatre, index) => (
              <div
                key={index}
                className="text-md gap-x-52 px-auto mt-4 border-e-white/20 flex roboto-bold text-white/70 "
              >
                <div>{index + 1}</div>
                <div className="text-center">
                  <div>{theatre.name}</div>
                  <div className="roboto-light text-sm">{theatre.city}</div>
                </div>
                <div>{theatre.tscreens} Screen(s)</div>
                <div className="roboto-regular">{theatre.contact}</div>
              </div>
            ))}
          </div>
        </div>
        
        );
      })}
    </div>
  );
};

export default OwnersInfo;

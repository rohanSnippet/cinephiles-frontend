import React, { useEffect, useState } from 'react'
import useAxiosSecure from '../Hooks/AxiosSecure';
import Swal from 'sweetalert2';
import { MdOutlineDelete } from 'react-icons/md';

const Schedule = ({ screen, selectedDate, isSelected }) => {

    const [shows, setShows] = useState([]);

    const axiosSecure = useAxiosSecure();
  
    const fetchShows = async () => {
      try {
        const res = await axiosSecure.get(
          `/show/byScreen?screenId=${screen.id}&showDate=${selectedDate}`
        );
        setShows(res.data);
      } catch (error) {
        console.log(error);
      }
    };
  
    useEffect(() => {
      fetchShows();
    }, [axiosSecure, screen.id, selectedDate]);

    const deleteShow = async (s) => {
        try {
          const res = await axiosSecure.delete(`/show/delete-show/${s.id}`);
          console.log(res)
          if (res.status==204) {
            Swal.fire({
              title: "Show deleted",
              icon: "success",
              timer: 2000,
            });
            fetchShows();
          }
        } catch (error) {
          console.log(error);
          Swal.fire({
            title: "Show not deleted",
            icon: "error",
            timer: 2000,
          });
        }
      };
  return (
     <div className="space-y-4 ">
          <div className="flex mt-20 ml-2 text-white">
            <div
              className={` flex items-start space-x-1 rounded-md ${
                isSelected ? `selected-screen` : `timeline-container`
              }`}
            >
             
              <div
                className={`flex absolute w-[100%] text-center h-[100%]  container `}
              >
                {shows.length > 0 &&
                  shows.map((show, index) => (
                    <div
                      key={index}
                     style={{
                        width:"200px",
                    backgroundImage: `url(${show.banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                 }}
                      className={`h-[100%] text-white poppins-semibold shadow-sm shadow-red-700 hover:border-2 border-[0.1px] border-transparent hover:border-indigo-200 absolute cursor-grab rounded-lg`}
                      
                    >
                      <div className="absolute w-[100%] h-[100%]  rounded-lg bg-gradient-to-b from-slate-900/90 via-transparent to-purple-800/30">
                        {" "}
                        {show.title}
                        <button
                          className="btn bg-transparent transition-opacity border-transparent hover:bg-transparent hover:border-transparent "
                          onClick={() => deleteShow(show)}
                        >
                          <MdOutlineDelete
                            size={28}
                            className="rounded-ss-md  rounded-ee-md hover:bg-red-500/70 hover:text-white text-red-600/80"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
  )
}

export default Schedule

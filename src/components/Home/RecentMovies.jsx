import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Slider from "react-slick";
import RecomendedMovieCard from "../Home/RecomendedMovieCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useAxiosSecure from "../Hooks/AxiosSecure";
import useCity from "../Hooks/useCity";
import regions from "../../assets/regions.json";
import regions2 from "../../assets/regions2.json";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const RecentMovies = () => {
  const [movies, setMovies] = useState([]);
  const [cities, setCities] = useState([]);
  const city = useCity();
  const axiosSecure = useAxiosSecure();
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef(null);

  const cityData = useMemo(() => {
    const foundRegion = regions.find(r => r.region === city) || regions2.find(r => r.region === city);
    return foundRegion ? foundRegion.cities : [city];
  }, [city]);

  const fetchMovies = useCallback(async () => {
    if (cities.length === 0) return;
    setIsLoading(true);
    try {
      const cityQuery = cities.join(",");
      const res = await axiosSecure.get(`/movie/by-city?cities=${cityQuery}`);
      setMovies(res.data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
    }
  }, [axiosSecure, cities]);

  useEffect(() => { setCities(cityData); }, [cityData]);
  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  const sortedMovies = useMemo(() =>
    movies.slice()
      .sort((a, b) => {
        if (a.promoted !== b.promoted) return b.promoted - a.promoted;
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      })
      .filter(movie => movie.bookingOpen),
    [movies]
  );

  const settings = useMemo(() => ({
    dots: false,
    infinite: false, // Ensures empty space is left on the right if there are few movies
    speed: 600,
    slidesToShow: 5.5, // Default for very large screens
    slidesToScroll: 2,
    arrows: false,
    responsive: [
      { breakpoint: 1536, settings: { slidesToShow: 5.5, slidesToScroll: 2 } }, // 2xl (Shows 5 full, 1 peeking)
      { breakpoint: 1280, settings: { slidesToShow: 4.5, slidesToScroll: 2 } }, // xl (Shows 4 full, 1 peeking)
      { breakpoint: 1024, settings: { slidesToShow: 3.5, slidesToScroll: 2 } }, // lg
      { breakpoint: 768,  settings: { slidesToShow: 2.5, slidesToScroll: 1 } }, // md
      { breakpoint: 480,  settings: { slidesToShow: 2.2, slidesToScroll: 1 } }, // sm (Mobile)
    ],
  }), []);

  return (
    <div className="relative pt-12 pb-12 bg-black">

      {/* Header Section */}
      <div className="max-w-[95rem] mx-auto px-6 lg:px-12 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="text-left">
          <h2 className="text-white text-2xl md:text-3xl lg:text-4xl poppins-semibold tracking-wide mb-1">
            Now showing in {city || "Your Area"}
          </h2>
          <p className="text-neutral-400 roboto-light text-xs md:text-sm max-w-xl">
            Secure your tickets today and be among the first to experience the excitement.
          </p>
        </div>
        <Link
          to={`/All-Movies`}
          className="hidden md:inline-block text-xs poppins-medium text-white/70 hover:text-white transition-colors uppercase tracking-widest border-b border-white/30 hover:border-white pb-1"
        >
          View All Movies
        </Link>
      </div>

      {/* Slider Section */}
      <div className="relative max-w-[95rem] mx-auto px-4 lg:px-10">
        {!isLoading ? (
          <div className="relative group">

            {/* The Slider */}
            <div className="py-4">
              {sortedMovies.length > 0 ? (
                <Slider ref={sliderRef} {...settings}>
                  {sortedMovies.map((item, i) => (
                    <div key={item.id || i} className="px-2">
                      <RecomendedMovieCard item={item} />
                    </div>
                  ))}
                </Slider>
              ) : (
                <div className="text-neutral-500 py-10 px-4 poppins-medium text-center border border-white/5 rounded-xl bg-white/5">
                  No trending movies found in this location.
                </div>
              )}
            </div>

            {/* Premium Navigation Arrows (Only show if there are enough movies to actually scroll) */}
            {sortedMovies.length > 5 && (
              <>
                <button
                  onClick={() => sliderRef.current?.slickPrev()}
                  className="absolute top-1/2 -left-2 md:-left-6 transform -translate-y-1/2 z-10 bg-black/80 backdrop-blur-md hover:bg-white text-white hover:text-black border border-white/10 p-3 md:p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block"
                >
                  <FaChevronLeft size={16} />
                </button>

                <button
                  onClick={() => sliderRef.current?.slickNext()}
                  className="absolute top-1/2 -right-2 md:-right-6 transform -translate-y-1/2 z-10 bg-black/80 backdrop-blur-md hover:bg-white text-white hover:text-black border border-white/10 p-3 md:p-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)] opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:block"
                >
                  <FaChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        ) : (
          /* Skeletons perfectly mathematically matched to the slider widths */
          <div className="flex gap-4 overflow-hidden px-2 py-4">
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <div
                key={l}
                className="flex-shrink-0 aspect-[2/3] bg-neutral-900 animate-pulse rounded-xl border border-white/5 w-[42vw] sm:w-[35vw] md:w-[26vw] lg:w-[20vw] xl:w-[16vw] 2xl:w-[15vw]"
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile View All Button */}
      <div className="mt-6 text-center md:hidden">
        <Link
          to={`/All-Movies`}
          className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white poppins-medium text-sm transition-all"
        >
          Explore All
        </Link>
      </div>
    </div>
  );
};

export default React.memo(RecentMovies);
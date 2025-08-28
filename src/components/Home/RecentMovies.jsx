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

const RecentMovies = () => {
  const [movies, setMovies] = useState([]);
  const [cities, setCities] = useState([]);
  const city = useCity();
  const axiosSecure = useAxiosSecure();
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef(null);

  // Memoized city data processing
  const cityData = useMemo(() => {
    const foundRegion = regions.find(r => r.region === city) || regions2.find(r => r.region === city);
    return foundRegion ? foundRegion.cities : [city];
  }, [city]);

  // Optimized movie fetching
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

  // Load cities only once
  useEffect(() => {
    setCities(cityData);
  }, [cityData]);

  // Fetch movies when cities change
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Memoized sorted movies
  const sortedMovies = useMemo(() => 
    movies
      .slice()
      .sort((a, b) => {
        if (a.promoted !== b.promoted) return b.promoted - a.promoted;
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      })
      .filter(movie => movie.bookingOpen),
    [movies]
  );

  // Responsive slider settings
  const settings = useMemo(() => ({
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: Math.min(sortedMovies.length, 5),
    slidesToScroll: Math.min(sortedMovies.length, 2),
    centerMode: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1920, // Large desktop
        settings: {
          slidesToShow: Math.min(sortedMovies.length, 5),
          slidesToScroll: Math.min(sortedMovies.length, 2),
        },
      },
      {
        breakpoint: 1480, // 2xl screens
        settings: {
          slidesToShow: Math.min(sortedMovies.length, 4),
          slidesToScroll: Math.min(sortedMovies.length, 2),
        },
      },
      {
        breakpoint: 1024, // lg screens
        settings: {
          slidesToShow: Math.min(sortedMovies.length, 3),
          slidesToScroll: Math.min(sortedMovies.length, 2),
        },
      },
      {
        breakpoint: 768, // md screens
        settings: {
          slidesToShow: Math.min(sortedMovies.length, 2),
          slidesToScroll: Math.min(sortedMovies.length, 1),
        },
      },
      {
        breakpoint: 480, // sm screens
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '40px',
        },
      },
    ],
  }), [sortedMovies.length]);

  const loaderCount = useMemo(() => [1, 2, 3, 4], []);

  return (
    <div className="relative overflow-hidden -mt-8 md:mt-20 bg-gradient-to-b from-black/70 via-gray-900">
      {/* Header Section */}
      <div className="w-[90%] mx-auto mb-8 md:mb-4 pt-8 md:pt-12">
        <h1 className="text-white text-2xl md:text-4xl lg:text-6xl poppins-extrabold mb-4 md:mb-6">
          GET YOUR TICKETS NOW
        </h1>
        <div className="text-white roboto-light text-base md:text-lg space-y-2">
          <p>Don't miss out on the action! Secure your tickets today and be among</p>
          <p>the first to experience the excitement. Act fast and grab your spot</p>
        </div>
      </div>

      {/* Slider Section */}
      <div className="relative px-4 md:px-8 lg:px-16">
        {!isLoading && sortedMovies.length > 0 ? (
          <div className="relative">
            <Slider ref={sliderRef} {...settings}>
              {sortedMovies.map((item, i) => (
                <div key={item.id || i} className="px-2 md:px-3 lg:px-4">
                  <RecomendedMovieCard item={item} />
                </div>
              ))}
            </Slider>

            {/* Navigation Arrows - Only show if there are enough movies */}
            {sortedMovies.length > 3 && (
              <>
                <button
                  onClick={() => sliderRef.current?.slickPrev()}
                  className="absolute top-1/2 -left-2 md:-left-4 lg:-left-6 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all duration-200"
                  aria-label="Previous movies"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => sliderRef.current?.slickNext()}
                  className="absolute top-1/2 -right-2 md:-right-4 lg:-right-6 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all duration-200"
                  aria-label="Next movies"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        ) : (
          // Skeleton Loaders
          <div className="flex justify-center gap-4 md:gap-6 lg:gap-8 px-4">
            {loaderCount.map((l) => (
              <div key={l} className="flex flex-col gap-3 w-[45vw] sm:w-[30vw] md:w-[22vw] lg:w-[18vw] xl:w-[15vw]">
                <div className="skeleton h-48 md:h-56 lg:h-64 w-full rounded-lg"></div>
                <div className="skeleton h-4 w-3/4"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-5/6"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explore More Button */}
       <div className="mt-7 py-3">
        <Link
          to={`/All-Movies`}
          className="badge bg-transparent border-double border-white text-white hover:transition-transform hover:scale-105 hover:bg-gradient-to-br hover:from-white/10 hover:via-white/20 hover:to-white/35 hover:bg-opacity-15 poppins-regular text-2xl py-5 px-7"
        >
          Explore More
        </Link>
      </div>
    </div>
  );
};

export default React.memo(RecentMovies);
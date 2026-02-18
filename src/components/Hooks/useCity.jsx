import { useState, useEffect, useCallback } from "react";
import useAxiosSecure from "./AxiosSecure";

const useCity = () => {
  const [city, setCity] = useState(null);
  const axiosSecure = useAxiosSecure();
  const username = localStorage.getItem("username");

  // Function to update location in Backend
  const updateBackendLocation = async (id, newCity) => {
    if (!id || !newCity) return;
    try {
      const response = await axiosSecure.put(`/user/update-location/${id}`, {
        currLocation: newCity,
      });
      if (response.status === 200) {
        console.log("Location synced with server successfully");
      }
    } catch (error) {
      console.error("Error syncing location:", error);
    }
  };

  const getLocation = useCallback((userId = null) => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Fetch city from OpenStreetMap
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const detectedCity = data?.address?.city || data?.address?.town || data?.address?.village;

          if (detectedCity) {
            setCity(detectedCity);
            // If we have a userId (meaning user is logged in but had no location), sync it now
            if (userId) {
              updateBackendLocation(userId, detectedCity);
            }
          }
        } catch (error) {
          console.error("Error fetching city name from coordinates:", error);
        }
      },
      (error) => console.error("Geolocation permission denied or error:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }, [axiosSecure]);

  useEffect(() => {
    const initCity = async () => {
      // 1. If no user is logged in, just get Geolocation
      if (!username) {
        getLocation();
        return;
      }

      // 2. If user is logged in, check Database first
      try {
        const res = await axiosSecure.get(`/user?username=${username}`);
        const userData = res.data;

        if (userData?.currLocation) {
          // Database has location, use it
          setCity(userData.currLocation);
        } else {
          // Database has NO location, get Geolocation and pass userId to update it
          getLocation(userData.id);
        }
      } catch (error) {
        console.error("Error fetching user profile for location:", error);
        // Fallback to geolocation if backend fails
        getLocation(); 
      }
    };

    initCity();
  }, [username, axiosSecure, getLocation]);

  return city;
};

export default useCity;
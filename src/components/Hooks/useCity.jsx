import { useState, useEffect, useCallback } from "react";
import useAxiosSecure from "./AxiosSecure";

const useCity = () => {
  const [city, setCity] = useState(null);
  const [userId, setUserId] = useState(null);
  const axiosSecure = useAxiosSecure();
  const username = localStorage.getItem("username");

  const getLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data?.address?.city) {
            setCity(data.address.city); // Set city from geolocation API
          }
        } catch (error) {
          console.error("Error fetching location data:", error);
        }
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  const updateLocation = async (userId, city) => {
    try {
      const response = await axiosSecure.put(`/user/update-location/${userId}`, {
        currLocation: city,
      });
      if (response.status === 200) {
        console.log("Location updated successfully");
        setCity(city); // Update state with new city location
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  useEffect(() => {
    const fetchCity = async () => {
      if (!username) {
        getLocation(); // If no username, get the geolocation
        return;
      }
      try {
        const res = await axiosSecure.get(`/user?username=${username}`);
        if (res.data?.currLocation) {
          setUserId(res.data.id);
          setCity(res.data.currLocation); // Set city from server if available
        } else {
          // If no currLocation set, update the location with geolocation data
          getLocation();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        getLocation(); // If an error occurs fetching user data, get geolocation
      }
    };

    fetchCity();

    return () => {
      // Add cancellation logic here if necessary
    };
  }, [username, axiosSecure, getLocation]);

  // If city is fetched through geolocation and currLocation is not set, update it
  useEffect(() => {
    if (city && userId) {
      // Check if currLocation is null and update if necessary
      axiosSecure
        .get(`/user/${userId}`)
        .then((res) => {
          if (!res.data.currLocation) {
            updateLocation(userId, city); // Update if currLocation is null
          }
        })
        .catch((error) => console.error("Error checking user location:", error));
    }
  }, [city, userId, axiosSecure]);

  return city;
};

export default useCity;

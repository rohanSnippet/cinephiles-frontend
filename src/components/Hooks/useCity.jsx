import { useState, useEffect, useCallback } from "react";
import useAxiosSecure from "./AxiosSecure";

const useCity = () => {
  const [city, setCity] = useState(localStorage.getItem("city") || null);
  const axiosSecure = useAxiosSecure();
  const username = localStorage.getItem("username");

 const normalizeLocation = (geoApiResponse) => {
   if (!geoApiResponse || !geoApiResponse.address) return "Unknown Location";

   const address = geoApiResponse.address;

   // 1. Get the base city name provided by the API
   let baseCity = address?.city || address?.town || address?.village || "";

   // 2. SMART HYPHEN MATCHER (Case-Insensitive)
   if (baseCity.includes("-")) {
     const cityParts = baseCity.split("-").map(part => part.trim());

     // Check against 'county'
     if (address.county) {
       const countyLower = address.county.toLowerCase();
       const matchedCity = cityParts.find(part =>
         countyLower.includes(part.toLowerCase())
       );
       // We return the original capitalized 'part' so your UI still looks nice
       if (matchedCity) return matchedCity;
     }

     // Check against 'borough'
     if (address.borough) {
       const boroughLower = address.borough.toLowerCase();
       const matchedCity = cityParts.find(part =>
         boroughLower.includes(part.toLowerCase())
       );
       if (matchedCity) return matchedCity;
     }
   }

   // 3. FALLBACK: Extract from Indian "Subdistrict" format
   if (address.county && address.county.toLowerCase().includes("subdistrict")) {
     // We use a case-insensitive regex replace here to be extra safe
     const extractedFromCounty = address.county.replace(/ subdistrict/i, "").trim();

     if (!baseCity || baseCity.includes("-")) {
       return extractedFromCounty;
     }
   }

   // 4. Return the cleaned base city
   return baseCity || "Unknown Location";
 };

  const updateBackendLocation = async (id, newCity) => {
    if (!id || !newCity) return;
    try {
      await axiosSecure.put(`/user/update-location/${id}`, { currLocation: newCity });
    } catch (error) {
      console.error("Error syncing location:", error);
    }
  };

  const getLocationAPI = useCallback((userId = null) => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          console.log(data)

          const detectedCity = normalizeLocation(data);

          console.log("Normalized City:", detectedCity);

         // const detectedCity = data?.address?.city || data?.address?.town || data?.address?.village;

          if (detectedCity) {
            setCity(detectedCity);
            localStorage.setItem("city", detectedCity);
            window.dispatchEvent(new Event("locationUpdated"));

            if (userId) updateBackendLocation(userId, detectedCity);
          }
        } catch (error) {
          console.error("Live API failed", error);
        }
      },
      (error) => console.error("Geolocation denied", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }, [axiosSecure]);

  useEffect(() => {
    const initCity = async () => {
      const localCity = localStorage.getItem("city");

      if (!username) {
        if (localCity) setCity(localCity);
        else getLocationAPI();
        return;
      }

      try {
        const res = await axiosSecure.get(`/user?username=${username}`);
        const userData = res.data;

        if (userData?.currLocation) {
          setCity(userData.currLocation);
          if (localCity !== userData.currLocation) {
            localStorage.setItem("city", userData.currLocation);
            window.dispatchEvent(new Event("locationUpdated"));
          }
        } else if (localCity) {
          setCity(localCity);
          updateBackendLocation(userData.id, localCity);
        } else {
          getLocationAPI(userData.id);
        }
      } catch (error) {
        console.error("Failed to fetch DB profile", error);
        if (localCity) setCity(localCity);
        else getLocationAPI();
      }
    };

    initCity();
  }, [username, axiosSecure, getLocationAPI]);

  return city;
};

export default useCity;
import delhi from "../../assets/Cities/Delhi.png";
import mumbai from "../../assets/Cities/Mumbai.png";
import bangalore from "../../assets/Cities/Bangalore.png";
import pune from "../../assets/Cities/Pune.png";
import hyderabad from "../../assets/Cities/Hyderabad.png";

export const locationHierarchy = [
  {
      region: "Mumbai",
      state: "Maharashtra",
      image: mumbai || "https://cdn-icons-png.flaticon.com/128/510/510020.png",
      cities: [
        // Main Hubs
        "Mumbai", "Navi Mumbai", "Thane",

        // Individual Suburbs/Towns
        "Kalyan", "Dombivli", "Dombivali", "Badlapur", "Ambernath", "Ulhasnagar",
        "Vasai", "Virar", "Nalasopara", "Palghar", "Boisar",
        "Mira Road", "Bhayandar", "Bhiwandi",
        "Panvel", "Kharghar", "Vashi", "Belapur",

        // Combined Municipal Corporation Names (Returned by Live API)
        "Kalyan-Dombivli", "Kalyan-Dombivali",
        "Vasai-Virar",
        "Mira-Bhayandar",
        "Bhiwandi-Nizampur"
      ]
    },
  {
    region: "Delhi NCR",
    state: "Delhi NCR",
    image: delhi || "https://cdn-icons-png.flaticon.com/128/3174/3174792.png",
    cities: ["New Delhi", "Gurugram", "Noida", "Faridabad", "Ghaziabad"]
  },
  {
    region: "Pune",
    state: "Maharashtra",
    image: pune || "https://images.unsplash.com/photo-1598444983050-705626af0e39?q=80&w=400&auto=format&fit=crop",
    cities: ["Pune", "Pimpri-Chinchwad", "Lonavala", "Baramati"]
  },
  {
    region: "Bangalore",
    state: "Karnataka",
    image: bangalore || "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=400&auto=format&fit=crop",
    cities: ["Bengaluru", "Bangalore", "Whitefield", "Electronic City"]
  },
  {
    region: "Hyderabad",
    state: "Telangana",
    image: hyderabad || "https://images.unsplash.com/photo-1601058269707-1647ceb44040?q=80&w=400&auto=format&fit=crop",
    cities: ["Hyderabad", "Secunderabad", "Cyberabad"]
  }
];

/**
 * Returns an array of cities to send to your Spring Boot Backend.
 * If user selects "Mumbai Region", it returns ["Mumbai", "Thane", "Kalyan"...]
 * If user selects "Kalyan", it just returns ["Kalyan"]
 */
export const getApiCities = (selectedName) => {
  if (!selectedName) return [];
  const regionMatch = locationHierarchy.find(loc => loc.region === selectedName);
  if (regionMatch) return regionMatch.cities;
  return [selectedName];
};

/**
 * Finds the Mega-Region/State to fetch the correct Featured/Hero Movies.
 * If user is in "Kalyan", it returns "Maharashtra"
 */
export const getStateForHero = (selectedName) => {
  if (!selectedName) return "GLOBAL";
  const match = locationHierarchy.find(loc =>
    loc.region === selectedName || loc.cities.includes(selectedName)
  );
  return match ? match.state : "GLOBAL";
};
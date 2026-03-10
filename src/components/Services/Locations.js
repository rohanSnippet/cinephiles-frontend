export const locationHierarchy = [
  {
    region: "Mumbai",
    state: "Maharashtra",
    image: "https://images.unsplash.com/photo-1522256662024-e168853b006c?q=80&w=400&auto=format&fit=crop",
    cities: ["Mumbai", "Navi Mumbai", "Thane", "Kalyan", "Dombivli", "Badlapur", "Vasai", "Virar"]
  },
  {
    region: "Delhi NCR",
    state: "Delhi NCR",
    image: "https://images.unsplash.com/photo-1587474260580-58955f9a65bd?q=80&w=400&auto=format&fit=crop",
    cities: ["New Delhi", "Gurugram", "Noida", "Faridabad", "Ghaziabad"]
  },
  {
    region: "Pune",
    state: "Maharashtra",
    image: "https://images.unsplash.com/photo-1598444983050-705626af0e39?q=80&w=400&auto=format&fit=crop",
    cities: ["Pune", "Pimpri-Chinchwad", "Lonavala", "Baramati"]
  },
  {
    region: "Bengaluru",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=400&auto=format&fit=crop",
    cities: ["Bengaluru", "Whitefield", "Electronic City"]
  },
  {
    region: "Hyderabad",
    state: "Telangana",
    image: "https://images.unsplash.com/photo-1601058269707-1647ceb44040?q=80&w=400&auto=format&fit=crop",
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
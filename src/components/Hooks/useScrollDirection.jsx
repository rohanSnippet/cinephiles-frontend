// src/Hooks/useScrollDirection.js
import { useState, useEffect } from "react";

const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;

      // Only update direction if scroll has moved a significant amount
      // This prevents flickering on very small scrolls
      if (Math.abs(scrollY - lastScrollY) < 10) { // Adjust this threshold as needed
        return;
      }

      const direction = scrollY > lastScrollY ? "down" : "up";
      if (direction !== scrollDirection) {
        setScrollDirection(direction);
      }
      setLastScrollY(scrollY > 0 ? scrollY : 0); // Handle reaching the very top
    };

    window.addEventListener("scroll", updateScrollDirection); // Add event listener
    return () => {
      window.removeEventListener("scroll", updateScrollDirection); // Clean up
    };
  }, [scrollDirection, lastScrollY]); // Re-run effect if these states change

  return scrollDirection;
}

export default useScrollDirection;
import { useState, useEffect } from 'react';

const useSessionStorage = (key, initialValue) => {
  // Initialize state with stored value or default
  const [value, setValue] = useState(() => {
    try {
      const storedValue = sessionStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error("Error reading sessionStorage", error);
      return initialValue;
    }
  });

  // Update sessionStorage whenever the value changes
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error setting sessionStorage", error);
    }
  }, [key, value]);

  return [value, setValue];
}

export default useSessionStorage;
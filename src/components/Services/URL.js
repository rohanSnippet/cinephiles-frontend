import axios from "axios";

export const baseURL = import.meta.env.VITE_APP_BASE_URL || "https://cinephiles-backend.onrender.com"; // Ensure correct API base URL
export const frontURL = import.meta.env.VITE_APP_FRONTEND_URL; // Ensure correct API base URL


// User login
export const userLogin = async (username, password) => {
  try {
    const response = await axios.post(`${baseURL}/auth/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// User signup in URL.js
export const SignUpUser = async (firstName, lastName, username, password) => {
  try {
    const response = await axios.post(`${baseURL}/auth/signup`, {
      firstName,
      lastName,
      username,
      password,
    });
    // console.log(response);
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

// Save theater
export const saveTheater = async (theater) => {
  try {
    const response = await axios.post(`${baseURL}/theater`, theater);
    return response;
  } catch (error) {
    console.error("Error saving theater:", error);
    throw error;
  }
};

// Get theater
export const getTheater = async () => {
  try {
    const response = await axios.get(`${baseURL}/theater`);
    return response;
  } catch (error) {
    console.error("Error fetching theater:", error);
    throw error;
  }
};

// Save screen
export const saveScreen = async (theatreId, screen) => {
  try {
    const response = await axios.post(
      `${baseURL}/screens/${theatreId}`,
      screen
    ); // Adjusted endpoint
    return response;
  } catch (error) {
    console.error("Error saving screen:", error);
    throw error;
  }
};

// Get all screens
export const getAllScreens = async () => {
  try {
    const response = await axios.get(`${baseURL}/screens`); // Adjusted endpoint
    return response;
  } catch (error) {
    console.error("Error fetching screens:", error);
    throw error;
  }
};

// Get all movies
export const getAllMovies = async () => {
  try {
    const response = await axios.get(`${baseURL}/movies`);
    return response;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

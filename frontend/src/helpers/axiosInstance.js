import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "https://vid-streamer.onrender.com",
  baseURL: "http://localhost:3000",
});

// Set JWT token in headers
const token = localStorage.getItem("token");
axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

export default axiosInstance;

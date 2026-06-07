import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 80000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        console.error("API ERROR STATUS:", error.response.status);
        console.error("API ERROR DATA:", error.response.data);
      } else if (error.code === "ECONNABORTED") {
        console.error("Request timeout. Please try again.");
      } else {
        console.error("Network/CORS error:", error.message);
      }
  
      return Promise.reject(error);
    }
  );

export default axiosInstance;
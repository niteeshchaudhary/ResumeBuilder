import axios from "axios";
const host = import.meta.env.VITE_HOST;
const apiUrl = `${host}/reserish`;
// const instance = axios.create({
//   baseURL: '${host}/api', // Assuming your API is hosted at this URL
// });
const instance = axios.create({
  baseURL: apiUrl + "/api", // Assuming your API is hosted at this URL
});
// Add a request interceptor to attach the token
instance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export const axios2 = axios.create({
  baseURL: apiUrl + "/api", 
});
export default instance;

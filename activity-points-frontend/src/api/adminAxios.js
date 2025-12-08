// // src/api/adminAxios.js
// import axios from 'axios';

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// const adminAxios = axios.create({
//   baseURL: API_BASE,
// });

// adminAxios.interceptors.request.use((config) => {
//   const token = localStorage.getItem("adminToken") || localStorage.getItem("tutorToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default adminAxios;

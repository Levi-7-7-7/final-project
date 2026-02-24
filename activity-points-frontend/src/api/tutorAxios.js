// src/api/tutorAxios.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const tutorAxios = axios.create({
  baseURL: BASE_URL,
});

tutorAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('tutorToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;

});

export default tutorAxios;

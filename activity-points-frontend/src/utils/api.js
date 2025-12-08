import axios from 'axios';
import { BASE_URL } from '../utils/constants';

export const getBatches = async () => {
  return axios.get(`${BASE_URL}/api/meta/batches`);
};

export const getBranches = async () => {
  return axios.get(`${BASE_URL}/api/meta/branches`);
};

export const getStudents = async (token) => {
  return axios.get(`${BASE_URL}/api/tutors/students`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

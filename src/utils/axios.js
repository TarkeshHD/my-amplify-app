import axios from 'axios';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({ message: 'Please check your internet connection!' } || error);
    }
    return Promise.reject((error.response && error.response.data) || 'Something went wrong');
  },
);

export default axiosInstance;

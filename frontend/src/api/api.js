import axios from 'axios';
import { refreshToken } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('auth');
  if (authData) {
    const { access } = JSON.parse(authData);
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newTokens = await refreshToken();
        localStorage.setItem('auth', JSON.stringify({
          ...JSON.parse(localStorage.getItem('auth')),
          access: newTokens.access
        }));
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('auth');
        // УБРАЛ window.location.href = '/login' во избежание перезагрузки
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// // import axios from 'axios';
// import api from './api';

// const API_URL = 'http://localhost:8000/api/auth/'; // Путь к API

// // Функция для сохранения токенов в localStorage
// const saveTokens = (accessToken, refreshToken) => {
//   localStorage.setItem('auth', JSON.stringify({ access: accessToken, refresh: refreshToken }));
// };

// // Функция для получения токенов из localStorage
// const getTokens = () => {
//   const tokens = localStorage.getItem('auth');
//   return tokens ? JSON.parse(tokens) : null;
// };

// // Функция для удаления токенов из localStorage
// const removeTokens = () => {
//   localStorage.removeItem('auth');
// };

// // Функция для логина пользователя
// export const login = async (username, password) => {
//   try {
//     const response = await api.post(`${API_URL}login/`, { username, password });
//     const { access, refresh } = response.data;

//     // Сохраняем токены в localStorage
//     saveTokens(access, refresh);

//     // Возвращаем данные пользователя или токены
//     return response.data;
//   } catch (error) {
//     console.error('Login failed', error);
//     throw error;
//   }
// };


// export const getCurrentUser = () => {
//   const authData = localStorage.getItem('auth');
//   return authData ? JSON.parse(authData).user : null;
// };


// // Функция для обновления access-токена с использованием refresh-токена
// export const refreshToken = async () => {
//   try {
//     const tokens = getTokens();
//     if (!tokens || !tokens.refresh) {
//       throw new Error('No refresh token available');
//     }

//     const response = await api.post(`${API_URL}refresh/`, { refresh: tokens.refresh });
//     const { access } = response.data;

//     // Сохраняем новый access-токен
//     saveTokens(access, tokens.refresh);

//     return access;
//   } catch (error) {
//     console.error('Failed to refresh access token', error);
//     throw error;
//   }
// };

// // Функция для выхода из системы (удаление токенов)
// export const logout = () => {
//   removeTokens();
//   window.location.reload(); // Перезагружаем страницу после выхода
// };

// // Устанавливаем интерцептор для axios для автоматической отправки токена
// axios.interceptors.request.use(
//   (config) => {
//     const tokens = getTokens();
//     if (tokens && tokens.access) {
//       config.headers['Authorization'] = `Bearer ${tokens.access}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Обрабатываем ошибки и обновляем токен при истечении access-токена
// api.interceptors.response.use(
//   response => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Если ошибка 401 (неавторизован), пробуем обновить токен
//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const newAccessToken = await refreshAccessToken();
//         originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
//         return axios(originalRequest); // Повторно отправляем запрос с новым токеном
//       } catch (refreshError) {
//         // Если обновление токена не удалось, выводим пользователя из системы
//         logout();
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

import api from './api';

const API_URL = 'http://localhost:8000/api/auth';

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register/`, userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data);
    throw error;
  }
};


export const login = async (credentials) => {
  try {
    const response = await api.post(`${API_URL}/token/`, credentials);
    console.log('Response from /auth/token/:', response.data);
    // const response = await api.post('/auth/token/', credentials);

    if (!response.data?.access) {
      throw new Error('Не удалось получить токен');
    }

    const authData = response.data;
    localStorage.setItem('auth', JSON.stringify(authData));
    return authData;

  } catch (err) {
    console.error('Login error:', err);
    throw new Error(err.response?.data?.detail || 'Ошибка авторизации');
  }
};


export const logout = () => {
  localStorage.removeItem('auth');
};

export const getCurrentUser = () => {
  const authData = localStorage.getItem('auth');
  return authData ? JSON.parse(authData).user : null;
};

export const authHeader = () => {
  const authData = localStorage.getItem('auth');
  if (authData) {
    const { access } = JSON.parse(authData);
    return { Authorization: `Bearer ${access}` };
  }
  return {};
};

export const refreshToken = async () => {
  const authData = localStorage.getItem('auth');
  if (!authData) throw new Error('Нет refresh токена');

  const { refresh } = JSON.parse(authData);
  const response = await api.post('/auth/token/refresh/', { refresh });
  return response.data;
};

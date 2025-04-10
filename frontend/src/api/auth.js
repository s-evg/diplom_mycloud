import api from './api';

const API_URL = 'http://localhost:8000/api/auth';

export const register = async (userData) => {
  try {
    const response = await api.post(`${API_URL}/register/`, userData);
    return response.data;
  } catch (error) {
    console.error('Ошибка регистрации:', error.response?.data);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post(`${API_URL}/token/`, credentials);
    const { access, refresh } = response.data;

    if (!access || !refresh) {
      throw new Error('Не удалось получить токены');
    }

    localStorage.setItem('auth', JSON.stringify({ access, refresh }));
    return { access, refresh };
  } catch (err) {
    console.error('Ошибка входа:', err);
    throw new Error(err.response?.data?.detail || 'Ошибка авторизации');
  }
};

export const logout = () => {
  localStorage.removeItem('auth');
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/user/');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения текущего пользователя:', error);
    throw error;
  }
};

export const refreshToken = async () => {
  const authData = localStorage.getItem('auth');
  if (!authData) throw new Error('Нет refresh токена');

  const { refresh } = JSON.parse(authData);
  const response = await api.post('/auth/token/refresh/', { refresh });
  return response.data;
};

export const authHeader = () => {
  const authData = localStorage.getItem('auth');
  if (authData) {
    const { access } = JSON.parse(authData);
    return { Authorization: `Bearer ${access}` };
  }
  return {};
};

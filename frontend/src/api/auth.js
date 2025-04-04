import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

// Все ваши старые экспорты остаются как были
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
    const response = await axios.post(`${API_URL}/token/`, credentials);
    
    if (!response.data?.access) {
      throw new Error('Не удалось получить токен');
    }

    // Добавляем получение данных пользователя
    const userResponse = await axios.get(`${API_URL}/user/`, {
      headers: { Authorization: `Bearer ${response.data.access}` }
    });

    // Сохраняем ВСЕ данные вместе
    const authData = {
      ...response.data,
      user: userResponse.data
    };
    
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
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register/`, userData);
    return response.data;
  } catch (err) {
    if (err.response?.data?.error) {
      // Используем сообщение об ошибке с сервера
      throw new Error(err.response.data.error);
    }
    throw new Error('Ошибка соединения с сервером');
  }
};


// export const login = async (credentials) => {
//   const response = await axios.post(`${API_URL}/token/`, credentials);
//   if (response.data.access) {
//     localStorage.setItem('user', JSON.stringify(response.data));
//   }
//   return response.data;
// };

export const login = async (credentials) => {
  try {
    // 1. Получаем токен
    const tokenResponse = await axios.post(`${API_URL}/token/`, credentials);
    
    if (!tokenResponse.data?.access) {
      throw new Error('Сервер не вернул токен');
    }

    // 2. Получаем данные пользователя через отдельный endpoint
    const userResponse = await axios.get(`${API_URL}/user/`, {
      headers: {
        'Authorization': `Bearer ${tokenResponse.data.access}`
      }
    });

    const authData = {
      token: tokenResponse.data.access,
      user: userResponse.data
    };
    
    localStorage.setItem('auth', JSON.stringify(authData));
    return authData;

  } catch (err) {
    console.error('Full auth error:', err);
    throw new Error(
      err.response?.status === 401 
        ? 'Неверный логин или пароль' 
        : 'Ошибка сервера'
    );
  }
};







export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const authHeader = () => {
  const user = getCurrentUser();
  if (user && user.access) {
    return { Authorization: `Bearer ${user.access}` };
  }
  return {};
};
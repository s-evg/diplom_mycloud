import axios from 'axios';
import { authHeader } from './auth';

const API_URL = 'http://localhost:8000/api/admin';

// Функция для получения списка всех пользователей
export const getUsers = async () => {
  try {
    // Отправляем GET-запрос к API с авторизационными заголовками
    const response = await axios.get(`${API_URL}/users/`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    throw error;
  }
};

// Функция для обновления данных пользователя
export const updateUser = async (userId, userData) => {
  try {
    // Отправляем PATCH-запрос для обновления пользователя
    const response = await axios.patch(
      `${API_URL}/users/${userId}/`,
      userData,
      {
        headers: authHeader()
      }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    throw error;
  }
};

// Функция для удаления пользователя
export const deleteUser = async (userId) => {
  try {
    // Отправляем DELETE-запрос для удаления пользователя
    await axios.delete(`${API_URL}/users/${userId}/`, {
      headers: authHeader()
    });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    throw error;
  }
};
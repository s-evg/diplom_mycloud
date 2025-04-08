import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

// Создаем контекст для аутентификации
const AuthContext = createContext();

// Хук для получения доступа к состоянию аутентификации в других компонентах
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  // Инициализируем состояния
  const [accessToken, setAccessToken] = useState(localStorage.getItem("auth"));
  const [user, setUser] = useState(null);  // Состояние для хранения данных пользователя
  const [isInitialized, setIsInitialized] = useState(false);  // Состояние для отслеживания инициализации

  // Проверяем токен и пытаемся получить данные пользователя
  useEffect(() => {
    if (accessToken) {
      api
        .get("/auth/user", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((response) => {
          setUser(response.data);  // Если токен валидный, устанавливаем данные пользователя
        })
        .catch(() => {
          setUser(null);  // Если ошибка, сбрасываем данные пользователя
        })
        .finally(() => {
          setIsInitialized(true);  // Завершаем процесс инициализации, даже если произошла ошибка
        });
    } else {
      setIsInitialized(true);  // Если токена нет, сразу завершаем инициализацию
    }
  }, [accessToken]);  // Эффект будет срабатывать при изменении токена

  // Функция для обновления токена
  const updateToken = (newToken) => {
    localStorage.setItem("auth", newToken);  // Сохраняем новый токен в localStorage
    setAccessToken(newToken);  // Обновляем состояние токена
  };

  // Функция для выхода пользователя
  const logout = () => {
    localStorage.removeItem("auth");  // Удаляем токен из localStorage
    setAccessToken(null);  // Обновляем состояние токена
    setUser(null);  // Обновляем состояние пользователя
  };

  // Возвращаем контекст с состоянием и функциями
  return (
    <AuthContext.Provider value={{ accessToken, user, isInitialized, setUser, updateToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

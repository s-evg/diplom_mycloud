import { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, getCurrentUser } from '../api/auth';

const AuthContext = createContext();

// Кастомный хук для использования контекста
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация при загрузке
  useEffect(() => {
    try {
      const userData = getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const data = await apiLogin(credentials);  // Запрос на логин
      setUser(data.user);  // Сохраняем данные пользователя
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;  // Бросаем ошибку для обработки в компоненте
    }
  };

  const logout = () => {
    localStorage.removeItem('auth');  // Удаляем токены из localStorage
    setUser(null);  // Сбрасываем состояние пользователя
  };

  // Если данные еще не загружены, показываем индикатор загрузки
  if (!isInitialized) {
    return <div>Загрузка...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

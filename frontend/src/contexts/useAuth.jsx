import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

import { authenticated_user, login, logout, register } from '../endpoints/api.js';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const nav = useNavigate();
    // Проверяем прошел ли пользователь аутентификацию
    const get_authenticated_user = async () => {
        try {
          const user = await authenticated_user();
          setUser(user);
        } catch (error) {
          setUser(null); // Если запрос неудачен пользователя нет
        } finally {
          setLoading(false); // Устанавливаем флаг в false после запроса
        }
    };

    const loginUser = async (username, password) => {
        const user = await login(username, password)
        if (user) {
          setUser(user)
          nav('/')
        } else {
          alert('Неправильное имя пользователя или пароль')
        }
    }

    const logoutUser = async () => {
      await logout();
      nav('/login')
    }

    const registerUser = async (username, email, password, confirm_password) => {
        if (password === confirm_password) {
          try {
            await register(username, email, password)
            alert('Пользователь успешно зарегистрирован')
            nav('/')
          } catch {
              alert('Ошибка регистрации пользователя')
          }  
        } else {
          alert('Пароли не совпдают')
        }
    }

    useEffect(() => {
        get_authenticated_user();
    }, [window.location.pathname])

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, registerUser }}>
          {children}
        </AuthContext.Provider>
      );
}

export const useAuth = () => useContext(AuthContext);
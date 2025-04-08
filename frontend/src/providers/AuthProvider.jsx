import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as doLogout } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        setIsInitialized(true);
        return;
      }
  
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Ошибка инициализации пользователя:', error);
        doLogout();
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };
  
    initializeUser();
  }, []); // Только при монтировании
  

  const logout = () => {
    doLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isInitialized, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

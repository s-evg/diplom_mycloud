import { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, getCurrentUser } from '../api/auth';

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация при загрузке
  useEffect(() => {
    const userData = getCurrentUser();
    if (userData) {
      setUser(userData);
    }
    setIsInitialized(true);
  }, []);

  const login = async (credentials) => {
    const data = await apiLogin(credentials);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setUser(null);
  };

  if (!isInitialized) {
    return <div>Загрузка...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
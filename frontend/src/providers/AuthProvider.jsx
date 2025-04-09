import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("auth");
    if (storedAuth) {
      const { access, refresh } = JSON.parse(storedAuth);
      setAccessToken(access);
      getCurrentUser()
        .then(setUser)
        .catch(() => {
          setUser(null);
          sessionStorage.removeItem("auth");
        })
        .finally(() => setIsInitialized(true));
    } else {
      setIsInitialized(true);
    }
  }, []);

  const login = ({ access, refresh }, userData) => {
    sessionStorage.setItem("auth", JSON.stringify({ access, refresh }));
    setAccessToken(access);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem("auth");
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isInitialized, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

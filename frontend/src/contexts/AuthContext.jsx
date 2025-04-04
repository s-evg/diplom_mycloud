import { createContext, useState, useEffect, useContext } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);

  useEffect(() => {
    if (cookies.token) {
      axios
        .get("/api/auth/user/", {
          headers: { Authorization: `Bearer ${cookies.token}` },
        })
        .then((response) => setUser(response.data))
        .catch(() => logout());
    }
  }, [cookies.token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post("/api/auth/login/", {
        username,
        password,
      });
      setCookie("token", response.data.access, { path: "/" });
      setUser(response.data.user);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    removeCookie("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Кастомный хук для удобного использования контекста
export const useAuth = () => {
  return useContext(AuthContext);
};

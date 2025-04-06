import { createContext, useState, useEffect, useContext } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(["access", "refresh"]);

  useEffect(() => {
    if (cookies.access) {
      axios
        .get("/api/auth/user/", {
          headers: { Authorization: `Bearer ${cookies.access}` },
        })
        .then((response) => setUser(response.data))
        .catch(() => logout());
    }
  }, [cookies.access]);

  const login = async (username, password) => {
    try {
      const response = await axios.post("/api/auth/token/", {
        username,
        password,
      });

      setCookie("access", response.data.access, { path: "/" });
      setCookie("refresh", response.data.refresh, { path: "/" });
      setUser(response.data.user);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    removeCookie("access", { path: "/" });
    removeCookie("refresh", { path: "/" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

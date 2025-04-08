import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import StoragePage from "../pages/StoragePage";
import ProfilePage from "../pages/ProfilePage";
import NotFoundPage from "../pages/NotFoundPage";

// Защищённый маршрут: показывает children только если пользователь есть и авторизация завершена
// const PrivateRoute = ({ children }) => {
//   const { accessToken, isInitialized } = useAuth(); // Проверка токена вместо user
//   if (!isInitialized) return <Spinner />; // Можно показать индикатор загрузки, пока токен не получен
//   console.log("Access Token:", accessToken);
//   console.log("User:", user);
//   return accessToken ? children : <Navigate to="/login" replace />;
// };

// Открытый маршрут: если авторизован — редирект, если нет — показывает children
const PublicRoute = ({ children }) => {
  const { user, isInitialized } = useAuth();
  if (!isInitialized) return null;
  return user ? <Navigate to="/storage" replace /> : children;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/storage" element={<PrivateRoute><StoragePage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/storage" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;

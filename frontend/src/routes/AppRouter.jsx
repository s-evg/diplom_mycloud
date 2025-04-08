import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import StoragePage from "../pages/StoragePage";
import ProfilePage from "../pages/ProfilePage";
import NotFoundPage from "../pages/NotFoundPage";

// Защищённый маршрут (PrivateRoute): доступ только для авторизованных пользователей
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Открытый маршрут (PublicRoute): доступ только для неавторизованных пользователей
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/storage" replace /> : children;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Открытые маршруты */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Закрытые маршруты */}
        <Route path="/storage" element={<PrivateRoute><StoragePage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* Главная страница, которая редиректит на /storage */}
        <Route path="/" element={<Navigate to="/storage" />} />

        {/* Страница 404, если маршрут не найден */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;

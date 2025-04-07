import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
import { useAuth } from "../providers/AuthProvider";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import StoragePage from "../pages/StoragePage";
import ProfilePage from "../pages/ProfilePage";
import NotFoundPage from "../pages/NotFoundPage";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/storage" /> : children;
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

        {/* Главная страница редиректит на storage */}
        <Route path="/" element={<Navigate to="/storage" />} />

        {/* Страница 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;

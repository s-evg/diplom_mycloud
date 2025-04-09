import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import StoragePage from "../pages/StoragePage";
import NotFoundPage from "../pages/NotFoundPage";
import Admin from "../pages/Admin";
import Navbar from "../components/Navbar";
import { Spinner } from "@chakra-ui/react";

const PrivateRoute = ({ children }) => {
  const { accessToken, isInitialized } = useAuth();

  if (!isInitialized) return <Spinner />;
  return accessToken ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { accessToken, isInitialized } = useAuth();

  if (!isInitialized) return <Spinner />;
  return accessToken ? <Navigate to="/storage" replace /> : children;
};

const AppRouter = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/storage" element={<PrivateRoute><StoragePage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/storage" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Router>
);

export default AppRouter;

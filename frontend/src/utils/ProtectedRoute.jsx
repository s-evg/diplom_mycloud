import React from "react";
import { Navigate } from "react-router-dom";
import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from "@chakra-ui/react";
import authService from "../services/authService";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    // Проверяем авторизацию
    const isAuthenticated = authService.isAuthenticated();
    const isAdmin = authService.isAdmin();
    const currentUser = authService.getCurrentUser();

    // Если пользователь не авторизован - редирект на логин
    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    // Если требуются админские права, но пользователь не админ
    if (requireAdmin && !isAdmin) {
        return (
            <Alert status='error' borderRadius='md'>
                <AlertIcon />
                <div>
                    <AlertTitle>Доступ запрещен!</AlertTitle>
                    <AlertDescription>
                        У вас нет прав администратора для просмотра этой
                        страницы.
                        {currentUser && (
                            <div>
                                Текущий пользователь:{" "}
                                <strong>{currentUser.username}</strong>
                            </div>
                        )}
                    </AlertDescription>
                </div>
            </Alert>
        );
    }

    // Если все проверки прошли - отображаем дочерние компоненты
    return children;
};

export default ProtectedRoute;

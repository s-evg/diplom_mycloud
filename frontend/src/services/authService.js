import API_BASE_URL from "./path";

class AuthService {
    // Получение access токена из localStorage
    getToken() {
        return localStorage.getItem("access_token");
    }

    // Получение refresh токена
    getRefreshToken() {
        return localStorage.getItem("refresh_token");
    }

    // Сохранение токенов после логина/регистрации
    saveTokens(accessToken, refreshToken, userData = null) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        if (userData) {
            localStorage.setItem("user_data", JSON.stringify(userData));
        }
    }

    // Очистка всех данных пользователя
    clearTokens() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_data");
    }

    // Проверка авторизации
    isAuthenticated() {
        return !!this.getToken();
    }

    // Получение данных текущего пользователя
    getCurrentUser() {
        const userData = localStorage.getItem("user_data");
        return userData ? JSON.parse(userData) : null;
    }

    // Проверка админских прав
    isAdmin() {
        const user = this.getCurrentUser();
        return user ? user.is_admin : false;
    }

    // Регистрация пользователя
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                // Сохраняем токены после успешной регистрации
                this.saveTokens(data.access, data.refresh, data.user);
                return { success: true, user: data.user };
            } else {
                return {
                    success: false,
                    error: data.error || "Ошибка регистрации",
                };
            }
        } catch (error) {
            return { success: false, error: "Ошибка соединения с сервером" };
        }
    }

    // Авторизация пользователя
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/token/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                this.saveTokens(data.access, data.refresh, data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, error: "Неверный логин или пароль" };
            }
        } catch (error) {
            return { success: false, error: "Ошибка соединения с сервером" };
        }
    }

    // Обновление access токена
    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                return false;
            }

            const response = await fetch(
                `${API_BASE_URL}/auth/token/refresh/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refresh: refreshToken }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("access_token", data.access);
                return true;
            } else {
                // Refresh токен недействителен - очищаем данные
                this.clearTokens();
                return false;
            }
        } catch (error) {
            this.clearTokens();
            return false;
        }
    }

    // Выход из системы
    logout() {
        this.clearTokens();
        // Можно добавить редирект на главную страницу
        window.location.href = "/";
    }
}

export default new AuthService();

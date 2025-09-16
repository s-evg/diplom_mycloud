import authService from "./authService";
import API_BASE_URL from "./path";

// const API_BASE_URL = "http://localhost:8000/api";

class ApiService {
    // Получение заголовков с авторизацией
    getAuthHeaders() {
        const token = authService.getToken();
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    // Обработка ответов API с автоматическим обновлением токена
    async handleResponse(response) {
        if (response.status === 401) {
            // Попытка обновить токен
            const refreshed = await authService.refreshToken();
            if (!refreshed) {
                // Токен не удалось обновить - разлогиниваем
                authService.logout();
                return { success: false, error: "Сессия истекла" };
            }
            // Если токен обновлен, можно повторить запрос (но для простоты возвращаем ошибку)
            return { success: false, error: "Необходимо повторить запрос" };
        }

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
            return {
                success: false,
                error: data.detail || data.error || "Ошибка API",
            };
        }
    }

    // === РАБОТА С ФАЙЛАМИ ===

    // Получение списка файлов пользователя
    async getFiles(userId = null) {
        try {
            let url = `${API_BASE_URL}/storage/files/`;
            if (userId && authService.isAdmin()) {
                url += `?user_id=${userId}`;
            }

            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
            });

            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, error: "Ошибка соединения" };
        }
    }

    // Загрузка нового файла
    async uploadFile(file, comment = "", isPublic = false) {
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("name", file.name);
            formData.append("comment", comment);
            formData.append("is_public", isPublic);

            const response = await fetch(`${API_BASE_URL}/storage/files/`, {
                method: "POST",
                headers: this.getAuthHeaders(),
                body: formData,
            });
            const data = await response.json();

            if (response.ok) {
                return { success: true, data };
            } else {
                // Более детальная обработка ошибок
                if (data.name && data.name[0].includes("существует")) {
                    return {
                        success: false,
                        error: "Файл с таким именем уже существует в хранилище",
                    };
                } else if (data.file && data.file[0].includes("существует")) {
                    return {
                        success: false,
                        error: "Файл с таким именем уже существует в хранилище",
                    };
                }
                return {
                    success: false,
                    error: data.detail || data.error || "Ошибка загрузки файла",
                };
            }
        } catch (error) {
            return { success: false, error: "Ошибка соединения с сервером" };
        }
    }

    // Удаление файла
    async deleteFile(fileId) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/storage/files/${fileId}/`,
                {
                    method: "DELETE",
                    headers: this.getAuthHeaders(),
                }
            );

            if (response.status === 204) {
                return { success: true };
            } else {
                const data = await response.json();
                return {
                    success: false,
                    error: data.detail || "Ошибка удаления файла",
                };
            }
        } catch (error) {
            return { success: false, error: "Ошибка соединения" };
        }
    }

    // Переименование файла
    async renameFile(fileId, newName) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/storage/files/${fileId}/`,
                {
                    method: "PATCH",
                    headers: {
                        ...this.getAuthHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: newName }),
                }
            );

            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, error: "Ошибка переименования файла" };
        }
    }

    // Изменение комментария файла
    async updateFileComment(fileId, comment) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/storage/files/${fileId}/`,
                {
                    method: "PATCH",
                    headers: {
                        ...this.getAuthHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ comment }),
                }
            );

            return await this.handleResponse(response);
        } catch (error) {
            return { success: false, error: "Ошибка обновления комментария" };
        }
    }

    // Изменение публичности файла
    async toggleFilePublic(fileId, isPublic) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/storage/files/${fileId}/`,
                {
                    method: "PATCH",
                    headers: {
                        ...this.getAuthHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ is_public: isPublic }),
                }
            );

            return await this.handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: "Ошибка изменения настроек доступа",
            };
        }
    }

    // === АДМИНСКИЕ ФУНКЦИИ ===

    // Получение списка всех пользователей (только для админов)
    async getUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/admin/users/`, {
                headers: this.getAuthHeaders(),
            });

            return await this.handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: "Ошибка получения списка пользователей",
            };
        }
    }

    // Удаление пользователя (только для админов)
    async deleteUser(userId) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/auth/admin/users/${userId}/`,
                {
                    method: "DELETE",
                    headers: this.getAuthHeaders(),
                }
            );

            if (response.status === 200 || response.status === 204) {
                return { success: true };
            } else {
                const data = await response.json();
                return {
                    success: false,
                    error: data.detail || "Ошибка удаления пользователя",
                };
            }
        } catch (error) {
            return { success: false, error: "Ошибка соединения" };
        }
    }

    // Изменение прав пользователя (только для админов)
    async updateUserRights(userId, isAdmin) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/auth/admin/users/${userId}/`,
                {
                    method: "PATCH",
                    headers: {
                        ...this.getAuthHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ is_admin: isAdmin }),
                }
            );

            return await this.handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: "Ошибка изменения прав пользователя",
            };
        }
    }

    // === ПОЛУЧЕНИЕ ДАННЫХ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ ===

    async getCurrentUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/user/`, {
                headers: this.getAuthHeaders(),
            });

            return await this.handleResponse(response);
        } catch (error) {
            return {
                success: false,
                error: "Ошибка получения данных пользователя",
            };
        }
    }
}

export default new ApiService();

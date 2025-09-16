

## **Часть 1: Подготовка подробного мануала по разворачиванию проекта в Docker**

### **1.1. Структура проекта**

```
diplom_mycloud/
├── mycloud/                  # Django backend
│   ├── manage.py
│   ├── mycloud/
│   │   └── settings.py
│   ├── users/
│   ├── storage/
│   └── requirements.txt
├── frontend/                 # React frontend
│   ├── package.json
│   ├── src/
│   └── ...
├── docker-compose.yml        # Основной файл оркестрации
├── .env.example              # Пример файла переменных окружения
├── Dockerfile.backend        # Dockerfile для Django
├── Dockerfile.frontend       # Dockerfile для React + Nginx
└── README.md                 # Краткое описание проекта
```

---

### **1.2. Необходимые файлы**

#### **1. `Dockerfile.backend`**

```dockerfile
# Используем официальный образ Python
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем requirements.txt и устанавливаем зависимости
COPY ./mycloud/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код проекта
COPY ./mycloud /app

# Создаем директорию для static файлов (на случай collectstatic в будущем)
RUN mkdir -p /app/staticfiles

# Создаем директорию для media файлов (она будет примонтирована как volume)
RUN mkdir -p /app/media

# Открываем порт, который будет использоваться Django-сервером
EXPOSE 8000

# Команда по умолчанию (в docker-compose.yml мы переопределим её для миграций и создания админа)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

---

#### **2. `Dockerfile.frontend`**

```dockerfile
# Этап сборки (builder stage)
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY ./frontend/package*.json ./

# Устанавливаем зависимости
RUN npm ci && npm cache clean --force

# Копируем исходный код
COPY ./frontend .

# Собираем React-приложение
RUN npm run build

# Этап выполнения (runtime stage)
FROM nginx:alpine

# Копируем собранные файлы из этапа builder в папку по умолчанию для Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Копируем кастомный конфиг Nginx
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Запускаем Nginx в foreground
CMD ["nginx", "-g", "daemon off;"]
```

---

#### **3. `nginx/nginx.conf`**

Создай папку `nginx` в корне проекта и файл `nginx.conf` внутри неё.

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Увеличиваем максимальный размер загружаемого файла
    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Прокси для API-запросов
    location /api/ {
        proxy_pass http://backend:8000/api/;  # ← имя сервиса из docker-compose.yml
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Также увеличиваем лимиты на прокси
        proxy_buffering off;
        client_max_body_size 100M;
    }
}
```

---

#### **4. `docker-compose.yml`**

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    command: >
      sh -c "python manage.py migrate &&
             python manage.py create_admin &&
             python manage.py runserver 0.0.0.0:8000"
    volumes:
      - ./mycloud:/app  # Для разработки, можно убрать в продакшене
      - ./mycloud/media:/app/media  # Сохраняем загруженные файлы на хост
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_HOST=db  # Имя сервиса в docker-compose
      - DB_PORT=5432
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - DEBUG=${DEBUG}
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

# Объявляем именованный volume для данных PostgreSQL
volumes:
  postgres_data:
```

---

#### **5. `.env.example`**

```env
# Django settings
SECRET_KEY=your-super-secret-key-here-change-it-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend,0.0.0.0,your_server_ip

# Database
DB_NAME=mycloud_db
DB_USER=myuser
DB_PASSWORD=mypassword
DB_HOST=db
DB_PORT=5432
```

---

### **1.3. Инструкция по разворачиванию**

1.  **Установите Docker и Docker Compose** на ваш сервер.
    *   Docker: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
    *   Docker Compose plugin: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

2.  **Скопируйте проект** на сервер (например, через `git clone`).

3.  **Создайте файл `.env`** в корне проекта на основе `.env.example` и заполните его актуальными данными, особенно `SECRET_KEY` и `ALLOWED_HOSTS` (добавьте IP вашего сервера).

4.  **Запустите проект:**
    ```bash
    docker compose up --build -d
    ```

5.  **Дождитесь завершения сборки и запуска контейнеров.**

6.  **Откройте в браузере:**
    *   Фронтенд: `http://<ваш_IP_сервера>`
    *   Бэкенд (API): `http://<ваш_IP_сервера>:8000`
    *   Админка Django: `http://<ваш_IP_сервера>:8000/admin/`
        *   Логин: `admin`
        *   Пароль: `Admin123!` (если не меняли в `create_admin.py`)

---

## **Часть 2: Скрипт для автоматического разворачивания на сервере**

Создайте файл `deploy.sh` в корне проекта.

### **`deploy.sh`**

```bash
#!/bin/bash

# deploy.sh - Скрипт для автоматического разворачивания проекта Diplom_My_cloud

set -e # Останавливаем скрипт при любой ошибке

echo "=== Начало разворачивания проекта Diplom_My_cloud ==="

# 1. Проверка наличия Docker и Docker Compose
if ! command -v docker &> /dev/null
then
    echo "Ошибка: Docker не установлен. Пожалуйста, установите Docker."
    exit 1
fi

if ! docker compose version &> /dev/null
then
    echo "Ошибка: Docker Compose plugin не установлен. Пожалуйста, установите Docker Compose."
    exit 1
fi

echo "Docker и Docker Compose найдены."

# 2. Проверка наличия .env файла
if [ ! -f ".env" ]; then
    echo "Файл .env не найден!"
    echo "Пожалуйста, создайте файл .env на основе .env.example и настройте его."
    exit 1
fi

echo "Файл .env найден."

# 3. Остановка старых контейнеров (если есть)
echo "Остановка старых контейнеров..."
docker compose down

# 4. Сборка и запуск новых контейнеров
echo "Сборка и запуск контейнеров..."
docker compose up --build -d

echo "=== Разворачивание завершено ==="
echo "Проверьте статус контейнеров: docker compose ps"
echo "Логи бэкенда: docker compose logs backend"
echo "Логи фронтенда: docker compose logs frontend"
echo "Логи БД: docker compose logs db"
```

Сделайте скрипт исполняемым:

```bash
chmod +x deploy.sh
```

**Использование:**

1.  Убедитесь, что файл `.env` создан и настроен.
2.  Запустите скрипт:
    ```bash
    ./deploy.sh
    ```

---

## **Часть 3: Настройка CI/CD на GitHub Actions**

### **3.1. Подготовка репозитория**

1.  Залейте проект в репозиторий на GitHub.
2.  Убедитесь, что в репозитории есть все файлы, созданные выше (`Dockerfile.*`, `docker-compose.yml`, `.env.example`, `deploy.sh`).

### **3.2. Настройка секретов в GitHub**

1.  Перейдите в ваш репозиторий на GitHub.
2.  Зайдите в `Settings` -> `Secrets and variables` -> `Actions`.
3.  Добавьте следующие секреты:
    *   `SERVER_IP`: IP-адрес вашего сервера.
    *   `SERVER_USER`: Имя пользователя для SSH-подключения.
    *   `SERVER_SSH_KEY`: Приватный SSH-ключ для подключения к серверу (содержимое файла `~/.ssh/id_rsa` или аналогичного). **Важно:** храните его как секрет!

### **3.3. Создание workflow-файла**

Создайте файл `.github/workflows/deploy.yml` в вашем репозитории.

#### **`.github/workflows/deploy.yml`**

```yaml
name: Deploy to Server

on:
  push:
    branches: [ "main" ] # Или ваша основная ветка

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Deploy to server
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.SERVER_IP }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          echo "=== Начало деплоя через GitHub Actions ==="
          # Переходим в директорию проекта (замените на ваш путь)
          cd /path/to/your/project/diplom_mycloud || { echo "Директория проекта не найдена"; exit 1; }
          
          # Получаем последние изменения из репозитория
          git pull origin main
          
          # Запускаем скрипт разворачивания
          ./deploy.sh
          
          echo "=== Деплой завершен ==="
```

**Важно:** Замените `/path/to/your/project/diplom_mycloud` на реальный путь к проекту на вашем сервере.

### **3.4. Как это работает**

1.  При каждом `git push` в ветку `main` (или другую, указанную в `on.push.branches`) запускается workflow.
2.  GitHub Actions подключается к вашему серверу по SSH.
3.  Выполняет `git pull`, чтобы получить последние изменения.
4.  Запускает скрипт `deploy.sh`, который останавливает старые контейнеры, пересобирает и запускает новые.


---


---

### Почему проект работает по HTTP и как он разворачивается

Для упрощения развертывания и соответствия учебным целям дипломного проекта, мы **сознательно отказались от настройки HTTPS/SSL** и традиционных системных демонов/служб.

**Причины:**

1.  **Упрощение развертывания:** Настройка SSL-сертификатов и системных служб добавляет сложности, требует глубокого понимания операционной системы и управления сервисами. Это выходит за рамки задачи "научиться писать fullstack-приложение".
2.  **Современный подход:** Вместо этого мы использовали **Docker** и **Docker Compose**. Это позволяет упаковать всё приложение (бэкенд, фронтенд, базу данных) в изолированные контейнеры. Запуск всего приложения сводится к одной команде: `docker compose up`. Это делает развертывание предсказуемым, воспроизводимым и проще для понимания.
3.  **Фокус на функциональности:** Основная цель — продемонстрировать работу fullstack-приложения (Django + React), а не реализацию best-practices по системному администрированию или информационной безопасности.

**Важно:** Использование HTTP делает соединение **небезопасным** (данные передаются в открытом виде). Для реального продакшена настоятельно рекомендуется настроить HTTPS. Также, хотя в задании упоминались демоны и службы, использование Docker является более современным и, по нашему мнению, предпочтительным способом для разворачивания такого приложения.


---

### Обновлённый и структурированный **мануал по разворачиванию проекта Diplom_My_cloud на сервере**:

---

## **Разворачивание проекта Diplom_My_cloud на сервере**

Этот мануал описывает процесс установки и запуска проекта с использованием **Docker Compose**. Он предполагает, что на сервере установлены **Docker** и **Docker Compose plugin**.

### **1. Подготовка сервера**

1.  **Установите Docker и Docker Compose Plugin** (если ещё не установлены).
    *   Следуйте официальной документации Docker для вашей ОС (например, Ubuntu): [https://docs.docker.com/engine/install/ubuntu/](https://docs.docker.com/engine/install/ubuntu/).
    *   Убедитесь, что Docker Compose Plugin установлен: `docker compose version`.
    *   Лучше воспользоваться скриптом: [dockinstall.sh](dockinstall.sh)
    *   Скрипт устанавливает Docker и Docker Compose Plugin.
    *   Исользование:
        ```bash
        chmod +x dockinstall.sh
        ./dockinstall.sh
        ```

2.  **(Опционально) Добавьте вашего пользователя в группу `docker`**, чтобы запускать команды `docker` без `sudo`:
    ```bash
    sudo usermod -aG docker $USER
    ```
    *   **Важно:** После выполнения этой команды **необходимо выйти из системы и снова войти** (или переподключиться по SSH), чтобы изменения вступили в силу. Это необходимо для применения нового членства в группе.

### **2. Получение кода проекта**

1.  **Склонируйте репозиторий** проекта на сервер:
    ```bash
    git clone git@github.com:<name-user>/diplom_mycloud.git
    ```
2.  Перейдите в директорию проекта:
    ```bash
    cd diplom_mycloud
    ```

### **3. Настройка окружения**

1.  **Создайте файл `.env`** на основе примера:
    ```bash
    cp .env.example .env
    ```
2.  **Откройте файл `.env`** и настройте переменные окружения:
    *   `SECRET_KEY`: Сгенерируйте уникальный ключ (например, с помощью Python: `python -c 'import secrets; print(secrets.token_urlsafe(50))'`).
    *   `ALLOWED_HOSTS`: Добавьте IP-адрес вашего сервера и любые другие необходимые хосты. Пример: `localhost,127.0.0.1,backend,0.0.0.0,ВАШ_IP_СЕРВЕРА`.
    *   `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Установите параметры для подключения к базе данных PostgreSQL.

### **4. Обработка конфликта портов (если Nginx уже запущен)**

Если на сервере уже работает Nginx (или другой сервис) на порту 80, вам нужно выбрать один из вариантов:

*   **Остановить существующий Nginx** (если он не нужен):
    ```bash
    sudo systemctl stop nginx
    # (Опционально, чтобы не запускался автоматически)
    # sudo systemctl disable nginx
    ```
*   **Изменить порт приложения**:
    1.  Откройте `docker-compose.yml`.
    2.  Найдите сервис `frontend`.
    3.  Измените строку `ports: - "80:80"` на, например, `ports: - "8080:80"`.
    4.  Приложение будет доступно по адресу `http://ВАШ_IP_СЕРВЕРА:8080`.

### **5. Запуск проекта**

1.  **Запустите скрипт разворачивания** (он остановит старые контейнеры и запустит новые):
    ```bash
    ./deploy.sh
    ```
    *   Или выполните команду вручную:
        ```bash
        docker compose down # Остановить старые контейнеры
        docker compose up --build -d # Собрать и запустить новые контейнеры в фоне
        ```
    * Возможно при первом запусске может появиться ошибка:
        ```bash
        ERROR: Couldn't connect to Docker daemon at http+docker://localunixsocket - is it running?
        If it's at a non-standard location, specify the URL with the DOCKER_HOST environment variable.
        ```
        В таком случае проверьте, запущен ли Docker на вашем сервере. Если нет, запустите его командой `sudo systemctl start docker`.
        Если Docker уже запущен, проверьте, что он работает правильно.

        ПРИ ОЩИБКЕ: dial unix /var/run/docker.sock: connect: permission denied
        Запусти с правами sudo: `sudo ./deploy.sh`

2.  **Дождитесь завершения процесса.** Это может занять несколько минут, особенно при первой сборке.

### **6. Проверка**

1.  Проверьте статус контейнеров:
    ```bash
    docker compose ps
    ```
    Все контейнеры (`db`, `backend`, `frontend`) должны быть в статусе `Up` (или `Up (healthy)` для `db`).
2.  Откройте в браузере:
    *   **Фронтенд**: `http://ВАШ_IP_СЕРВЕРА` (или `http://ВАШ_IP_СЕРВЕРА:8080` если меняли порт).
    *   **API/Админка**: `http://ВАШ_IP_СЕРВЕРА:8000`.
    *   **Админка Django**: `http://ВАШ_IP_СЕРВЕРА:8000/admin/`.
        *   Логин: `admin`
        *   Пароль: `Admin123!` (если не изменяли в `create_admin.py`).

### **7. Автозапуск контейнеров после перезагрузки**

Контейнеры настроены с параметром `restart: unless-stopped`. Это означает, что если они работали до перезагрузки сервера, они **автоматически запустятся** снова после перезагрузки. Если вы остановили контейнеры вручную (командой `docker compose down`), они **не будут** автоматически запускаться до следующей команды `docker compose up`.

---
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
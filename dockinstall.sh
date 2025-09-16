#!/bin/bash
# Скрипт установки/переустановки Docker с цветным выводом ошибок и логированием

LOG_FILE="docker_install.log"
exec > >(tee -a "$LOG_FILE") 2>&1

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Начало установки Docker ===${NC}"

# Функция для определения кодового имени
get_codename() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        if [ "$ID" = "ubuntu" ]; then
            echo "$VERSION_CODENAME"
        elif [ "$ID" = "linuxmint" ]; then
            if [ -f /etc/upstream-release/lsb-release ]; then
                . /etc/upstream-release/lsb-release
                echo "$DISTRIB_CODENAME"
            else
                case "$VERSION_ID" in
                    22*|"victoria"|"vanessa"|"vera") echo "jammy" ;;
                    21*|"uma"|"ulyssa") echo "focal" ;;
                    20*|"ulyana"|"ulyssa") echo "focal" ;;
                    19*|"tricia"|"tina"|"tessa") echo "bionic" ;;
                    *) 
                        echo -e "${RED}Ошибка: версия Linux Mint $VERSION_ID не поддерживается${NC}" >&2
                        exit 1
                        ;;
                esac
            fi
        else
            echo -e "${RED}Ошибка: дистрибутив $ID не поддерживается${NC}" >&2
            exit 1
        fi
    else
        echo -e "${RED}Ошибка: файл /etc/os-release не найден${NC}" >&2
        exit 1
    fi
}

# Удаление старых версий Docker (тихий режим)
echo "Удаление старых версий Docker..."
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc docker-ce docker-ce-cli containerd.io; do 
    sudo apt-get remove -y "$pkg" >/dev/null 2>&1 || true
done

echo "Очистка кеша пакетов..."
sudo apt-get autoremove -y -qq
sudo apt-get clean -y

echo "Удаление старых репозиториев Docker..."
DOCKER_LIST="/etc/apt/sources.list.d/docker.list"
if [ -f "$DOCKER_LIST" ]; then
    sudo rm -f "$DOCKER_LIST"
    echo -e "${GREEN}Старый репозиторий Docker удалён${NC}"
fi

# Временное решение проблемы с ключом Microsoft
echo "Временное отключение проблемных репозиториев..."
sudo sed -i 's/^deb/#deb/g' /etc/apt/sources.list.d/microsoft*.list >/dev/null 2>&1 || true

echo "Обновление списка пакетов..."
if ! sudo apt-get update -y >/dev/null 2>&1; then
    echo -e "${YELLOW}Предупреждение: обновление завершилось с ошибками, но продолжим установку...${NC}"
fi

echo "Установка зависимостей..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release >/dev/null 2>&1

echo "Настройка репозитория Docker..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg >/dev/null 2>&1
sudo chmod a+r /etc/apt/keyrings/docker.gpg

CODENAME=$(get_codename) || exit 1

# Корректировка для новых версий
if [[ "$CODENAME" == "noble" ]]; then
    CODENAME="jammy"
    echo -e "${YELLOW}Используем jammy вместо noble${NC}"
fi

echo "Добавление репозитория для $CODENAME"
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $CODENAME stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

echo "Обновление репозитория Docker..."
sudo apt-get update -o Dir::Etc::sourcelist="sources.list.d/docker.list" -o Dir::Etc::sourceparts="-" -o APT::Get::List-Cleanup="0" >/dev/null 2>&1

echo "Установка Docker..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin >/dev/null 2>&1

echo "Добавление пользователя в группу Docker..."
if sudo usermod -aG docker "$USER" >/dev/null 2>&1; then
    echo -e "${GREEN}Пользователь $USER добавлен в группу docker${NC}"
    echo -e "${YELLOW}Перезапустите терминал для применения изменений${NC}"
else
    echo -e "${RED}Ошибка добавления в группу docker!${NC}"
    exit 1
fi

echo "Настройка демона Docker..."
sudo systemctl enable docker >/dev/null 2>&1
sudo systemctl restart docker >/dev/null 2>&1

echo "Проверка установки..."
if docker --version; then
    echo -e "${GREEN}Docker успешно установлен!${NC}"
else
    echo -e "${RED}Ошибка: Docker не работает!${NC}"
    exit 1
fi

echo -e "${GREEN}=== Установка завершена успешно ===${NC}"
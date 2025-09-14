# Diplom_My_cloud
Дипломный проект по профессии «Fullstack-разработчик на Python»

Запуск

Создайте виртуальное окружение
(В программе VSCode комбинация клавиш Ctrl+Shirft+P. В строке поиска наберите 
Python: Create Environment и выберите "Venv Creates .venv virtual environments in current workspace
Появится предложение сразу же установить зависимости из файла requirements.txt в виртуальное окружение,
соглашаемся и шаг с установкой зависимостей можно пропустить
)
либо через теминал
```bash
python -m venv .venv
```

Активируйте его
```bash
.venv/Scripts/activate
```

Установите зависимости
```bash
pip install -r requirements.txt
```

либо используйте (установите при необходимости) pipenv
```bash
pip install pipenv
```

и установите зависимости из файла Pipfile
```bash
pipenv install
```

Далее создаем файл .env со следующим содержимым:
```bash
SECRET_KEY=*******  генерируем с помощью терминала 
ALLOWED_HOSTS= localhost,127.0.0.1,ИМЯ ДОМЕНА ИЛИ IP АДРЕС СЕРВЕРА
DB_NAME=Название вашей БД
DB_USER=имя пользователя БД
DB_PASSWORD=пароль пользователя БД
DB_HOST=localhost
DB_PORT=5432
```

SECRET_KEY=*******  генерируем с помощью терминала
```bash
python
>>> import secrets 
>>> print(secrets.token_urlsafe(50))
```
Копируем и вставляем вместо *** после SECRET_KEY= 
Создайте БД в PgAdmin4 или в терминале

```bash
createdb -U <DB_USER> <DB_NAME>
```

Выполните миграции БД

```bash
python manage.py migrate
```

Создайте суперпользователя для админки Django (Для входа в админ-панель)

```bash
python manage.py createsuperuser
```

либо по готову скрипту с подставленными по умолчанию параметрами командой находясь в папке my_cloud
```bash
python manage.py create_admin
```

При успешном создании получим в терминале ответ:
```bash
Администратор создан:
Username: admin
Email: admin@mycloud.com
Password: Admin123!
Storage path: user_admin
```

Перед данной командой можно в файле по относительному пути в в файле mycloud/users/management/commands/create_admin.py изменить параметры создания ползователя на свои.

Запустите сервер Django
```bash
python manage.py runserver
```

Админка доступна по адресу
http://127.0.0.1:8000/admin/

## Endpoints (Удобно тестировать через POSTMAN) 

Сервер должен быть запущен на момент тестирования командой
```bash
python manage.py runserver
```

### Пользователи

POST `http://localhost:8000/api/auth/register/` - регистрация пользователя \
GET `http://localhost:8000/api/auth/user/` - получение информации о пользователе (требуется передавать ключ Authorization: Bearer JWT-токен пользователя) \
POST `http://localhost:8000/api/storage/files/` - Добавление файла в репозиторий пользователя (требуется передавать ключ Authorization: Bearer JWT-токен пользователя) \
GET `http://localhost:8000/api/storage/files/` - Получение списка файлов пользователя (требуется передавать ключ Authorization: Bearer JWT-токен пользователя) \
GET 'http://localhost:8000/api/storage/files/ID/download/' - Получение информации на приватный файл, где ID - идентификатор файла (требуется передавать ключ Authorization: Bearer JWT-токен пользователя) \
GET `http://localhost:8000/api/storage/files/LINK/download/` - Получение файла по ссылке без авторизации, где LINK - ссылка на файл, которую можно узнать командами выше. \
PATCH `http://localhost:8000/api/storage/files/ID/` - Изменение приватности файла, где ID - идентификатор файла (требуется передавать ключ Authorization: Bearer JWT-токен пользователя), данные об изменении приватности передаются через JSON, где булево значение определяет публичность файла \
```bash
{ 
    "is_public": true 
}
```
### Администратор

POST `http://localhost:8000/api/auth/token/` - Передаем через JSON логин и пароль админа, чтобы получить его access JWT-токен ответом, который необходим в следующих ендпоинтах. \
```bash
{ 
    "username": "логин админа",
    "password": "пароль админа"
}
```

GET `http://localhost:8000/api/auth/admin/users/` - Получение информации о всех пользователях, их количестве и общем размере файлов.\
GET `http://localhost:8000/api/storage/files/?user_id=ID` - Получение информации о конкретном пользователе и его хранилище с информацией по каждому файлу, где ID - это id пользователя (требуется передавать ключ Authorization: Bearer JWT-токен администратора). \
DEL `http://localhost:8000/api/storage/files/ID/` - Удаление файла пользователя, где ID - это идентификатор файла \
DEL `http://localhost:8000/api/auth/admin/users/ID/` - Удаление профиля пользователя, где ID - это идентификатор пользователя \
PATCH `http://localhost:8000/api/auth/admin/users/ID/` - Изменение прав пользователя, где ID - это идентификатор пользователя, данные передаются через JSON, например \
```bash
{
    "is_admin":true
}
```


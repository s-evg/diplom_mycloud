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

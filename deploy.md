# Разворачиваем приложение на сервере
1. Для начала нужно выпустить на своем компьютере SSH-ключ, например через терминал командой 
```bash
ssh-keygen
```
2. Далее передим на сайт [reg.ru](https://cloud.reg.ru/) и cоздаем облачный сервер: \

- образ - Ubuntu 24.04 LTS
- тип диска - Стандартный
- тариф - Std C1-M1-D10
- регион размещения - Москва
- указываем название SSH ключа
- добавляем SSH-ключ, используя ранее сгенерированный публичный SSH-ключ
- даем название серверу
- нажимаем кнопку Заказать сервер
---
После успешной регистрации на вашу почту придет письмо с IP- адресом сервера, логином и паролем. \
3. Открываем терминал от имени администратора и набираем
```bash
ssh root@IP
```
где IP - это ip-адрес вашего сервера и вводим пароль из письма, или от SSH-ключа \
4. Создаем нового пользователя: 
   `adduser <ИМЯ ПОЛЬЗОВАТЕЛЯ>`
   
5. Добавляем созданного пользователя в группу `sudo`: \
   `usermod <ИМЯ ПОЛЬЗОВАТЕЛЯ> -aG sudo` 

6. Выходим из под пользователя `root`: \
   `logout` 

7. Подключаемся к серверу под новым пользователем: \
   `ssh <ИМЯ ПОЛЬЗОВАТЕЛЯ>@<IP АДРЕС СЕРВЕРА>`

   ---

8. Обновляем список доступных пакетов `apt` и их версий из всех настроенных репозиториев, включая PPA, чтобы пользоваться их актуальными релизами:\
   `sudo apt update`\
9. Устанавливаем нужной версии `Python 3.13.1+`:
   - Установка необходимых инструментов для добавления PPA:\
      `sudo apt install software-properties-common`
   - Добавление PPA для установок новых версий Python:\
      `sudo add-apt-repository ppa:deadsnakes/ppa`
   - Обновление списка пакетов:\
      `sudo apt update`
   - Установка Python 3.13 и необходимых пакетов для разработки:\
      `sudo apt install python3.13 python3.13-venv python3.13-dev python3-pip`
   - Проверка установленной версии Python 3.13:\
      `python3.13 --version`
   - Настройка Python 3.13 как альтернативы для python3:\
      `sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.13 1`\
      `sudo update-alternatives --config python3`
   - Проверка версии python3, чтобы убедиться, что всё настроено правильно:\
      `python3 --version`
10. Устанавливаем необходимые пакеты:\
   `sudo apt install postgresql nginx`

    ---

11. Заходим в панель `psql` под пользователем `postgres`:\
   `sudo -u postgres psql`
12. Задаем пароль для пользователя `postgres`:\
   `ALTER USER postgres WITH PASSWORD 'postgres';`
13. Создаем базу данных:\
   `CREATE DATABASE mycloud;`
14. Выходим из панели `psql`:\
    `\q`

    ---

15. Проверяем что установлен `git`:\
   `git --version`
16. Клонируем репозиторий:\
   `git clone https://github.com/SubHunt/diplom_mycloud.git`

    ---

17. Переходим в папку проекта `mycloud`:\
   `cd /home/<ИМЯ ПОЛЬЗОВАТЕЛЯ>/diplom_mycloud/mycloud`
18. Устанавливаем виртуальное окружение:\
   `python3 -m venv venv`
19. Активируем виртуальное окружение:\
   `source venv/bin/activate`
20. Устанавливаем зависимости:\
   `pip install -r requirements.txt`
21. В папке `backend` создаем файл `.env` в соответствии с шаблоном:\
   `nano .env`

      ```python
         # Настройки Django
         # можно сгенерировать с помощью терминала python: >>> import secrets >>> print(secrets.token_urlsafe(50))
         SECRET_KEY=*******
         # False or True
         DEBUG=False
         # ALLOWED_HOSTS например через запятую: localhost,127.0.0.1,<ИМЯ ДОМЕНА ИЛИ IP АДРЕС СЕРВЕРА> или оставить `*` для всех
         ALLOWED_HOSTS=*

         # Настройки базы данных, что создали на этапе 12-13
         DB_NAME=mycloud
         DB_USER=postgres
         DB_PASSWORD=password
         DB_HOST=localhost
         DB_PORT=5432
      ```

22. Применяем миграции:\
   `python manage.py migrate`
23. Создаем администратора (суперпользователя):\
   `python manage.py createsuperuser`\
    либо готовым скриптом: \
    `python manage.py create_admin`
   *Суперпользователь позволят входить как в "Django administration", так и в "Административный интерфейс" на фронте сайта после входа.*
25. Собираем весь статичный контент в одной папке (`static`) на сервере:\
   `python manage.py collectstatic`
26. Запускаем сервер:\
   `python manage.py runserver 0.0.0.0:8000`

    ---

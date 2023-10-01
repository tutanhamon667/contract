# Платформа для фрилансеров и поиска заказов для IT специалиста [freelancing-platform-project]

## Бэкенд

### Окружение

- [Python 3.10.11 и новее](https://www.python.org/downloads/)

### Запуск бэкенд-сервера

В корне проекта (там, где находятся файлы `README.md` и `setup.cfg`),
нужно создать и активировать виртуальное окружение:

```sh
python -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
```

Перейти в папку backend и установить зависимости:

```sh
cd backend
pip install -r requirements.txt
```

Выполнить миграции:

```sh
python manage.py makemigrations
python manage.py migrate
```

Запустить проект:

```sh
python manage.py runserver
```

### Примеры запросов

Получить список основных эндпоинтов: http://127.0.0.1:8000/api/v1/

### Документация

- http://127.0.0.1:8000/redoc/

- http://127.0.0.1:8000/swagger/

- Ссылка на просмотре документации онлайн (не всегда содержит последние изменения):
https://redocly.github.io/redoc/?url=https://raw.githubusercontent.com/freelancing-platform-practicum/freelancing-platform-project/develop/backend/docs/redoc_orders.yml&nocors

#### Эндпоинты модели Member

регистрация нового пользователя (доступно любому пользователю)  
/api/v1/users/reg_in/  
POST  
JSON схема передаваемых данных

```jsom
{
    "first_name": "Имя",
    "last_name": "Фамилия",
    "email": "адрес электронной почты в принятом стандарте",
    "password": "пароль",
    "re_password": "ещё раз пароль",
    "is_customer": пользователь регистрируется в качестве заказчика (булева переменная),
    "is_worker": пользователь регистрируется в качестве фрилансера (булева переменная)
}
```

Все поля обязательны к заполнению, булевы не могут быть оба True или False

вход зарегистрированного пользователя на сайт (доступно любому пользователю)  
/api/v1/login/jwt/create/  
POST  
JSON схема передаваемых данных

```jsom
{
    "email": "адрес электронной почты в принятом стандарте",
    "password": "пароль"
}
```

смена адреса электронной почты (авторизация с использования JWT-токена)  
/api/v1/users/new_email/  
POST  
JSON схема передаваемых данных

```jsom
{
    "new_email": "новый email",
    "re_new_email": "ещё раз новый email",
    "current_password": "действующий пароль пользователя"
}
```

смена пароля (авторизация с использования JWT-токена)  
/api/v1/users/new_password/  
POST  
JSON схема передаваемых данных

```jsom
{
    "new_password": "новый пароль",
    "re_new_password": "ещё раз новый пароль",
    "current_password": "действующий пароль пользователя"
}
```

Сброс пароля с использованием email происходит в 2 этапа:

1. Отправка письма на зарегистрированный электронный адрес
   /api/v1/users/reset_password/  
   POST
   JSON схема передаваемых данных

```jsom
{
    "email": "email пользователя, желающего сбросить свой пароль и установить новый"
}
```

2. Пользователь получает на свой электронный адрес письмо, в теле которого есть ссылка в формате  
   имя_сайта/api/v1/users/reset_password_confirm/{uid}/{token}/  
   после нажатия на эту ссылку пользователь попадает на страницу установки нового пароля  
   api/v1/users/reset_password_confirm/  
   POST  
   JSON схема передаваемых данных

```jsom
{
    "uid": "UID пользователя, содержащийся в ссылке, полученной в письме",
    "token": "одноразовый токен, содержащийся в ссылке, полученной в письме",
    "new_password": "новый пароль",
    "re_new_password": "ещё раз новый пароль"
}
```

## Фронтенд

### Окружение

- [Node.js 18 (LTS) и новее](https://nodejs.org/en/download)

### Запуск фронтенд-сервера

Перейти в директорию `frontend` и установить зависимости:

```sh
cd frontend
npm install
```

Запустить фронтенд-сервер:

```sh
npm start
```

- Фронтенд-сервер запустится по адресу http://localhost:3000

- Ссылка на просмотр фронта, загруженного на GitHub Pages (не всегда содержит последние изменения):
https://freelancing-platform-practicum.github.io/freelancing-platform-project/

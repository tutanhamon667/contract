# Платформа для фрилансеров и поиска заказов для IT специалиста [freelancing-platform-project]

[![Freelance platform workflow](https://github.com/freelancing-platform-practicum/freelancing-platform-project/actions/workflows/main.yml/badge.svg)](https://github.com/freelancing-platform-practicum/freelancing-platform-project/actions/workflows/main.yml)

## О проекте

Платформа может помочь IT специалистам создать удобную и эффективную среду для нахождения работы 
и развития профессиональной карьеры в IT. 
Может помочь сократить время и усилия, связанные с поиском проектов и коммуникацией с заказчиками.

| Название           | URL                           |
|--------------------|-------------------------------|
| Сайт               | https://taski.ddns.net/       |
| API                | https://taski.ddns.net/api/   |
| Документация Redoc | https://taski.ddns.net/redoc/ |

Настроен автоматический деплой проекта из ветки `develop`. 

## Фронтенд

### Окружение

- [Node.js 20 (LTS) и новее](https://nodejs.org/en/download)

### Установка зависимостей

Перейти в директорию `frontend` и установить зависимости:

```sh
cd frontend
npm install
```

### Запуск фронтенд-сервера

Запустить фронтенд-сервер:

```sh
npm start
```

Фронтенд-сервер запустится по адресу: http://localhost:5173

### Сборка фронтенда

Собрать фронтенд для деплоя:

```shell
npm run build
```

Готовый фронтенд будет в папке `dist`.

## Бэкенд

### Окружение

- [Python 3.10.11 и новее](https://www.python.org/downloads/)

### Запуск бэкенд-сервера

> [!IMPORTANT]
> В файле `/backend/taski/settings.py` нужно раскомментировать блок `DATABASES` с `sqlite3`, 
> а блок `DATABASES` выше закомментировать.

Перейти в папку `backend`, создать и активировать виртуальное окружение:

```sh
cd backend
python -m venv venv
source venv/bin/activate
```

Обновить менеджер пакетов pip и установить зависимости:

```sh
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Выполнить миграции:

```sh
python manage.py makemigrations users
python manage.py makemigrations api
python manage.py makemigrations orders
python manage.py makemigrations chat
python manage.py migrate
```

Запустить бэкенд-сервер:

```sh
python manage.py runserver
```

### Примеры запросов

Получить список основных эндпоинтов: http://127.0.0.1:8000/api/

### Документация

Redoc и Swagger доступны по адресам (но пока есть проблемы, поэтому смотри [Эндпоинты модели Member](#эндпоинты-модели-member)):

- http://127.0.0.1:8000/redoc/

- http://127.0.0.1:8000/swagger/

#### Эндпоинты модели Member
  
##### Список фрилансеров (доступно любому пользователю):

/api/main/  
GET  
JSON схема передаваемых данных  

```json
{
    "user":{ "данные подтягиваются из анкеты"
            "first_name": "Имя",
            "last_name": "Фамилия"
    },
    "stacks": [
        {
            "name": "Стэк технологий, которым владеет исполнитель",
            "slug": "А нужен ли?????"
        }
    ],
    "categories": [
        {
            "name": "категория, соответствующая категориям в фильтрах заказа",
            "slug": "А нужен ли?????"
        }
    ],
    "about": "о себе",
    "payrate": "ставка оплаты в час"
}
```
Отображаемые данные отсортированы по фамилии пользователя (last_name).  
РЕАЛИЗОВАН ПОИСК ПО ПОЛЯМ (пример)  
/api/main/?categories=development&min_payrate=&max_payrate=2500
  
##### Регистрация нового пользователя (доступно любому пользователю):

/api/users/
POST
JSON схема передаваемых данных

```json
{
    "first_name": "Имя",
    "last_name": "Фамилия",
    "email": "адрес электронной почты в принятом стандарте",
    "password": "пароль, обязательно должны быть цифра, спецсимвол и заглавная буква латинского алфавита",
    "re_password": "ещё раз пароль",
    "is_customer": "пользователь регистрируется в качестве заказчика (булева переменная)",
    "is_worker": "пользователь регистрируется в качестве фрилансера (булева переменная)"
}
```

Все поля обязательны к заполнению, булевы не могут быть оба True или False

##### Информация о выбранном пользователе (доступно любому пользователю):

/api/users/id/  
GET  
JSON схема передаваемых данных профиля Заказчика

```json
{
    "photo": "логотип, фото, закодированный в Base64",
    "name": "Фамилия Имя или название компании",
    "is_customer": "пользователь регистрируется в качестве заказчика (булева переменная)",
    "is_worker": "пользователь регистрируется в качестве фрилансера (булева переменная)",
    "industry": {
        "name": "область деятельности компании"
    },
    "about": "о себе",
    "web": "личный сайт"
}
```

JSON схема передаваемых данных профиля Исполнителя

```json
{
    "user":{ "данные подтягиваются из анкеты"
            "first_name": "Имя",
            "last_name": "Фамилия"
    },
    "is_customer": "пользователь регистрируется в качестве заказчика (булева переменная)",
    "is_worker": "пользователь регистрируется в качестве фрилансера (булева переменная)",
    "stacks": [
        {
            "name": "Стэк технологий, которым владеет исполнитель",
            "slug": "А нужен ли?????"
        }
    ],
    "categories": [
        {
            "name": "категория, соответствующая категориям в фильтрах заказа",
            "slug": "А нужен ли?????"
        }
    ],
    "education": [
        {
            "diploma": [
                {
                    "file": "файл диплома (работа проверена на .png)",
                    "name": "краткое описание файла",
                    "thumbnail": "автоматически создаваемая иконка (GET)"
                }
            ],
            "name": "название учебного заведения",
            "faculty": "факультет",
            "start_year": "год начала обучения",
            "finish_year": "год окончания обучения",
            "degree": "квалификация"
        }
    ],
    "portfolio": [
        {
            "file": "файл портфолио (работа проверена на .png)",
            "name": "краткое описание файла",
            "thumbnail": "автоматически создаваемая иконка (GET)"
        }
    ],
    "photo": "фотография исполнителя",
    "payrate": "ставка оплаты в час",
    "about": "о себе",
    "web": "сайт-портфолио или своя страница исполнителя"
}
```

##### Вход зарегистрированного пользователя на сайт (доступно любому пользователю):

/api/login/jwt/create/  
POST  
JSON схема передаваемых данных

```json
{
    "email": "адрес электронной почты в принятом стандарте",
    "password": "пароль"
}
```

##### Создание, обновление или просмотр своего профиля (авторизация с использования JWT-токена):

/api/users/me/  
POST PATCH GET  
JSON схема передаваемых данных профиля Заказчика (выбор автоматически по роли пользователя)

```json
{
    "photo": "логотип, фото, закодированный в Base64",
    "account_email": "адрес электронной почты R/O",
    "name": "Фамилия Имя или название компании",
    "is_customer": "пользователь регистрируется в качестве заказчика (булева переменная) R/O",
    "is_worker": "пользователь регистрируется в качестве фрилансера (булева переменная) R/O",
    "industry": {
        "name": "область деятельности компании"
    },
    "about": "о себе",
    "web": "личный сайт"
}
```

R/O - read only, только для чтения. Изменение значения поля невозможно  
JSON схема передаваемых данных профиля Исполнителя (выбор автоматически по роли пользователя)

```json
{
    "account_email": "адрес электронной почты R/O",
    "user":{ "данные подтягиваются из анкеты"
            "first_name": "Имя",
            "last_name": "Фамилия"
    },
    "is_customer": "пользователь регистрируется в качестве заказчика (булева переменная) R/O",
    "is_worker": "пользователь регистрируется в качестве фрилансера (булева переменная) R/O",
    "contacts": [
        {
            "type": "Тип контакта (выбор из предустановленного списка)",
            "value": "контакт",
            "preferred": "Установить в качестве предпочитаемого (булева переменная)"
        }
    ],
    "stacks": [
        {
            "name": "Стэк технологий, которым владеет исполнитель",
            "slug": "А нужен ли?????"
        }
    ],
    "categories": [
        {
            "name": "категория, соответствующая категориям в фильтрах заказа",
            "slug": "А нужен ли?????"
        }
    ],
    "education": [
        {
            "diploma": [
                {
                    "file": "файл диплома (работа проверена на .png)",
                    "name": "краткое описание файла",
                    "thumbnail": "автоматически создаваемая иконка (GET)"
                }
            ],
            "name": "название учебного заведения",
            "faculty": "факультет",
            "start_year": "год начала обучения",
            "finish_year": "год окончания обучения",
            "degree": "квалификация"
        }
    ],
    "portfolio": [
        {
            "file": "файл портфолио (работа проверена на .png)",
            "name": "краткое описание файла",
            "thumbnail": "автоматически создаваемая иконка (GET)"
        }
    ],
    "photo": "фотография исполнителя",
    "payrate": "ставка оплаты в час",
    "about": "о себе",
    "web": "сайт-портфолио или своя страница исполнителя"
}
```

R/O - read only, только для чтения. Изменение значения поля невозможно  
POST используется только один раз при создании профиля, далее используется только PATCH

##### Изменение адреса электронной почты (авторизация с использования JWT-токена):

/api/users/new_email/
POST
JSON схема передаваемых данных

```json
{
    "new_email": "новый email",
    "re_new_email": "ещё раз новый email",
    "current_password": "действующий пароль пользователя"
}
```

##### Изменение пароля (авторизация с использования JWT-токена):

/api/users/new_password/  
POST  
JSON схема передаваемых данных

```json
{
    "new_password": "новый пароль",
    "re_new_password": "ещё раз новый пароль",
    "current_password": "действующий пароль пользователя"
}
```

##### Сброс пароля с использованием email происходит в 2 этапа:

1. Отправка письма на зарегистрированный электронный адрес
   /api/users/reset_password/  
   POST  
   JSON схема передаваемых данных

```json
{
    "email": "email пользователя, желающего сбросить свой пароль и установить новый"
}
```

2. Пользователь получает на свой электронный адрес письмо, в теле которого есть ссылка в формате
   имя_сайта/api/users/reset_password_confirm/{uid}/{token}/  
   после нажатия на эту ссылку пользователь попадает на страницу установки нового пароля  
   api/users/reset_password_confirm/  
   POST  
   JSON схема передаваемых данных

```json
{
    "uid": "UID пользователя, содержащийся в ссылке, полученной в письме",
    "token": "одноразовый токен, содержащийся в ссылке, полученной в письме",
    "new_password": "новый пароль",
    "re_new_password": "ещё раз новый пароль"
}
```

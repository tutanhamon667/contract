# freelancing-platform-project

Запуск Backend (временный - до настройки docker):


Cоздать и активировать виртуальное окружение:

```
python3 -m venv venv
```

```
source venv/bin/activate
```

```
python3 -m pip install --upgrade pip
```
Перейти в папку Backend и 
установить зависимости из файла requirements.txt:

```
pip install -r requirements.txt
```

Выполнить миграции:

```
python3 manage.py makemigrations
```

```
python3 manage.py migrate
```

Запустить проект:

```
python3 manage.py runserver
```

### Примеры запросов:

Получить список основных эндпоинтов:

```
http://127.0.0.1:8000/api/v1/
```

# Документация доступан по ссылкам:

```
http://127.0.0.1:8000/redoc/
```

```
http://127.0.0.1:8000/swagger/
```
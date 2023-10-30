FROM python:3.10.13-slim
WORKDIR /app
COPY ./requirements.txt .
RUN pip3 install -r requirements.txt --no-cache-dir
COPY . .
COPY ./app/static/zohoverify/verifyforzoho.html /app/static/zohoverify/
CMD ["gunicorn", "taski.wsgi:application", "--bind", "0:8000"]

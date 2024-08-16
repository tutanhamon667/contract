FROM python:3.10.14-bullseye
WORKDIR /app
COPY ./requirements.txt .
RUN apt install gcc
RUN python3 -m venv venv
ENV PATH="/app/venv/bin:$PATH"
RUN pip install --upgrade pip
RUN pip install -r requirements.txt --no-cache-dir
COPY . .
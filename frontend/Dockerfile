FROM node:18.18.0-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build
COPY app/build /app/result_build
CMD [ "cp", "-r", "/app/build", "/app/result_build" ]
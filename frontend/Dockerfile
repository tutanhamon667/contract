FROM node:lts-alpine
RUN mkdir /app
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build
RUN cp -r dist result_build

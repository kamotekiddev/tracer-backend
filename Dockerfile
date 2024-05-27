FROM node:20-alpine3.20

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8000


CMD [ "npm", "run","start:dev" ]





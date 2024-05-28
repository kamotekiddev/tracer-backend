FROM node:20-alpine3.20

WORKDIR /app

COPY . .

RUN npm install
RUN npx prisma generate
RUN npx prisma migrate reset
RUN npx prisma db push


EXPOSE 8000


CMD [ "npm", "run","start:dev" ]





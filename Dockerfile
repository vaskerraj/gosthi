FROM node:latest

WORKDIR /usr/src/gosthi

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
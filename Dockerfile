FROM node:alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

ENTRYPOINT ["node"]
CMD ["index.js"]
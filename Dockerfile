FROM node:alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm i

COPY . .

EXPOSE 3000

ENTRYPOINT ["node"]
CMD ["index.js"]
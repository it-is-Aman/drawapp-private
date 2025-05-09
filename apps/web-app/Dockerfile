FROM node:20

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install --filter ./apps/web-app... --frozen-lockfile

RUN pnpm build --filter ./apps/web-app...

EXPOSE 3000

CMD ["pnpm","--filter", "./apps/web-app", "start"]

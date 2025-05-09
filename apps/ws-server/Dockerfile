FROM node:20

WORKDIR /app


RUN npm install -g pnpm

COPY . .

RUN pnpm install --filter ./apps/ws-server... --frozen-lockfile

RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

RUN pnpm build --filter ./apps/ws-server...

EXPOSE 8080

CMD ["pnpm", "--filter", "./apps/ws-server", "start"]

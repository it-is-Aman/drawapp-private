FROM node:20

WORKDIR /app

RUN npm install -g pnpm

COPY . .

# Install only http-server and its deps
RUN pnpm install --filter ./apps/http-server... --frozen-lockfile

# Generate Prisma client for db
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build the app
RUN pnpm build --filter ./apps/http-server...

EXPOSE 3001

CMD ["pnpm", "--filter", "./apps/http-server", "start"]

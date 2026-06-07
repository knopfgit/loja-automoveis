# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Build the application
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

# Storage dir for local uploads driver
RUN mkdir -p /app/storage

EXPOSE 3000

# Run pending migrations then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

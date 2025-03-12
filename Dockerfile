FROM node:18-alpine AS builder

WORKDIR /app

# Copie et installation des dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copie du code source et build
COPY . .
RUN npm run build

# Image finale
FROM node:18-alpine
WORKDIR /app

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000

# Démarrage de l'application Next.js
CMD ["npm", "start"]
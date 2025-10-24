# Multi-stage build para otimizar tamanho
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas package.json primeiro (melhor cache)
COPY package*.json ./
RUN npm ci

# Copiar código fonte e fazer build
COPY . .
RUN npm run build

# Estágio de produção
FROM node:20-alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copiar dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar build do estágio anterior
COPY --from=builder /app/dist ./dist

# Expor porta
EXPOSE 3000

# Health check - verifica se a aplicação está respondendo
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Iniciar aplicação
CMD ["node", "dist/main.js"]

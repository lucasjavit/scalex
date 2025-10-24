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

WORKDIR /app

# Copiar dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar build do estágio anterior
COPY --from=builder /app/dist ./dist

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar aplicação
CMD ["node", "dist/main.js"]

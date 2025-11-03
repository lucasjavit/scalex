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

# Copiar dependências (incluindo devDependencies para migrations)
COPY package*.json ./
RUN npm ci

# Copiar build do estágio anterior
COPY --from=builder /app/dist ./dist

# Copiar código fonte necessário para migrations
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copiar script de inicialização
COPY start.sh ./
RUN chmod +x start.sh

# Expor porta
EXPOSE 3000

# Health check - verifica se a aplicação está respondendo
# Usa /api/ porque app.setGlobalPrefix('api') foi adicionado
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api || exit 1

# Iniciar aplicação com migrations
CMD ["./start.sh"]

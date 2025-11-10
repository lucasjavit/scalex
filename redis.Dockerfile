# Redis Dockerfile para Scalex
FROM redis:7-alpine

# Copia configuração customizada (se existir)
COPY redis.conf /usr/local/etc/redis/redis.conf

# Expõe a porta padrão do Redis
EXPOSE 6379

# Comando para iniciar o Redis com a configuração customizada
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]

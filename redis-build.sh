#!/bin/bash

# Script para build e deploy do Redis no servidor

echo "🔧 Building Redis Docker image..."
docker build -f redis.Dockerfile -t scalex-redis:latest .

echo "✅ Build completed!"
echo ""
echo "Para rodar o Redis:"
echo "  docker run -d --name scalex-redis -p 6379:6379 -v redis_data:/data scalex-redis:latest"
echo ""
echo "Para ver logs:"
echo "  docker logs -f scalex-redis"
echo ""
echo "Para testar conexão:"
echo "  docker exec -it scalex-redis redis-cli -a redis-password-scalex-2025 ping"

# Redis Setup para Scalex

## Arquivos

- `redis.Dockerfile` - Dockerfile customizado para o Redis
- `redis.conf` - Configuração do Redis com senha e persistência
- `redis-build.sh` - Script de build (Linux/Mac)

## Build da Imagem

```bash
docker build -f redis.Dockerfile -t scalex-redis:latest .
```

## Executar o Redis

### Opção 1: Comando Simples

```bash
docker run -d \
  --name scalex-redis \
  --restart unless-stopped \
  -p 6379:6379 \
  -v redis_data:/data \
  scalex-redis:latest
```

### Opção 2: Com Rede Customizada

```bash
# Criar rede (se ainda não existir)
docker network create scalex-network

# Rodar Redis na rede
docker run -d \
  --name scalex-redis \
  --restart unless-stopped \
  --network scalex-network \
  -p 6379:6379 \
  -v redis_data:/data \
  scalex-redis:latest
```

## Configuração

### Senha Padrão
**Senha:** `redis-password-scalex-2025`

⚠️ **IMPORTANTE:** Altere esta senha em produção editando o arquivo `redis.conf`:

```conf
requirepass SUA_SENHA_FORTE_AQUI
```

Depois rebuild a imagem:
```bash
docker build -f redis.Dockerfile -t scalex-redis:latest .
docker stop scalex-redis
docker rm scalex-redis
# Rodar novamente com o comando acima
```

### Conectar no Backend

Atualize o `.env` do backend:

```bash
REDIS_URL=redis://:redis-password-scalex-2025@localhost:6379
```

Se o Redis estiver em outro servidor:
```bash
REDIS_URL=redis://:redis-password-scalex-2025@IP_DO_SERVIDOR:6379
```

## Comandos Úteis

### Verificar Status
```bash
docker ps | grep scalex-redis
```

### Ver Logs
```bash
docker logs -f scalex-redis
```

### Testar Conexão
```bash
docker exec -it scalex-redis redis-cli -a redis-password-scalex-2025 ping
# Deve retornar: PONG
```

### Acessar CLI do Redis
```bash
docker exec -it scalex-redis redis-cli -a redis-password-scalex-2025
```

Comandos úteis dentro do CLI:
```redis
# Ver todas as chaves
KEYS *

# Ver valor de uma chave
GET companies:featured

# Ver TTL de uma chave
TTL companies:featured

# Limpar uma chave específica
DEL companies:featured

# Ver informações do servidor
INFO

# Ver estatísticas de memória
INFO memory

# Sair
exit
```

### Parar/Iniciar
```bash
# Parar
docker stop scalex-redis

# Iniciar
docker start scalex-redis

# Reiniciar
docker restart scalex-redis
```

### Remover
```bash
# Parar e remover container
docker stop scalex-redis
docker rm scalex-redis

# Remover volume de dados (CUIDADO: perde todos os dados!)
docker volume rm redis_data
```

## Backup e Restore

### Backup
```bash
# Criar backup do dump.rdb
docker exec scalex-redis redis-cli -a redis-password-scalex-2025 BGSAVE
docker cp scalex-redis:/data/dump.rdb ./backup-redis-$(date +%Y%m%d).rdb
```

### Restore
```bash
# Parar Redis
docker stop scalex-redis

# Copiar backup para o volume
docker cp ./backup-redis-20250611.rdb scalex-redis:/data/dump.rdb

# Iniciar Redis
docker start scalex-redis
```

## Monitoramento

### Ver Comandos em Tempo Real
```bash
docker exec -it scalex-redis redis-cli -a redis-password-scalex-2025 MONITOR
```

### Estatísticas
```bash
docker exec -it scalex-redis redis-cli -a redis-password-scalex-2025 INFO stats
```

## Segurança em Produção

1. **Alterar senha padrão** no `redis.conf`
2. **Usar firewall** para restringir acesso à porta 6379
3. **Habilitar SSL/TLS** se necessário (requer configuração adicional)
4. **Backups regulares** dos dados
5. **Monitorar logs** para tentativas de acesso não autorizado

## Troubleshooting

### Redis não conecta
- Verificar se container está rodando: `docker ps`
- Verificar logs: `docker logs scalex-redis`
- Testar conexão: `docker exec -it scalex-redis redis-cli -a redis-password-scalex-2025 ping`

### Erro de autenticação
- Verificar senha no `redis.conf`
- Verificar senha no `.env` do backend (formato: `redis://:senha@host:porta`)

### Memória cheia
- Aumentar limite no `redis.conf`: `maxmemory 512mb`
- Configurar política de eviction: `maxmemory-policy allkeys-lru`
- Rebuild imagem e recriar container

## Performance

A configuração atual usa:
- **AOF (Append Only File)** com sync a cada segundo
- **RDB Snapshots** em intervalos configurados
- **LRU eviction** quando memória está cheia
- **TCP keepalive** para manter conexões

Para melhor performance em produção, considere:
- Aumentar `maxmemory` conforme necessário
- Ajustar políticas de snapshot no `redis.conf`
- Usar SSD para o volume de dados

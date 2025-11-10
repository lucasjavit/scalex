import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const getCacheConfig = (
  config: ConfigService,
): CacheModuleOptions => {
  const redisUrl = config.get<string>('REDIS_URL');

  // Se tiver REDIS_URL configurado, usa Redis
  if (redisUrl) {
    const url = new URL(redisUrl);
    return {
      isGlobal: true,
      store: redisStore as any,
      host: url.hostname,
      port: parseInt(url.port || '6379'),
      password: url.password || undefined,
      ttl: 1800, // 30 minutos padrão
      max: 1000, // Máximo 1000 itens no cache
    };
  }

  // Fallback: cache em memória (desenvolvimento)
  console.log('⚠️  Redis não configurado, usando cache em memória');
  return {
    isGlobal: true,
    ttl: 1800, // 30 minutos
    max: 100, // Máximo 100 itens
  };
};

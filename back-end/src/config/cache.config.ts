import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const getCacheConfig = async (
  config: ConfigService,
): Promise<CacheModuleOptions> => {
  const redisUrl = config.get<string>('REDIS_URL');

  console.log('🔍 Cache config - REDIS_URL:', redisUrl ? 'CONFIGURADO' : 'NÃO CONFIGURADO');

  // Se tiver REDIS_URL configurado, usa Redis
  if (redisUrl) {
    console.log('✅ Configurando Redis store...');

    const store = await redisStore({
      url: redisUrl,
      ttl: 1800 * 1000, // 30 minutos em milissegundos
    });

    console.log('✅ Redis store configurado com sucesso!');

    return {
      isGlobal: true,
      store: store as any,
      ttl: 1800 * 1000, // 30 minutos em milissegundos
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

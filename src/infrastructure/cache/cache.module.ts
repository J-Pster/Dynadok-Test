import { Module, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisCacheService } from './redis/redis-cache.service';
import { createKeyv } from '@keyv/redis';

// Token de injeção para o serviço de cache
export const REDIS_CACHE_SERVICE = 'REDIS_CACHE_SERVICE';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('CacheModule');

        // Usar a variável de ambiente diretamente para garantir que pega o valor correto
        const redisHost = process.env.REDIS_HOST || 'redis';
        const redisPort = process.env.REDIS_PORT || '6379';
        const redisUrl = `redis://${redisHost}:${redisPort}`;

        logger.log(`Configurando Redis cache com URL: ${redisUrl}`);

        try {
          // Configuração direta com createKeyv para maior controle
          const redisClient = createKeyv(redisUrl, {
            namespace: 'dynadok',
            // Opções específicas do Redis para melhor desempenho
            useUnlink: true,
            clearBatchSize: 1000,
          });

          // Adicionar handler para erros de conexão
          redisClient.on('error', (err) => {
            logger.error(`Redis connection error: ${err.message}`, err.stack);
          });

          // Log para confirmar conexão bem-sucedida
          const redisInstance = redisClient.store.client;
          redisInstance.on('connect', () => {
            logger.log('Conexão Redis estabelecida com sucesso');
          });

          return {
            isGlobal: true,
            ttl: configService.get<number>('cache.ttl', 300) * 1000, // em milissegundos
            max: configService.get<number>('cache.max', 1000),
            store: redisClient.store, // Use diretamente o store do cliente Redis
          };
        } catch (error) {
          logger.error(
            `Erro ao configurar Redis: ${error.message}`,
            error.stack,
          );
          throw error;
        }
      },
    }),
  ],
  providers: [
    {
      provide: REDIS_CACHE_SERVICE,
      useClass: RedisCacheService,
    },
  ],
  exports: [REDIS_CACHE_SERVICE],
})
export class CacheManagerModule {}

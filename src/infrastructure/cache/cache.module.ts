import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InMemoryCacheService } from './inmemory/inmemory-cache.service';

// Token de injeção para o serviço de cache
export const INMEMORY_CACHE_SERVICE = 'INMEMORY_CACHE_SERVICE';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true,
        ttl: configService.get<number>('cache.ttl', 300) * 1000, // em milissegundos
        max: configService.get<number>('cache.max', 1000),
      }),
    }),
  ],
  providers: [
    {
      provide: INMEMORY_CACHE_SERVICE,
      useClass: InMemoryCacheService,
    },
  ],
  exports: [INMEMORY_CACHE_SERVICE],
})
export class CacheManagerModule {}

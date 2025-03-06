import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ICacheService } from '../../../core/domain/cache/cache-service.interface';

@Injectable()
export class RedisCacheService implements ICacheService {
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.logger.log('RedisCacheService inicializado');

    // Verifica se o cache manager tem os métodos necessários
    if (
      !this.cacheManager.get ||
      !this.cacheManager.set ||
      !this.cacheManager.del
    ) {
      this.logger.error('Cache manager não possui os métodos necessários');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      this.logger.debug(`Tentando obter dados do cache para chave: ${key}`);
      const value = await this.cacheManager.get<string>(key);

      if (value !== undefined) {
        this.logger.debug(`Cache HIT para chave: ${key}`);
        return JSON.parse(value) as T;
      }

      this.logger.debug(`Cache MISS para chave: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar chave ${key} no cache: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    try {
      if (value === undefined || value === null) {
        this.logger.warn(
          `Tentativa de armazenar valor nulo/indefinido para chave: ${key}`,
        );
        return;
      }

      let stringfyedValue: string;
      try {
        stringfyedValue = JSON.stringify(value);
      } catch (error) {
        this.logger.error(
          `Erro ao serializar valor para chave ${key}: ${error.message}`,
        );
        return;
      }

      this.logger.debug(`Armazenando no cache: ${key} (TTL: ${ttl}s)`);

      await this.cacheManager.set(key, stringfyedValue, ttl * 1000);

      const storedValue = await this.cacheManager.get(key);
      if (storedValue === undefined) {
        this.logger.warn(
          `Valor aparentemente não foi armazenado para chave: ${key}`,
        );
      } else {
        this.logger.debug(`Valor armazenado com sucesso para chave: ${key}`);
      }
    } catch (error) {
      this.logger.error(
        `Erro ao armazenar chave ${key} no cache: ${error.message}`,
        error.stack,
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      this.logger.debug(`Removendo do cache: ${key}`);
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(
        `Erro ao deletar chave ${key} do cache: ${error.message}`,
        error.stack,
      );
    }
  }
}

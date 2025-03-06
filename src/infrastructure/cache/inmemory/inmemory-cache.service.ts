import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ICacheService } from '../../../core/domain/cache/cache-service.interface';

@Injectable()
export class InMemoryCacheService implements ICacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.cacheManager.get<T>(key);
    return value === undefined ? null : value;
  }

  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    await this.cacheManager.set(key, value, ttl * 1000);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}

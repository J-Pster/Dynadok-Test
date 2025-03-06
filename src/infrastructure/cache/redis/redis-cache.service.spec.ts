import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisCacheService } from './redis-cache.service';
import { Logger } from '@nestjs/common';

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve verificar se o cache manager tem os métodos necessários', () => {
      const mockCacheManagerSemMetodos = {};

      // Reinstanciar o serviço com um cache manager sem métodos
      const newService = new RedisCacheService(
        mockCacheManagerSemMetodos as any,
      );

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Cache manager não possui os métodos necessários',
      );
    });
  });

  describe('get', () => {
    it('deve retornar o valor parseado do cache quando encontrado', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockStringifiedData = JSON.stringify(mockData);
      (cacheManager.get as jest.Mock).mockResolvedValue(mockStringifiedData);

      const result = await service.get<{ id: number; name: string }>(
        'test-key',
      );

      expect(cacheManager.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(mockData);
      expect(Logger.prototype.debug).toHaveBeenCalledWith(
        'Tentando obter dados do cache para chave: test-key',
      );
      expect(Logger.prototype.debug).toHaveBeenCalledWith(
        'Cache HIT para chave: test-key',
      );
    });

    it('deve retornar null quando o valor não existe no cache', async () => {
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);

      const result = await service.get('nonexistent-key');

      expect(cacheManager.get).toHaveBeenCalledWith('nonexistent-key');
      expect(result).toBeNull();
      expect(Logger.prototype.debug).toHaveBeenCalledWith(
        'Cache MISS para chave: nonexistent-key',
      );
    });

    it('deve retornar null e logar erro quando ocorre exceção', async () => {
      (cacheManager.get as jest.Mock).mockRejectedValue(
        new Error('Redis connection failed'),
      );

      const result = await service.get('test-key');

      expect(cacheManager.get).toHaveBeenCalledWith('test-key');
      expect(result).toBeNull();
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Erro ao buscar chave test-key no cache: Redis connection failed',
        expect.any(String),
      );
    });
  });

  describe('set', () => {
    it('deve armazenar o valor no cache corretamente', async () => {
      const key = 'test-key';
      const value = { id: 1, name: 'Test' };
      const ttl = 600;

      (cacheManager.set as jest.Mock).mockResolvedValue(undefined);
      (cacheManager.get as jest.Mock).mockResolvedValue(JSON.stringify(value));

      await service.set(key, value, ttl);

      expect(cacheManager.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        ttl * 1000,
      );
      expect(Logger.prototype.debug).toHaveBeenCalledWith(
        `Armazenando no cache: ${key} (TTL: ${ttl}s)`,
      );
      expect(Logger.prototype.debug).toHaveBeenCalledWith(
        `Valor armazenado com sucesso para chave: ${key}`,
      );
    });

    it('deve avisar quando o valor é nulo/indefinido', async () => {
      const key = 'null-key';
      const value = null;

      await service.set(key, value);

      expect(cacheManager.set).not.toHaveBeenCalled();
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        `Tentativa de armazenar valor nulo/indefinido para chave: ${key}`,
      );
    });

    it('deve tratar erro na serialização do valor', async () => {
      const key = 'circular-ref-key';
      const circularValue = {};
      (circularValue as any).self = circularValue;

      const jsonError = new Error('Converting circular structure to JSON');
      jest.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw jsonError;
      });

      await service.set(key, circularValue);

      expect(cacheManager.set).not.toHaveBeenCalled();
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Erro ao serializar valor para chave ${key}: ${jsonError.message}`,
      );

      (JSON.stringify as jest.Mock).mockRestore();
    });

    it('deve tratar erro ao armazenar no cache', async () => {
      const key = 'error-key';
      const value = { id: 1, name: 'Test' };
      const ttl = 300;
      const cacheError = new Error('Cache storage error');

      (cacheManager.set as jest.Mock).mockRejectedValue(cacheError);

      await service.set(key, value, ttl);

      expect(cacheManager.set).toHaveBeenCalledWith(
        key,
        JSON.stringify(value),
        ttl * 1000,
      );
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Erro ao armazenar chave ${key} no cache: ${cacheError.message}`,
        expect.any(String),
      );
    });

    it('deve avisar quando o valor parece não ter sido armazenado', async () => {
      const key = 'unstored-key';
      const value = { id: 1, name: 'Test' };

      (cacheManager.set as jest.Mock).mockResolvedValue(undefined);
      (cacheManager.get as jest.Mock).mockResolvedValue(undefined);

      await service.set(key, value);

      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        `Valor aparentemente não foi armazenado para chave: ${key}`,
      );
    });
  });

  describe('delete', () => {
    it('deve remover valor do cache corretamente', async () => {
      const key = 'delete-key';

      (cacheManager.del as jest.Mock).mockResolvedValue(undefined);

      await service.delete(key);

      expect(cacheManager.del).toHaveBeenCalledWith(key);
      expect(Logger.prototype.debug).toHaveBeenCalledWith(
        `Removendo do cache: ${key}`,
      );
    });

    it('deve tratar erro ao remover valor do cache', async () => {
      const key = 'error-delete-key';
      const deleteError = new Error('Delete operation failed');

      (cacheManager.del as jest.Mock).mockRejectedValue(deleteError);

      await service.delete(key);

      expect(cacheManager.del).toHaveBeenCalledWith(key);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Erro ao deletar chave ${key} do cache: ${deleteError.message}`,
        expect.any(String),
      );
    });
  });
});

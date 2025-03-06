import { Test, TestingModule } from '@nestjs/testing';
import { GetClienteByIdUseCase } from './get-cliente-by-id.use-case';
import { CLIENTE_REPOSITORY } from '../../../domain/repositories/cliente-repository.interface';
import { REDIS_CACHE_SERVICE } from '../../../../infrastructure/cache/cache.module';
import { APP_LOGGER } from '../../../../infrastructure/logger/logger.module';
import { Cliente } from '../../../domain/entities/cliente.entity';

describe('GetClienteByIdUseCase', () => {
  let useCase: GetClienteByIdUseCase;
  let clienteRepositoryMock: any;
  let cacheServiceMock: any;
  let loggerMock: any;

  beforeEach(async () => {
    clienteRepositoryMock = {
      findById: jest.fn(),
    };

    cacheServiceMock = {
      get: jest.fn(),
      set: jest.fn(),
    };

    loggerMock = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClienteByIdUseCase,
        {
          provide: CLIENTE_REPOSITORY,
          useValue: clienteRepositoryMock,
        },
        {
          provide: REDIS_CACHE_SERVICE,
          useValue: cacheServiceMock,
        },
        {
          provide: APP_LOGGER,
          useValue: loggerMock,
        },
      ],
    }).compile();

    useCase = module.get<GetClienteByIdUseCase>(GetClienteByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const clienteId = 'test-client-id';
    const mockCliente = new Cliente({
      id: clienteId,
      nome: 'Test Cliente',
      email: 'test@example.com',
      telefone: '11999999999',
      cpf: '12345678900',
      endereco: 'Test Address',
    });

    it('deve retornar cliente do cache quando disponível', async () => {
      cacheServiceMock.get.mockResolvedValue(mockCliente);

      const result = await useCase.execute(clienteId);

      expect(cacheServiceMock.get).toHaveBeenCalledWith(`cliente:${clienteId}`);
      expect(clienteRepositoryMock.findById).not.toHaveBeenCalled();
      expect(cacheServiceMock.set).not.toHaveBeenCalled();
      expect(loggerMock.log).toHaveBeenCalledWith(
        `Cliente ${clienteId} encontrado no cache`,
        'GetClienteByIdUseCase',
      );

      expect(result).toEqual(mockCliente);
    });

    it('deve buscar cliente do repositório quando não está em cache e armazenar em cache', async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      clienteRepositoryMock.findById.mockResolvedValue(mockCliente);

      const result = await useCase.execute(clienteId);

      expect(cacheServiceMock.get).toHaveBeenCalledWith(`cliente:${clienteId}`);
      expect(clienteRepositoryMock.findById).toHaveBeenCalledWith(clienteId);
      expect(cacheServiceMock.set).toHaveBeenCalledWith(
        `cliente:${clienteId}`,
        mockCliente,
        300,
      );
      expect(loggerMock.log).toHaveBeenCalledWith(
        `Cliente ${clienteId} encontrado no repositório, armazenando em cache`,
        'GetClienteByIdUseCase',
      );

      expect(result).toEqual(mockCliente);
    });

    it('deve retornar null quando cliente não encontrado no cache nem no repositório', async () => {
      cacheServiceMock.get.mockResolvedValue(null);
      clienteRepositoryMock.findById.mockResolvedValue(null);

      const result = await useCase.execute(clienteId);

      expect(cacheServiceMock.get).toHaveBeenCalledWith(`cliente:${clienteId}`);
      expect(clienteRepositoryMock.findById).toHaveBeenCalledWith(clienteId);
      expect(cacheServiceMock.set).not.toHaveBeenCalled();
      expect(loggerMock.warn).toHaveBeenCalledWith(
        `Cliente ${clienteId} não encontrado`,
        'GetClienteByIdUseCase',
      );

      expect(result).toBeNull();
    });
  });
});

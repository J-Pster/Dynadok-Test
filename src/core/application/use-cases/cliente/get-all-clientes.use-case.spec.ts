import { Test, TestingModule } from '@nestjs/testing';
import { GetAllClientesUseCase } from './get-all-clientes.use-case';
import { CLIENTE_REPOSITORY } from '../../../domain/repositories/cliente-repository.interface';
import { Cliente } from '../../../domain/entities/cliente.entity';

describe('GetAllClientesUseCase', () => {
  let useCase: GetAllClientesUseCase;
  let clienteRepositoryMock: any;

  beforeEach(async () => {
    clienteRepositoryMock = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllClientesUseCase,
        {
          provide: CLIENTE_REPOSITORY,
          useValue: clienteRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<GetAllClientesUseCase>(GetAllClientesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('deve retornar todos os clientes', async () => {
      const mockClientes = [
        new Cliente({
          id: 'id1',
          nome: 'Cliente 1',
          email: 'cliente1@example.com',
          telefone: '11999999991',
          cpf: '12345678901',
          endereco: 'Endereço 1',
        }),
        new Cliente({
          id: 'id2',
          nome: 'Cliente 2',
          email: 'cliente2@example.com',
          telefone: '11999999992',
          cpf: '12345678902',
          endereco: 'Endereço 2',
        }),
      ];

      clienteRepositoryMock.findAll.mockResolvedValue(mockClientes);

      const result = await useCase.execute();

      expect(clienteRepositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockClientes);
      expect(result.length).toBe(2);
    });

    it('deve retornar array vazio quando não há clientes', async () => {
      clienteRepositoryMock.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(clienteRepositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
});

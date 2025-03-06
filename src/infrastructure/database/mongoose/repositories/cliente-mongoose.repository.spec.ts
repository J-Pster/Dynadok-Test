import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClienteMongooseRepository } from './cliente-mongoose.repository';
import { Cliente, ClienteDocument } from '../schemas/cliente.schema';
import { Cliente as ClienteEntity } from '../../../../core/domain/entities/cliente.entity';

describe('ClienteMongooseRepository', () => {
  let repository: ClienteMongooseRepository;
  let mockClienteModel: Model<ClienteDocument>;

  const mockCliente = {
    _id: '1234567890',
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '11999999999',
    cpf: '12345678901',
    endereco: 'Rua Teste, 123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Mock simplificado para o modelo Mongoose
    mockClienteModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    } as unknown as Model<ClienteDocument>;

    // Criando o módulo de teste com o repositório
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteMongooseRepository,
        {
          provide: getModelToken(Cliente.name),
          useValue: mockClienteModel,
        },
      ],
    }).compile();

    repository = module.get<ClienteMongooseRepository>(
      ClienteMongooseRepository,
    );
  });

  describe('findByEmail', () => {
    it('deve encontrar um cliente pelo email', async () => {
      // Usando arrow functions para evitar problemas com 'this'
      const mockFindOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockCliente),
      }));

      (mockClienteModel.findOne as jest.Mock) = mockFindOne;

      const result = await repository.findByEmail('joao@email.com');

      expect(mockFindOne).toHaveBeenCalledWith({ email: 'joao@email.com' });
      expect(result).toBeInstanceOf(ClienteEntity);
      expect(result?.id).toBe('1234567890');
      expect(result?.nome).toBe('João Silva');
      expect(result?.email).toBe('joao@email.com');
    });

    it('deve retornar null quando cliente não é encontrado pelo email', async () => {
      // Usando arrow functions para evitar problemas com 'this'
      const mockFindOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      (mockClienteModel.findOne as jest.Mock) = mockFindOne;

      const result = await repository.findByEmail('naoexiste@email.com');

      expect(result).toBeNull();
    });
  });

  describe('findByCpf', () => {
    it('deve encontrar um cliente pelo CPF', async () => {
      // Usando arrow functions para evitar problemas com 'this'
      const mockFindOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockCliente),
      }));

      (mockClienteModel.findOne as jest.Mock) = mockFindOne;

      const result = await repository.findByCpf('12345678901');

      expect(mockFindOne).toHaveBeenCalledWith({ cpf: '12345678901' });
      expect(result).toBeInstanceOf(ClienteEntity);
      expect(result?.id).toBe('1234567890');
      expect(result?.cpf).toBe('12345678901');
    });

    it('deve retornar null quando cliente não é encontrado pelo CPF', async () => {
      // Usando arrow functions para evitar problemas com 'this'
      const mockFindOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      (mockClienteModel.findOne as jest.Mock) = mockFindOne;

      const result = await repository.findByCpf('99999999999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('deve criar um cliente corretamente', async () => {
      const clienteData = {
        nome: 'Maria Silva',
        email: 'maria@email.com',
        telefone: '11988888888',
        cpf: '98765432109',
        endereco: 'Rua Nova, 456',
      };
      const clienteEntity = new ClienteEntity(clienteData);

      // Mockando diretamente o método create do repositório
      jest.spyOn(repository, 'create').mockImplementation(() => {
        return Promise.resolve(
          new ClienteEntity({
            id: '9876543210',
            ...clienteData,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        );
      });

      const result = await repository.create(clienteEntity);

      expect(result).toBeInstanceOf(ClienteEntity);
      expect(result.id).toBe('9876543210');
      expect(result.nome).toBe('Maria Silva');
      expect(result.email).toBe('maria@email.com');
    });
  });

  describe('update', () => {
    it('deve atualizar um cliente corretamente', async () => {
      const id = '1234567890';
      const updateData = {
        nome: 'João Silva Atualizado',
        telefone: '11988887777',
      };

      const updatedDoc = {
        _id: id,
        nome: 'João Silva Atualizado',
        email: 'joao@email.com',
        telefone: '11988887777',
        cpf: '12345678901',
        endereco: 'Rua Teste, 123',
        createdAt: mockCliente.createdAt,
        updatedAt: new Date(),
      };

      // Usando arrow functions para evitar problemas com 'this'
      const mockFindByIdAndUpdate = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(updatedDoc),
      }));

      (mockClienteModel.findByIdAndUpdate as jest.Mock) = mockFindByIdAndUpdate;

      const result = await repository.update(id, updateData);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { $set: { nome: 'João Silva Atualizado', telefone: '11988887777' } },
        { new: true },
      );
      expect(result).toBeInstanceOf(ClienteEntity);
      expect(result.id).toBe(id);
      expect(result.nome).toBe('João Silva Atualizado');
      expect(result.telefone).toBe('11988887777');
    });

    it('deve lançar erro quando o cliente não existe', async () => {
      const id = 'inexistente';
      const updateData = { nome: 'Nome Atualizado' };

      // Usando arrow functions para evitar problemas com 'this'
      const mockFindByIdAndUpdate = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      (mockClienteModel.findByIdAndUpdate as jest.Mock) = mockFindByIdAndUpdate;

      await expect(repository.update(id, updateData)).rejects.toThrow(
        'Entity not found',
      );
    });
  });

  describe('delete', () => {
    it('deve deletar um cliente corretamente', async () => {
      const id = '1234567890';

      // Usando arrow functions para evitar problemas com 'this'
      const mockFindByIdAndDelete = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockCliente),
      }));

      (mockClienteModel.findByIdAndDelete as jest.Mock) = mockFindByIdAndDelete;

      const result = await repository.delete(id);

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it('deve retornar false quando o cliente não existe', async () => {
      const id = 'inexistente';

      // Usando arrow functions para evitar problemas com 'this'
      const mockFindByIdAndDelete = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      (mockClienteModel.findByIdAndDelete as jest.Mock) = mockFindByIdAndDelete;

      const result = await repository.delete(id);

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('deve encontrar um cliente pelo ID', async () => {
      const id = '1234567890';

      // Usando arrow functions para evitar problemas com 'this'
      const mockFindById = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockCliente),
      }));

      (mockClienteModel.findById as jest.Mock) = mockFindById;

      const result = await repository.findById(id);

      expect(mockFindById).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(ClienteEntity);
      expect(result?.id).toBe(id);
      expect(result?.nome).toBe('João Silva');
    });

    it('deve retornar null quando cliente não é encontrado pelo ID', async () => {
      const id = 'inexistente';

      // Usando arrow functions para evitar problemas com 'this'
      const mockFindById = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      (mockClienteModel.findById as jest.Mock) = mockFindById;

      const result = await repository.findById(id);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os clientes', async () => {
      const clientes = [
        mockCliente,
        {
          _id: '0987654321',
          nome: 'Maria Silva',
          email: 'maria@email.com',
          telefone: '11988888888',
          cpf: '98765432109',
          endereco: 'Rua Nova, 456',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Usando arrow functions para evitar problemas com 'this'
      const mockFind = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(clientes),
      }));

      (mockClienteModel.find as jest.Mock) = mockFind;

      const results = await repository.findAll();

      expect(mockFind).toHaveBeenCalled();
      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(ClienteEntity);
      expect(results[0].id).toBe('1234567890');
      expect(results[1].id).toBe('0987654321');
    });

    it('deve retornar array vazio quando não existem clientes', async () => {
      // Usando arrow functions para evitar problemas com 'this'
      const mockFind = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue([]),
      }));

      (mockClienteModel.find as jest.Mock) = mockFind;

      const results = await repository.findAll();

      expect(results).toEqual([]);
    });
  });

  describe('métodos de mapeamento', () => {
    it('deve mapear corretamente de documento para entidade (mapTo)', () => {
      // Clone do repositório para testes em um objeto seguro
      const repoMethods = {
        mapTo: (repository as any).mapTo.bind(repository),
      };

      const result = repoMethods.mapTo(mockCliente);

      expect(result).toBeInstanceOf(ClienteEntity);
      expect(result.id).toBe('1234567890');
      expect(result.nome).toBe('João Silva');
      expect(result.email).toBe('joao@email.com');
      expect(result.telefone).toBe('11999999999');
      expect(result.cpf).toBe('12345678901');
      expect(result.endereco).toBe('Rua Teste, 123');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('deve mapear corretamente de entidade para documento (mapFrom)', () => {
      // Clone do repositório para testes em um objeto seguro
      const repoMethods = {
        mapFrom: (repository as any).mapFrom.bind(repository),
      };

      const clienteEntity = new ClienteEntity({
        id: '1234567890',
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '11999999999',
        cpf: '12345678901',
        endereco: 'Rua Teste, 123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      });

      const result = repoMethods.mapFrom(clienteEntity);

      expect(result).toEqual({
        nome: 'João Silva',
        email: 'joao@email.com',
        telefone: '11999999999',
        cpf: '12345678901',
        endereco: 'Rua Teste, 123',
        createdAt: clienteEntity.createdAt,
        updatedAt: clienteEntity.updatedAt,
      });
      // Verifica que o id não está presente no mapeamento (não deve ser enviado ao banco)
      expect(result.id).toBeUndefined();
    });

    it('deve mapear apenas propriedades definidas no mapFrom', () => {
      // Clone do repositório para testes em um objeto seguro
      const repoMethods = {
        mapFrom: (repository as any).mapFrom.bind(repository),
      };

      const clienteParcial = {
        nome: 'João Silva',
        email: 'joao@email.com',
      };

      const result = repoMethods.mapFrom(clienteParcial);

      expect(result).toEqual({
        nome: 'João Silva',
        email: 'joao@email.com',
      });
      expect(result.telefone).toBeUndefined();
      expect(result.cpf).toBeUndefined();
    });
  });
});

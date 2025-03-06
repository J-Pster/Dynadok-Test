import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CreateClienteUseCase } from './create-cliente.use-case';
import { CLIENTE_REPOSITORY } from '../../../domain/repositories/cliente-repository.interface';
import { MESSAGING_SERVICE } from '../../../domain/messaging/messaging-service.interface';
import { Cliente } from '../../../domain/entities/cliente.entity';
import { CreateClienteDto } from '../../dtos/cliente.dto';

describe('CreateClienteUseCase', () => {
  let useCase: CreateClienteUseCase;
  let clienteRepositoryMock: any;
  let messagingServiceMock: any;

  beforeEach(async () => {
    clienteRepositoryMock = {
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
      create: jest.fn(),
    };

    messagingServiceMock = {
      sendMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClienteUseCase,
        {
          provide: CLIENTE_REPOSITORY,
          useValue: clienteRepositoryMock,
        },
        {
          provide: MESSAGING_SERVICE,
          useValue: messagingServiceMock,
        },
      ],
    }).compile();

    useCase = module.get<CreateClienteUseCase>(CreateClienteUseCase);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createClienteDto: CreateClienteDto = {
      nome: 'Test Cliente',
      email: 'test@example.com',
      telefone: '11999999999',
      cpf: '12345678900',
      endereco: 'Test Address',
    };

    const mockCliente = new Cliente({
      nome: createClienteDto.nome,
      email: createClienteDto.email,
      telefone: createClienteDto.telefone,
      cpf: createClienteDto.cpf,
      endereco: createClienteDto.endereco,
    });

    it('deve criar um cliente com sucesso', async () => {
      clienteRepositoryMock.findByEmail.mockResolvedValue(null);
      clienteRepositoryMock.findByCpf.mockResolvedValue(null);

      const createdCliente = { ...mockCliente, id: 'generated-id' };
      clienteRepositoryMock.create.mockResolvedValue(createdCliente);

      messagingServiceMock.sendMessage.mockResolvedValue(undefined);

      const result = await useCase.execute(createClienteDto);

      expect(clienteRepositoryMock.findByEmail).toHaveBeenCalledWith(
        createClienteDto.email,
      );
      expect(clienteRepositoryMock.findByCpf).toHaveBeenCalledWith(
        createClienteDto.cpf,
      );
      expect(clienteRepositoryMock.create).toHaveBeenCalled();

      expect(messagingServiceMock.sendMessage).toHaveBeenCalledWith(
        'cliente-criado',
        expect.objectContaining({
          id: createdCliente.id,
          nome: createdCliente.nome,
          email: createdCliente.email,
        }),
        createdCliente.id,
      );

      expect(result).toBe(createdCliente);
    });

    it('deve lançar erro se o email já existe', async () => {
      clienteRepositoryMock.findByEmail.mockResolvedValue({
        id: 'existing-id',
        email: createClienteDto.email,
      });

      await expect(useCase.execute(createClienteDto)).rejects.toThrow(
        'Cliente com este email já existe',
      );

      expect(clienteRepositoryMock.create).not.toHaveBeenCalled();
      expect(messagingServiceMock.sendMessage).not.toHaveBeenCalled();
    });

    it('deve lançar erro se o CPF já existe', async () => {
      clienteRepositoryMock.findByEmail.mockResolvedValue(null);
      clienteRepositoryMock.findByCpf.mockResolvedValue({
        id: 'existing-id',
        cpf: createClienteDto.cpf,
      });

      await expect(useCase.execute(createClienteDto)).rejects.toThrow(
        'Cliente com este CPF já existe',
      );

      expect(clienteRepositoryMock.create).not.toHaveBeenCalled();
      expect(messagingServiceMock.sendMessage).not.toHaveBeenCalled();
    });

    it('deve criar cliente mesmo se ocorrer erro no envio da mensagem', async () => {
      clienteRepositoryMock.findByEmail.mockResolvedValue(null);
      clienteRepositoryMock.findByCpf.mockResolvedValue(null);

      const createdCliente = { ...mockCliente, id: 'generated-id' };
      clienteRepositoryMock.create.mockResolvedValue(createdCliente);

      messagingServiceMock.sendMessage.mockRejectedValue(
        new Error('Messaging error'),
      );

      const result = await useCase.execute(createClienteDto);

      expect(clienteRepositoryMock.create).toHaveBeenCalled();
      expect(messagingServiceMock.sendMessage).toHaveBeenCalled();
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Erro ao enviar mensagem para Kafka:',
        expect.any(Error),
      );

      expect(result).toBe(createdCliente);
    });
  });
});

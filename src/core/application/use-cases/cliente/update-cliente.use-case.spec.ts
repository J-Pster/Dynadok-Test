import { Test, TestingModule } from '@nestjs/testing';
import { UpdateClienteUseCase } from './update-cliente.use-case';
import { CLIENTE_REPOSITORY } from '../../../domain/repositories/cliente-repository.interface';
import { Cliente } from '../../../domain/entities/cliente.entity';
import { UpdateClienteDto } from '../../dtos/cliente.dto';

describe('UpdateClienteUseCase', () => {
  let useCase: UpdateClienteUseCase;
  let clienteRepositoryMock: any;

  beforeEach(async () => {
    clienteRepositoryMock = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClienteUseCase,
        {
          provide: CLIENTE_REPOSITORY,
          useValue: clienteRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<UpdateClienteUseCase>(UpdateClienteUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const clienteId = 'test-client-id';
    const mockCliente = new Cliente({
      id: clienteId,
      nome: 'Original Nome',
      email: 'original@example.com',
      telefone: '11999999999',
      cpf: '12345678900',
      endereco: 'Endereço Original',
    });

    it('deve atualizar cliente com sucesso', async () => {
      const updateDto: UpdateClienteDto = {
        nome: 'Nome Atualizado',
        endereco: 'Endereço Atualizado',
      };

      const updatedCliente = new Cliente({
        id: clienteId,
        nome: 'Nome Atualizado',
        email: mockCliente.email,
        telefone: mockCliente.telefone,
        cpf: mockCliente.cpf,
        endereco: 'Endereço Atualizado',
      });

      clienteRepositoryMock.findById.mockResolvedValue(mockCliente);
      clienteRepositoryMock.update.mockResolvedValue(updatedCliente);

      jest.spyOn(mockCliente, 'update');

      const result = await useCase.execute(clienteId, updateDto);

      expect(clienteRepositoryMock.findById).toHaveBeenCalledWith(clienteId);
      expect(mockCliente.update).toHaveBeenCalledWith(updateDto);
      expect(clienteRepositoryMock.update).toHaveBeenCalledWith(
        clienteId,
        mockCliente,
      );

      expect(result).toEqual(updatedCliente);
    });

    it('deve lançar erro se o cliente não for encontrado', async () => {
      clienteRepositoryMock.findById.mockResolvedValue(null);

      const updateDto: UpdateClienteDto = {
        nome: 'Nome Atualizado',
      };

      await expect(useCase.execute(clienteId, updateDto)).rejects.toThrow(
        'Cliente não encontrado',
      );

      expect(clienteRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve verificar duplicidade de email e atualizar se não houver conflito', async () => {
      const updateDto: UpdateClienteDto = {
        email: 'novo@example.com',
      };

      clienteRepositoryMock.findById.mockResolvedValue(mockCliente);
      clienteRepositoryMock.findByEmail.mockResolvedValue(null);

      const updatedCliente = new Cliente({
        id: clienteId,
        nome: mockCliente.nome,
        email: 'novo@example.com',
        telefone: mockCliente.telefone,
        cpf: mockCliente.cpf,
        endereco: mockCliente.endereco,
      });

      clienteRepositoryMock.update.mockResolvedValue(updatedCliente);

      const result = await useCase.execute(clienteId, updateDto);

      expect(clienteRepositoryMock.findByEmail).toHaveBeenCalledWith(
        updateDto.email,
      );
      expect(clienteRepositoryMock.update).toHaveBeenCalled();
      expect(result.email).toBe('novo@example.com');
    });

    it('deve lançar erro se o email já existe para outro cliente', async () => {
      const updateDto: UpdateClienteDto = {
        email: 'existente@example.com',
      };

      clienteRepositoryMock.findById.mockResolvedValue(mockCliente);

      clienteRepositoryMock.findByEmail.mockResolvedValue({
        id: 'outro-cliente-id',
        email: 'existente@example.com',
      });

      await expect(useCase.execute(clienteId, updateDto)).rejects.toThrow(
        'Cliente com este email já existe',
      );

      expect(clienteRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve verificar duplicidade de CPF e atualizar se não houver conflito', async () => {
      const updateDto: UpdateClienteDto = {
        cpf: '98765432100',
      };

      clienteRepositoryMock.findById.mockResolvedValue(mockCliente);
      clienteRepositoryMock.findByCpf.mockResolvedValue(null);

      const updatedCliente = new Cliente({
        id: clienteId,
        nome: mockCliente.nome,
        email: mockCliente.email,
        telefone: mockCliente.telefone,
        cpf: '98765432100',
        endereco: mockCliente.endereco,
      });

      clienteRepositoryMock.update.mockResolvedValue(updatedCliente);

      const result = await useCase.execute(clienteId, updateDto);

      expect(clienteRepositoryMock.findByCpf).toHaveBeenCalledWith(
        updateDto.cpf,
      );
      expect(clienteRepositoryMock.update).toHaveBeenCalled();
      expect(result.cpf).toBe('98765432100');
    });

    it('deve lançar erro se o CPF já existe para outro cliente', async () => {
      const updateDto: UpdateClienteDto = {
        cpf: '98765432100',
      };

      clienteRepositoryMock.findById.mockResolvedValue(mockCliente);

      clienteRepositoryMock.findByCpf.mockResolvedValue({
        id: 'outro-cliente-id',
        cpf: '98765432100',
      });

      await expect(useCase.execute(clienteId, updateDto)).rejects.toThrow(
        'Cliente com este CPF já existe',
      );

      expect(clienteRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('deve permitir atualização com o mesmo email do cliente atual', async () => {
      const updateDto: UpdateClienteDto = {
        email: mockCliente.email,
        nome: 'Nome Atualizado',
      };

      clienteRepositoryMock.findById.mockResolvedValue(mockCliente);

      clienteRepositoryMock.findByEmail.mockResolvedValue({
        id: clienteId,
        email: mockCliente.email,
      });

      const updatedCliente = new Cliente({
        id: clienteId,
        nome: 'Nome Atualizado',
        email: mockCliente.email,
        telefone: mockCliente.telefone,
        cpf: mockCliente.cpf,
        endereco: mockCliente.endereco,
      });

      clienteRepositoryMock.update.mockResolvedValue(updatedCliente);

      const result = await useCase.execute(clienteId, updateDto);

      expect(clienteRepositoryMock.update).toHaveBeenCalled();
      expect(result.nome).toBe('Nome Atualizado');
    });
  });
});

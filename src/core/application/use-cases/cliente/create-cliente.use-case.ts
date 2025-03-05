import { Inject, Injectable } from '@nestjs/common';
import { Cliente } from '../../../domain/entities/cliente.entity';
import {
  CLIENTE_REPOSITORY,
  ClienteRepository,
} from '../../../domain/repositories/cliente-repository.interface';
import { CreateClienteDto } from '../../dtos/cliente.dto';

@Injectable()
export class CreateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const existingClienteEmail = await this.clienteRepository.findByEmail(
      createClienteDto.email,
    );
    if (existingClienteEmail) {
      throw new Error('Cliente com este email já existe');
    }

    const existingClienteCpf = await this.clienteRepository.findByCpf(
      createClienteDto.cpf,
    );
    if (existingClienteCpf) {
      throw new Error('Cliente com este CPF já existe');
    }

    const cliente = new Cliente({
      nome: createClienteDto.nome,
      email: createClienteDto.email,
      telefone: createClienteDto.telefone,
      cpf: createClienteDto.cpf,
      endereco: createClienteDto.endereco,
    });

    return this.clienteRepository.create(cliente);
  }
}

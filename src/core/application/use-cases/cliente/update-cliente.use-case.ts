import { Inject, Injectable } from '@nestjs/common';
import { Cliente } from '../../../domain/entities/cliente.entity';
import {
  CLIENTE_REPOSITORY,
  ClienteRepository,
} from '../../../domain/repositories/cliente-repository.interface';
import { UpdateClienteDto } from '../../dtos/cliente.dto';

@Injectable()
export class UpdateClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute(
    id: string,
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    if (updateClienteDto.email) {
      const existingClienteEmail = await this.clienteRepository.findByEmail(
        updateClienteDto.email,
      );
      if (existingClienteEmail && existingClienteEmail.id !== id) {
        throw new Error('Cliente com este email já existe');
      }
    }

    if (updateClienteDto.cpf) {
      const existingClienteCpf = await this.clienteRepository.findByCpf(
        updateClienteDto.cpf,
      );
      if (existingClienteCpf && existingClienteCpf.id !== id) {
        throw new Error('Cliente com este CPF já existe');
      }
    }

    cliente.update(updateClienteDto);
    return this.clienteRepository.update(id, cliente);
  }
}

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cliente } from '../../../domain/entities/cliente.entity';
import {
  CLIENTE_REPOSITORY,
  ClienteRepository,
} from '../../../domain/repositories/cliente-repository.interface';

@Injectable()
export class GetClienteByIdUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
  ) {}

  async execute(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findById(id);
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return cliente;
  }
}

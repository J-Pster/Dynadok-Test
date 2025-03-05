import { Cliente } from '../entities/cliente.entity';
import { BaseRepository } from './base-repository.interface';

export const CLIENTE_REPOSITORY = 'CLIENTE_REPOSITORY';

export interface ClienteRepository extends BaseRepository<Cliente> {
  findByEmail(email: string): Promise<Cliente | null>;
  findByCpf(cpf: string): Promise<Cliente | null>;
}

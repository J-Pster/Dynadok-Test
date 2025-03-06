import { Inject, Injectable } from '@nestjs/common';
import { Cliente } from '../../../domain/entities/cliente.entity';
import {
  CLIENTE_REPOSITORY,
  ClienteRepository,
} from '../../../domain/repositories/cliente-repository.interface';
import { ICacheService } from '../../../domain/cache/cache-service.interface';
import { REDIS_CACHE_SERVICE } from '../../../../infrastructure/cache/cache.module';
import { APP_LOGGER } from '../../../../infrastructure/logger/logger.module';
import { LoggerService } from '@nestjs/common';

@Injectable()
export class GetClienteByIdUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: ClienteRepository,
    @Inject(REDIS_CACHE_SERVICE)
    private readonly cacheService: ICacheService,
    @Inject(APP_LOGGER)
    private readonly logger: LoggerService,
  ) {}

  async execute(id: string): Promise<Cliente | null> {
    this.logger.log(`Buscando cliente com ID: ${id}`, 'GetClienteByIdUseCase');

    // Tenta buscar do cache primeiro
    const cacheKey = `cliente:${id}`;
    const cachedCliente = await this.cacheService.get<Cliente>(cacheKey);

    if (cachedCliente) {
      this.logger.log(
        `Cliente ${id} encontrado no cache`,
        'GetClienteByIdUseCase',
      );
      return cachedCliente;
    }

    this.logger.log(
      `Cache miss para cliente ${id}, buscando no repositório`,
      'GetClienteByIdUseCase',
    );

    // Se não estiver em cache, busca do repositório
    const cliente = await this.clienteRepository.findById(id);

    if (cliente) {
      this.logger.log(
        `Cliente ${id} encontrado no repositório, armazenando em cache`,
        'GetClienteByIdUseCase',
      );
      // Armazena no cache para futuras consultas (TTL de 5 minutos)
      await this.cacheService.set(cacheKey, cliente, 300);
    } else {
      this.logger.warn(`Cliente ${id} não encontrado`, 'GetClienteByIdUseCase');
    }

    return cliente;
  }
}

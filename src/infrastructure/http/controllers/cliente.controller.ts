import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateClienteDto,
  UpdateClienteDto,
} from '../../../core/application/dtos/cliente.dto';
import { CreateClienteUseCase } from '../../../core/application/use-cases/cliente/create-cliente.use-case';
import { GetAllClientesUseCase } from '../../../core/application/use-cases/cliente/get-all-clientes.use-case';
import { GetClienteByIdUseCase } from '../../../core/application/use-cases/cliente/get-cliente-by-id.use-case';
import { UpdateClienteUseCase } from '../../../core/application/use-cases/cliente/update-cliente.use-case';
import { ICacheService } from '../../../core/domain/cache/cache-service.interface';
import { INMEMORY_CACHE_SERVICE } from '../../../infrastructure/cache/cache.module';

@Controller('clientes')
export class ClienteController {
  constructor(
    private readonly createClienteUseCase: CreateClienteUseCase,
    private readonly updateClienteUseCase: UpdateClienteUseCase,
    private readonly getClienteByIdUseCase: GetClienteByIdUseCase,
    private readonly getAllClientesUseCase: GetAllClientesUseCase,
    @Inject(INMEMORY_CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  @Post()
  async create(@Body() createClienteDto: CreateClienteDto) {
    try {
      return await this.createClienteUseCase.execute(createClienteDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao criar cliente',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    try {
      // Remover do cache ao atualizar
      await this.cacheService.delete(`cliente:${id}`);
      return await this.updateClienteUseCase.execute(id, updateClienteDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao atualizar cliente',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.getClienteByIdUseCase.execute(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Cliente não encontrado',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.getAllClientesUseCase.execute();
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar clientes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

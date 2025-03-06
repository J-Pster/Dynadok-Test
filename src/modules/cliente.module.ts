import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClienteSchema } from '../infrastructure/database/mongoose/schemas/cliente.schema';
import { ClienteController } from '../infrastructure/http/controllers/cliente.controller';
import { ClienteMongooseRepository } from '../infrastructure/database/mongoose/repositories/cliente-mongoose.repository';
import {
  ClienteRepository,
  CLIENTE_REPOSITORY,
} from '../core/domain/repositories/cliente-repository.interface';
import { CreateClienteUseCase } from '../core/application/use-cases/cliente/create-cliente.use-case';
import { GetAllClientesUseCase } from '../core/application/use-cases/cliente/get-all-clientes.use-case';
import { GetClienteByIdUseCase } from '../core/application/use-cases/cliente/get-cliente-by-id.use-case';
import { UpdateClienteUseCase } from '../core/application/use-cases/cliente/update-cliente.use-case';
import {
  CacheManagerModule,
  INMEMORY_CACHE_SERVICE,
} from '../infrastructure/cache/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Cliente', schema: ClienteSchema }]),
    CacheManagerModule,
  ],
  controllers: [ClienteController],
  providers: [
    {
      provide: CLIENTE_REPOSITORY,
      useClass: ClienteMongooseRepository,
    },
    CreateClienteUseCase,
    GetAllClientesUseCase,
    GetClienteByIdUseCase,
    UpdateClienteUseCase,
  ],
})
export class ClienteModule {}

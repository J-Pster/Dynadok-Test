import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateClienteUseCase } from '../core/application/use-cases/cliente/create-cliente.use-case';
import { GetAllClientesUseCase } from '../core/application/use-cases/cliente/get-all-clientes.use-case';
import { GetClienteByIdUseCase } from '../core/application/use-cases/cliente/get-cliente-by-id.use-case';
import { UpdateClienteUseCase } from '../core/application/use-cases/cliente/update-cliente.use-case';
import { CLIENTE_REPOSITORY } from '../core/domain/repositories/cliente-repository.interface';
import {
  Cliente,
  ClienteSchema,
} from '../infrastructure/database/mongoose/schemas/cliente.schema';
import { ClienteMongooseRepository } from '../infrastructure/database/mongoose/repositories/cliente-mongoose.repository';
import { ClienteController } from '../infrastructure/http/controllers/cliente.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cliente.name, schema: ClienteSchema }]),
  ],
  controllers: [ClienteController],
  providers: [
    {
      provide: CLIENTE_REPOSITORY,
      useClass: ClienteMongooseRepository,
    },
    CreateClienteUseCase,
    UpdateClienteUseCase,
    GetClienteByIdUseCase,
    GetAllClientesUseCase,
  ],
})
export class ClienteModule {}

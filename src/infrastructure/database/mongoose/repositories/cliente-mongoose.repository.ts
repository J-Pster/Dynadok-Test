import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cliente as ClienteEntity } from '../../../../core/domain/entities/cliente.entity';
import { ClienteRepository } from '../../../../core/domain/repositories/cliente-repository.interface';
import { Cliente, ClienteDocument } from '../schemas/cliente.schema';
import { BaseMongooseRepository } from './base-mongoose.repository';

@Injectable()
export class ClienteMongooseRepository
  extends BaseMongooseRepository<ClienteEntity, ClienteDocument>
  implements ClienteRepository
{
  constructor(@InjectModel(Cliente.name) model: Model<ClienteDocument>) {
    super(model);
  }

  async findByEmail(email: string): Promise<ClienteEntity | null> {
    const cliente = await this.model.findOne({ email }).exec();
    if (!cliente) {
      return null;
    }
    return this.mapTo(cliente);
  }

  async findByCpf(cpf: string): Promise<ClienteEntity | null> {
    const cliente = await this.model.findOne({ cpf }).exec();
    if (!cliente) {
      return null;
    }
    return this.mapTo(cliente);
  }

  protected mapTo(document: ClienteDocument): ClienteEntity {
    const { _id, nome, email, telefone, cpf, endereco, createdAt, updatedAt } =
      document;

    return new ClienteEntity({
      id: _id.toString(),
      nome,
      email,
      telefone,
      cpf,
      endereco,
      createdAt,
      updatedAt,
    });
  }

  protected mapFrom(
    item: Partial<ClienteEntity> | ClienteEntity,
  ): Record<string, any> {
    const mapped: Record<string, any> = {};

    if ('nome' in item && item.nome !== undefined) mapped.nome = item.nome;
    if ('email' in item && item.email !== undefined) mapped.email = item.email;
    if ('telefone' in item && item.telefone !== undefined)
      mapped.telefone = item.telefone;
    if ('cpf' in item && item.cpf !== undefined) mapped.cpf = item.cpf;
    if ('endereco' in item && item.endereco !== undefined)
      mapped.endereco = item.endereco;
    if ('createdAt' in item && item.createdAt !== undefined)
      mapped.createdAt = item.createdAt;
    if ('updatedAt' in item && item.updatedAt !== undefined)
      mapped.updatedAt = item.updatedAt;

    return mapped;
  }
}

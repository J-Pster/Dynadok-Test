import { Document, Model } from 'mongoose';
import { BaseRepository } from '../../../../core/domain/repositories/base-repository.interface';

export abstract class BaseMongooseRepository<T, TDocument extends Document>
  implements BaseRepository<T>
{
  constructor(protected readonly model: Model<TDocument>) {}

  async create(item: T): Promise<T> {
    const created = new this.model(this.mapFrom(item));
    const saved = await created.save();
    return this.mapTo(saved as TDocument);
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    // Convertemos o item para formato compatível com o documento
    const itemToUpdate = this.mapFrom(item);

    const updated = await this.model
      .findByIdAndUpdate(
        id,
        // Usamos cast para resolver o problema de tipagem
        { $set: itemToUpdate } as any,
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new Error('Entity not found');
    }
    return this.mapTo(updated as TDocument);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findById(id: string): Promise<T | null> {
    const entity = await this.model.findById(id).exec();
    if (!entity) {
      return null as unknown as T; // Cast explícito para resolver problema de tipagem
    }
    return this.mapTo(entity as TDocument);
  }

  async findAll(): Promise<T[]> {
    const entities = await this.model.find().exec();
    return entities.map((entity) => this.mapTo(entity as TDocument));
  }

  // Método para mapear da entidade de domínio para documento do Mongoose
  protected abstract mapTo(document: TDocument): T;

  // Método para mapear do objeto de domínio para formato compatível com Mongoose
  protected mapFrom(item: Partial<T> | T): Record<string, any> {
    // Por padrão, apenas retorna o item como um objeto simples
    return item as unknown as Record<string, any>;
  }
}

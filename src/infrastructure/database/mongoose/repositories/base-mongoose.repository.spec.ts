import { Document, Model } from 'mongoose';
import { BaseMongooseRepository } from './base-mongoose.repository';

class TestEntity {
  id?: string;
  name: string;
  value: number;

  constructor(data?: Partial<TestEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

interface TestDocument extends Document {
  name: string;
  value: number;
}

class TestRepository extends BaseMongooseRepository<TestEntity, TestDocument> {
  protected mapTo(document: TestDocument): TestEntity {
    return new TestEntity({
      id: document._id.toString(),
      name: document.name,
      value: document.value,
    });
  }

  protected mapFrom(item: Partial<TestEntity>): Record<string, any> {
    const mapped: Record<string, any> = {};
    if ('name' in item && item.name !== undefined) mapped.name = item.name;
    if ('value' in item && item.value !== undefined) mapped.value = item.value;
    return mapped;
  }
}

describe('BaseMongooseRepository', () => {
  let repository: TestRepository;
  let mockModel: Model<TestDocument>;
  let mockExecFn: jest.Mock;

  beforeEach(() => {
    mockExecFn = jest.fn();

    mockModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findByIdAndUpdate: jest.fn().mockReturnThis(),
      findByIdAndDelete: jest.fn().mockReturnThis(),
      exec: mockExecFn,
    } as unknown as Model<TestDocument>;

    repository = new TestRepository(mockModel);
  });

  describe('create', () => {
    it('deve criar uma entidade corretamente', async () => {
      jest.spyOn(repository, 'create').mockImplementation(() => {
        return Promise.resolve(
          new TestEntity({
            id: 'some-id',
            name: 'Test Entity',
            value: 42,
          }),
        );
      });

      const entity = new TestEntity({ name: 'Test Entity', value: 42 });
      const result = await repository.create(entity);

      expect(result).toBeInstanceOf(TestEntity);
      expect(result.id).toBe('some-id');
      expect(result.name).toBe('Test Entity');
      expect(result.value).toBe(42);
    });
  });

  describe('update', () => {
    it('deve atualizar uma entidade existente', async () => {
      const id = 'existing-id';
      const updateData = { name: 'Updated Name' };

      const updatedDoc = {
        _id: id,
        name: 'Updated Name',
        value: 42,
      };

      const mockFindByIdAndUpdate = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(updatedDoc),
      }));

      (mockModel.findByIdAndUpdate as jest.Mock) = mockFindByIdAndUpdate;

      const result = await repository.update(id, updateData);

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { $set: { name: 'Updated Name' } },
        { new: true },
      );
      expect(result).toBeInstanceOf(TestEntity);
      expect(result.id).toBe(id);
      expect(result.name).toBe('Updated Name');
    });

    it('deve lançar erro quando entidade não existe', async () => {
      const id = 'non-existing-id';

      const mockFindByIdAndUpdate = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      (mockModel.findByIdAndUpdate as jest.Mock) = mockFindByIdAndUpdate;

      await expect(
        repository.update(id, { name: 'Updated Name' }),
      ).rejects.toThrow('Entity not found');
    });
  });

  describe('delete', () => {
    it('deve retornar true quando a entidade é deletada', async () => {
      const id = 'existing-id';
      const deletedDoc = {
        _id: id,
        name: 'Entity to delete',
        value: 42,
      };

      const mockFindByIdAndDelete = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(deletedDoc),
      }));

      (mockModel.findByIdAndDelete as jest.Mock) = mockFindByIdAndDelete;

      const result = await repository.delete(id);

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toBe(true);
    });

    it('deve retornar false quando a entidade não existe', async () => {
      const id = 'non-existing-id';

      const mockFindByIdAndDelete = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      (mockModel.findByIdAndDelete as jest.Mock) = mockFindByIdAndDelete;

      const result = await repository.delete(id);

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('deve encontrar uma entidade pelo id', async () => {
      const id = 'existing-id';
      const foundDoc = {
        _id: id,
        name: 'Found Entity',
        value: 42,
      };

      const mockFindById = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(foundDoc),
      }));

      (mockModel.findById as jest.Mock) = mockFindById;

      const result = await repository.findById(id);

      expect(mockFindById).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(TestEntity);
      expect(result?.id).toBe(id);
      expect(result?.name).toBe('Found Entity');
      expect(result?.value).toBe(42);
    });

    it('deve retornar null quando entidade não existe', async () => {
      const id = 'non-existing-id';

      const mockFindById = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      (mockModel.findById as jest.Mock) = mockFindById;

      const result = await repository.findById(id);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de entidades', async () => {
      const entities = [
        { _id: 'id1', name: 'Entity 1', value: 1 },
        { _id: 'id2', name: 'Entity 2', value: 2 },
      ];

      const mockFind = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(entities),
      }));

      (mockModel.find as jest.Mock) = mockFind;

      const results = await repository.findAll();

      expect(mockFind).toHaveBeenCalled();
      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(TestEntity);
      expect(results[0].id).toBe('id1');
      expect(results[1].id).toBe('id2');
      expect(results[0].name).toBe('Entity 1');
      expect(results[1].name).toBe('Entity 2');
    });

    it('deve retornar array vazio quando não existem entidades', async () => {
      const mockFind = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue([]),
      }));

      (mockModel.find as jest.Mock) = mockFind;

      const results = await repository.findAll();

      expect(results).toEqual([]);
    });
  });
});

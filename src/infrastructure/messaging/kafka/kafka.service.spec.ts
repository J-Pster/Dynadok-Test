import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { KafkaService } from './kafka.service';
import { Logger } from '@nestjs/common';

jest.mock('kafkajs', () => {
  const mockConnect = jest.fn().mockResolvedValue(undefined);
  const mockDisconnect = jest.fn().mockResolvedValue(undefined);
  const mockSend = jest.fn().mockResolvedValue({
    success: true,
    recordMetadata: {},
  });
  const mockCreateTopics = jest.fn().mockResolvedValue({});
  const mockListTopics = jest.fn().mockResolvedValue(['existing-topic']);
  const mockAdminConnect = jest.fn().mockResolvedValue(undefined);
  const mockAdminDisconnect = jest.fn().mockResolvedValue(undefined);

  return {
    Kafka: jest.fn().mockImplementation(() => ({
      producer: jest.fn().mockReturnValue({
        connect: mockConnect,
        disconnect: mockDisconnect,
        send: mockSend,
      }),
      consumer: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        subscribe: jest.fn().mockResolvedValue(undefined),
        run: jest.fn().mockResolvedValue(undefined),
      }),
      admin: jest.fn().mockImplementation(() => ({
        connect: mockAdminConnect,
        disconnect: mockAdminDisconnect,
        createTopics: mockCreateTopics,
        listTopics: mockListTopics,
      })),
    })),
  };
});

describe('KafkaService', () => {
  let service: KafkaService;
  let configService: ConfigService;
  let mockProducer: any;
  let mockAdmin: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key, defaultValue) => {
              if (key === 'KAFKA_BROKERS') return 'localhost:9092';
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<KafkaService>(KafkaService);
    configService = module.get<ConfigService>(ConfigService);

    mockProducer = (service as any).producer;
    mockAdmin = (service as any).kafka.admin();

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Inicialização', () => {
    it('deve criar a instância corretamente com os brokers do config', () => {
      expect(service).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith(
        'KAFKA_BROKERS',
        'localhost:9092',
      );
    });

    it('deve inicializar produtor e consumer ao criar instância', () => {
      expect((service as any).producer).toBeDefined();
      expect((service as any).kafka).toBeDefined();
    });
  });

  describe('onModuleInit', () => {
    it('deve chamar connect ao inicializar o módulo', async () => {
      const connectSpy = jest.spyOn(service as any, 'connect');
      await service.onModuleInit();
      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('deve chamar disconnect ao destruir o módulo', async () => {
      const disconnectSpy = jest.spyOn(service as any, 'disconnect');
      await service.onModuleDestroy();
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('connect', () => {
    it('deve conectar o producer e criar tópicos', async () => {
      await (service as any).connect();
      expect(mockProducer.connect).toHaveBeenCalled();
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Kafka producer conectado com sucesso',
      );
    });

    it('deve criar tópicos se não existirem', async () => {
      await (service as any).connect();
      expect(mockAdmin.connect).toHaveBeenCalled();
      expect(mockAdmin.listTopics).toHaveBeenCalled();
      expect(mockAdmin.disconnect).toHaveBeenCalled();
    });

    it('deve lidar com erros na conexão', async () => {
      mockProducer.connect.mockRejectedValueOnce(new Error('Erro de conexão'));
      await expect((service as any).connect()).rejects.toThrow(
        'Erro de conexão',
      );
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Falha ao conectar ao Kafka:',
        expect.any(Error),
      );
    });
  });

  describe('disconnect', () => {
    it('deve desconectar o producer', async () => {
      await (service as any).disconnect();
      expect(mockProducer.disconnect).toHaveBeenCalled();
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Kafka producer desconectado com sucesso',
      );
    });

    it('deve lidar com erros na desconexão', async () => {
      mockProducer.disconnect.mockRejectedValueOnce(
        new Error('Erro na desconexão'),
      );
      await (service as any).disconnect();
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Erro ao desconectar Kafka producer:',
        expect.any(Error),
      );
    });
  });

  describe('createTopicsIfNotExist', () => {
    it('deve criar tópicos que não existem', async () => {
      mockAdmin.listTopics.mockResolvedValueOnce([]);

      await (service as any).createTopicsIfNotExist();

      expect(mockAdmin.createTopics).toHaveBeenCalledWith({
        topics: expect.arrayContaining([
          expect.objectContaining({ topic: 'cliente-criado' }),
        ]),
      });
    });

    it('não deve criar tópicos que já existem', async () => {
      mockAdmin.listTopics.mockResolvedValueOnce(['cliente-criado']);

      await (service as any).createTopicsIfNotExist();

      expect(mockAdmin.createTopics).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('deve enviar mensagem corretamente', async () => {
      const topic = 'cliente-criado';
      const message = { id: '1', nome: 'Teste' };
      const key = 'key-1';

      await service.sendMessage(topic, message, key);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic,
        messages: [
          expect.objectContaining({
            key: 'key-1',
            value: JSON.stringify(message),
            headers: expect.objectContaining({
              timestamp: expect.any(String),
            }),
          }),
        ],
      });
      expect(Logger.prototype.debug).toHaveBeenCalledWith(
        `Mensagem enviada para o tópico ${topic}`,
      );
    });

    it('deve enviar mensagem sem key quando não fornecida', async () => {
      const topic = 'cliente-criado';
      const message = { id: '1', nome: 'Teste' };

      await service.sendMessage(topic, message);

      expect(mockProducer.send).toHaveBeenCalledWith({
        topic,
        messages: [
          expect.objectContaining({
            key: undefined,
            value: JSON.stringify(message),
          }),
        ],
      });
    });

    it('deve lidar com erros ao enviar mensagem', async () => {
      const topic = 'cliente-criado';
      const message = { id: '1', nome: 'Teste' };
      const error = new Error('Erro ao enviar');

      mockProducer.send.mockRejectedValueOnce(error);

      await expect(service.sendMessage(topic, message)).rejects.toThrow(
        'Erro ao enviar',
      );
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `Erro ao enviar mensagem para o tópico ${topic}:`,
        error,
      );
    });
  });
});

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, KafkaMessage } from 'kafkajs';
import { MessagingService } from '../../../core/domain/messaging/messaging-service.interface';

@Injectable()
export class KafkaService
  implements MessagingService, OnModuleInit, OnModuleDestroy
{
  private readonly kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private readonly logger = new Logger(KafkaService.name);
  private readonly topics = ['cliente-criado']; // Lista de tópicos a serem criados

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService
      .get<string>('KAFKA_BROKERS', 'localhost:9092')
      .split(',');

    this.kafka = new Kafka({
      clientId: 'dynadok-api',
      brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'dynadok-consumer-group' });
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka producer conectado com sucesso');

      // Certifique-se de que os tópicos existem
      await this.createTopicsIfNotExist();

      this.logger.log('Tópicos Kafka configurados com sucesso');
    } catch (error) {
      this.logger.error('Falha ao conectar ao Kafka:', error);
      throw error;
    }
  }

  private async disconnect() {
    try {
      await this.producer.disconnect();
      this.logger.log('Kafka producer desconectado com sucesso');
    } catch (error) {
      this.logger.error('Erro ao desconectar Kafka producer:', error);
    }
  }

  private async createTopicsIfNotExist() {
    const admin = this.kafka.admin();
    await admin.connect();

    try {
      const existingTopics = await admin.listTopics();

      const topicsToCreate = this.topics.filter(
        (topic) => !existingTopics.includes(topic),
      );

      if (topicsToCreate.length > 0) {
        await admin.createTopics({
          topics: topicsToCreate.map((topic) => ({
            topic,
            numPartitions: 1,
            replicationFactor: 1,
          })),
        });
        this.logger.log(`Tópicos criados: ${topicsToCreate.join(', ')}`);
      }
    } finally {
      await admin.disconnect();
    }
  }

  async sendMessage<T>(topic: string, message: T, key?: string): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: key || undefined,
            value: JSON.stringify(message),
            headers: { timestamp: Date.now().toString() },
          },
        ],
      });
      this.logger.debug(`Mensagem enviada para o tópico ${topic}`);
    } catch (error) {
      this.logger.error(
        `Erro ao enviar mensagem para o tópico ${topic}:`,
        error,
      );
      throw error;
    }
  }
}

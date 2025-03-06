import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka } from 'kafkajs';

@Injectable()
export class ClienteConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private consumer: Consumer;
  private readonly logger = new Logger(ClienteConsumerService.name);
  private readonly topic = 'cliente-criado';

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService
      .get<string>('KAFKA_BROKERS', 'localhost:9092')
      .split(',');

    this.kafka = new Kafka({
      clientId: 'dynadok-consumer',
      brokers,
    });

    this.consumer = this.kafka.consumer({ groupId: 'cliente-emails-group' });
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      await this.consumer.connect();
      this.logger.log('Consumer Kafka conectado com sucesso');

      await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const messageValue = message.value?.toString();
            if (!messageValue) return;

            const clienteData = JSON.parse(messageValue);
            this.logger.debug(
              `Processando mensagem do tópico ${topic}, partição ${partition}`,
            );

            // Simular o envio de email
            await this.sendWelcomeEmail(clienteData);
          } catch (error) {
            this.logger.error(
              `Erro ao processar mensagem: ${error.message}`,
              error.stack,
            );
          }
        },
      });

      this.logger.log(`Consumer inscrito no tópico ${this.topic}`);
    } catch (error) {
      this.logger.error('Falha ao configurar consumer Kafka:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  private async disconnect() {
    try {
      await this.consumer.disconnect();
      this.logger.log('Consumer Kafka desconectado com sucesso');
    } catch (error) {
      this.logger.error('Erro ao desconectar Consumer Kafka:', error);
    }
  }

  private async sendWelcomeEmail(clienteData: any): Promise<void> {
    this.logger.log('-------------- EMAIL SIMULADO --------------');
    this.logger.log(`Para: ${clienteData.email}`);
    this.logger.log(`Assunto: Bem-vindo(a) à Dynadok, ${clienteData.nome}!`);
    this.logger.log('Conteúdo:');
    this.logger.log('Olá,');
    this.logger.log(
      `É com grande satisfação que damos as boas-vindas a você, ${clienteData.nome}!`,
    );
    this.logger.log('Obrigado por se cadastrar em nossa plataforma.');
    this.logger.log('Estamos muito felizes em tê-lo(a) conosco.');
    this.logger.log('');
    this.logger.log('Atenciosamente,');
    this.logger.log('Equipe Dynadok');
    this.logger.log('-------------------------------------------');

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

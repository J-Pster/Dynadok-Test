import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaService } from './kafka/kafka.service';
import { MESSAGING_SERVICE } from '../../core/domain/messaging/messaging-service.interface';
import { ClienteConsumerService } from './consumers/cliente-consumer.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MESSAGING_SERVICE,
      useClass: KafkaService,
    },
    ClienteConsumerService,
  ],
  exports: [MESSAGING_SERVICE],
})
export class MessagingModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClienteModule } from './modules/cliente.module';
import { CacheManagerModule } from './infrastructure/cache/cache.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { MessagingModule } from './infrastructure/messaging/messaging.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
    }),
    LoggerModule,
    CacheManagerModule,
    ClienteModule,
    MessagingModule,
  ],
})
export class AppModule {}

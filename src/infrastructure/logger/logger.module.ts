import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppLoggerService } from './app-logger.service';

export const APP_LOGGER = 'APP_LOGGER';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: APP_LOGGER,
      useClass: AppLoggerService,
    },
  ],
  exports: [APP_LOGGER],
})
export class LoggerModule {}

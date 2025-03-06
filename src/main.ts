import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Logs antes de iniciar a aplicação
  console.log('================ INICIANDO APLICAÇÃO ================');
  console.log('Variáveis de ambiente:');
  console.log('REDIS_URL:', process.env.REDIS_URL);
  console.log('REDIS_HOST:', process.env.REDIS_HOST);
  console.log('REDIS_PORT:', process.env.REDIS_PORT);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('====================================================');

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(
    `MongoDB connection URI: ${process.env.MONGODB_URI || 'mongodb://root:example@mongodb:27017/dynadok-test?authSource=admin'}`,
  );
  logger.log(
    `Redis connection: ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  );
}
bootstrap();

// Just to Test CI Branch Protection

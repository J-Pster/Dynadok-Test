import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClienteModule } from './modules/cliente.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://root:example@mongodb:27017/dynadok-test?authSource=admin',
    ),
    ClienteModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

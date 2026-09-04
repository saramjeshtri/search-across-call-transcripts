import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CallsModule } from './calls/calls.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    // ConfigModule loads .env into process.env before anything else runs
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI ?? ''),

    CallsModule,
    SearchModule,
  ],
})
export class AppModule {}

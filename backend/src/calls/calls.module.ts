import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { Call, CallSchema } from './schemas/call.schema';
import { ChunksModule } from '../chunks/chunks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Call.name, schema: CallSchema }]),
    ChunksModule,
  ],
  controllers: [CallsController],
  providers: [CallsService],
  exports: [CallsService], // later modules will use this
})
export class CallsModule {}

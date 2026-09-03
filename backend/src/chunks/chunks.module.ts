import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChunksService } from './chunks.service';
import { Chunk, ChunkSchema } from './schemas/chunk.schema';
import { EmbeddingsModule } from '../embeddings/embeddings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chunk.name, schema: ChunkSchema }]),
    EmbeddingsModule,
  ],
  providers: [ChunksService],
  exports: [ChunksService],
})
export class ChunksModule {}

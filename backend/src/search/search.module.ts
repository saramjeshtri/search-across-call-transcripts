import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { ChunksModule } from '../chunks/chunks.module';
import { CallsModule } from '../calls/calls.module';

@Module({
  imports: [EmbeddingsModule, ChunksModule, CallsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

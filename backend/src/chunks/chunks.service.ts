import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chunk, ChunkDocument } from './schemas/chunk.schema';
import {
  ChunkStrategy,
  Chunk as TranscriptChunk,
} from '../calls/chunking/chunk.type';
import { Turn } from '../calls/transcript/turn.type';
import {
  chunkBySpeakerTurn,
  chunkByTimeWindow,
  chunkBySize,
} from '../calls/chunking/chunking';
import { EmbeddingsService } from '../embeddings/embeddings.service';

@Injectable()
export class ChunksService {
  constructor(
    @InjectModel(Chunk.name) private readonly chunkModel: Model<ChunkDocument>,
    private readonly embeddings: EmbeddingsService,
  ) {}

  // chunk the call three ways and index each set
  async indexCall(callId: string, turns: Turn[]): Promise<void> {
    await this.indexChunks(callId, chunkBySpeakerTurn(turns));
    await this.indexChunks(callId, chunkByTimeWindow(turns, 60));
    await this.indexChunks(callId, chunkBySize(turns));
  }

  // embed one set of chunks and save them
  private async indexChunks(
    callId: string,
    chunks: TranscriptChunk[],
  ): Promise<void> {
    if (chunks.length === 0) return;

    const vectors = await this.embeddings.embedDocuments(
      chunks.map((c) => c.text),
    );

    await this.chunkModel.insertMany(
      chunks.map((chunk, i) => ({
        callId: new Types.ObjectId(callId),
        strategy: chunk.strategy,
        timeSeconds: chunk.timeSeconds,
        embedding: vectors[i],
      })),
    );
  }

  // all chunks for one strategy, used by search
  findByStrategy(strategy: ChunkStrategy): Promise<Chunk[]> {
    return this.chunkModel.find({ strategy }).lean().exec();
  }
}

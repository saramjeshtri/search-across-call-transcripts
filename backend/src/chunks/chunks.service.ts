import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chunk, ChunkDocument } from './schemas/chunk.schema';
import { Turn } from '../calls/transcript/turn.type';
import {
  chunkBySpeakerTurn,
  chunkByTimeWindow,
  chunkBySize,
} from '../calls/chunking/chunking';
import { EmbeddingsService } from '../embeddings/embeddings.service';

const STRATEGIES = [chunkBySpeakerTurn, chunkByTimeWindow, chunkBySize];

@Injectable()
export class ChunksService {
  constructor(
    @InjectModel(Chunk.name) private readonly chunkModel: Model<ChunkDocument>,
    private readonly embeddings: EmbeddingsService,
  ) {}

  // chunk the call 3 ways, embed every chunk, save them all
  async indexCall(callId: string, turns: Turn[]): Promise<number> {
    let saved = 0;

    for (const chunkWith of STRATEGIES) {
      const chunks = chunkWith(turns);
      if (chunks.length === 0) continue;

      const vectors = await this.embeddings.embedDocuments(
        chunks.map((c) => c.text),
      );

      const callObjectId = new Types.ObjectId(callId);

      await this.chunkModel.insertMany(
        chunks.map((chunk, i) => ({
          callId: callObjectId,
          strategy: chunk.strategy,
          timeSeconds: chunk.timeSeconds,
          embedding: vectors[i],
        })),
      );
      saved += chunks.length;
    }

    return saved;
  }
}

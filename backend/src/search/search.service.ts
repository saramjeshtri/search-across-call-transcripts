import { Injectable } from '@nestjs/common';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { ChunksService } from '../chunks/chunks.service';
import { CallsService } from '../calls/calls.service';
import { ChunkStrategy } from '../calls/chunking/chunk.type';
import { Turn } from '../calls/transcript/turn.type';
import { cosineSimilarity } from './cosine';

const RESULTS = 5;
const CONTEXT_RADIUS = 2; // turns before and after the match

// below this score, a chunk isn't a real match - measured against real queries
const MIN_SCORE = 0.6;

// if a match is this close (in seconds) to one we already picked from the
// same call, it's probably the same moment - skip it and keep looking
const MIN_GAP_SECONDS = 30;

export interface SearchResult {
  callId: string;
  callTitle: string;
  timeSeconds: number;
  context: string;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly embeddings: EmbeddingsService,
    private readonly chunks: ChunksService,
    private readonly calls: CallsService,
  ) {}

  async search(
    query: string,
    strategy: ChunkStrategy = 'speaker',
  ): Promise<SearchResult[]> {
    const queryVector = await this.embeddings.embedQuery(query);
    const chunks = await this.chunks.findByStrategy(strategy);

    const ranked = chunks
      .map((chunk) => ({
        chunk,
        score: cosineSimilarity(queryVector, chunk.embedding),
      }))
      .filter((r) => r.score >= MIN_SCORE)
      .sort((a, b) => b.score - a.score);

    const results: SearchResult[] = [];
    for (const { chunk } of ranked) {
      if (results.length >= RESULTS) break;

      const callId = String(chunk.callId);

      // already showed a moment from this call close to this one - skip it,
      // it's most likely the same part of the conversation, not a new one
      const tooClose = results.some(
        (r) =>
          r.callId === callId &&
          Math.abs(r.timeSeconds - chunk.timeSeconds) < MIN_GAP_SECONDS,
      );
      if (tooClose) continue;

      // the call might have been deleted since - skip it, don't fail the search
      const call = await this.calls.findOne(callId).catch(() => null);
      if (!call) continue;

      results.push({
        callId,
        callTitle: call.title,
        timeSeconds: chunk.timeSeconds,
        context: contextAround(call.turns, chunk.timeSeconds),
      });
    }

    return results;
  }
}

// the turn at this moment, plus a few turns before and after, as text
function contextAround(turns: Turn[], timeSeconds: number): string {
  const match = turns.findIndex((t) => t.timeSeconds >= timeSeconds);
  const center = match === -1 ? turns.length - 1 : match;

  return turns
    .slice(Math.max(0, center - CONTEXT_RADIUS), center + CONTEXT_RADIUS + 1)
    .map((t) => `${t.speaker}: ${t.text}`)
    .join('\n');
}

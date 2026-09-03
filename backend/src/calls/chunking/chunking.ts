import { Turn } from '../transcript/turn.type';
import { Chunk, ChunkStrategy } from './chunk.type';

// Strategy 1: one chunk per speaker turn.
export function chunkBySpeakerTurn(turns: Turn[]): Chunk[] {
  return turns.map((turn) => makeChunk('speaker', [turn]));
}

// Strategy 2: group turns into fixed time windows (default 60s).
export function chunkByTimeWindow(turns: Turn[], windowSeconds = 60): Chunk[] {
  const chunks: Chunk[] = [];
  let currentWindow = -1;

  turns.forEach((turn) => {
    const window = Math.floor(turn.timeSeconds / windowSeconds);

    if (window === currentWindow) {
      appendTurn(chunks[chunks.length - 1], turn);
    } else {
      chunks.push(makeChunk('time', [turn]));
      currentWindow = window;
    }
  });

  return chunks;
}

// Strategy 3: keep adding turns to a chunk until it reaches maxChars.
export function chunkBySize(turns: Turn[], maxChars = 400): Chunk[] {
  const chunks: Chunk[] = [];

  turns.forEach((turn) => {
    const last = chunks[chunks.length - 1];

    if (!last || last.text.length >= maxChars) {
      chunks.push(makeChunk('size', [turn]));
    } else {
      appendTurn(last, turn);
    }
  });

  return chunks;
}

// build a chunk from a group of consecutive turns
function makeChunk(strategy: ChunkStrategy, group: Turn[]): Chunk {
  return {
    strategy,
    text: group.map((t) => `${t.speaker}: ${t.text}`).join('\n'),
    timeSeconds: group[0].timeSeconds,
  };
}

// add one more turn to an existing chunk
function appendTurn(chunk: Chunk, turn: Turn): void {
  chunk.text += `\n${turn.speaker}: ${turn.text}`;
}

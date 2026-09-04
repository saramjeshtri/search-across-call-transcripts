export type ChunkStrategy = 'speaker' | 'time' | 'size';

// a piece of the transcript, before it's embedded
export interface Chunk {
  strategy: ChunkStrategy;
  text: string;
  timeSeconds: number;
}

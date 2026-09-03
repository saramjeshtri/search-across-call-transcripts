export type ChunkStrategy = 'speaker' | 'time' | 'size';

// A piece of the transcript. text is used to make the embedding,
// timeSeconds is the moment the chunk starts.
export interface Chunk {
  strategy: ChunkStrategy;
  text: string;
  timeSeconds: number;
}

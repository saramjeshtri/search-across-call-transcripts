import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ChunksService } from './chunks.service';
import { Chunk } from './schemas/chunk.schema';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { Turn } from '../calls/transcript/turn.type';

describe('ChunksService', () => {
  let service: ChunksService;

  const chunkModel = { insertMany: jest.fn() };
  const embeddings = {
    embedDocuments: jest.fn((texts: string[]) =>
      Promise.resolve(texts.map(() => [0.1, 0.2, 0.3])),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChunksService,
        { provide: getModelToken(Chunk.name), useValue: chunkModel },
        { provide: EmbeddingsService, useValue: embeddings },
      ],
    }).compile();

    service = module.get<ChunksService>(ChunksService);
  });

  const turns: Turn[] = [
    { speaker: 'A', timeSeconds: 0, text: 'hello there' },
    { speaker: 'B', timeSeconds: 60, text: 'hi back' },
  ];

  const callId = '0123456789abcdef01234567';

  it('runs all 3 strategies and embeds every chunk', async () => {
    const total = await service.indexCall(callId, turns);

    // speaker: 2, time(60s): 2, size: 1  -> 5 chunks
    expect(total).toBe(5);
    expect(embeddings.embedDocuments).toHaveBeenCalledTimes(3);
    expect(chunkModel.insertMany).toHaveBeenCalledTimes(3);
  });

  it('stores the call id, timestamp and embedding on each chunk', async () => {
    await service.indexCall(callId, turns);

    const firstInsert = chunkModel.insertMany.mock.calls[0][0];
    expect(firstInsert[0]).toEqual(
      expect.objectContaining({
        strategy: 'speaker',
        timeSeconds: 0,
        embedding: [0.1, 0.2, 0.3],
      }),
    );
    expect(String(firstInsert[0].callId)).toBe(callId);
  });
});

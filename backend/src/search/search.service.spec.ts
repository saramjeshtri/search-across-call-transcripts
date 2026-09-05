import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { ChunksService } from '../chunks/chunks.service';
import { CallsService } from '../calls/calls.service';

describe('SearchService', () => {
  let service: SearchService;

  const turns = [
    { speaker: 'A', timeSeconds: 0, text: 'hello' },
    { speaker: 'B', timeSeconds: 5, text: 'hi there' },
  ];
  const call = { id: 'call-1', title: 'Demo call', turns };

  const embeddings = { embedQuery: jest.fn() };
  const chunksService = { findByStrategy: jest.fn() };
  const callsService = { findOne: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    embeddings.embedQuery.mockResolvedValue([1, 0]);
    callsService.findOne.mockResolvedValue(call);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: EmbeddingsService, useValue: embeddings },
        { provide: ChunksService, useValue: chunksService },
        { provide: CallsService, useValue: callsService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('drops chunks below the relevance threshold', async () => {
    chunksService.findByStrategy.mockResolvedValue([
      { callId: 'call-1', timeSeconds: 0, embedding: [0, 1] }, // orthogonal - score 0
    ]);

    const results = await service.search('anything');

    expect(results).toEqual([]);
  });

  it('returns the matching call, timestamp and surrounding context', async () => {
    chunksService.findByStrategy.mockResolvedValue([
      { callId: 'call-1', timeSeconds: 5, embedding: [1, 0] }, // score 1
    ]);

    const results = await service.search('anything');

    expect(results).toEqual([
      {
        callId: 'call-1',
        callTitle: 'Demo call',
        timeSeconds: 5,
        context: 'A: hello\nB: hi there',
      },
    ]);
  });

  it('does not return two matches from the same call that are too close together', async () => {
    const spacedTurns = Array.from({ length: 25 }, (_, i) => ({
      speaker: 'A',
      timeSeconds: i * 10,
      text: `turn ${i}`,
    }));
    callsService.findOne.mockResolvedValue({
      id: 'call-1',
      title: 'Demo call',
      turns: spacedTurns,
    });
    chunksService.findByStrategy.mockResolvedValue([
      { callId: 'call-1', timeSeconds: 100, embedding: [1, 0] },
      { callId: 'call-1', timeSeconds: 110, embedding: [1, 0] }, // 10s later - same moment
      { callId: 'call-1', timeSeconds: 200, embedding: [1, 0] }, // far enough away
    ]);

    const results = await service.search('anything');

    expect(results.map((r) => r.timeSeconds)).toEqual([100, 200]);
  });

  it('skips a chunk whose call was deleted, instead of failing the search', async () => {
    chunksService.findByStrategy.mockResolvedValue([
      { callId: 'call-1', timeSeconds: 5, embedding: [1, 0] },
    ]);
    callsService.findOne.mockRejectedValue(new Error('not found'));

    const results = await service.search('anything');

    expect(results).toEqual([]);
  });

  it('returns the best matches first, and at most five of them', async () => {
    const scores = [0.95, 0.9, 0.85, 0.8, 0.75, 0.7];
    const asVector = (score: number) => [score, Math.sqrt(1 - score * score)];

    // one chunk per call, so the duplicate check never gets in the way
    chunksService.findByStrategy.mockResolvedValue(
      scores.map((score, i) => ({
        callId: `call-${i}`,
        timeSeconds: 0,
        embedding: asVector(score),
      })),
    );
    callsService.findOne.mockImplementation((id: string) =>
      Promise.resolve({ id, title: id, turns }),
    );

    const results = await service.search('anything');

    expect(results.map((r) => r.callId)).toEqual([
      'call-0',
      'call-1',
      'call-2',
      'call-3',
      'call-4',
    ]);
  });
});

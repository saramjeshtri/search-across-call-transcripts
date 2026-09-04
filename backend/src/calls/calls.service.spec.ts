import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CallsService } from './calls.service';
import { Call } from './schemas/call.schema';
import { ChunksService } from '../chunks/chunks.service';

describe('CallsService', () => {
  let service: CallsService;

  const callModel = {
    create: jest.fn((doc) => Promise.resolve({ id: 'call-1', ...doc })),
  };
  const chunksService = { indexCall: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallsService,
        { provide: getModelToken(Call.name), useValue: callModel },
        { provide: ChunksService, useValue: chunksService },
      ],
    }).compile();

    service = module.get<CallsService>(CallsService);
  });

  it('parses the transcript into turns before saving', async () => {
    const transcript = [
      '[00:00:04] Agent: Hello.',
      '[00:01:00] Customer: Hi there.',
    ].join('\n');

    await service.create({ transcript, title: 'Demo call' });

    expect(callModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Demo call',
        turns: [
          { speaker: 'Agent', timeSeconds: 4, text: 'Hello.' },
          { speaker: 'Customer', timeSeconds: 60, text: 'Hi there.' },
        ],
      }),
    );
  });

  it('indexes the call after saving it', async () => {
    await service.create({ transcript: '[00:00:00] A: hi', title: 'x' });

    expect(chunksService.indexCall).toHaveBeenCalledWith('call-1', [
      { speaker: 'A', timeSeconds: 0, text: 'hi' },
    ]);
  });
});

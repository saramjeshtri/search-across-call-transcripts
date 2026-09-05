import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CallsService } from './calls.service';
import { Call } from './schemas/call.schema';
import { ChunksService } from '../chunks/chunks.service';
import { SummariesService } from '../summaries/summaries.service';

describe('CallsService', () => {
  let service: CallsService;
  let saved: { save: jest.Mock; [key: string]: unknown };

  const callModel = {
    create: jest.fn((doc) => {
      saved = { id: 'call-1', ...doc, save: jest.fn() };
      return Promise.resolve(saved);
    }),
    findByIdAndDelete: jest.fn().mockResolvedValue(null),
  };
  const chunksService = { indexCall: jest.fn() };
  const summariesService = {
    summarize: jest.fn().mockResolvedValue('a summary'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    chunksService.indexCall.mockResolvedValue(undefined); // default: indexing works
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallsService,
        { provide: getModelToken(Call.name), useValue: callModel },
        { provide: ChunksService, useValue: chunksService },
        { provide: SummariesService, useValue: summariesService },
      ],
    }).compile();

    service = module.get<CallsService>(CallsService);
  });

  it('saves the parsed turns', async () => {
    const transcript = [
      '[00:00:04] Agent: Hello.',
      '[00:01:00] Customer: Hi there.',
    ].join('\n');

    await service.create({ transcript, title: 'Demo call' });

    expect(callModel.create).toHaveBeenCalledWith({
      title: 'Demo call',
      turns: [
        { speaker: 'Agent', timeSeconds: 4, text: 'Hello.' },
        { speaker: 'Customer', timeSeconds: 60, text: 'Hi there.' },
      ],
    });
  });

  it('adds the generated summary to the call', async () => {
    await service.create({ transcript: '[00:00:00] A: hi', title: 'x' });

    expect(saved.summary).toBe('a summary');
    expect(saved.save).toHaveBeenCalled();
  });

  it('indexes the call after saving it', async () => {
    await service.create({ transcript: '[00:00:00] A: hi', title: 'x' });

    expect(chunksService.indexCall).toHaveBeenCalledWith('call-1', [
      { speaker: 'A', timeSeconds: 0, text: 'hi' },
    ]);
  });

  it('deletes the call if indexing fails, so no unsearchable call is left behind', async () => {
    chunksService.indexCall.mockRejectedValue(new Error('out of quota'));

    await expect(
      service.create({ transcript: '[00:00:00] A: hi', title: 'x' }),
    ).rejects.toThrow('out of quota');

    expect(callModel.findByIdAndDelete).toHaveBeenCalledWith('call-1');
  });

  it('rejects a transcript with no parseable turns', async () => {
    await expect(
      service.create({ transcript: '   ', title: 'x' }),
    ).rejects.toThrow('No turns found');

    expect(callModel.create).not.toHaveBeenCalled();
  });
});

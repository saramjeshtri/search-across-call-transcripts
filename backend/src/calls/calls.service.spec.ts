import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CallsService } from './calls.service';
import { Call } from './schemas/call.schema';

describe('CallsService', () => {
  let service: CallsService;
  // Fake Mongoose model: create() just echoes back what it was given.
  const callModel = {
    create: jest.fn((doc) => Promise.resolve(doc)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallsService,
        { provide: getModelToken(Call.name), useValue: callModel },
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

  it('falls back to a generated title when none is given', async () => {
    await service.create({ transcript: '[00:00:00] A: hi' });

    const arg = callModel.create.mock.calls[0][0];
    expect(arg.title).toMatch(/^Call /);
  });
});

import { Turn } from '../transcript/turn.type';
import { chunkBySpeakerTurn, chunkByTimeWindow, chunkBySize } from './chunking';

const turn = (speaker: string, timeSeconds: number, text: string): Turn => ({
  speaker,
  timeSeconds,
  text,
});

describe('chunkBySpeakerTurn', () => {
  it('makes one chunk per turn', () => {
    const turns = [turn('Agent', 0, 'Hello.'), turn('Customer', 5, 'Hi.')];

    expect(chunkBySpeakerTurn(turns)).toEqual([
      { strategy: 'speaker', text: 'Agent: Hello.', timeSeconds: 0 },
      { strategy: 'speaker', text: 'Customer: Hi.', timeSeconds: 5 },
    ]);
  });
});

describe('chunkByTimeWindow', () => {
  it('groups turns that fall in the same window', () => {
    const turns = [
      turn('A', 0, 'first'),
      turn('B', 50, 'second'),
      turn('A', 70, 'third'), // next window
    ];

    const chunks = chunkByTimeWindow(turns, 60);

    expect(chunks).toHaveLength(2);
    expect(chunks[0]).toEqual({
      strategy: 'time',
      text: 'A: first\nB: second',
      timeSeconds: 0,
    });
    expect(chunks[1].text).toBe('A: third');
  });
});

describe('chunkBySize', () => {
  const turns = Array.from({ length: 4 }, (_, i) =>
    turn('A', i * 10, 'x'.repeat(40)),
  );

  it('keeps adding turns until the chunk passes maxChars', () => {
    const chunks = chunkBySize(turns, 80);

    expect(chunks).toHaveLength(2);
    expect(chunks[0].timeSeconds).toBe(0);
    expect(chunks[1].timeSeconds).toBe(20);
  });

  it('makes one chunk when maxChars is very large', () => {
    expect(chunkBySize(turns, 100000)).toHaveLength(1);
  });
});

describe('empty input', () => {
  it('returns [] for every strategy', () => {
    expect(chunkBySpeakerTurn([])).toEqual([]);
    expect(chunkByTimeWindow([], 60)).toEqual([]);
    expect(chunkBySize([], 400)).toEqual([]);
  });
});

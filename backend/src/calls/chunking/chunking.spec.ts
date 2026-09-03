import { Turn } from '../transcript/turn.type';
import {
  chunkBySpeakerTurn,
  chunkByTimeWindow,
  chunkBySize,
} from './chunking';

const turn = (speaker: string, timeSeconds: number, text: string): Turn => ({
  speaker,
  timeSeconds,
  text,
});

describe('chunkBySpeakerTurn', () => {
  it('makes one chunk per turn', () => {
    const turns = [
      turn('Agent', 0, 'Hello there.'),
      turn('Customer', 5, 'Hi.'),
      turn('Agent', 8, 'How can I help?'),
    ];

    const chunks = chunkBySpeakerTurn(turns);

    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toEqual({
      strategy: 'speaker',
      text: 'Agent: Hello there.',
      timeSeconds: 0,
    });
    expect(chunks[2].timeSeconds).toBe(8);
  });

  it('returns [] for no turns', () => {
    expect(chunkBySpeakerTurn([])).toEqual([]);
  });
});

describe('chunkByTimeWindow', () => {
  it('groups turns into 60-second windows', () => {
    const turns = [
      turn('A', 0, 'first'),
      turn('B', 10, 'second'),
      turn('A', 50, 'third'),
      turn('B', 70, 'fourth'), // next window
      turn('A', 130, 'fifth'), // window after that
    ];

    const chunks = chunkByTimeWindow(turns, 60);

    expect(chunks).toHaveLength(3);
    expect(chunks[0].text).toBe('A: first\nB: second\nA: third');
    expect(chunks[0].timeSeconds).toBe(0);
    expect(chunks[1].text).toBe('B: fourth');
    expect(chunks[2].text).toBe('A: fifth');
  });

  it('puts everything in one chunk when the call is shorter than a window', () => {
    const turns = [turn('A', 1, 'hi'), turn('B', 30, 'bye')];
    expect(chunkByTimeWindow(turns, 60)).toHaveLength(1);
  });

  it('returns [] for no turns', () => {
    expect(chunkByTimeWindow([], 60)).toEqual([]);
  });
});

describe('chunkBySize', () => {
  // 6 turns, each ~40 characters of text
  const turns = Array.from({ length: 6 }, (_, i) =>
    turn(i % 2 === 0 ? 'A' : 'B', i * 10, 'x'.repeat(40)),
  );

  it('keeps adding turns until the chunk passes maxChars', () => {
    const chunks = chunkBySize(turns, 80);

    expect(chunks).toHaveLength(3);
    expect(chunks[0].timeSeconds).toBe(0);
    expect(chunks[1].timeSeconds).toBe(20);
  });

  it('keeps a turn longer than maxChars as its own chunk', () => {
    const chunks = chunkBySize([turn('A', 0, 'z'.repeat(500))], 80);
    expect(chunks).toHaveLength(1);
  });

  it('makes one chunk when maxChars is very large', () => {
    expect(chunkBySize(turns, 100000)).toHaveLength(1);
  });

  it('returns [] for no turns', () => {
    expect(chunkBySize([], 400)).toEqual([]);
  });
});

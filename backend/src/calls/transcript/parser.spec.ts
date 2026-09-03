import { parseTranscript } from './parser';

describe('parseTranscript', () => {
  it('parses a simple two-turn transcript', () => {
    const raw = [
      '[00:00:04] Agent: Thanks for calling, how can I help?',
      '[00:00:11] Customer: My order has not arrived.',
    ].join('\n');

    expect(parseTranscript(raw)).toEqual([
      { speaker: 'Agent', timeSeconds: 4, text: 'Thanks for calling, how can I help?' },
      { speaker: 'Customer', timeSeconds: 11, text: 'My order has not arrived.' },
    ]);
  });

  it('converts HH:MM:SS timestamps to seconds', () => {
    const raw = '[01:02:03] Agent: Still here.';
    expect(parseTranscript(raw)[0].timeSeconds).toBe(3723);
  });

  it('accepts MM:SS timestamps (no hours)', () => {
    const raw = '[12:30] Customer: Half past.';
    expect(parseTranscript(raw)[0].timeSeconds).toBe(750);
  });

  it('merges a line without a timestamp into the previous turn', () => {
    const raw = [
      '[00:00:11] Customer: My dashboard is broken.',
      'It just spins forever.',
    ].join('\n');

    expect(parseTranscript(raw)).toEqual([
      {
        speaker: 'Customer',
        timeSeconds: 11,
        text: 'My dashboard is broken. It just spins forever.',
      },
    ]);
  });

  it('ignores blank lines', () => {
    const raw = [
      '[00:00:01] A: one',
      '',
      '   ',
      '[00:00:02] B: two',
    ].join('\n');

    expect(parseTranscript(raw)).toHaveLength(2);
  });

  it('ignores text before the first timestamped line', () => {
    const raw = [
      'Call recording - support line',
      'Date: 2026-01-01',
      '[00:00:00] Agent: Hello.',
    ].join('\n');

    expect(parseTranscript(raw)).toEqual([
      { speaker: 'Agent', timeSeconds: 0, text: 'Hello.' },
    ]);
  });

  it('keeps colons that appear inside the spoken text', () => {
    const raw = '[00:00:05] Agent: The error says: connection refused.';
    expect(parseTranscript(raw)[0].text).toBe(
      'The error says: connection refused.',
    );
  });

  it('handles multi-word speaker names', () => {
    const raw = '[00:00:05] Sales Rep: Let me walk you through pricing.';
    expect(parseTranscript(raw)[0].speaker).toBe('Sales Rep');
  });

  it('returns an empty array for empty input', () => {
    expect(parseTranscript('')).toEqual([]);
  });
});

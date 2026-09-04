import { parseTranscript } from './parser';

describe('parseTranscript', () => {
  it('parses speaker, time and text from each line', () => {
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
    expect(parseTranscript('[01:02:03] Agent: Still here.')[0].timeSeconds).toBe(
      3723,
    );
  });

  it('merges a line without a timestamp into the previous turn', () => {
    const raw = [
      '[00:00:11] Customer: My dashboard is broken.',
      'It just spins forever.',
    ].join('\n');

    expect(parseTranscript(raw)[0].text).toBe(
      'My dashboard is broken. It just spins forever.',
    );
  });

  it('keeps colons that appear inside the spoken text', () => {
    const raw = '[00:00:05] Agent: The error says: connection refused.';
    expect(parseTranscript(raw)[0].text).toBe(
      'The error says: connection refused.',
    );
  });

  it('returns an empty array for empty input', () => {
    expect(parseTranscript('')).toEqual([]);
  });
});

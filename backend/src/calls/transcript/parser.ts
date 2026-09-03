import { Turn } from './turn.type';

// Turns a plain-text transcript into a list of turns.
const TURN_LINE = /^\[(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\]\s*([^:]+):\s?(.*)$/;

export function parseTranscript(raw: string): Turn[] {
  const turns: Turn[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === '') continue;

    const match = trimmed.match(TURN_LINE);

    if (match) {
      const [, hh, mm, ss, speaker, text] = match;
      turns.push({
        speaker: speaker.trim(),
        timeSeconds: toSeconds(hh, mm, ss),
        text: text.trim(),
      });
    } else {
      // continuation of the last turn
      const last = turns[turns.length - 1];
      if (last) last.text = `${last.text} ${trimmed}`.trim();
    }
  }

  return turns;
}

function toSeconds(hh: string | undefined, mm: string, ss: string): number {
  const h = hh ? parseInt(hh, 10) : 0;
  return h * 3600 + parseInt(mm, 10) * 60 + parseInt(ss, 10);
}

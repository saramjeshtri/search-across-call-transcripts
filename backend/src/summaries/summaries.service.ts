import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { Turn } from '../calls/transcript/turn.type';
import { chunkBySize } from '../calls/chunking/chunking';

// Free-tier models flip between available and overloaded, so we try more than one.
const MODELS = ['gemini-flash-lite-latest', 'gemini-flash-latest'];

// If the transcript is longer than this, summarise it in stages.
const SINGLE_REQUEST_CHARS = 4000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Injectable()
export class SummariesService {
  private readonly logger = new Logger(SummariesService.name);
  private readonly ai: GoogleGenAI;

  constructor(config: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: config.getOrThrow<string>('GEMINI_API_KEY'),
    });
  }

  async summarize(turns: Turn[]): Promise<string> {
    const transcript = turns.map((t) => `${t.speaker}: ${t.text}`).join('\n');

    if (transcript.length <= SINGLE_REQUEST_CHARS) {
      this.logger.log('summarising in a single request');
      return this.summarizeWhole(transcript);
    }

    // long call: summarise each section, then summarise the section summaries
    const sections = chunkBySize(turns, SINGLE_REQUEST_CHARS).map((c) => c.text);
    this.logger.log(`summarising in ${sections.length} stages + 1 combine`);

    const sectionSummaries: string[] = [];
    for (const section of sections) {
      sectionSummaries.push(await this.summarizeSection(section));
    }

    return this.combineSummaries(sectionSummaries);
  }

  // Plain text only, no markdown, so it renders cleanly in the UI.
  private readonly FORMAT =
    'Write 3-4 sentences of plain prose. Then a blank line, then a line ' +
    'reading exactly "Next steps:", then each agreed next step on its own ' +
    'line starting with "• ". If none were agreed, write "• None". ' +
    'Do not use markdown, headings, bold or asterisks.';

  private summarizeWhole(transcript: string): Promise<string> {
    return this.ask(
      `Summarise this call. ${this.FORMAT}\n\n${transcript}`,
    );
  }

  private summarizeSection(section: string): Promise<string> {
    return this.ask(
      'This is one part of a longer call. Summarise it in 2-3 sentences of ' +
        'plain text and note any next steps mentioned.\n\n' +
        section,
    );
  }

  private combineSummaries(sectionSummaries: string[]): Promise<string> {
    return this.ask(
      `Below are summaries of consecutive parts of one call. Write one ` +
        `summary of the whole call. ${this.FORMAT}\n\n` +
        sectionSummaries.join('\n\n'),
    );
  }

  // Try each model twice, alternating, waiting longer each time.
  // Handles a model that is rate-limited (429) or temporarily overloaded (503).
  private async ask(prompt: string): Promise<string> {
    const tries = [...MODELS, ...MODELS];
    let lastError: unknown;

    for (const [i, model] of tries.entries()) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents: prompt,
        });
        return (response.text ?? '').trim();
      } catch (err) {
        lastError = err;
        await sleep((i + 1) * 1500);
      }
    }

    throw lastError;
  }
}

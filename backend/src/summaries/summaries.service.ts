import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { Turn } from '../calls/transcript/turn.type';
import { chunkBySize } from '../calls/chunking/chunking';

const MODEL = 'gemini-flash-lite-latest';

// If the transcript is longer than this, summarise it in stages.
const SINGLE_REQUEST_CHARS = 4000;

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
    const transcript = turns
      .map((t) => `${t.speaker}: ${t.text}`)
      .join('\n');

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

  private summarizeWhole(transcript: string): Promise<string> {
    return this.ask(
      'Summarise this call in 3-4 sentences, then list the next steps that ' +
        'were agreed as short bullet points. If no next steps were agreed, ' +
        'write "Next steps: none".\n\n' +
        transcript,
    );
  }

  private summarizeSection(section: string): Promise<string> {
    return this.ask(
      'This is one part of a longer call. Summarise it in 2-3 sentences and ' +
        'note any next steps mentioned.\n\n' +
        section,
    );
  }

  private combineSummaries(sectionSummaries: string[]): Promise<string> {
    return this.ask(
      'Below are summaries of consecutive parts of one call. Write a single ' +
        'summary of the whole call in 3-4 sentences, then list the agreed ' +
        'next steps as short bullet points.\n\n' +
        sectionSummaries.join('\n\n'),
    );
  }

  // Gemini's free tier sometimes returns 503/429 under load, so retry a few times.
  private async ask(prompt: string, attempt = 1): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: MODEL,
        contents: prompt,
      });
      return (response.text ?? '').trim();
    } catch (err) {
      if (attempt >= 3) throw err;
      await new Promise((r) => setTimeout(r, attempt * 2000));
      return this.ask(prompt, attempt + 1);
    }
  }
}

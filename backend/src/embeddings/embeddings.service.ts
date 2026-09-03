import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

const MODEL = 'gemini-embedding-001';
const DIMENSIONS = 768;
const BATCH_SIZE = 100; // max texts per API request

@Injectable()
export class EmbeddingsService {
  private readonly ai: GoogleGenAI;

  constructor(config: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: config.getOrThrow<string>('GEMINI_API_KEY'),
    });
  }

  // embed text we are storing and will search against
  async embedDocuments(texts: string[]): Promise<number[][]> {
    return this.embed(texts, 'RETRIEVAL_DOCUMENT');
  }

  // embed a user's search query
  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embed([text], 'RETRIEVAL_QUERY');
    return vector;
  }

  private async embed(texts: string[], taskType: string): Promise<number[][]> {
    const vectors: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const response = await this.ai.models.embedContent({
        model: MODEL,
        contents: batch,
        config: { taskType, outputDimensionality: DIMENSIONS },
      });
      for (const embedding of response.embeddings ?? []) {
        vectors.push(embedding.values ?? []);
      }
    }

    return vectors;
  }
}

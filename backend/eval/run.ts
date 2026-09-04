import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from '../src/app.module';
import { CallsService } from '../src/calls/calls.service';
import { SearchService, SearchResult } from '../src/search/search.service';
import { ChunkStrategy } from '../src/calls/chunking/chunk.type';
import { Question, QUESTIONS } from './questions';

const STRATEGIES: ChunkStrategy[] = ['speaker', 'time', 'size'];

const SAMPLES = [
  'northwind-sales-call',
  'acme-support-call',
  'long-onboarding-call',
  'retention-call',
  'feature-request-call',
];

const ROOT = join(process.cwd(), '..'); // run from backend/

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pct = (n: number) => `${Math.round(n * 100)}%`.padStart(4);

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  const calls = app.get(CallsService);
  const search = app.get(SearchService);
  const db = app.get<Connection>(getConnectionToken());

  await reset(db);
  await uploadSamples(calls);

  console.log('strategy   top-1   top-3');
  for (const strategy of STRATEGIES) {
    const { top1, top3 } = await score(search, strategy);
    console.log(`${strategy.padEnd(9)}  ${pct(top1)}   ${pct(top3)}`);
  }

  await app.close();
}

async function reset(db: Connection) {
  console.log('Resetting database...');
  await db.collection('calls').deleteMany({});
  await db.collection('chunks').deleteMany({});
}

async function uploadSamples(calls: CallsService) {
  console.log(`Uploading ${SAMPLES.length} sample calls (paced for the rate limit)...`);
  for (const [i, name] of SAMPLES.entries()) {
    const transcript = readFileSync(
      join(ROOT, 'sample-transcripts', `${name}.txt`),
      'utf8',
    );
    await calls.create({ transcript, title: name });
    process.stdout.write(` ${name}`);
    if (i < SAMPLES.length - 1) await wait(20_000);
  }
  console.log('\n');
}

// how often the right moment is the #1 result, and how often it's in the top 3
async function score(search: SearchService, strategy: ChunkStrategy) {
  let top1 = 0;
  let top3 = 0;

  for (const q of QUESTIONS) {
    const results = await search.search(q.query, strategy);
    const rank = results.findIndex((r) => isCorrect(r, q));
    if (rank === 0) top1++;
    if (rank >= 0 && rank < 3) top3++;
  }

  return { top1: top1 / QUESTIONS.length, top3: top3 / QUESTIONS.length };
}

// a result is right if it's the expected call and the answer phrase is in the context
function isCorrect(result: SearchResult, q: Question): boolean {
  return (
    result.callTitle === q.call &&
    result.context.toLowerCase().includes(q.expect.toLowerCase())
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

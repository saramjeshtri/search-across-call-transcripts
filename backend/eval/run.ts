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

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  const calls = app.get(CallsService);
  const search = app.get(SearchService);
  const db = app.get<Connection>(getConnectionToken());

  await reset(db);
  await uploadSamples(calls);

  console.log(`strategy   correct (of ${QUESTIONS.length})`);
  for (const strategy of STRATEGIES) {
    const correct = await score(search, strategy);
    console.log(`${strategy.padEnd(9)}  ${correct} / ${QUESTIONS.length}`);
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

// how many of the questions did search get right on the first result?
async function score(
  search: SearchService,
  strategy: ChunkStrategy,
): Promise<number> {
  let correct = 0;

  for (const q of QUESTIONS) {
    const [topResult] = await search.search(q.query, strategy);
    if (topResult && isCorrect(topResult, q)) correct++;
  }

  return correct;
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

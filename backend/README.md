# Backend (NestJS)

The REST API for Call Transcript Search.

## Run

```bash
cp .env.example .env     # then add your Gemini key
npm install
npm run start:dev        # http://localhost:3000
```

Needs MongoDB running (`docker compose up -d` from the project root).

## Test

```bash
npm test
```

## Chunking strategy evaluation (bonus)

```bash
npm run eval
```

Note: this wipes the `calls` and `chunks` collections before it runs.

Uploads the 5 sample calls, runs 15 questions (`eval/questions.ts`) against all 3
strategies, and counts how many the **first search result** got right. A result
is right when it points to the correct call and the returned context contains
the answer. Needs MongoDB running and a Gemini key.

Last run:

| Strategy | Correct (of 15) |
| --- | --- |
| `speaker` | 13 |
| `time` | 7 |
| `size` | 8 |

`speaker` performs best, which is why it's the search default. One chunk per
turn means the chunk's timestamp lands on the exact matching turn, so the
returned context is centred on the answer. `time` is weakest &mdash; a
60-second window mixes several topics into one blurry embedding.

## Endpoints

- `POST /calls` – body `{ "transcript": "...", "title": "..." }`; parses, saves, then chunks + embeds the call
- `GET /calls` – list all calls with their summaries (without the turns)
- `POST /search` – body `{ "query": "..." }`, optional `?strategy=speaker|time|size` (default `speaker`); returns up to 5 relevant matches as `{ callId, callTitle, timeSeconds, context }` (fewer, or none, if nothing clears the relevance threshold)

## AI (Google Gemini)

- **Embeddings** – `EmbeddingsService` uses `gemini-embedding-2` (768 dims).
  On upload, `ChunksService.indexCall` runs all 3 strategies, embeds every chunk,
  and saves each as `{ callId, strategy, timeSeconds, embedding }`.
- **Summaries** – `SummariesService` uses `gemini-flash-latest`, falling back to
  `gemini-flash-lite-latest` if the first is busy. Short calls get one request;
  calls over ~4000 characters are summarised in stages (each section separately,
  then the section summaries are combined). A failed summary is logged and left
  empty – the call is still saved.

## Transcript format

```
[00:00:04] Agent: Thanks for calling, how can I help?
[00:00:11] Customer: My order hasn't arrived.
It was supposed to come yesterday.
```

- `[MM:SS]` or `[HH:MM:SS]` at the start of a line begins a new turn
- speaker = text between `]` and the first `:`
- a line with no timestamp is added to the previous turn

## Chunking

Three strategies for splitting a call's turns into searchable pieces
(`src/calls/chunking/chunking.ts`):

- **speaker** – one chunk per turn
- **time** – fixed time windows (default 60s)
- **size** – keep adding turns until the chunk passes a character limit (default 400)

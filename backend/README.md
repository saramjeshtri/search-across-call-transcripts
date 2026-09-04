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

Uploads the 5 sample calls, runs 15 questions (`eval/questions.ts`) against all 3
strategies, and prints how often the right moment was the first result (top-1)
and how often it was in the top 3. A result is a hit when it points to the right
call and the returned context contains the answer. Needs MongoDB running and a
Gemini key.

Last run:

| Strategy | top-1 | top-3 |
| --- | --- | --- |
| `speaker` | 80% | 87% |
| `time` | 47% | 80% |
| `size` | 67% | 87% |

`speaker` wins: its chunk timestamp lands on the exact matching turn, so the
returned context is centred on the answer. `time` is weakest &mdash; a 60-second
window mixes topics into one blurry embedding. This matches the search default.

## Endpoints so far

- `GET /health` – checks the API is up and the database is connected
- `POST /calls` – body `{ "transcript": "...", "title": "..." }`; parses, saves, then chunks + embeds the call
- `GET /calls` – list all calls with their summaries (without the turns)
- `GET /calls/:id` – one call with all its turns
- `POST /search` – body `{ "query": "..." }`, optional `?strategy=speaker|time|size` (default `speaker`); returns the top 5 matches as `{ callId, callTitle, timeSeconds, context }`

## AI (Google Gemini)

- **Embeddings** – `EmbeddingsService` uses `gemini-embedding-001` (768 dims).
  On upload, `ChunksService.indexCall` runs all 3 strategies, embeds every chunk,
  and saves each as `{ callId, strategy, timeSeconds, embedding }`.
- **Summaries** – `SummariesService` uses `gemini-flash-lite-latest`. Short calls
  get one request; calls over ~4000 characters are summarised in stages (each
  section separately, then the section summaries are combined). A failed summary
  is logged and left empty – the call is still saved.

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

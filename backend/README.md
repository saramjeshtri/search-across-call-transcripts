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

## Endpoints so far

- `GET /health` – checks the API is up and the database is connected
- `POST /calls` – body `{ "transcript": "...", "title": "..." }`; parses, saves, then chunks + embeds the call
- `GET /calls` – list all calls (without the turns)
- `GET /calls/:id` – one call with all its turns

## Embeddings

`EmbeddingsService` wraps Google Gemini (`gemini-embedding-001`, 768 dimensions).
On upload, `ChunksService.indexCall` runs all 3 chunking strategies, embeds every
chunk, and saves each to the `chunks` collection as
`{ callId, strategy, timeSeconds, embedding }`.

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

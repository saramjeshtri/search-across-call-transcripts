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
- `POST /calls` – body `{ "transcript": "...", "title": "..." }`; parses the transcript into turns and saves it
- `GET /calls` – list all calls (without the turns)
- `GET /calls/:id` – one call with all its turns

## Transcript format

```
[00:00:04] Agent: Thanks for calling, how can I help?
[00:00:11] Customer: My order hasn't arrived.
It was supposed to come yesterday.
```

- `[MM:SS]` or `[HH:MM:SS]` at the start of a line begins a new turn
- speaker = text between `]` and the first `:`
- a line with no timestamp is added to the previous turn

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

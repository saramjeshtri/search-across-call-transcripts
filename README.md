# Call Transcript Search

A tool for going through recorded sales and support calls without re-listening to them.

You upload a call transcript and the app:

- splits it into turns (who said what, and when)
- writes a short summary of the call, including the next steps that were agreed
- lets you search all your calls by meaning, not just keywords

A search like "customer worried about price" jumps you straight to the moment it
came up, with the timestamp and the lines around it.

## Tech stack

- **Frontend:** React + TypeScript (Vite), Tailwind CSS
- **Backend:** NestJS (Node.js)
- **Database:** MongoDB (runs in Docker)
- **AI:** Google Gemini (summaries + embeddings)
- **Tests:** Jest

## How to run

You need Node.js 20+, Docker, and a Gemini API key (https://aistudio.google.com/apikey).

```bash
# 1. Start the database
docker compose up -d

# 2. Start the backend
cd backend
cp .env.example .env     # then put your Gemini key in .env
npm install
npm run start:dev        # http://localhost:3000

# 3. Start the frontend (in a new terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

## Folders

- `backend/` – the API
- `frontend/` – the website
- `sample-transcripts/` – example calls to upload
- `docker-compose.yml` – the MongoDB database

## Chunking evaluation (bonus)

`cd backend && npm run eval` compares the three chunking strategies against a
15-question set and prints the scores. Results and analysis are in
`backend/README.md`.

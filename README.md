# Call Transcript Search

Upload call transcripts (with speakers and timestamps), get an automatic summary
of each call, and search across all calls by meaning to jump to the exact moment
a topic was discussed.

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
- `docker-compose.yml` – the MongoDB database

import { useEffect, useState } from 'react'
import { api } from './lib/api'

type Health = { status: string; db: string }

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  // On first render, call the backend to prove the frontend <-> API wiring works.
  useEffect(() => {
    api
      .get<Health>('/health')
      .then((res) => setHealth(res.data))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-bold">Call Transcript Search</h1>
        <p className="mt-1 text-slate-600">Step 1 — scaffold check</p>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="font-semibold">Backend health</h2>
          {health && (
            <p className="mt-2 text-green-700">
              API: {health.status} · DB: {health.db}
            </p>
          )}
          {error && <p className="mt-2 text-red-700">Cannot reach API: {error}</p>}
          {!health && !error && <p className="mt-2 text-slate-500">Checking…</p>}
        </div>
      </div>
    </div>
  )
}

export default App

import { useState } from 'react'
import { search } from '../lib/api'
import type { SearchResult } from '../types'

// 139 -> "2:19"
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setBusy(true)
    setError('')
    try {
      setResults(await search(query))
    } catch {
      setError('Search failed. Is the backend running?')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all calls by meaning…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {busy ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {results && (
        <ul className="mt-4 space-y-3">
          {results.length === 0 && (
            <li className="text-sm text-slate-500">No matches.</li>
          )}
          {results.map((r) => (
            <li
              key={`${r.callId}-${r.timeSeconds}`}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-indigo-950">
                  {r.callTitle}
                </span>
                <span className="text-xs text-slate-400">
                  {formatTime(r.timeSeconds)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {r.context}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

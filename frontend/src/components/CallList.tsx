import type { Call } from '../types'

export function CallList({ calls }: { calls: Call[] }) {
  if (calls.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        No calls yet — upload a transcript to get started.
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {calls.map((call) => (
        <li
          key={call._id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow"
        >
          <h3 className="font-semibold text-indigo-950">{call.title}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {call.summary || 'No summary.'}
          </p>
        </li>
      ))}
    </ul>
  )
}

import { useState } from 'react'
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
        <CallCard key={call._id} call={call} />
      ))}
    </ul>
  )
}

// starts collapsed - click the title to show the summary
function CallCard({ call }: { call: Call }) {
  const [open, setOpen] = useState(false)

  return (
    <li className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
      >
        <h3 className="font-semibold text-indigo-950">{call.title}</h3>
        <Chevron open={open} />
      </button>

      {open && (
        <p className="whitespace-pre-wrap px-5 pb-5 text-sm leading-relaxed text-slate-600">
          {call.summary || 'No summary.'}
        </p>
      )}
    </li>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

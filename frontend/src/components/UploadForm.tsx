import { useState } from 'react'
import { uploadCall, isNetworkError, apiErrorMessage } from '../lib/api'

// the real backend does these steps in order for every upload
const STEPS = [
  'Parsing the transcript',
  'Summarising with AI',
  'Chunking and indexing for search',
]
const STEP_DELAY_MS = 2000

export function UploadForm({ onUploaded }: { onUploaded: () => void }) {
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setBusy(true)
    setStep(0)
    setError('')
    setDone('')

    // one request doesn't report progress as it happens, so just move
    // through the known steps on a timer while it's in flight
    const timer = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }, STEP_DELAY_MS)

    try {
      const text = await file.text()
      const title = file.name.replace(/\.txt$/, '')
      await uploadCall(title, text)
      setDone(`Uploaded and summarised "${title}".`)
      onUploaded()
    } catch (err) {
      setError(
        isNetworkError(err)
          ? 'Cannot reach the server. Is the backend running?'
          : (apiErrorMessage(err) ??
            'Upload failed. Please check the file and try again.'),
      )
    } finally {
      clearInterval(timer)
      setBusy(false)
      e.target.value = '' // allow picking the same file again
    }
  }

  return (
    <div>
      <label
        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 ${
          busy ? 'pointer-events-none opacity-60' : ''
        }`}
      >
        <UploadIcon />
        {busy ? 'Uploading…' : 'Choose a .txt file'}
        <input
          type="file"
          accept=".txt"
          onChange={handleFile}
          disabled={busy}
          className="hidden"
        />
      </label>

      {busy && (
        <ul className="mt-3 space-y-1.5">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <StepIcon state={i < step ? 'done' : i === step ? 'active' : 'pending'} />
              <span className={i <= step ? 'text-slate-700' : 'text-slate-400'}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      )}
      {done && <p className="mt-2 text-sm text-green-600">{done}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

function StepIcon({ state }: { state: 'done' | 'active' | 'pending' }) {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
      {state === 'done' && (
        <svg className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.6 3.6 6.7-6.7a1 1 0 011.4 0z"
          />
        </svg>
      )}
      {state === 'active' && (
        <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
      )}
      {state === 'pending' && <span className="h-2 w-2 rounded-full bg-slate-300" />}
    </span>
  )
}

function UploadIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M10 13V3m0 0L6.5 6.5M10 3l3.5 3.5" strokeLinecap="round" />
      <path d="M4 13v3a1 1 0 001 1h10a1 1 0 001-1v-3" strokeLinecap="round" />
    </svg>
  )
}

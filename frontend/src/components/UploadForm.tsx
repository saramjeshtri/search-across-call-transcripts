import { useState } from 'react'
import { uploadCall } from '../lib/api'

export function UploadForm({ onUploaded }: { onUploaded: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setBusy(true)
    setError('')
    setDone('')
    try {
      const text = await file.text()
      const title = file.name.replace(/\.txt$/, '')
      await uploadCall(title, text)
      setDone(`Uploaded and summarised "${title}".`)
      onUploaded()
    } catch {
      setError('Upload failed. Is it a plain-text transcript?')
    } finally {
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
        <p className="mt-2 text-sm text-slate-500">
          Parsing, summarising and indexing — this takes a few seconds.
        </p>
      )}
      {done && <p className="mt-2 text-sm text-green-600">{done}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
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

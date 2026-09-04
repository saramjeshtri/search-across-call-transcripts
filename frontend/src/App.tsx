import { useEffect, useState } from 'react'
import { getCalls } from './lib/api'
import type { Call } from './types'
import { UploadForm } from './components/UploadForm'
import { CallList } from './components/CallList'

function App() {
  const [calls, setCalls] = useState<Call[]>([])

  function loadCalls() {
    getCalls().then(setCalls).catch(console.error)
  }

  useEffect(() => {
    loadCalls()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-indigo-600 text-white">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <h1 className="text-xl font-semibold">Call Transcript Search</h1>
          <p className="mt-0.5 text-sm text-indigo-100">
            Upload calls, get summaries, and search every call by meaning.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-10 px-6 py-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Upload a transcript
          </h2>
          <UploadForm onUploaded={loadCalls} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Calls{calls.length > 0 && <span className="text-slate-400"> · {calls.length}</span>}
          </h2>
          <CallList calls={calls} />
        </section>
      </main>
    </div>
  )
}

export default App

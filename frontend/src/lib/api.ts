import axios from 'axios'
import type { Call, SearchResult } from '../types'

// one place that knows the API base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
})

export function getCalls() {
  return api.get<Call[]>('/calls').then((res) => res.data)
}

export function uploadCall(title: string, transcript: string) {
  return api.post('/calls', { title, transcript }).then((res) => res.data)
}

export function search(query: string) {
  return api
    .post<SearchResult[]>('/search', { query })
    .then((res) => res.data)
}

// true if the request never got a response at all (server down, wrong URL)
// false if the server responded but with an error (e.g. it failed internally)
export function isNetworkError(err: unknown): boolean {
  return axios.isAxiosError(err) && !err.response
}

// the message the API sent back, so we can show it instead of a generic one
export function apiErrorMessage(err: unknown): string | null {
  if (!axios.isAxiosError(err)) return null

  const message = (err.response?.data as { message?: string | string[] })?.message
  return Array.isArray(message) ? message[0] : (message ?? null)
}

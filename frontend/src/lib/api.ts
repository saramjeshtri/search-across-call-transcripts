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

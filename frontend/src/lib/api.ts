import axios from 'axios'

// One place that knows the API base URL. Components never hard-code it.
// VITE_ prefix is required for Vite to expose the var to the browser.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
})

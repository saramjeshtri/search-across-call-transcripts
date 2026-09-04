// shapes returned by the backend API

export type Call = {
  _id: string
  title: string
  summary: string
}

export type SearchResult = {
  callId: string
  callTitle: string
  timeSeconds: number
  context: string
}

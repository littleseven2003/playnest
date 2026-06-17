export interface GuessResponse {
  word: string
  similarity: number
  isCorrect: boolean
  guessCount: number
}

export interface GuessItem extends GuessResponse {
  id: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

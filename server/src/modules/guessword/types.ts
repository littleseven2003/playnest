export interface WordEntry {
  id: number
  word: string
  pinyin: string
  category: string
  related: string[]
}

export interface GuessSession {
  gameId: string
  target: WordEntry
  guessCount: number
  createdAt: number
}

export interface GuessResult {
  word: string
  similarity: number
  isCorrect: boolean
  guessCount: number
}

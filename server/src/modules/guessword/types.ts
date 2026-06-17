export interface WordEntry {
  id: number
  word: string
  pinyin: string
  category: string
  aliases: string[]
  related: string[]
  hints: string[]
}

export interface GuessSession {
  gameId: string
  target: {
    id: number
    word: string
    normalizedWord: string
    pinyin: string
    category: string
    frequency: number
    enabled: number
  }
  guessCount: number
  createdAt: number
}

export interface GuessResult {
  word: string
  similarity: number
  isCorrect: boolean
  guessCount: number
  message?: string
}

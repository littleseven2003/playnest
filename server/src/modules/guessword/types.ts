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
  target: WordEntry
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

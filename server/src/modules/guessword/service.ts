import { randomUUID } from 'node:crypto'
import wordsData from './data/words.json' with { type: 'json' }
import type { GuessResult, GuessSession, WordEntry } from './types.js'
import { clampScore } from '../../shared/utils/score.js'

const words = wordsData.words as WordEntry[]
const sessions = new Map<string, GuessSession>()
const wordIndex = new Map<string, WordEntry>()

for (const entry of words) {
  wordIndex.set(entry.word, entry)
  for (const term of [...entry.aliases, ...entry.related, ...entry.hints]) {
    if (!wordIndex.has(term)) {
      wordIndex.set(term, entry)
    }
  }
}

function pickWord() {
  return words[Math.floor(Math.random() * words.length)]
}

function uniqueChars(value: string) {
  return new Set([...value])
}

function charOverlap(a: string, b: string) {
  const aSet = new Set([...a])
  const bSet = new Set([...b])
  const intersection = [...aSet].filter((char) => bSet.has(char)).length
  const union = new Set([...aSet, ...bSet]).size
  return union === 0 ? 0 : intersection / union
}

function repeatedCharRatio(value: string) {
  return 1 - uniqueChars(value).size / value.length
}

function validateGuess(word: string) {
  if (!/^[\u4e00-\u9fa5]{1,8}$/.test(word)) {
    return '请输入 1-8 个中文字符'
  }

  if (word.length >= 3 && uniqueChars(word).size === 1) {
    return '输入质量太低，请不要重复堆叠同一个字'
  }

  if (word.length >= 4 && repeatedCharRatio(word) >= 0.5) {
    return '输入质量太低，请换一个更具体的词'
  }

  return ''
}

function termListScore(guess: string, terms: string[], exactScore: number, fuzzyScore: number) {
  if (terms.includes(guess)) {
    return exactScore
  }

  const bestOverlap = terms.reduce((best, term) => {
    return Math.max(best, charOverlap(guess, term))
  }, 0)

  return bestOverlap * fuzzyScore
}

function categoryScore(guess: string, target: WordEntry) {
  const guessedWord = wordIndex.get(guess)
  if (!guessedWord) {
    return 0
  }

  if (guessedWord.category === target.category) {
    return 34
  }

  const guessedTerms = new Set([...guessedWord.aliases, ...guessedWord.related, ...guessedWord.hints])
  const targetTerms = new Set([...target.aliases, ...target.related, ...target.hints])
  const sharedTerms = [...guessedTerms].filter((item) => targetTerms.has(item)).length
  return Math.min(30, sharedTerms * 6)
}

function lexicalScore(guess: string, target: WordEntry) {
  return Math.max(
    charOverlap(guess, target.word) * 62,
    termListScore(guess, target.aliases, 92, 72),
    termListScore(guess, target.related, 78, 54),
    termListScore(guess, target.hints, 56, 38),
    categoryScore(guess, target)
  )
}

export class GuessWordService {
  startGame() {
    const gameId = randomUUID()
    sessions.set(gameId, {
      gameId,
      target: pickWord(),
      guessCount: 0,
      createdAt: Date.now()
    })

    return { gameId }
  }

  guess(gameId: string, word: string): GuessResult {
    const session = sessions.get(gameId)
    if (!session) {
      throw new Error('游戏不存在或已过期')
    }

    const normalizedWord = word.trim()
    if (!normalizedWord) {
      throw new Error('请输入要猜测的词语')
    }

    session.guessCount += 1

    const qualityMessage = validateGuess(normalizedWord)
    if (qualityMessage) {
      return {
        word: normalizedWord,
        similarity: 0,
        isCorrect: false,
        guessCount: session.guessCount,
        message: qualityMessage
      }
    }

    const isCorrect = normalizedWord === session.target.word
    const similarity = isCorrect
      ? 100
      : clampScore(lexicalScore(normalizedWord, session.target))

    return {
      word: normalizedWord,
      similarity,
      isCorrect,
      guessCount: session.guessCount
    }
  }

  getWordList() {
    return words.map(({ word, category }) => ({ word, category }))
  }

  getDebugInfo(gameId: string) {
    const session = sessions.get(gameId)
    if (!session) {
      throw new Error('游戏不存在或已过期')
    }

    return {
      gameId: session.gameId,
      target: session.target.word,
      category: session.target.category,
      guessCount: session.guessCount
    }
  }
}

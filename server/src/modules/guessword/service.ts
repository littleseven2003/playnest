import { randomUUID } from 'node:crypto'
import wordsData from './data/words.json' with { type: 'json' }
import type { GuessResult, GuessSession, WordEntry } from './types.js'
import { clampScore } from '../../shared/utils/score.js'

const words = wordsData.words as WordEntry[]
const sessions = new Map<string, GuessSession>()

function pickWord() {
  return words[Math.floor(Math.random() * words.length)]
}

function charOverlap(a: string, b: string) {
  const aSet = new Set([...a])
  const bSet = new Set([...b])
  const intersection = [...aSet].filter((char) => bSet.has(char)).length
  const union = new Set([...aSet, ...bSet]).size
  return union === 0 ? 0 : intersection / union
}

function relatedScore(guess: string, target: WordEntry) {
  if (target.related.includes(guess)) {
    return 78
  }

  const bestRelatedOverlap = target.related.reduce((best, related) => {
    return Math.max(best, charOverlap(guess, related))
  }, 0)

  return bestRelatedOverlap * 58
}

function categoryScore(guess: string, target: WordEntry) {
  const guessedWord = words.find((item) => item.word === guess)
  if (!guessedWord) {
    return 0
  }

  if (guessedWord.category === target.category) {
    return 34
  }

  const sharedRelated = guessedWord.related.filter((item) => target.related.includes(item)).length
  return Math.min(28, sharedRelated * 7)
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

    const isCorrect = normalizedWord === session.target.word
    const similarity = isCorrect
      ? 100
      : clampScore(
          Math.max(
            charOverlap(normalizedWord, session.target.word) * 72,
            relatedScore(normalizedWord, session.target),
            categoryScore(normalizedWord, session.target)
          ) + Math.min(8, normalizedWord.length * 1.2)
        )

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

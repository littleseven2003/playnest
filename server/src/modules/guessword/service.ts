import { randomUUID } from 'node:crypto'
import type { GuessResult, GuessSession } from './types.js'
import { getRelationKey, loadLexiconIndex, type LexiconTerm } from './storage/lexicon-repository.js'
import { clampScore } from '../../shared/utils/score.js'

const lexicon = loadLexiconIndex()
const sessions = new Map<string, GuessSession>()
const playableTerms = lexicon.terms.filter((term) => term.enabled)

function pickWord() {
  return playableTerms[Math.floor(Math.random() * playableTerms.length)]
}

function uniqueChars(value: string) {
  return new Set([...value])
}

function charOverlap(a: string, b: string) {
  const aSet = uniqueChars(a)
  const bSet = uniqueChars(b)
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

function directRelationScore(target: LexiconTerm, guess: LexiconTerm) {
  const relation = lexicon.directRelationByPair.get(getRelationKey(target.id, guess.id))
  return relation ? relation.weight * 100 : 0
}

function twoHopRelationScore(target: LexiconTerm, guess: LexiconTerm) {
  const targetRelations = (lexicon.relationsBySource.get(target.id) ?? []).slice(0, 60)
  let bestScore = 0

  for (const firstHop of targetRelations) {
    const secondHop = lexicon.directRelationByPair.get(getRelationKey(firstHop.targetTermId, guess.id))
    if (!secondHop) {
      continue
    }

    bestScore = Math.max(bestScore, firstHop.weight * secondHop.weight * 78)
  }

  return bestScore
}

function categoryScore(target: LexiconTerm, guess: LexiconTerm) {
  if (target.category !== guess.category) {
    return 0
  }

  const frequencyBonus = Math.min(8, Math.max(0, guess.frequency / 12))
  return 28 + frequencyBonus
}

function lexicalFallbackScore(targetWord: string, guessWord: string) {
  return charOverlap(targetWord, guessWord) * 38
}

function scoreGuess(target: LexiconTerm, guessWord: string) {
  const guessTerm = lexicon.termByWord.get(guessWord)

  if (!guessTerm) {
    return clampScore(lexicalFallbackScore(target.word, guessWord))
  }

  return clampScore(
    Math.max(
      directRelationScore(target, guessTerm),
      twoHopRelationScore(target, guessTerm),
      categoryScore(target, guessTerm),
      lexicalFallbackScore(target.word, guessWord)
    )
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
    const similarity = isCorrect ? 100 : scoreGuess(session.target, normalizedWord)

    return {
      word: normalizedWord,
      similarity,
      isCorrect,
      guessCount: session.guessCount
    }
  }

  getWordList() {
    return playableTerms.map(({ word, category }) => ({ word, category }))
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
      guessCount: session.guessCount,
      totalTerms: playableTerms.length
    }
  }
}

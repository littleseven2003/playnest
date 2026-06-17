import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

export interface LexiconTerm {
  id: number
  word: string
  normalizedWord: string
  pinyin: string
  category: string
  frequency: number
  enabled: number
}

export interface LexiconRelation {
  targetTermId: number
  relationType: string
  weight: number
}

export interface LexiconIndex {
  terms: LexiconTerm[]
  termByWord: Map<string, LexiconTerm>
  relationsBySource: Map<number, LexiconRelation[]>
  directRelationByPair: Map<string, LexiconRelation>
}

const moduleDir = dirname(fileURLToPath(import.meta.url))

function resolveDatabasePath() {
  const candidates = [
    resolve(moduleDir, '../data/lexicon.sqlite'),
    resolve(process.cwd(), 'src/modules/guessword/data/lexicon.sqlite'),
    resolve(process.cwd(), 'dist/modules/guessword/data/lexicon.sqlite')
  ]
  const databasePath = candidates.find((candidate) => existsSync(candidate))

  if (!databasePath) {
    throw new Error('猜词 SQLite 词库不存在，请先运行 npm run build:lexicon')
  }

  return databasePath
}

function relationKey(sourceTermId: number, targetTermId: number) {
  return `${sourceTermId}:${targetTermId}`
}

export function loadLexiconIndex(): LexiconIndex {
  const db = new DatabaseSync(resolveDatabasePath(), { readOnly: true })
  const terms = db
    .prepare(
      `
        SELECT
          id,
          word,
          normalized_word AS normalizedWord,
          pinyin,
          category,
          frequency,
          enabled
        FROM terms
        WHERE enabled = 1
        ORDER BY frequency DESC, id ASC
      `
    )
    .all() as unknown as LexiconTerm[]

  const rows = db
    .prepare(
      `
        SELECT
          source_term_id AS sourceTermId,
          target_term_id AS targetTermId,
          relation_type AS relationType,
          weight
        FROM relations
        WHERE weight >= 0.25
        ORDER BY source_term_id ASC, weight DESC
      `
    )
    .all() as unknown as Array<LexiconRelation & { sourceTermId: number }>

  db.close()

  const termByWord = new Map<string, LexiconTerm>()
  const relationsBySource = new Map<number, LexiconRelation[]>()
  const directRelationByPair = new Map<string, LexiconRelation>()

  for (const term of terms) {
    termByWord.set(term.normalizedWord, term)
  }

  for (const row of rows) {
    const relation = {
      targetTermId: row.targetTermId,
      relationType: row.relationType,
      weight: row.weight
    }
    const list = relationsBySource.get(row.sourceTermId) ?? []
    list.push(relation)
    relationsBySource.set(row.sourceTermId, list)
    directRelationByPair.set(relationKey(row.sourceTermId, row.targetTermId), relation)
  }

  return {
    terms,
    termByWord,
    relationsBySource,
    directRelationByPair
  }
}

export function getRelationKey(sourceTermId: number, targetTermId: number) {
  return relationKey(sourceTermId, targetTermId)
}

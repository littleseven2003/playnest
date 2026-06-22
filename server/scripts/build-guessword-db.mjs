import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import https from 'node:https'

const dbPath = resolve('src/modules/guessword/data/lexicon.sqlite')
const cacheDir = resolve('src/modules/guessword/data/source-cache')
const targetCount = Number(process.argv[2] ?? 10000)
const maxTerms = Math.max(8000, targetCount)

const sources = {
  jieba: {
    url: 'https://raw.githubusercontent.com/fxsjy/jieba/master/jieba/dict.txt',
    file: 'jieba-dict.txt'
  },
  xinhuaIdioms: {
    url: 'https://raw.githubusercontent.com/pwxcoo/chinese-xinhua/master/data/idiom.json',
    file: 'chinese-xinhua-idiom.json'
  },
  thuocl: [
    ['IT', '技术', 'https://raw.githubusercontent.com/thunlp/THUOCL/master/data/THUOCL_IT.txt'],
    ['animal', '动物', 'https://raw.githubusercontent.com/thunlp/THUOCL/master/data/THUOCL_animal.txt'],
    ['caijing', '金融', 'https://raw.githubusercontent.com/thunlp/THUOCL/master/data/THUOCL_caijing.txt'],
    ['car', '交通', 'https://raw.githubusercontent.com/thunlp/THUOCL/master/data/THUOCL_car.txt'],
    ['chengyu', '成语', 'https://raw.githubusercontent.com/thunlp/THUOCL/master/data/THUOCL_chengyu.txt'],
    ['food', '食物', 'https://raw.githubusercontent.com/thunlp/THUOCL/master/data/THUOCL_food.txt'],
    ['law', '法律', 'https://raw.githubusercontent.com/thunlp/THUOCL/master/data/THUOCL_law.txt'],
    ['medical', '医疗', 'https://raw.githubusercontent.com/thunlp/THUOCL/master/data/THUOCL_medical.txt']
  ]
}

const relationWeights = {
  synonym: 0.94,
  strong: 0.78,
  sibling: 0.48,
  weak: 0.34
}

const curatedRelations = [
  ['医生', '医师', 'synonym'],
  ['医生', '大夫', 'synonym'],
  ['医生', '医护', 'synonym'],
  ['医生', '医院', 'strong'],
  ['医生', '护士', 'strong'],
  ['医生', '治疗', 'strong'],
  ['医生', '门诊', 'strong'],
  ['学习', '读书', 'synonym'],
  ['学习', '求学', 'synonym'],
  ['学习', '学校', 'strong'],
  ['学习', '考试', 'strong'],
  ['音乐', '歌曲', 'synonym'],
  ['音乐', '旋律', 'strong'],
  ['音乐', '乐器', 'strong'],
  ['旅行', '旅游', 'synonym'],
  ['旅行', '出游', 'synonym'],
  ['旅行', '酒店', 'strong'],
  ['旅行', '车票', 'strong'],
  ['编程', '编码', 'synonym'],
  ['编程', '代码', 'strong'],
  ['编程', '算法', 'strong'],
  ['火车', '列车', 'synonym'],
  ['火车', '车站', 'strong'],
  ['火车', '轨道', 'strong'],
  ['银行', '存款', 'strong'],
  ['银行', '账户', 'strong'],
  ['银行', '贷款', 'strong']
]

const stopWords = new Set([
  '我们', '你们', '他们', '她们', '它们', '这个', '那个', '这些', '那些', '自己', '什么', '怎么',
  '没有', '不是', '不能', '一个', '一些', '一种', '一样', '一下', '以及', '进行', '通过', '由于',
  '为了', '因此', '但是', '然后', '如果', '所以', '已经', '可以', '可能', '应该', '需要', '时候',
  '迅雷', '天仁'
])

const terms = new Map()
const relations = []
const categoryBuckets = new Map()

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'playnest-lexicon-build' } }, (response) => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          download(response.headers.location).then(resolve, reject)
          return
        }

        if (response.statusCode !== 200) {
          reject(new Error(`下载失败 ${response.statusCode}: ${url}`))
          return
        }

        const chunks = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      })
      .on('error', reject)
  })
}

async function readSource(source) {
  mkdirSync(cacheDir, { recursive: true })
  const filePath = resolve(cacheDir, source.file)
  if (!existsSync(filePath)) {
    const content = await download(source.url)
    writeFileSync(filePath, content)
  }
  return readFileSync(filePath, 'utf8')
}

function isValidWord(word) {
  if (!/^[\u4e00-\u9fa5]{2,4}$/.test(word) || stopWords.has(word)) {
    return false
  }

  if (/^[一二三四五六七八九十][\u4e00-\u9fa5]{2}$/.test(word)) {
    return false
  }

  return true
}

function classifyJiebaTag(tag) {
  if (tag === 'i') return '成语'
  if (tag?.startsWith('v')) return '行为'
  if (tag?.startsWith('a')) return '形容'
  if (tag?.startsWith('t')) return '时间'
  if (tag?.startsWith('s')) return '空间'
  if (tag?.startsWith('n')) return '通用'
  return '通用'
}

function addCandidate(word, category, score, source, tag = '') {
  const normalized = word.trim()
  if (!isValidWord(normalized)) return

  const existing = terms.get(normalized)
  if (existing) {
    existing.score += score
    existing.frequency = Math.max(existing.frequency, Math.round(score))
    existing.sources.add(source)
    existing.tags.add(tag)
    existing.categories.set(category, (existing.categories.get(category) ?? 0) + score)
    if (source === 'thuocl' && existing.category === '通用') existing.category = category
    return
  }

  terms.set(normalized, {
    word: normalized,
    pinyin: '',
    category,
    score,
    frequency: Math.round(score),
    sources: new Set([source]),
    tags: new Set(tag ? [tag] : []),
    categories: new Map([[category, score]])
  })
}

function finalizeCategories(term) {
  let bestCategory = term.category
  let bestScore = 0
  for (const [category, score] of term.categories) {
    if (score > bestScore) {
      bestCategory = category
      bestScore = score
    }
  }
  term.category = bestCategory
}

function sharedCharCount(a, b) {
  const bChars = new Set([...b])
  return [...new Set([...a])].filter((char) => bChars.has(char)).length
}

function relationSignature(sourceId, targetId, type) {
  return `${sourceId}:${targetId}:${type}`
}

const relationSeen = new Set()

function addRelation(source, target, type, weight) {
  if (!source || !target || source.id === target.id) return

  const forward = relationSignature(source.id, target.id, type)
  if (!relationSeen.has(forward)) {
    relations.push({ sourceId: source.id, targetId: target.id, type, weight })
    relationSeen.add(forward)
  }

  const backward = relationSignature(target.id, source.id, type)
  if (!relationSeen.has(backward)) {
    relations.push({ sourceId: target.id, targetId: source.id, type, weight })
    relationSeen.add(backward)
  }
}

function relationScore(a, b) {
  const shared = sharedCharCount(a.word, b.word)
  const sameCategory = a.category === b.category
  const samePrefix = a.word[0] === b.word[0]
  const sameSuffix = a.word.at(-1) === b.word.at(-1)
  let score = 0

  if (sameCategory) score += 4
  score += shared * 3
  if (samePrefix) score += 2
  if (sameSuffix) score += 1
  if (a.sources.has('thuocl') && b.sources.has('thuocl')) score += 1

  return score
}

async function loadThuocl() {
  for (const [name, category, url] of sources.thuocl) {
    const content = await readSource({ url, file: `thuocl-${name}.txt` })
    for (const line of content.split(/\r?\n/)) {
      const [word, rawFrequency] = line.trim().split(/\s+/)
      if (!word) continue
      const frequency = Number(rawFrequency) || 1
      addCandidate(word, category, Math.log10(frequency + 10) * 180, 'thuocl', name)
    }
  }
}

async function loadJieba() {
  const content = await readSource(sources.jieba)
  for (const line of content.split(/\r?\n/)) {
    const [word, rawFrequency, tag = ''] = line.trim().split(/\s+/)
    if (!word) continue
    const frequency = Number(rawFrequency) || 1
    const score = Math.log10(frequency + 10) * 42
    addCandidate(word, classifyJiebaTag(tag), score, 'jieba', tag)
  }
}

async function loadXinhuaIdioms() {
  const content = await readSource(sources.xinhuaIdioms)
  const idioms = JSON.parse(content)
  for (const item of idioms) {
    addCandidate(item.word, '成语', 180, 'chinese-xinhua', 'idiom')
  }
}

function selectTerms() {
  for (const term of terms.values()) finalizeCategories(term)

  const hasProperNounTag = (term) => [...term.tags].some((tag) => /^(nr|ns|nt|nz)/.test(tag))

  const categoryQuotas = new Map([
    ['通用', 1800],
    ['行为', 850],
    ['形容', 650],
    ['成语', 1600],
    ['技术', 1200],
    ['金融', 950],
    ['医疗', 950],
    ['食物', 750],
    ['法律', 600],
    ['交通', 450],
    ['动物', 250],
    ['时间', 150],
    ['空间', 150]
  ])

  const eligible = [...terms.values()]
    .filter((term) => {
      if (term.sources.has('curated')) return true
      if (term.category === '成语') return term.word.length === 4
      if (hasProperNounTag(term)) return false
      if (!term.sources.has('jieba')) return false
      return term.score >= 150 || term.sources.has('thuocl')
    })
    .sort((a, b) => b.score - a.score || a.word.localeCompare(b.word, 'zh-Hans-CN'))

  const selected = []
  const selectedWords = new Set()

  for (const term of eligible) {
    if (term.sources.has('curated') && !selectedWords.has(term.word)) {
      selected.push(term)
      selectedWords.add(term.word)
    }
  }

  for (const [category, quota] of categoryQuotas) {
    for (const term of eligible) {
      if (selected.length >= maxTerms) break
      if (term.category !== category || selectedWords.has(term.word)) continue
      if (selected.filter((item) => item.category === category).length >= quota) break
      selected.push(term)
      selectedWords.add(term.word)
    }
  }

  for (const term of eligible) {
    if (selected.length >= maxTerms) break
    if (selectedWords.has(term.word)) continue
    selected.push(term)
    selectedWords.add(term.word)
  }

  selected.forEach((term, index) => {
    term.id = index + 1
    term.frequency = Math.round(Math.min(999999, term.score))
    const bucket = categoryBuckets.get(term.category) ?? []
    bucket.push(term)
    categoryBuckets.set(term.category, bucket)
  })

  return selected
}

function buildRelations(selectedTerms) {
  const termByWord = new Map(selectedTerms.map((term) => [term.word, term]))

  for (const [sourceWord, targetWord, type] of curatedRelations) {
    addRelation(termByWord.get(sourceWord), termByWord.get(targetWord), type, relationWeights[type] ?? relationWeights.strong)
  }

  for (const bucket of categoryBuckets.values()) {
    for (const source of bucket) {
      const candidates = bucket
        .filter((target) => target.id !== source.id)
        .map((target) => ({ target, score: relationScore(source, target) }))
        .filter((item) => item.score >= 5)
        .sort((a, b) => b.score - a.score || b.target.score - a.target.score)
        .slice(0, 18)

      for (const candidate of candidates) {
        const shared = sharedCharCount(source.word, candidate.target.word)
        const type = shared > 0 ? 'strong' : 'sibling'
        const weight = Math.min(0.74, (type === 'strong' ? 0.52 : 0.38) + candidate.score * 0.015)
        addRelation(source, candidate.target, type, Number(weight.toFixed(3)))
      }
    }
  }
}

function loadCuratedTerms() {
  for (const [sourceWord, targetWord, type] of curatedRelations) {
    const score = type === 'synonym' ? 1200 : 980
    addCandidate(sourceWord, '核心', score, 'curated', type)
    addCandidate(targetWord, '核心', score, 'curated', type)
  }
}

function writeDatabase(selectedTerms) {
  mkdirSync(dirname(dbPath), { recursive: true })
  rmSync(dbPath, { force: true })

  const db = new DatabaseSync(dbPath)
  db.exec(`
    PRAGMA journal_mode = DELETE;
    CREATE TABLE terms (
      id INTEGER PRIMARY KEY,
      word TEXT NOT NULL UNIQUE,
      normalized_word TEXT NOT NULL UNIQUE,
      pinyin TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      frequency INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE relations (
      id INTEGER PRIMARY KEY,
      source_term_id INTEGER NOT NULL,
      target_term_id INTEGER NOT NULL,
      relation_type TEXT NOT NULL,
      weight REAL NOT NULL,
      UNIQUE(source_term_id, target_term_id, relation_type)
    );
    CREATE INDEX idx_terms_normalized_word ON terms(normalized_word);
    CREATE INDEX idx_terms_enabled ON terms(enabled, frequency);
    CREATE INDEX idx_relations_source_target ON relations(source_term_id, target_term_id);
    CREATE INDEX idx_relations_source ON relations(source_term_id);
  `)

  const insertTerm = db.prepare(`
    INSERT INTO terms (id, word, normalized_word, pinyin, category, frequency, enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  const insertRelation = db.prepare(`
    INSERT OR IGNORE INTO relations (source_term_id, target_term_id, relation_type, weight)
    VALUES (?, ?, ?, ?)
  `)

  db.exec('BEGIN')
  for (const term of selectedTerms) {
    insertTerm.run(term.id, term.word, term.word, term.pinyin, term.category, term.frequency, 1)
  }
  for (const relation of relations) {
    insertRelation.run(relation.sourceId, relation.targetId, relation.type, relation.weight)
  }
  db.exec('COMMIT')

  const counts = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM terms) AS terms,
      (SELECT COUNT(*) FROM relations) AS relations,
      (SELECT COUNT(*) FROM terms WHERE word GLOB '*[0-9]*') AS digitTerms,
      (SELECT COUNT(*) FROM terms WHERE length(word) < 2 OR length(word) > 4) AS invalidLengthTerms
  `).get()
  db.close()

  return counts
}

await loadThuocl()
await loadJieba()
await loadXinhuaIdioms()
loadCuratedTerms()

const selectedTerms = selectTerms()
if (selectedTerms.length < 8000) {
  throw new Error(`高质量候选词不足 8000 个，当前仅 ${selectedTerms.length} 个`)
}

buildRelations(selectedTerms)
const counts = writeDatabase(selectedTerms)

console.log(`Built ${dbPath}`)
console.log(
  `terms=${counts.terms} relations=${counts.relations} digitTerms=${counts.digitTerms} invalidLengthTerms=${counts.invalidLengthTerms}`
)

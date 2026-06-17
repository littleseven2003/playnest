import { mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const dbPath = resolve('src/modules/guessword/data/lexicon.sqlite')

const curatedTerms = [
  ['医生', '职业', ['医师', '大夫', '医护', '郎中'], ['医院', '治疗', '健康', '病人', '药物', '检查', '护士', '门诊', '诊所', '处方', '手术'], ['白大褂', '听诊器', '挂号', '病历', '急诊', '科室']],
  ['学习', '教育', ['读书', '求学', '研习'], ['知识', '学校', '阅读', '考试', '课程', '作业', '老师', '课堂'], ['成长', '思考', '理解', '记忆', '练习', '笔记']],
  ['音乐', '艺术', ['乐曲', '歌曲', '声乐'], ['旋律', '乐器', '节奏', '演唱', '声音', '歌手', '钢琴', '吉他'], ['听觉', '舞台', '专辑', '耳机', '合唱', '音符']],
  ['旅行', '生活', ['旅游', '出游', '远行'], ['风景', '城市', '出发', '地图', '假期', '远方', '酒店', '车票'], ['行李', '路线', '拍照', '景点', '攻略', '护照']],
  ['编程', '技术', ['写代码', '程序开发', '编码'], ['代码', '程序', '开发', '逻辑', '函数', '软件', '算法', '调试'], ['键盘', '编辑器', '变量', '项目', '终端', '构建']],
  ['火车', '交通', ['列车', '铁路', '动车'], ['车站', '轨道', '旅途', '速度', '车票', '远方', '乘客', '月台'], ['车厢', '检票', '座位', '行李', '隧道', '时刻表']],
  ['银行', '机构', ['储蓄所', '钱庄'], ['存款', '取款', '账户', '贷款', '柜台', '银行卡', '利息', '现金'], ['排队', '转账', '密码', '网点', '理财', '工作人员']]
]

const domains = [
  { category: '医疗', roots: ['医', '药', '病', '护', '诊', '康', '疗', '急', '检', '术'], suffixes: ['生', '师', '院', '房', '科', '室', '单', '方', '品', '物', '理', '疗', '检', '查', '诊', '治', '护', '士', '患', '者', '急救', '病历', '门诊', '住院', '手术', '处方', '药房', '体检'] },
  { category: '教育', roots: ['学', '教', '课', '书', '考', '题', '文', '习', '读', '讲'], suffixes: ['习', '校', '生', '师', '堂', '程', '本', '籍', '卷', '题', '分', '试', '案', '义', '馆', '院', '业', '问', '答', '讲', '复习', '笔记', '作业', '课堂', '考试', '教材'] },
  { category: '技术', roots: ['云', '数', '网', '智', '程', '码', '算', '机', '软', '硬'], suffixes: ['端', '据', '络', '能', '序', '码', '法', '器', '件', '盘', '库', '站', '页', '包', '栈', '流', '表', '图', '屏', '键', '平台', '系统', '模型', '接口', '服务', '应用'] },
  { category: '交通', roots: ['车', '路', '航', '飞', '船', '站', '轨', '港', '桥', '行'], suffixes: ['站', '票', '道', '线', '班', '机', '船', '港', '桥', '程', '速', '客', '厢', '座', '箱', '轮', '灯', '口', '路', '轨', '机场', '月台', '航线', '客运', '地铁'] },
  { category: '食物', roots: ['面', '米', '菜', '肉', '鱼', '汤', '茶', '咖', '甜', '果'], suffixes: ['包', '饭', '粥', '汤', '饼', '菜', '肉', '鱼', '茶', '饮', '点', '糕', '糖', '酱', '香', '味', '盘', '碗', '锅', '餐', '早餐', '晚餐', '烘焙', '小吃', '甜品'] },
  { category: '运动', roots: ['球', '跑', '泳', '骑', '跳', '练', '赛', '队', '健', '篮'], suffixes: ['场', '鞋', '员', '队', '赛', '分', '跑', '步', '泳', '池', '馆', '练', '习', '操', '拍', '网', '篮', '门', '道', '服', '比赛', '训练', '健身', '冠军'] },
  { category: '自然', roots: ['山', '海', '风', '雨', '云', '花', '树', '星', '月', '水'], suffixes: ['林', '谷', '洋', '浪', '沙', '风', '雨', '云', '花', '草', '树', '叶', '星', '空', '月', '光', '河', '湖', '泉', '石', '森林', '海岸', '星空', '天气'] },
  { category: '艺术', roots: ['画', '音', '影', '舞', '歌', '曲', '剧', '色', '光', '笔'], suffixes: ['画', '笔', '布', '色', '彩', '乐', '曲', '谱', '歌', '声', '影', '片', '剧', '场', '舞', '台', '展', '馆', '风', '格', '音乐', '电影', '绘画', '摄影'] },
  { category: '生活', roots: ['家', '友', '节', '旅', '衣', '房', '园', '店', '市', '街'], suffixes: ['庭', '人', '友', '情', '节', '日', '旅', '行', '衣', '物', '房', '间', '园', '区', '店', '铺', '市', '场', '街', '道', '聚会', '假期', '购物', '社区'] },
  { category: '金融', roots: ['银', '钱', '卡', '账', '贷', '息', '投', '保', '税', '票'], suffixes: ['行', '包', '款', '金', '卡', '号', '账', '户', '贷', '款', '息', '率', '投', '资', '保', '险', '税', '票', '额', '单', '转账', '存款', '理财'] }
]

const relationWeights = {
  synonym: 0.94,
  strong: 0.78,
  hint: 0.56,
  sibling: 0.42
}

const targetCount = Number(process.argv[2] ?? 20000)
const terms = []
const seenWords = new Set()
const relations = []

function addTerm(word, category, frequency = 50) {
  const normalized = word.trim()
  if (!normalized || seenWords.has(normalized)) {
    return null
  }

  const term = {
    id: terms.length + 1,
    word: normalized,
    normalizedWord: normalized,
    pinyin: '',
    category,
    frequency,
    enabled: 1
  }
  seenWords.add(normalized)
  terms.push(term)
  return term
}

function addRelation(source, target, type, weight) {
  if (!source || !target || source.id === target.id) {
    return
  }
  relations.push({ sourceId: source.id, targetId: target.id, type, weight })
  relations.push({ sourceId: target.id, targetId: source.id, type, weight })
}

for (const [word, category, aliases, related, hints] of curatedTerms) {
  const main = addTerm(word, category, 100)
  for (const alias of aliases) {
    addRelation(main, addTerm(alias, category, 88), 'synonym', relationWeights.synonym)
  }
  for (const item of related) {
    addRelation(main, addTerm(item, category, 72), 'strong', relationWeights.strong)
  }
  for (const item of hints) {
    addRelation(main, addTerm(item, category, 46), 'hint', relationWeights.hint)
  }
}

let round = 0
while (terms.length < targetCount) {
  for (const domain of domains) {
    for (const root of domain.roots) {
      for (const suffix of domain.suffixes) {
        const word = `${root}${suffix}${round ? round + 1 : ''}`
        const term = addTerm(word, domain.category, Math.max(5, 60 - round))
        if (!term) {
          continue
        }

        const neighbors = terms
          .filter((candidate) => candidate.category === domain.category && candidate.id !== term.id)
          .slice(-8)
        for (const neighbor of neighbors) {
          const sharedRoot = neighbor.word.includes(root)
          addRelation(term, neighbor, sharedRoot ? 'strong' : 'sibling', sharedRoot ? 0.7 : relationWeights.sibling)
        }

        if (terms.length >= targetCount) {
          break
        }
      }
      if (terms.length >= targetCount) break
    }
    if (terms.length >= targetCount) break
  }
  round += 1
}

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
for (const term of terms) {
  insertTerm.run(term.id, term.word, term.normalizedWord, term.pinyin, term.category, term.frequency, term.enabled)
}
for (const relation of relations) {
  insertRelation.run(relation.sourceId, relation.targetId, relation.type, relation.weight)
}
db.exec('COMMIT')

const counts = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM terms) AS terms,
    (SELECT COUNT(*) FROM relations) AS relations
`).get()
db.close()

console.log(`Built ${dbPath}`)
console.log(`terms=${counts.terms} relations=${counts.relations}`)

import { mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

const dbPath = resolve('src/modules/guessword/data/lexicon.sqlite')
const maxTerms = Number(process.argv[2] ?? 0)

const relationWeights = {
  synonym: 0.94,
  strong: 0.78,
  hint: 0.56,
  sibling: 0.42
}

const curatedRelations = [
  ['医生', '医师', 'synonym'],
  ['医生', '大夫', 'synonym'],
  ['医生', '医护', 'synonym'],
  ['医生', '医院', 'strong'],
  ['医生', '护士', 'strong'],
  ['医生', '治疗', 'strong'],
  ['医生', '门诊', 'strong'],
  ['医生', '听诊器', 'hint'],
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

const lexiconGroups = [
  {
    category: '医疗',
    words: [
      '医生', '医师', '大夫', '医护', '护士', '医院', '诊所', '门诊', '急诊', '病房',
      '病人', '患者', '治疗', '检查', '体检', '手术', '药物', '药品', '处方', '挂号',
      '病历', '健康', '康复', '发烧', '感冒', '咳嗽', '头痛', '胃痛', '牙痛', '输液',
      '针灸', '中医', '西医', '内科', '外科', '儿科', '药房', '听诊器', '白大褂', '救护车'
    ]
  },
  {
    category: '教育',
    words: [
      '学习', '读书', '求学', '学校', '小学', '中学', '大学', '课堂', '课程', '老师',
      '学生', '同学', '作业', '考试', '试卷', '成绩', '分数', '知识', '阅读', '写作',
      '语文', '数学', '英语', '历史', '地理', '物理', '化学', '生物', '教材', '课本',
      '笔记', '练习', '复习', '预习', '毕业', '校园', '教室', '图书馆', '自习', '讲座'
    ]
  },
  {
    category: '技术',
    words: [
      '编程', '编码', '代码', '程序', '软件', '硬件', '算法', '数据', '网络', '网站',
      '应用', '接口', '服务', '系统', '平台', '模型', '智能', '云端', '数据库', '服务器',
      '浏览器', '编辑器', '终端', '键盘', '鼠标', '屏幕', '文件', '项目', '变量', '函数',
      '组件', '路由', '缓存', '日志', '部署', '构建', '测试', '调试', '版本', '仓库'
    ]
  },
  {
    category: '交通',
    words: [
      '火车', '列车', '动车', '高铁', '地铁', '汽车', '公交', '出租车', '飞机', '航班',
      '机场', '车站', '月台', '轨道', '铁路', '公路', '道路', '桥梁', '隧道', '码头',
      '轮船', '客车', '货车', '车票', '机票', '船票', '座位', '乘客', '司机', '驾驶',
      '出发', '到达', '换乘', '检票', '安检', '行李', '路线', '导航', '红灯', '绿灯'
    ]
  },
  {
    category: '食物',
    words: [
      '米饭', '面条', '面包', '馒头', '饺子', '包子', '粥', '汤', '鸡蛋', '牛奶',
      '咖啡', '茶水', '水果', '苹果', '香蕉', '橙子', '西瓜', '葡萄', '蔬菜', '白菜',
      '土豆', '番茄', '黄瓜', '鸡肉', '牛肉', '猪肉', '鱼肉', '海鲜', '蛋糕', '甜品',
      '饼干', '糖果', '巧克力', '火锅', '烧烤', '炒饭', '早餐', '午餐', '晚餐', '餐厅'
    ]
  },
  {
    category: '运动',
    words: [
      '篮球', '足球', '排球', '网球', '乒乓球', '羽毛球', '跑步', '游泳', '骑车', '跳绳',
      '健身', '瑜伽', '散步', '登山', '滑雪', '滑冰', '比赛', '训练', '冠军', '运动员',
      '教练', '裁判', '队友', '球场', '操场', '跑道', '球鞋', '球衣', '得分', '投篮',
      '射门', '传球', '防守', '进攻', '体能', '速度', '力量', '耐力', '热身', '拉伸'
    ]
  },
  {
    category: '自然',
    words: [
      '天空', '太阳', '月亮', '星空', '星星', '云朵', '雨天', '下雨', '大风', '雪花',
      '雷电', '彩虹', '山峰', '森林', '树木', '花朵', '草地', '河流', '湖泊', '海洋',
      '沙滩', '岛屿', '石头', '泥土', '空气', '清风', '阳光', '露水', '季节', '春天',
      '夏天', '秋天', '冬天', '清晨', '黄昏', '夜晚', '天气', '温度', '潮汐', '浪花'
    ]
  },
  {
    category: '艺术',
    words: [
      '音乐', '歌曲', '旋律', '节奏', '乐器', '钢琴', '吉他', '唱歌', '舞蹈', '电影',
      '影片', '演员', '导演', '剧情', '镜头', '影院', '摄影', '相机', '照片', '绘画',
      '画画', '画笔', '颜料', '画布', '颜色', '素描', '水彩', '书法', '展览', '美术',
      '小说', '诗歌', '戏剧', '舞台', '观众', '掌声', '创作', '作品', '风格', '灵感'
    ]
  },
  {
    category: '生活',
    words: [
      '家庭', '朋友', '同事', '邻居', '社区', '城市', '乡村', '街道', '房间', '厨房',
      '卧室', '客厅', '花园', '阳台', '商店', '超市', '市场', '书店', '饭店', '酒店',
      '节日', '生日', '礼物', '聚会', '聊天', '陪伴', '帮助', '快乐', '烦恼', '心情',
      '工作', '休息', '睡觉', '起床', '洗澡', '购物', '旅行', '假期', '衣服', '鞋子'
    ]
  },
  {
    category: '金融',
    words: [
      '银行', '现金', '钱包', '账户', '存款', '取款', '转账', '贷款', '利息', '工资',
      '奖金', '收入', '支出', '价格', '费用', '账单', '发票', '税收', '理财', '投资',
      '股票', '基金', '保险', '资产', '债务', '信用', '密码', '银行卡', '支付宝', '预算'
    ]
  },
  {
    category: '成语',
    words: [
      '一心一意', '三心二意', '七上八下', '九牛一毛', '亡羊补牢', '画蛇添足', '守株待兔', '掩耳盗铃',
      '刻舟求剑', '狐假虎威', '井底之蛙', '胸有成竹', '锦上添花', '雪中送炭', '水落石出', '柳暗花明',
      '心平气和', '风和日丽', '春暖花开', '山清水秀', '鸟语花香', '万紫千红', '欢天喜地', '眉开眼笑',
      '目瞪口呆', '半途而废', '坚持不懈', '专心致志', '争分夺秒', '日积月累', '举一反三', '熟能生巧'
    ]
  }
]

const terms = []
const seenWords = new Set()
const termByWord = new Map()
const relations = []

function isValidWord(word) {
  return /^[\u4e00-\u9fa5]{2,4}$/.test(word)
}

function addTerm(word, category, frequency = 50) {
  const normalized = word.trim()
  if (!isValidWord(normalized) || seenWords.has(normalized)) {
    return null
  }

  if (maxTerms > 0 && terms.length >= maxTerms) {
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
  termByWord.set(normalized, term)
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

function sharedCharCount(a, b) {
  const bChars = new Set([...b])
  return [...new Set([...a])].filter((char) => bChars.has(char)).length
}

for (const group of lexiconGroups) {
  for (const word of group.words) {
    addTerm(word, group.category, group.category === '成语' ? 78 : 70)
  }
}

for (const [sourceWord, targetWord, type] of curatedRelations) {
  const source = termByWord.get(sourceWord)
  const target = termByWord.get(targetWord)
  addRelation(source, target, type, relationWeights[type] ?? relationWeights.strong)
}

for (const group of lexiconGroups) {
  const groupTerms = terms.filter((term) => term.category === group.category)
  for (const source of groupTerms) {
    const candidates = groupTerms
      .filter((target) => target.id !== source.id)
      .map((target) => ({
        target,
        shared: sharedCharCount(source.word, target.word)
      }))
      .sort((a, b) => b.shared - a.shared || b.target.frequency - a.target.frequency)
      .slice(0, 10)

    for (const candidate of candidates) {
      addRelation(
        source,
        candidate.target,
        candidate.shared > 0 ? 'strong' : 'sibling',
        candidate.shared > 0 ? 0.62 : relationWeights.sibling
      )
    }
  }
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
    (SELECT COUNT(*) FROM relations) AS relations,
    (SELECT COUNT(*) FROM terms WHERE word GLOB '*[0-9]*') AS digitTerms,
    (SELECT COUNT(*) FROM terms WHERE length(word) < 2 OR length(word) > 4) AS invalidLengthTerms
`).get()
db.close()

console.log(`Built ${dbPath}`)
console.log(
  `terms=${counts.terms} relations=${counts.relations} digitTerms=${counts.digitTerms} invalidLengthTerms=${counts.invalidLengthTerms}`
)

# 项目设计文档：游戏巢

## 1. 项目概述

### 1.1 项目名称
- 英文名：`playnest`
- 中文名：游戏巢

### 1.2 项目背景
搭建一个自托管的个人游戏集合平台，展示和运行多个小游戏。平台首页展示所有可用游戏的卡片列表，点击进入具体游戏页面进行游玩。

### 1.3 项目目标
- 提供一个美观的游戏中心首页，展示所有小游戏
- 每个游戏独立路由，可单独访问和分享
- 架构支持方便地添加新游戏

### 1.4 目标用户
- 个人使用，也可分享给朋友游玩

---

## 2. 功能范围

### 2.1 v1 必须实现
- **首页游戏列表**：卡片式展示所有游戏，显示封面、名称、简介
- **猜词游戏（/guessword）**：
  - 系统随机选择一个目标词语
  - 用户输入猜测词语
  - 显示猜测词与目标词的语义相似度（0%~100%）
  - 记录猜测历史，按相似度排序展示
  - 猜中后显示胜利动画和统计
- **2048游戏（/game2048）**：
  - 4x4 网格数字滑动合并游戏
  - 支持键盘方向键和触摸滑动操作
  - 相同数字碰撞合并，目标合成 2048
  - 分数统计和最高分记录（本地存储）
  - 游戏结束检测和重新开始
- **响应式设计**：支持桌面和移动端访问
- **Docker 部署**：支持 Docker Compose 部署到 1Panel

### 2.2 v1 暂不实现
- 用户系统（登录/注册）
- 游戏排行榜/历史记录持久化
- 更多游戏
- 管理后台

### 2.3 后续可扩展
- 添加更多小游戏（扫雷、俄罗斯方块、贪吃蛇等）
- 游戏成就系统
- 分享功能

---

## 3. 技术栈选择

### 3.1 前端
- **框架**：Vue 3 + Vite + TypeScript
- **路由**：Vue Router 4
- **UI**：自定义 CSS/SCSS（轻量、可定制）
- **状态管理**：Pinia（游戏状态）

### 3.2 后端
- **运行时**：Node.js + Express + TypeScript
- **用途**：
  - 提供词库 API
  - 计算词语相似度
  - 静态资源服务

### 3.3 数据
- **词库**：JSON 文件或 SQLite 存储中文词汇及词向量
- **相似度计算**：预计算词向量 + 余弦相似度

### 3.4 部署
- **容器化**：Docker Compose
- **面板**：1Panel
- **域名**：games.littleseven.me

### 3.5 选择理由
- Vue 3 + Node.js 全栈统一，开发效率高
- 前后端分离，便于扩展新游戏
- Docker 一键部署，易于维护

---

## 4. 系统架构

```text
用户浏览器
   ↓
Nginx (1Panel 反向代理)
   ↓
┌─────────────────────────────────────┐
│          前端 Vue 应用              │
│  ┌─────────┐  ┌─────────────────┐  │
│  │ 首页    │  │  游戏页面        │  │
│  │ /       │  │  /guessword     │  │
│  │         │  │  /game2048      │  │
│  └─────────┘  └─────────────────┘  │
└─────────────────────────────────────┘
        ↓ API 调用
┌─────────────────────────────────────┐
│        后端 Node.js 服务            │
│  ┌─────────────────────────────┐    │
│  │  词库 API + 相似度计算       │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
        ↓
    词库数据 (JSON/SQLite)
```

---

## 5. 目录结构（游戏模块化设计）

采用**游戏模块隔离**架构，每个游戏作为独立模块，便于单独开发、修改和删除：

```text
playnest/
├── docker-compose.yml
├── README.md
├── design.md
├── .env.example
├── .gitignore
│
├── server/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── app.ts
│       ├── config/
│       │   └── index.ts
│       ├── routes/
│       │   └── index.ts              # 路由聚合入口
│       ├── modules/                   # 游戏后端模块（隔离）
│       │   └── guessword/
│       │       ├── routes.ts          # 猜词游戏路由
│       │       ├── service.ts         # 业务逻辑
│       │       ├── data/
│       │       │   └── words.json     # 词库数据
│       │       └── types.ts           # 类型定义
│       ├── shared/                    # 共享工具
│       │   ├── utils/
│       │   └── middlewares/
│       └── types/
│           └── index.ts
│
├── web/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       ├── router/
│       │   └── index.ts              # 路由聚合
│       ├── stores/
│       │   └── index.ts              # Store 聚合
│       ├── modules/                   # 游戏前端模块（隔离）
│       │   ├── guessword/
│       │   │   ├── index.ts          # 模块入口（导出配置）
│       │   │   ├── GuessWord.vue     # 游戏页面
│       │   │   ├── components/       # 游戏专属组件
│       │   │   ├── composables/      # 游戏逻辑组合函数
│       │   │   ├── api.ts            # 游戏API调用
│       │   │   ├── store.ts          # 游戏状态管理
│       │   │   ├── types.ts          # 类型定义
│       │   │   ├── styles.scss       # 游戏专属样式
│       │   │   └── assets/           # 游戏专属资源
│       │   │       └── cover.png     # 游戏封面
│       │   │
│       │   └── game2048/
│       │       ├── index.ts          # 模块入口
│       │       ├── Game2048.vue      # 游戏页面
│       │       ├── components/
│       │       ├── composables/
│       │       ├── store.ts
│       │       ├── types.ts
│       │       ├── styles.scss
│       │       └── assets/
│       │           └── cover.png
│       │
│       ├── views/
│       │   └── Home.vue              # 首页 - 游戏列表
│       ├── components/
│       │   ├── GameCard.vue           # 公共游戏卡片
│       │   └── Layout.vue            # 公共布局
│       ├── shared/                    # 共享资源
│       │   ├── styles/
│       │   │   ├── variables.scss
│       │   │   └── main.scss
│       │   ├── utils/
│       │   └── types/
│       └── config/
│           └── games.ts              # 游戏注册配置
│
└── docs/
```

---

## 6. 游戏模块化设计

### 6.1 隔离原则

每个游戏是一个**独立模块**，遵循以下原则：

1. **文件隔离**：每个游戏的所有文件（组件、API、样式、资源）都在独立目录
2. **配置驱动**：通过配置文件注册游戏，增删游戏只需修改配置
3. **接口规范**：每个游戏模块导出统一接口
4. **零耦合**：游戏之间无直接依赖，修改一个不影响其他

### 6.2 游戏模块接口规范

每个游戏前端模块需导出以下接口：

```typescript
// web/src/modules/guessword/index.ts

import type { GameModule } from '@/shared/types'

export default {
  // 基础配置
  id: 'guessword',
  name: '猜词游戏',
  description: '根据语义相似度猜出隐藏词语',
  tags: ['文字', '益智'],
  color: '#4CAF50',
  
  // 路由配置
  route: {
    path: '/guessword',
    name: 'GuessWord',
    component: () => import('./GuessWord.vue')
  },
  
  // 封面资源（可选）
  cover: new URL('./assets/cover.png', import.meta.url).href
} as GameModule
```

### 6.3 游戏注册机制

```typescript
// web/src/config/games.ts

import type { GameModule } from '@/shared/types'

// 导入所有游戏模块
import guessword from '@/modules/guessword'
import game2048 from '@/modules/game2048'

// 游戏注册列表
export const gameModules: GameModule[] = [
  guessword,
  game2048,
  // 新增游戏只需在此添加一行
]

// 自动生成游戏列表
export const games = gameModules.map(m => ({
  id: m.id,
  name: m.name,
  description: m.description,
  cover: m.cover,
  route: m.route.path,
  tags: m.tags,
  color: m.color
}))
```

### 6.4 路由自动注册

```typescript
// web/src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'
import { gameModules } from '@/config/games'
import Home from '@/views/Home.vue'

const routes = [
  { path: '/', component: Home },
  // 自动注册所有游戏路由
  ...gameModules.map(m => m.route)
]

export default createRouter({
  history: createWebHistory(),
  routes
})
```

### 6.5 后端模块隔离

每个游戏后端模块：

```typescript
// server/src/modules/guessword/routes.ts

import { Router } from 'express'
import { GameService } from './service'

const router = Router()
const service = new GameService()

router.get('/start', (req, res) => {
  // ...
})

router.post('/guess', (req, res) => {
  // ...
})

export default {
  path: '/api/guessword',
  router
}
```

```typescript
// server/src/routes/index.ts

import guesswordRoutes from '@/modules/guessword/routes'
import game2048Routes from '@/modules/game2048/routes'  // 如有后端

export const registerRoutes = (app) => {
  app.use(guesswordRoutes.path, guesswordRoutes.router)
  app.use(game2048Routes.path, game2048Routes.router)
  // 新增游戏路由...
}
```

### 6.6 新增游戏流程

添加一个新游戏只需 3 步：

1. **创建模块目录**：
   ```bash
   mkdir -p web/src/modules/newgame
   mkdir -p server/src/modules/newgame  # 如需后端
   ```

2. **实现游戏模块**（创建 index.ts、组件、逻辑等）

3. **注册游戏**：
   ```typescript
   // web/src/config/games.ts
   import newgame from '@/modules/newgame'
   
   export const gameModules = [
     guessword,
     game2048,
     newgame  // 添加这行
   ]
   ```

### 6.7 删除游戏流程

删除一个游戏只需 2 步：

1. **移除注册**：从 `games.ts` 中删除对应 import 和配置
2. **删除目录**：删除对应的模块目录

无需修改任何其他代码！

---

## 7. 猜词游戏详细设计

### 7.1 游戏规则
1. 系统从词库中随机选择一个目标词语（2-4个字的中文词）
2. 用户输入一个猜测词语
3. 系统计算并显示猜测词与目标词的语义相似度（0%~100%）
4. 相似度越高，颜色越接近绿色；越低越接近红色
5. 用户根据反馈继续猜测
6. 猜中目标词（相似度100%）时游戏胜利
7. 显示猜测次数统计

### 7.2 UI 设计

```
┌─────────────────────────────────────────┐
│  ← 返回        猜词游戏        ? 帮助   │
├─────────────────────────────────────────┤
│                                         │
│           ┌───────────────┐             │
│           │   输入猜测词   │             │
│           └───────────────┘             │
│              [ 猜 测 ]                   │
│                                         │
├─────────────────────────────────────────┤
│  猜测历史                    已猜 3 次   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  测试    ████████████   85%     │    │
│  ├─────────────────────────────────┤    │
│  │  考试    █████████     65%      │    │
│  ├─────────────────────────────────┤    │
│  │  苹果    ████          15%      │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 7.3 API 设计

#### GET /api/guessword/start
开始新游戏，返回游戏ID。

响应：
```json
{
  "success": true,
  "data": {
    "gameId": "uuid"
  }
}
```

#### POST /api/guessword/guess
提交猜测。

请求：
```json
{
  "gameId": "uuid",
  "word": "猜测词"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "word": "猜测词",
    "similarity": 85.5,
    "isCorrect": false,
    "guessCount": 3
  }
}
```

#### GET /api/guessword/wordlist
获取可用词汇列表（用于输入提示，可选）。

### 7.4 相似度计算方案

**方案一：预计算词向量（推荐）**
- 使用中文词向量（如 Tencent AI Lab Embedding）
- 预计算词库中所有词对的相似度，存储为矩阵
- 查询时直接查表，速度极快
- 缺点：词向量文件较大，需要预处理

**方案二：拼音 + 编辑距离（轻量级）**
- 计算拼音相似度（声母、韵母、声调）
- 计算编辑距离
- 综合评分
- 优点：无需大文件，计算快
- 缺点：语义相似度不够准确

**方案三：API 调用（中等）**
- 调用外部 NLP API 计算相似度
- 优点：准确
- 缺点：依赖外部服务

**推荐方案**：预处理一个小型词库（5000-10000词），使用预计算的相似度矩阵。词库控制在合理大小，相似度数据可存储为 JSON 或 SQLite。

---

## 8. 2048游戏详细设计

### 8.1 游戏规则
1. 4x4 网格，初始有两个数字方块（2 或 4）
2. 每次操作（上/下/左/右）所有方块向该方向滑动
3. 两个相同数字的方块相遇时合并为它们的和
4. 每次滑动后在空位随机生成一个 2（90%）或 4（10%）
5. 当出现 2048 方块时玩家获胜（可继续挑战更高分）
6. 当没有空位且无法合并时游戏结束

### 8.2 UI 设计

```
┌─────────────────────────────────────────┐
│  ← 返回          2048          ↺ 新游戏 │
├─────────────────────────────────────────┤
│                                         │
│     分数: 1024      最高分: 4096        │
│                                         │
│  ┌────┬────┬────┬────┐                  │
│  │    │  2 │    │    │                  │
│  ├────┼────┼────┼────┤                  │
│  │    │    │  4 │    │                  │
│  ├────┼────┼────┼────┤                  │
│  │  2 │    │    │    │                  │
│  ├────┼────┼────┼────┤                  │
│  │    │    │    │  2 │                  │
│  └────┴────┴────┴────┘                  │
│                                         │
│     ← ↑ → ↓  或 触摸滑动               │
│                                         │
└─────────────────────────────────────────┘
```

### 8.3 核心逻辑

```typescript
// 游戏状态
interface Game2048State {
  grid: number[][];        // 4x4 网格，0表示空
  score: number;           // 当前分数
  bestScore: number;       // 最高分
  gameOver: boolean;       // 游戏是否结束
  won: boolean;            // 是否已达到2048
}

// 核心操作
- moveLeft(): void
- moveRight(): void
- moveUp(): void
- moveDown(): void
- addRandomTile(): void
- canMove(): boolean
- reset(): void
```

### 8.4 方块颜色方案

| 数值 | 背景色 | 文字色 |
|------|--------|--------|
| 2    | #EEE4DA | #776E65 |
| 4    | #EDE0C8 | #776E65 |
| 8    | #F2B179 | #F9F6F2 |
| 16   | #F59563 | #F9F6F2 |
| 32   | #F67C5F | #F9F6F2 |
| 64   | #F65E3B | #F9F6F2 |
| 128  | #EDCF72 | #F9F6F2 |
| 256  | #EDCC61 | #F9F6F2 |
| 512  | #EDC850 | #F9F6F2 |
| 1024 | #EDC53F | #F9F6F2 |
| 2048 | #EDC22E | #F9F6F2 |

### 8.5 技术要点
- **纯前端实现**：无需后端 API
- **触摸支持**：监听 touchstart/touchend 计算滑动方向
- **键盘支持**：监听方向键事件
- **动画效果**：方块滑动和合并动画（CSS transition）
- **本地存储**：使用 localStorage 保存最高分
- **响应式布局**：适配不同屏幕尺寸

---

## 9. 词库设计

### 9.1 词库来源
- 常用中文词汇（2-4字）
- 可从开放词库获取，如：
  - 现代汉语常用词表
  - THUOCL 中文词库

### 9.2 词库格式

```json
// words.json
{
  "words": [
    {
      "id": 1,
      "word": "学习",
      "pinyin": "xué xí",
      "category": "动词"
    },
    // ...
  ],
  "similarity_matrix": {
    "1": { "2": 0.85, "3": 0.45 },
    "2": { "1": 0.85, "3": 0.60 }
    // ...
  }
}
```

### 9.3 词库规模
- 初始词库：1000-2000 个常用词
- 后续可扩展到 5000-10000 词

---

## 10. 核心模块设计

### 10.1 平台核心模块

#### 首页（Home.vue）
- 响应式卡片网格布局
- 每个卡片显示：游戏封面、名称、简介、标签
- 点击卡片进入对应游戏

#### GameCard 组件
- 封面图片
- 游戏名称
- 简介
- 主题色渐变边框
- hover 动画效果

### 10.2 游戏模块规范

每个游戏模块需包含：
- **index.ts**：模块入口，导出配置
- **GameXxx.vue**：游戏主页面
- **components/**：游戏专属组件
- **composables/**：游戏逻辑组合函数
- **store.ts**：游戏状态管理
- **types.ts**：类型定义
- **styles.scss**：游戏专属样式
- **assets/**：游戏专属资源（封面等）

### 10.3 后端模块规范

每个游戏后端模块（如需要）需包含：
- **routes.ts**：游戏路由
- **service.ts**：业务逻辑服务
- **data/**：游戏数据文件
- **types.ts**：类型定义

#### 猜词游戏后端模块
- 词库服务：加载词库、随机选择目标词
- 相似度服务：计算/查询词语相似度
- API路由：开始游戏、提交猜测
- 游戏状态管理（内存）

---

## 11. 部署方案

### 11.1 Docker Compose

```yaml
version: '3.8'

services:
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: playnest-server
    restart: unless-stopped
    ports:
      - "3001:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production

  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: playnest-web
    restart: unless-stopped
    ports:
      - "8080:80"
    depends_on:
      - server
```

### 11.2 1Panel 部署步骤

1. 上传项目到服务器 `/opt/playnest`
2. `docker-compose up -d --build`
3. 1Panel 创建反向代理：`games.littleseven.me` → `http://127.0.0.1:8080`
4. 申请 HTTPS 证书

---

## 12. 开发阶段

### Phase 1: 项目初始化（1-2天）
- [ ] 创建项目目录结构
- [ ] 初始化 Vue 3 + Vite 前端
- [ ] 初始化 Node.js + Express 后端
- [ ] 配置 TypeScript
- [ ] 编写 Dockerfile 和 docker-compose.yml
- [ ] Git 初始提交

### Phase 2: 前端框架（2-3天）
- [ ] 实现首页布局和游戏卡片
- [ ] 配置 Vue Router
- [ ] 实现响应式设计
- [ ] Git 提交

### Phase 3: 猜词游戏后端（3-4天）
- [ ] 准备词库数据
- [ ] 实现相似度计算/查询
- [ ] 实现游戏 API（start、guess）
- [ ] 测试 API
- [ ] Git 提交

### Phase 4: 猜词游戏前端（3-4天）
- [ ] 实现游戏页面 UI
- [ ] 对接后端 API
- [ ] 实现猜测历史展示
- [ ] 实现胜利动画
- [ ] Git 提交

### Phase 5: 2048游戏（3-4天）
- [ ] 实现游戏核心逻辑（网格、滑动、合并）
- [ ] 实现键盘和触摸操作
- [ ] 实现方块动画效果
- [ ] 实现分数统计和最高分存储
- [ ] 实现游戏结束/胜利检测
- [ ] Git 提交

### Phase 6: 部署上线（1-2天）
- [ ] Docker 构建测试
- [ ] 部署到服务器
- [ ] 配置域名和 HTTPS
- [ ] Git 提交

---

## 13. 给开发 Agent 的提示词

```
请根据 design.md 实现 playnest 游戏巢项目。要求：

1. **严格按照设计文档开发**：
   - 遵循目录结构
   - 实现所有 API 接口
   - 实现猜词游戏完整功能
   - 实现2048游戏完整功能

2. **优先级**：
   - 先完成首页和路由配置
   - 再完成猜词游戏后端 API
   - 然后完成猜词游戏前端
   - 最后完成2048游戏（纯前端）

3. **代码质量**：
   - TypeScript 严格模式
   - 清晰的组件划分
   - 适当的注释
   - 游戏逻辑与UI分离

4. **提交规范**：
   - 每完成一个功能模块提交一次
   - 提交信息清晰描述变更

5. **注意**：
   - 词库先使用小规模测试数据（100-200词）
   - 相似度计算优先实现简单可用方案
   - 2048游戏注意触摸和键盘操作的兼容性
   - 不要过度设计，保持简洁
```

---

*文档版本：v1.0*
*项目：playnest 游戏巢*

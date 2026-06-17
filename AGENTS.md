# LS_Develop_Base

## Skill 名称

LS_Develop_Base

## 中文名称

小项目开发基础规范 Skill

## 适用场景

当用户准备开发、修改、维护、发布一个程序项目时，使用本 Skill 统一约束项目开发过程中的：

- Git 版本控制
- 目录初始化
- 文档存放规范
- Python / uv 环境使用
- 分支与提交规范
- 远程仓库同步
- Pull Request 流程
- 发布与打包规范
- `.gitignore` 与敏感信息管理

本 Skill 适用于以下类型项目：

- Web 小工具
- AI 生成器
- 数据整理工具
- 管理面板
- Docker / 1Panel 部署项目
- Python 脚本工具
- Vue / Node.js 项目
- FastAPI / Django 项目
- 个人小型开源项目
- 内部工作辅助工具

---

## 核心原则

1. 所有项目开发都必须纳入 Git 版本控制。
2. 每个小功能、小修改都要形成独立 commit。
3. commit 内容必须规范、清晰、可追踪。
4. 开发过程不得在提交、分支名、发布名中体现 Agent、Codex、Claude 等字样。
5. 所有操作应模拟用户本人正常开发流程。
6. 项目目录、环境配置、文档位置必须保持清晰。
7. 不提交敏感信息、密钥、缓存、依赖目录和构建产物。
8. 远程仓库存在时，应及时同步。
9. 涉及主分支合并时，应优先使用 GitHub Pull Request 流程。
10. 任何自动化开发都应优先保证项目可运行、可回滚、可追踪。

---

# 1. Git 用户信息规范

## 1.1 默认 Git 用户名

```bash
git config user.name "littleseven2003"
```

## 1.2 默认 Git 邮箱

```bash
git config user.email "littleseven2003@126.com"
```

## 1.3 配置范围

优先在当前项目内设置局部配置：

```bash
git config --local user.name "littleseven2003"
git config --local user.email "littleseven2003@126.com"
```

如果用户明确要求全局设置，才使用：

```bash
git config --global user.name "littleseven2003"
git config --global user.email "littleseven2003@126.com"
```

默认不主动修改全局 Git 配置。

---

# 2. 项目初始化规范

## 2.1 检查是否已有 Git 仓库

进入项目目录后，必须先检查：

```bash
git status
```

如果提示不是 Git 仓库，应执行：

```bash
git init
```

初始化后立即设置当前项目 Git 用户信息。

---

## 2.2 未开始开发的新项目

如果项目还未开始开发，应按照以下顺序处理：

1. 根据 `Design.md` 或用户需求创建目录结构。
2. 将所有项目文档放入 `/docs` 目录。
3. 初始化 Git 仓库。
4. 创建 `.gitignore`。
5. 创建基础 `README.md`。
6. 创建必要的环境示例文件，例如 `.env.example`。
7. 完成第一次初始化 commit。
8. 询问用户是否需要通过 GitHub CLI `gh` 创建远程仓库。

---

## 2.3 远程仓库确认

如果项目没有远程仓库，应检查：

```bash
git remote -v
```

如果没有输出，不应擅自创建远程仓库，应询问用户：

```text
当前项目还没有配置远程仓库，是否需要我使用 gh 在 GitHub 上创建远程仓库并推送？
```

如果用户同意，再使用 `gh` 创建仓库。

推荐命令形式：

```bash
gh repo create <repo-name> --private --source=. --remote=origin --push
```

或根据用户要求创建公开仓库：

```bash
gh repo create <repo-name> --public --source=. --remote=origin --push
```

---

# 3. 目录与文档规范

## 3.1 文档目录

所有设计文档、说明文档、规划文档、变更文档应统一放入：

```text
/docs
```

推荐结构：

```text
project-name/
├── docs/
│   ├── Design.md
│   ├── CHANGELOG.md
│   ├── DEPLOYMENT.md
│   ├── RELEASE_NOTES.md
│   └── TODO.md
├── README.md
├── .gitignore
├── .env.example
└── ...
```

---

## 3.2 Design 文档位置

如果存在设计文档，应放在：

```text
/docs/Design.md
```

如果有多个版本：

```text
/docs/Design_v1.md
/docs/Design_v2.md
/docs/Design_no_admin.md
```

当前生效版本可复制或软链接为：

```text
/docs/Design.md
```

---

## 3.3 README 与 docs 的分工

`README.md` 用于项目入口说明，应简洁说明：

- 项目名称
- 项目简介
- 技术栈
- 快速启动
- 环境变量
- 部署方式
- 常用命令

`/docs/Design.md` 用于详细项目设计，应包含：

- 功能模块
- 页面设计
- API 设计
- 数据结构
- 部署方案
- 版本规划
- 开发规范

---

# 4. Git 提交规范

## 4.1 提交频率

必须严格使用 Git 进行版本控制。

以下情况都应提交 commit：

- 初始化项目目录
- 添加设计文档
- 新增一个页面
- 新增一个接口
- 新增一个数据模型
- 新增一个配置文件
- 完成一个小功能
- 修复一个小问题
- 调整样式
- 修改部署配置
- 更新 README
- 更新 Design 文档
- 添加测试
- 修复 lint 或格式问题

避免将多个无关修改混在一个 commit 中。

---

## 4.2 commit message 格式

提交信息必须使用规范格式：

```text
<type>: <中文描述>
```

示例：

```text
init: 初始化项目目录结构
docs: 添加项目设计文档
feat: 添加节假日加班数据导入功能
feat: 添加表格字段映射配置
fix: 修复导出文件名异常问题
style: 优化首页表单布局
refactor: 重构加班数据解析逻辑
chore: 添加 Docker 部署配置
test: 添加表格解析单元测试
build: 调整前端构建配置
release: 发布 v0.1.0 版本
```

---

## 4.3 commit type 说明

推荐使用以下类型：

| 类型 | 含义 |
|---|---|
| init | 项目初始化 |
| feat | 新功能 |
| fix | 修复问题 |
| docs | 文档修改 |
| style | 样式调整，不影响逻辑 |
| refactor | 重构代码 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 杂项维护 |
| build | 构建配置 |
| ci | CI/CD 配置 |
| config | 配置调整 |
| deploy | 部署相关 |
| release | 版本发布 |
| revert | 回滚提交 |

---

## 4.4 commit 内容语言

commit 描述必须使用中文书写。

允许 type 使用英文，但冒号后的内容必须使用中文。

正确示例：

```text
feat: 添加 Excel 文件上传功能
```

不推荐：

```text
feat: add excel upload
```

---

## 4.5 禁止出现的关键字

在以下位置不得出现：

- commit message
- branch name
- tag name
- release title
- release note 标题
- PR 标题
- PR 分支名

禁止关键字包括但不限于：

```text
agent
Agent
codex
Codex
claude
Claude
ClaudeCode
AI生成
AI开发
由AI完成
```

应直接模拟用户本人正常开发提交。

错误示例：

```text
feat: 使用 Codex 添加上传功能
fix: 修复 Claude 生成的错误
agent/add-upload-page
release: AI 完成初版
```

正确示例：

```text
feat: 添加上传功能
fix: 修复文件解析异常
feature/upload-page
release: 发布 v0.1.0 版本
```

---

# 5. 分支管理规范

## 5.1 主分支名称

默认主分支使用：

```text
main
```

如果已有项目使用 `master`，不强行修改，除非用户明确要求。

---

## 5.2 功能分支命名

分支名应简洁、英文、小写、使用短横线。

推荐格式：

```text
feature/<feature-name>
fix/<bug-name>
docs/<doc-name>
refactor/<module-name>
release/<version>
```

示例：

```text
feature/excel-upload
feature/overtime-summary
fix/export-filename
docs/update-design
release/v0.1.0
```

不得出现 Agent、Codex、Claude 等相关字样。

---

## 5.3 何时创建分支

以下情况建议创建新分支：

- 新增较大功能
- 重构核心模块
- 修改部署结构
- 发布前准备
- 修复重要问题
- 当前工作可能影响主分支稳定性

小型文档修改或非常小的修复，可以直接在当前开发分支提交。

---

## 5.4 合并主分支要求

如果当前不在主分支，且操作需要合并回主分支，应优先使用 GitHub Pull Request 流程，而不是直接本地强行合并。

推荐流程：

```bash
git checkout -b feature/<name>
# 开发与提交
git push -u origin feature/<name>
gh pr create --base main --head feature/<name> --title "<中文PR标题>" --body "<详细说明>"
```

PR 标题示例：

```text
添加节假日加班表格导入与汇总功能
```

PR 内容应包括：

```markdown
## 本次变更

- 添加 Excel 文件上传功能
- 添加节假日加班数据解析逻辑
- 添加汇总结果预览页面

## 验证方式

- 本地启动前后端服务
- 上传示例表格
- 确认汇总结果正常生成

## 影响范围

- 前端上传页面
- 后端解析接口
- 表格导出逻辑
```

PR 合并前，应确保：

1. 工作区干净。
2. 分支已推送远程。
3. PR 描述清楚。
4. 没有敏感信息。
5. 项目可以正常运行或构建。

---

# 6. 远程同步规范

## 6.1 每次提交后检查状态

每次 commit 后应执行：

```bash
git status
```

如果配置了远程仓库，应及时推送：

```bash
git push
```

首次推送分支：

```bash
git push -u origin <branch-name>
```

---

## 6.2 开发前同步

开始开发前，如果有远程仓库，应先同步：

```bash
git fetch origin
```

然后根据当前分支情况执行：

```bash
git pull --ff-only
```

避免无意义 merge commit。

---

## 6.3 避免强制推送

默认禁止使用：

```bash
git push --force
```

如果确实需要，应优先使用：

```bash
git push --force-with-lease
```

并在执行前确认原因。

---

# 7. Python 与 uv 环境规范

## 7.1 何时使用 uv

如果 Agent 操作过程中需要使用 Python，优先使用 `uv` 管理环境。

适用场景：

- Python 脚本工具
- Excel / Word / PDF 处理
- FastAPI / Flask / Django 服务
- 数据处理工具
- 自动化脚本
- 测试脚本

---

## 7.2 项目未初始化时使用 uv

如果项目目录未初始化，且需要 Python，应执行：

```bash
uv init
```

如果是纯脚本或服务项目，可根据实际情况选择：

```bash
uv init --app
```

或：

```bash
uv init --package
```

初始化后应检查 `uv` 自动生成的文件。

---

## 7.3 删除 uv 初始化生成的非必要文件

`uv init` 可能生成示例文件。若这些文件与项目无关，应删除或改造成项目实际入口。

常见处理：

```text
hello.py / main.py 示例内容
```

如果只是默认示例，应删除或替换为真实项目入口。

不保留无意义示例代码。

---

## 7.4 依赖管理

添加依赖使用：

```bash
uv add <package>
```

开发依赖使用：

```bash
uv add --dev <package>
```

运行命令使用：

```bash
uv run <command>
```

不推荐手动维护杂乱的 `pip install` 记录。

---

## 7.5 Python 版本

如无特殊要求，优先使用当前稳定版本。

可在 `pyproject.toml` 中指定：

```toml
requires-python = ">=3.11"
```

如果项目依赖较新生态，可使用：

```toml
requires-python = ">=3.12"
```

---

## 7.6 uv 相关 Git 管理

应提交：

```text
pyproject.toml
uv.lock
```

不应提交：

```text
.venv/
__pycache__/
*.pyc
.pytest_cache/
.ruff_cache/
.mypy_cache/
```

---

# 8. Node / 前端环境规范

## 8.1 Node 项目依赖管理

如果项目是 Node.js / Vue / React，应优先根据项目已有包管理器执行。

检查顺序：

```text
pnpm-lock.yaml → pnpm
package-lock.json → npm
yarn.lock → yarn
```

如果是新项目，优先使用：

```text
pnpm
```

如用户明确偏好 npm，则使用 npm。

---

## 8.2 前端项目常见命令

安装依赖：

```bash
pnpm install
```

开发运行：

```bash
pnpm dev
```

构建：

```bash
pnpm build
```

检查：

```bash
pnpm lint
```

---

## 8.3 Node 相关 Git 管理

应提交：

```text
package.json
pnpm-lock.yaml / package-lock.json / yarn.lock
```

不应提交：

```text
node_modules/
dist/
build/
.vite/
.cache/
```

除非项目明确需要提交构建产物，例如 GitHub Pages 静态部署。

---

# 9. .gitignore 规范

## 9.1 通用 .gitignore

项目应根据技术栈创建合理 `.gitignore`。

通用内容：

```gitignore
# System
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/

# Logs
*.log
logs/

# Env
.env
.env.*
!.env.example

# Dependencies
node_modules/
.venv/
venv/

# Python
__pycache__/
*.py[cod]
.pytest_cache/
.ruff_cache/
.mypy_cache/

# Build
dist/
build/
.cache/

# Database / Runtime data
*.db
*.sqlite
*.sqlite3
data/
uploads/
tmp/
temp/

# Secrets
*.pem
*.key
*.crt
secrets/
```

---

## 9.2 注意事项

`.env.example` 必须提交。

真实 `.env` 不得提交。

如果项目需要保留空目录，应使用：

```text
.gitkeep
```

例如：

```text
server/data/.gitkeep
uploads/.gitkeep
```

---

# 10. 敏感信息管理规范

以下内容不得提交到仓库：

- API Key
- Token
- Cookie
- Session Secret
- 数据库密码
- SSH 私钥
- 证书私钥
- 真实生产环境 `.env`
- 内网地址与敏感服务器信息
- 个人账号密码
- 真实用户数据
- 未脱敏的工作文件

如需要示例，应写入：

```text
.env.example
```

示例：

```env
ADMIN_PASSWORD=change-me
ADMIN_SESSION_SECRET=change-me
DATABASE_URL=sqlite:///data/app.db
OPENAI_API_KEY=your-api-key-here
```

---

# 11. 开发执行规范

## 11.1 开发前检查

开始修改前，应执行：

```bash
pwd
git status
git branch
git remote -v
```

如有未提交修改，应先判断是否为用户已有工作，不得随意覆盖。

---

## 11.2 不覆盖用户已有工作

如果发现工作区存在未提交修改：

```bash
git status
```

应先查看变更：

```bash
git diff
```

不要直接执行：

```bash
git reset --hard
git checkout .
rm -rf
```

除非用户明确要求。

---

## 11.3 每一步小修改后提交

典型流程：

```bash
# 修改文件
git status
git diff
git add <files>
git commit -m "feat: 添加文件上传页面"
git push
```

---

## 11.4 保持项目可运行

每个阶段提交前，应尽量确保：

- 项目可以安装依赖
- 项目可以启动
- 基础构建通过
- 没有明显语法错误
- 文档与实际命令一致

如因环境限制无法验证，应在提交信息或开发总结中说明。

---

# 12. 发布与打包规范

## 12.1 何时发布版本

以下情况可以打包发布：

- 完成最小可用版本
- 完成重要功能阶段
- 修复关键问题
- 项目达到可部署状态
- 用户明确要求发布版本

---

## 12.2 版本号规范

推荐使用语义化版本：

```text
v主版本.次版本.修订号
```

示例：

```text
v0.1.0
v0.2.0
v1.0.0
v1.0.1
```

说明：

- `v0.1.0`：首个可用原型
- `v0.2.0`：新增主要功能
- `v1.0.0`：正式稳定版本
- `v1.0.1`：修复问题

---

## 12.3 发布前检查

发布前应检查：

```bash
git status
git log --oneline -n 10
```

确保：

1. 工作区干净。
2. 所有修改已提交。
3. 分支与远程同步。
4. README 已更新。
5. `/docs/CHANGELOG.md` 已更新。
6. `.env.example` 已更新。
7. 没有提交敏感信息。
8. 可正常构建或启动。

---

## 12.4 CHANGELOG 规范

发布版本时，应维护：

```text
/docs/CHANGELOG.md
```

格式：

```markdown
# 更新日志

## v0.1.0 - 2026-06-02

### 新增

- 添加项目基础目录结构
- 添加 Excel 表格上传功能
- 添加节假日加班数据解析功能
- 添加汇总结果导出功能

### 修复

- 修复导出文件名为空时的异常

### 调整

- 优化首页表单布局
- 调整 Docker Compose 服务名称
```

---

## 12.5 RELEASE_NOTES 规范

如需要打包发布，应生成详细提交信息文档：

```text
/docs/RELEASE_NOTES.md
```

推荐结构：

```markdown
# 发布说明

## 版本

v0.1.0

## 发布时间

2026-06-02

## 本次发布内容

### 主要功能

- 支持上传节假日加班 Excel 表格
- 支持自动识别人员、日期、加班时长
- 支持生成汇总结果
- 支持导出整理后的 Excel 文件

### 技术变更

- 初始化前后端项目结构
- 添加 Docker Compose 部署配置
- 添加 `.env.example`
- 添加基础日志与错误处理

### 使用说明

1. 复制 `.env.example` 为 `.env`
2. 修改必要配置
3. 执行启动命令
4. 访问前端页面

### 注意事项

- 请勿提交真实 `.env`
- 当前版本仅支持标准模板表格
- 非标准表格格式将在后续版本增强

## 提交记录摘要

- init: 初始化项目目录结构
- docs: 添加项目设计文档
- feat: 添加 Excel 上传功能
- feat: 添加加班数据解析逻辑
- feat: 添加汇总导出功能
- chore: 添加 Docker 部署配置
```

---

## 12.6 Git Tag 规范

发布时创建 tag：

```bash
git tag -a v0.1.0 -m "发布 v0.1.0 版本"
git push origin v0.1.0
```

tag 名称不得包含 Agent、Codex、Claude 等字样。

---

## 12.7 GitHub Release 规范

如果需要创建 GitHub Release：

```bash
gh release create v0.1.0 \
  --title "v0.1.0" \
  --notes-file docs/RELEASE_NOTES.md
```

Release 标题使用版本号或中文标题：

```text
v0.1.0
```

或：

```text
v0.1.0 首个可用版本
```

不得出现 Agent、Codex、Claude 等字样。

---

# 13. GitHub CLI 使用规范

## 13.1 检查 gh 登录状态

创建远程仓库或 PR 前，应检查：

```bash
gh auth status
```

如果未登录，应提示用户先登录：

```bash
gh auth login
```

---

## 13.2 创建远程仓库

如果用户同意创建远程仓库，可执行：

```bash
gh repo create <repo-name> --private --source=. --remote=origin --push
```

默认建议私有仓库。

如果用户明确要求开源：

```bash
gh repo create <repo-name> --public --source=. --remote=origin --push
```

---

## 13.3 创建 PR

```bash
gh pr create \
  --base main \
  --head feature/<name> \
  --title "<中文标题>" \
  --body-file docs/PR_DESCRIPTION.md
```

若不需要保留 PR 描述文件，也可直接使用 `--body`。

---

# 14. 工作总结输出规范

每次完成一轮开发或修改后，应向用户简要汇总：

```markdown
已完成：

- 初始化项目目录结构
- 添加 `/docs/Design.md`
- 配置 `.gitignore`
- 完成首次提交：`init: 初始化项目目录结构`
- 当前分支：`main`
- 远程仓库：未配置

下一步建议：

- 确认是否使用 gh 创建 GitHub 远程仓库
```

如已经推送：

```markdown
已同步到远程仓库。
```

如无法推送：

```markdown
本地提交已完成，但远程推送失败，原因是……
```

---

# 15. 与 LS_Create_Design 的配合方式

如果项目已有 `LS_Create_Design` 生成的设计文档，应优先按该文档初始化项目。

推荐流程：

```text
LS_Create_Design
→ 生成 /docs/Design.md
→ LS_Develop_Base
→ 初始化项目目录
→ 初始化 Git
→ 设置 .gitignore
→ 创建 README 和 .env.example
→ 首次 commit
→ 询问是否创建远程仓库
→ 按 Design.md 分模块开发
```

---

# 16. 标准执行流程

## 16.1 新项目流程

```text
1. 进入项目目录
2. 检查 git status
3. 如未初始化，执行 git init
4. 设置本地 Git 用户名和邮箱
5. 根据 Design.md 初始化目录
6. 创建 /docs
7. 将设计文档放入 /docs/Design.md
8. 创建 README.md
9. 创建 .gitignore
10. 创建 .env.example
11. 如需要 Python，使用 uv 初始化
12. 清理 uv 示例文件
13. 提交初始化 commit
14. 检查是否有远程仓库
15. 如无远程仓库，询问是否用 gh 创建
16. 开始按模块开发
17. 每个小功能提交一次 commit
18. 每次提交后及时 push
```

---

## 16.2 已有项目流程

```text
1. 进入项目目录
2. 执行 git status
3. 检查当前分支
4. 检查远程仓库
5. 如有远程仓库，先 fetch / pull
6. 检查是否有未提交修改
7. 不覆盖用户已有修改
8. 创建功能分支或在当前分支继续
9. 完成小修改
10. 运行必要检查
11. 提交 commit
12. 推送远程
13. 如需合并主分支，创建 PR
```

---

# 17. 禁止行为

除非用户明确要求，否则不得执行：

```bash
git reset --hard
git clean -fd
rm -rf *
git push --force
```

不得提交：

```text
.env
API Key
node_modules
.venv
dist
build
真实数据库
个人隐私数据
生产证书
```

不得在版本控制信息中出现：

```text
agent
codex
Claude
由AI生成
AI开发
```

不得在未询问用户的情况下：

- 创建公开 GitHub 仓库
- 删除用户已有文件
- 强制覆盖远程分支
- 合并到主分支
- 发布 GitHub Release
- 修改全局 Git 配置

---

# 18. 默认推荐配置

## 18.1 `.gitignore` 推荐模板

```gitignore
# System
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/

# Logs
*.log
logs/

# Environment
.env
.env.*
!.env.example

# Node
node_modules/
dist/
build/
.vite/
.cache/

# Python
.venv/
venv/
__pycache__/
*.py[cod]
.pytest_cache/
.ruff_cache/
.mypy_cache/

# Database / Runtime
*.db
*.sqlite
*.sqlite3
data/
uploads/
tmp/
temp/

# Secrets
*.pem
*.key
*.crt
secrets/
```

---

## 18.2 README 初始化模板

```markdown
# 项目名称

## 项目简介

本项目用于……

## 技术栈

- 前端：
- 后端：
- 数据库：
- 部署：

## 快速开始

```bash
# 安装依赖
# 启动服务
```

## 环境变量

请复制 `.env.example` 为 `.env` 并修改配置。

## 文档

详细设计见：

```text
/docs/Design.md
```
```

---

## 18.3 `.env.example` 初始化模板

```env
APP_NAME=your-app-name
APP_ENV=development
APP_PORT=3000

ADMIN_PASSWORD=change-me
ADMIN_SESSION_SECRET=change-me

DATABASE_URL=sqlite:///data/app.db
```

---

# 19. Skill 输出要求

当执行本 Skill 时，应输出或执行以下内容：

1. 当前项目 Git 状态判断。
2. 是否已初始化 Git。
3. 是否已配置用户信息。
4. 是否存在远程仓库。
5. 是否需要创建 `/docs`。
6. 是否需要创建 `.gitignore`。
7. 是否需要创建 `.env.example`。
8. 是否需要使用 uv。
9. 本次计划提交的 commit。
10. 是否需要推送远程。
11. 是否需要创建 PR。
12. 是否需要生成发布说明。

---

# 20. 一句话总结

`LS_Develop_Base` 是所有小项目开发前的基础规范 Skill，用于确保项目在开发、提交、同步、发布、部署过程中保持清晰、规范、可追踪，并符合用户个人的 Git、环境和文档管理习惯。

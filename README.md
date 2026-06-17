# playnest 游戏巢

## 项目简介

playnest 是一个自托管的个人小游戏集合平台，提供游戏首页、猜词游戏和 2048 游戏，后续可按模块继续扩展更多小游戏。

## 技术栈

- 前端：Vue 3、Vite、TypeScript、Vue Router、Pinia
- 后端：Node.js、Express、TypeScript
- 部署：Docker Compose、1Panel 反向代理

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动前后端开发服务
pnpm dev
```

如果本机未全局安装 pnpm，可使用：

```bash
npx pnpm@9.15.4 install
npx pnpm@9.15.4 dev
```

## 环境变量

请复制 `.env.example` 为 `.env` 并按需修改配置。

## 常用命令

```bash
pnpm dev
pnpm build
pnpm lint
```

开发服务默认地址：

- 前端：http://localhost:5173
- 后端：http://localhost:3001

## 文档

详细设计见：

```text
docs/Design.md
```

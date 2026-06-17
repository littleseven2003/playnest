import type { GameModule } from '@/shared/types'

export default {
  id: 'guessword',
  name: '猜词游戏',
  description: '根据语义相似度一步步靠近隐藏词语。',
  tags: ['文字', '益智'],
  color: '#1f9d7a',
  accent: '#f6c453',
  cover: '词',
  route: {
    path: '/guessword',
    name: 'GuessWord',
    component: () => import('./GuessWord.vue')
  }
} satisfies GameModule

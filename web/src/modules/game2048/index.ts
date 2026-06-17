import type { GameModule } from '@/shared/types'

export default {
  id: 'game2048',
  name: '2048',
  description: '滑动数字方块，合并出更高分。',
  tags: ['数字', '策略'],
  color: '#d8663a',
  accent: '#2e8fb8',
  cover: '2048',
  route: {
    path: '/game2048',
    name: 'Game2048',
    component: () => import('./Game2048.vue')
  }
} satisfies GameModule

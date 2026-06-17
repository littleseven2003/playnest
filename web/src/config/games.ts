import game2048 from '@/modules/game2048'
import guessword from '@/modules/guessword'
import type { GameCardInfo, GameModule } from '@/shared/types'

export const gameModules: GameModule[] = [guessword, game2048]

export const games: GameCardInfo[] = gameModules.map((module) => ({
  id: module.id,
  name: module.name,
  description: module.description,
  tags: module.tags,
  color: module.color,
  accent: module.accent,
  cover: module.cover,
  route: module.route.path as string
}))

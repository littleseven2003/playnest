export type Direction = 'left' | 'right' | 'up' | 'down'

export interface Game2048State {
  grid: number[][]
  score: number
  bestScore: number
  gameOver: boolean
  won: boolean
}

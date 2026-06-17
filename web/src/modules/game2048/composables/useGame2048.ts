import { computed, reactive } from 'vue'
import type { Direction, Game2048State } from '../types'

const size = 4
const bestScoreKey = 'playnest:game2048:best-score'

function createEmptyGrid() {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0))
}

function cloneGrid(grid: number[][]) {
  return grid.map((row) => [...row])
}

function gridsEqual(a: number[][], b: number[][]) {
  return a.every((row, rowIndex) => row.every((value, colIndex) => value === b[rowIndex][colIndex]))
}

function mergeLine(line: number[]) {
  const values = line.filter(Boolean)
  const merged: number[] = []
  let score = 0

  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const nextValue = values[index] * 2
      merged.push(nextValue)
      score += nextValue
      index += 1
    } else {
      merged.push(values[index])
    }
  }

  while (merged.length < size) {
    merged.push(0)
  }

  return { line: merged, score }
}

function hasMoves(grid: number[][]) {
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (grid[row][col] === 0) {
        return true
      }
      if (col < size - 1 && grid[row][col] === grid[row][col + 1]) {
        return true
      }
      if (row < size - 1 && grid[row][col] === grid[row + 1][col]) {
        return true
      }
    }
  }

  return false
}

export function useGame2048() {
  const storedBestScore = Number(localStorage.getItem(bestScoreKey) ?? 0)
  const state = reactive<Game2048State>({
    grid: createEmptyGrid(),
    score: 0,
    bestScore: Number.isFinite(storedBestScore) ? storedBestScore : 0,
    gameOver: false,
    won: false
  })

  const cells = computed(() => state.grid.flatMap((row, rowIndex) => row.map((value, colIndex) => ({
    id: `${rowIndex}-${colIndex}`,
    value
  }))))

  function addRandomTile() {
    const emptyCells: Array<[number, number]> = []

    state.grid.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value === 0) {
          emptyCells.push([rowIndex, colIndex])
        }
      })
    })

    if (!emptyCells.length) {
      return
    }

    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    state.grid[row][col] = Math.random() < 0.9 ? 2 : 4
  }

  function applyScore(score: number) {
    state.score += score
    state.bestScore = Math.max(state.bestScore, state.score)
    localStorage.setItem(bestScoreKey, String(state.bestScore))
    state.won = state.won || state.grid.some((row) => row.includes(2048))
    state.gameOver = !hasMoves(state.grid)
  }

  function move(direction: Direction) {
    if (state.gameOver) {
      return
    }

    const previous = cloneGrid(state.grid)
    let gainedScore = 0

    if (direction === 'left' || direction === 'right') {
      state.grid = state.grid.map((row) => {
        const source = direction === 'left' ? row : [...row].reverse()
        const result = mergeLine(source)
        gainedScore += result.score
        return direction === 'left' ? result.line : result.line.reverse()
      })
    } else {
      const nextGrid = createEmptyGrid()
      for (let col = 0; col < size; col += 1) {
        const column = state.grid.map((row) => row[col])
        const source = direction === 'up' ? column : column.reverse()
        const result = mergeLine(source)
        gainedScore += result.score
        const mergedColumn = direction === 'up' ? result.line : result.line.reverse()
        mergedColumn.forEach((value, row) => {
          nextGrid[row][col] = value
        })
      }
      state.grid = nextGrid
    }

    if (!gridsEqual(previous, state.grid)) {
      addRandomTile()
      applyScore(gainedScore)
    }
  }

  function reset() {
    state.grid = createEmptyGrid()
    state.score = 0
    state.gameOver = false
    state.won = false
    addRandomTile()
    addRandomTile()
  }

  reset()

  return {
    state,
    cells,
    move,
    reset
  }
}

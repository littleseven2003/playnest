<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Layout from '@/components/Layout.vue'
import { useGame2048 } from './composables/useGame2048'
import type { Direction } from './types'
import './styles.scss'

const { state, cells, move, reset } = useGame2048()
const touchStart = ref<{ x: number; y: number } | null>(null)

const keyMap: Record<string, Direction> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down'
}

function handleKeydown(event: KeyboardEvent) {
  const direction = keyMap[event.key]
  if (!direction) {
    return
  }

  event.preventDefault()
  move(direction)
}

function handleTouchStart(event: TouchEvent) {
  const touch = event.touches[0]
  touchStart.value = { x: touch.clientX, y: touch.clientY }
}

function handleTouchEnd(event: TouchEvent) {
  if (!touchStart.value) {
    return
  }

  const touch = event.changedTouches[0]
  const dx = touch.clientX - touchStart.value.x
  const dy = touch.clientY - touchStart.value.y
  const distance = Math.max(Math.abs(dx), Math.abs(dy))
  touchStart.value = null

  if (distance < 28) {
    return
  }

  move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
}

function tileClass(value: number) {
  return value ? `tile tile-${value}` : 'tile tile-empty'
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Layout title="2048" subtitle="方向键或滑动操作" show-reset @reset="reset">
    <section class="game2048">
      <div class="score-row">
        <div>
          <span>分数</span>
          <strong>{{ state.score }}</strong>
        </div>
        <div>
          <span>最高分</span>
          <strong>{{ state.bestScore }}</strong>
        </div>
      </div>

      <div class="board-wrap">
        <div class="board" @touchstart.passive="handleTouchStart" @touchend.passive="handleTouchEnd">
          <div v-for="cell in cells" :key="cell.id" :class="tileClass(cell.value)">
            {{ cell.value || '' }}
          </div>
        </div>
        <div v-if="state.gameOver || state.won" class="board-message">
          <strong>{{ state.won ? '达成 2048' : '游戏结束' }}</strong>
          <button type="button" @click="reset">重新开始</button>
        </div>
      </div>
    </section>
  </Layout>
</template>

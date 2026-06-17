<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Layout from '@/components/Layout.vue'
import { getGuessDebugInfo, startGuessWordGame, submitGuess } from './api'
import type { GuessItem } from './types'
import './styles.scss'

const gameId = ref('')
const word = ref('')
const error = ref('')
const loading = ref(false)
const won = ref(false)
const debugTarget = ref('')
const history = ref<GuessItem[]>([])

const sortedHistory = computed(() => [...history.value].sort((a, b) => b.similarity - a.similarity))

async function resetGame() {
  loading.value = true
  error.value = ''
  won.value = false
  debugTarget.value = ''
  history.value = []

  try {
    const result = await startGuessWordGame()
    gameId.value = result.gameId
    await loadDebugInfo(result.gameId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '游戏启动失败'
  } finally {
    loading.value = false
  }
}

async function guess() {
  const normalizedWord = word.value.trim()

  if (!normalizedWord || loading.value || won.value) {
    return
  }

  const repeatedGuess = history.value.find((item) => item.word === normalizedWord)
  if (repeatedGuess) {
    error.value = `“${normalizedWord}”已经猜过了，相似度为 ${repeatedGuess.similarity}%`
    word.value = ''
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await submitGuess(gameId.value, normalizedWord)
    history.value.push({ ...result, id: `${result.word}-${Date.now()}` })
    if (result.message) {
      error.value = result.message
    }
    won.value = result.isCorrect
    word.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : '提交失败'
  } finally {
    loading.value = false
  }
}

async function loadDebugInfo(currentGameId: string) {
  try {
    const result = await getGuessDebugInfo(currentGameId)
    debugTarget.value = result.target
  } catch {
    debugTarget.value = ''
  }
}

function scoreStyle(score: number) {
  return {
    width: `${score}%`,
    background: `linear-gradient(90deg, #ef5b5b, #f6c453 ${Math.max(20, score)}%, #1f9d7a)`
  }
}

onMounted(resetGame)
</script>

<template>
  <Layout title="猜词游戏" subtitle="越接近，颜色越明亮" show-reset @reset="resetGame">
    <section class="guessword">
      <form class="guessword__panel" @submit.prevent="guess">
        <label for="guess-input">输入猜测词</label>
        <div class="guessword__input-row">
          <input
            id="guess-input"
            v-model="word"
            type="text"
            maxlength="8"
            autocomplete="off"
            placeholder="例如：音乐"
          />
          <button type="submit" :disabled="loading || !word.trim() || won">
            {{ loading ? '判断中' : '猜测' }}
          </button>
        </div>
        <p v-if="error" class="form-error">{{ error }}</p>
        <p v-if="debugTarget" class="guessword__debug">调试目标词：{{ debugTarget }}</p>
        <p v-if="won" class="guessword__win">猜中了！共 {{ history.length }} 次。</p>
      </form>

      <section class="guessword__history">
        <div class="section-heading">
          <h2>猜测历史</h2>
          <span>已猜 {{ history.length }} 次</span>
        </div>
        <div v-if="sortedHistory.length" class="guessword__list">
          <article v-for="item in sortedHistory" :key="item.id" class="guessword__item">
            <strong>{{ item.word }}</strong>
            <div class="guessword__meter">
              <span :style="scoreStyle(item.similarity)" />
            </div>
            <em>{{ item.similarity }}%</em>
          </article>
        </div>
        <p v-else class="empty-state">第一步总是最有意思的。</p>
      </section>
    </section>
  </Layout>
</template>

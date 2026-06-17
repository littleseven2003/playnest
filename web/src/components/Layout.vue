<script setup lang="ts">
import { Home, RotateCcw } from 'lucide-vue-next'

defineProps<{
  title: string
  subtitle?: string
  showReset?: boolean
}>()

const emit = defineEmits<{
  reset: []
}>()
</script>

<template>
  <main class="game-shell">
    <header class="game-shell__bar">
      <RouterLink class="icon-button" to="/" aria-label="返回首页" title="返回首页">
        <Home :size="20" />
      </RouterLink>
      <div class="game-shell__title">
        <h1>{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <button
        v-if="showReset"
        class="icon-button"
        type="button"
        aria-label="重新开始"
        title="重新开始"
        @click="emit('reset')"
      >
        <RotateCcw :size="20" />
      </button>
      <span v-else class="game-shell__spacer" />
    </header>
    <slot />
  </main>
</template>

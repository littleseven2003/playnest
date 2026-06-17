<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import type { GameCardInfo } from '@/shared/types'

defineProps<{
  game: GameCardInfo
}>()
</script>

<template>
  <RouterLink
    class="game-card"
    :to="game.route"
    :style="{ '--game-color': game.color, '--game-accent': game.accent }"
  >
    <div class="game-card__cover" :class="`game-card__cover--${game.id}`">
      <span>{{ game.cover }}</span>
    </div>
    <div class="game-card__body">
      <div>
        <h2>{{ game.name }}</h2>
        <p>{{ game.description }}</p>
      </div>
      <div class="game-card__tags">
        <span v-for="tag in game.tags" :key="tag">{{ tag }}</span>
      </div>
    </div>
    <span class="game-card__arrow" aria-hidden="true">
      <ArrowUpRight :size="20" />
    </span>
  </RouterLink>
</template>

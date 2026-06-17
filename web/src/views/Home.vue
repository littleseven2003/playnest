<script setup lang="ts">
import GameCard from '@/components/GameCard.vue'
import { games } from '@/config/games'
</script>

<template>
  <main class="home">
    <section class="home__hero">
      <div>
        <p class="eyebrow">playnest</p>
        <h1>游戏巢</h1>
        <p class="home__intro">把轻量小游戏收进一个漂亮、可扩展、能自托管的小空间。</p>
      </div>
      <div class="home__ticker" aria-label="游戏统计">
        <span>{{ games.length }}</span>
        <small>games ready</small>
      </div>
    </section>

    <section class="home__grid" aria-label="游戏列表">
      <GameCard v-for="game in games" :key="game.id" :game="game" />
    </section>
  </main>
</template>

import { createRouter, createWebHistory } from 'vue-router'
import { gameModules } from '@/config/games'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    ...gameModules.map((module) => module.route)
  ]
})

export default router

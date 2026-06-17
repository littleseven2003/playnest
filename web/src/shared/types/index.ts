import type { RouteRecordRaw } from 'vue-router'

export interface GameModule {
  id: string
  name: string
  description: string
  tags: string[]
  color: string
  accent: string
  route: RouteRecordRaw
  cover: string
}

export interface GameCardInfo {
  id: string
  name: string
  description: string
  tags: string[]
  color: string
  accent: string
  route: string
  cover: string
}

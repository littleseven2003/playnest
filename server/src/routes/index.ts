import type { Express } from 'express'
import guesswordRoutes from '../modules/guessword/routes.js'

export function registerRoutes(app: Express) {
  app.use(guesswordRoutes.path, guesswordRoutes.router)
}

import cors from 'cors'
import express from 'express'
import { registerRoutes } from './routes/index.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' } })
  })

  registerRoutes(app)

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: '接口不存在' })
  })

  return app
}

import { Router } from 'express'
import { GuessWordService } from './service.js'

const router = Router()
const service = new GuessWordService()

router.get('/start', (_req, res) => {
  res.json({ success: true, data: service.startGame() })
})

router.post('/guess', (req, res) => {
  try {
    const { gameId, word } = req.body as { gameId?: string; word?: string }

    if (!gameId || !word) {
      res.status(400).json({ success: false, message: 'gameId 和 word 不能为空' })
      return
    }

    res.json({ success: true, data: service.guess(gameId, word) })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : '猜测失败'
    })
  }
})

router.get('/wordlist', (_req, res) => {
  res.json({ success: true, data: service.getWordList() })
})

export default {
  path: '/api/guessword',
  router
}

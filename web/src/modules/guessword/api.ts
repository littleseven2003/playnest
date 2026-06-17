import type { ApiResponse, GuessDebugInfo, GuessResponse } from './types'

async function request<T>(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })
  const payload = (await response.json()) as ApiResponse<T>

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message ?? '请求失败')
  }

  return payload.data
}

export function startGuessWordGame() {
  return request<{ gameId: string }>('/api/guessword/start')
}

export function submitGuess(gameId: string, word: string) {
  return request<GuessResponse>('/api/guessword/guess', {
    method: 'POST',
    body: JSON.stringify({ gameId, word })
  })
}

export function getGuessDebugInfo(gameId: string) {
  return request<GuessDebugInfo>(`/api/guessword/debug/${gameId}`)
}

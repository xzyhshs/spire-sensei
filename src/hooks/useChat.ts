import { useState, useCallback } from 'react'
import type { ChatMessage, AppConfig, GameState } from '../types'

const PERSONAS = [
  { id: 'default', name: '默认', description: '', preset: true }
]

export { PERSONAS }

interface SendOpts {
  text: string
  imageBase64?: string
  config: AppConfig
  gameState: GameState | null
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg])
  }, [])

  const sendMessage = useCallback(async (opts: SendOpts) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      role: 'user',
      text: opts.text,
      imageBase64: opts.imageBase64,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMsg])
    setSending(true)

    try {
      const raw = await window.electronAPI.sendMessage({
        text: opts.text,
        imageBase64: opts.imageBase64,
        config: opts.config
      })

      const parsed = JSON.parse(raw)
      const replyText: string = parsed.reply || raw

      const aiMsg: ChatMessage = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        role: 'assistant',
        text: replyText,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      const fallbackText = window.electronAPI
        ? `AI 请求失败：${err instanceof Error ? err.message : '未知错误'}`
        : '（开发模式）AI 服务将在配置 API Key 后可用。'

      const aiMsg: ChatMessage = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        role: 'assistant',
        text: fallbackText,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, aiMsg])
    } finally {
      setSending(false)
    }
  }, [])

  return { messages, sending, addMessage, sendMessage }
}

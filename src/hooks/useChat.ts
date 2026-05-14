import { useState, useCallback } from 'react'
import type { ChatMessage, AppConfig, GameState } from '../types'

const PERSONAS = [
  { id: 'default', name: '默认', description: '', preset: true },
  { id: 'lbw', name: '卢本伟', description: '口语化，东北腔，爱说"兄弟""干就完了"', preset: true },
  { id: 'yujie', name: '东北雨姐', description: '东北方言，爽朗豪迈', preset: true },
  { id: 'trump', name: '特朗普', description: '夸张自信，最高级形容词', preset: true },
  { id: 'custom', name: '✏ 自定义', description: '', preset: false }
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

import { useState, useCallback, useRef } from 'react'
import type { ChatMessage, AppConfig, GameState } from '../types'
import * as ipc from '../lib/ipc'

const PERSONAS = [
  { id: 'default', name: '默认', description: '', preset: true }
]

export { PERSONAS }

interface SendOpts {
  text: string
  imageBase64?: string[]
  config: AppConfig
  gameState: GameState | null
  gamePath?: string | null
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const messagesRef = useRef<ChatMessage[]>([])
  messagesRef.current = messages
  const pendingChunkRef = useRef('')
  const rafPendingRef = useRef(false)

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg])
  }, [])

  const sendMessage = useCallback(async (opts: SendOpts): Promise<GameState | null> => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      role: 'user',
      text: opts.text,
      imageBase64: opts.imageBase64,
      timestamp: Date.now()
    }
    const aiMsgId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      text: '',
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMsg, aiMsg])
    setSending(true)

    try {
      const result = await new Promise<GameState | null>((resolve) => {
        const unsubChunk = window.electronAPI.onStreamChunk((text) => {
          pendingChunkRef.current += text
          if (!rafPendingRef.current) {
            rafPendingRef.current = true
            requestAnimationFrame(() => {
              const batch = pendingChunkRef.current
              pendingChunkRef.current = ''
              rafPendingRef.current = false
              setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, text: m.text + batch } : m
              ))
            })
          }
        })

        const unsubDone = window.electronAPI.onStreamDone(({ gameState }) => {
          unsubChunk()
          unsubDone()
          unsubError()
          if (pendingChunkRef.current) {
            const batch = pendingChunkRef.current
            pendingChunkRef.current = ''
            setMessages(prev => prev.map(m =>
              m.id === aiMsgId ? { ...m, text: m.text + batch } : m
            ))
          }
          resolve(gameState || null)
        })

        const unsubError = window.electronAPI.onStreamError((msg) => {
          unsubChunk()
          unsubDone()
          unsubError()
          setMessages(prev => prev.map(m =>
            m.id === aiMsgId ? { ...m, text: msg } : m
          ))
          resolve(null)
        })

        window.electronAPI.sendMessageStream({
          text: opts.text,
          imageBase64: opts.imageBase64,
          config: opts.config,
          gamePath: opts.gamePath
        })
      })

      return result
    } catch {
      return null
    } finally {
      setSending(false)
    }
  }, [])

  const cancelMessage = useCallback(async () => {
    await window.electronAPI.cancelMessage()
    setSending(false)
  }, [])

  // Persistence helpers — use ref so callers always get the latest messages
  const saveChatHistory = useCallback(async (gamePath: string) => {
    const stripped = messagesRef.current.map(({ imageBase64, ...rest }) => rest as ChatMessage)
    await ipc.saveChatHistory(gamePath, stripped)
  }, [])

  const loadChatHistory = useCallback(async (gamePath: string) => {
    const msgs = await ipc.loadChatHistory(gamePath)
    setMessages(msgs)
  }, [])

  return { messages, sending, addMessage, sendMessage, cancelMessage, setMessages, saveChatHistory, loadChatHistory }
}

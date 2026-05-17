import { useState, useCallback, useRef } from 'react'
import type { ChatMessage, AppConfig, GameState, SendingPhase } from '../types'
import * as ipc from '../lib/ipc'

const PERSONAS = [
  { id: 'default', name: '默认', description: '', preset: true }
]

export { PERSONAS }

// ── Fast-path: detect pure update commands ──

const UPDATE_PATTERNS = [
  /^[+\-]\d+\s*\S/,           // +1 停顿, -2 防御
  /^[+\-]\S/,                  // +停顿, -防御
  /^(加|删|添加|移除|删除)\s*(\d+\s*[张个]?\s*)?\S/,  // 加一张打击, 删2张防御
  /^(升级|降级)\s*\S/,         // 升级暴怒, 降级痛击
  /^获得\s*\S/,                // 获得开心小花
  /^(加遗物|删遗物)\s*\S/,     // 加遗物开心小花
  /^(更新卡组|更新遗物|更新状态|【更新卡组】|【更新遗物】|【更新状态】)/,
  /^(血量|生命|hp|HP)\s*[=:：]?\s*\d+/,   // 血量=30, hp 50
  /^(金币|gold)\s*[=:：]?\s*\d+/,         // 金币=200, gold 300
  /^(层数|floor)\s*[=:：]?\s*\d+/,        // 层数=5, floor 10
  /^(回满血|清空卡组|清空遗物)/,           // 回满血, 清空卡组
]

function isUpdateCommand(text: string, hasImages: boolean): boolean {
  if (hasImages) return false
  const trimmed = text.trim()
  if (!trimmed) return false
  return UPDATE_PATTERNS.some(p => p.test(trimmed))
}

interface SendOpts {
  text: string
  imageBase64?: string[]
  config: AppConfig
  gameState: GameState | null
  gamePath?: string | null
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sendingPhase, setSendingPhase] = useState<SendingPhase>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [receivedChars, setReceivedChars] = useState(0)
  const messagesRef = useRef<ChatMessage[]>([])
  messagesRef.current = messages
  const pendingChunkRef = useRef('')
  const rafPendingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const waitingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const charCountRef = useRef(0)
  const firstChunkRef = useRef(false)
  const streamResolverRef = useRef<((value: GameState | null) => void) | null>(null)

  const clearPhaseTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (waitingTimerRef.current) { clearTimeout(waitingTimerRef.current); waitingTimerRef.current = null }
  }, [])

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
    setSendingPhase('sending')
    setElapsedSeconds(0)
    setReceivedChars(0)
    charCountRef.current = 0
    firstChunkRef.current = false

    // Fast-path: pure update commands skip streaming entirely
    if (isUpdateCommand(opts.text, (opts.imageBase64?.length ?? 0) > 0)) {
      try {
        setSendingPhase('sending')
        const res = await window.electronAPI.sendUpdateCommand({
          text: opts.text,
          config: opts.config,
          gamePath: opts.gamePath
        })
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, text: res.reply } : m
        ))
        return res.gameState
      } finally {
        clearPhaseTimer()
        setSendingPhase('idle')
      }
    }

    const startTime = Date.now()

    // Elapsed time timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000))
    }, 200)

    // After 2s without response, switch to 'waiting'
    waitingTimerRef.current = setTimeout(() => {
      if (!firstChunkRef.current) {
        setSendingPhase('waiting')
      }
    }, 2000)

    try {
      const result = await new Promise<GameState | null>((resolve) => {
        streamResolverRef.current = resolve
        const unsubChunk = window.electronAPI.onStreamChunk((text) => {
          if (!firstChunkRef.current) {
            firstChunkRef.current = true
            setSendingPhase('receiving')
          }
          charCountRef.current += text.length
          setReceivedChars(charCountRef.current)
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

        const unsubToolExecuting = window.electronAPI.onToolExecuting((label) => {
          setSendingPhase('tool-executing')
          firstChunkRef.current = false
          void label
        })

        const unsubDone = window.electronAPI.onStreamDone(({ gameState }) => {
          unsubChunk()
          unsubToolExecuting()
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
          unsubToolExecuting()
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
        }).catch(() => {
          setMessages(prev => prev.map(m =>
            m.id === aiMsgId ? { ...m, text: 'API 请求失败：服务异常' } : m
          ))
          streamResolverRef.current?.(null)
        })
      })

      return result
    } catch {
      return null
    } finally {
      clearPhaseTimer()
      setSendingPhase('idle')
    }
  }, [clearPhaseTimer])

  const cancelMessage = useCallback(async () => {
    await window.electronAPI.cancelMessage()
    clearPhaseTimer()
    setSendingPhase('idle')
  }, [clearPhaseTimer])

  // Persistence helpers — use ref so callers always get the latest messages
  const saveChatHistory = useCallback(async (gamePath: string) => {
    const stripped = messagesRef.current.map(({ imageBase64, ...rest }) => rest as ChatMessage)
    await ipc.saveChatHistory(gamePath, stripped)
  }, [])

  const loadChatHistory = useCallback(async (gamePath: string) => {
    const msgs = await ipc.loadChatHistory(gamePath)
    setMessages(msgs)
  }, [])

  return { messages, sendingPhase, elapsedSeconds, receivedChars, addMessage, sendMessage, cancelMessage, setMessages, saveChatHistory, loadChatHistory }
}

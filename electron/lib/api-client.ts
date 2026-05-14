import { buildSystemPrompt } from './context-builder'
import { applyStateUpdate } from './state-updater'
import { readGame } from './game-manager'
import fs from 'fs'
import type { AppConfig, Persona, GameState } from '../../src/types'

interface SendMessageOpts {
  text: string
  imageBase64?: string
  gameFilePath: string | null
  config: AppConfig
  persona: Persona
  gameState: GameState | null
}

const DEFAULT_PERSONA: Persona = { id: 'default', name: '默认', description: '', preset: true }

const PERSONAS: Persona[] = [
  DEFAULT_PERSONA
]

export { PERSONAS }

// ── Tool definition for state update ──

const STATE_UPDATE_TOOL = {
  type: 'function',
  function: {
    name: 'update_game_state',
    description: '更新杀戮尖塔游戏状态。当玩家让你修改卡组、遗物、药水、生命值、金币、层数、幕数或当前选项时调用此函数。只传需要变更的字段，不传未变更的字段。',
    parameters: {
      type: 'object',
      properties: {
        hp: { type: 'string', description: '当前/最大生命值，如 "60/72"' },
        gold: { type: 'integer', description: '当前金币数量' },
        floor: { type: 'integer', description: '当前层数' },
        act: { type: 'integer', description: '当前幕数 (1-4)' },
        addCards: { type: 'array', items: { type: 'string' }, description: '添加到卡组的卡牌名称' },
        removeCards: { type: 'array', items: { type: 'string' }, description: '从卡组移除的卡牌名称' },
        upgradeCards: { type: 'array', items: { type: 'string' }, description: '升级的卡牌名称' },
        addRelics: { type: 'array', items: { type: 'string' }, description: '添加的遗物名称' },
        removeRelics: { type: 'array', items: { type: 'string' }, description: '移除的遗物名称' },
        addPotions: { type: 'array', items: { type: 'string' }, description: '添加的药水名称' },
        removePotions: { type: 'array', items: { type: 'string' }, description: '移除的药水名称' },
        options: { type: 'string', description: '当前选项内容' },
        clearOptions: { type: 'boolean', description: '是否清空当前选项' }
      }
    }
  }
}

// ── Shared helpers ──

interface BuildMessagesResult {
  messages: Array<{
    role: string
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
  }>
  apiUrl: string
  model: string
}

function buildMessages(opts: SendMessageOpts): BuildMessagesResult {
  const persona = opts.persona || DEFAULT_PERSONA

  const systemPrompt = buildSystemPrompt({
    gameState: opts.gameState,
    persona,
    depth: opts.config.depth,
    customPersonaPrompt: opts.config.customPersonaPrompt
  })

  const messages: Array<{
    role: string
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
  }> = [
    { role: 'system', content: systemPrompt }
  ]

  if (opts.imageBase64) {
    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${opts.imageBase64}` } }
    ]
    if (opts.text) {
      userContent.push({ type: 'text', text: opts.text })
    } else {
      userContent.push({ type: 'text', text: '请分析这张截图。如果不确定我的意图（选牌/更新状态/路线建议等），请先问我。' })
    }
    messages.push({ role: 'user', content: userContent })
  } else {
    messages.push({ role: 'user', content: opts.text })
  }

  let base = opts.config.baseUrl.replace(/\/+$/, '')
  if (base.endsWith('/chat/completions')) {
    // already full URL
  } else if (/\/v\d+$/.test(base) || /\/api\/paas\/v\d+$/.test(base)) {
    base = `${base}/chat/completions`
  } else {
    base = `${base}/chat/completions`
  }

  return { messages, apiUrl: base, model: opts.config.model }
}

// ── Tool call accumulator for streaming ──

interface AccumulatedToolCall {
  id: string
  name: string
  arguments: string
}

function parseToolCalls(delta: Record<string, unknown>): Array<{ index: number; id?: string; function?: { name?: string; arguments?: string } }> {
  const tcs = delta.tool_calls as Array<Record<string, unknown>> | undefined
  if (!tcs) return []
  return tcs.map(tc => ({
    index: (tc.index as number) ?? 0,
    id: tc.id as string | undefined,
    function: tc.function as { name?: string; arguments?: string } | undefined
  }))
}

function applyStateUpdateFromToolCalls(
  toolCalls: AccumulatedToolCall[],
  opts: SendMessageOpts
): boolean {
  if (!opts.gameFilePath || !opts.gameState) return false

  for (const tc of toolCalls) {
    if (tc.name !== 'update_game_state') continue
    try {
      const update = JSON.parse(tc.arguments)
      console.log('[api-client] Tool call state update:', JSON.stringify(update))
      const rawMd = fs.readFileSync(opts.gameFilePath, 'utf-8')
      const updatedMd = applyStateUpdate(rawMd, update)
      fs.writeFileSync(opts.gameFilePath, updatedMd, 'utf-8')
      console.log('[api-client] State update written via tool call')
      return true
    } catch (e) {
      console.log('[api-client] Tool call args parse failed:', e instanceof Error ? e.message : e)
    }
  }
  return false
}

// ── Non-streaming (legacy fallback) ──

export async function sendMessage(opts: SendMessageOpts): Promise<{
  reply: string
  stateUpdated: boolean
}> {
  const { messages, apiUrl, model } = buildMessages(opts)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 120000)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${opts.config.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2000,
        tools: [STATE_UPDATE_TOOL],
        tool_choice: 'auto'
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API error ${response.status}: ${err}`)
    }

    const data = await response.json()
    const choice = data.choices[0]
    const msg = choice.message
    const reply = msg.content || ''
    const tcs = msg.tool_calls

    let stateUpdated = false
    if (tcs) {
      const accumulated = tcs.map((tc: Record<string, unknown>) => ({
        id: (tc.id as string) || '',
        name: (tc.function as Record<string, string>)?.name || '',
        arguments: (tc.function as Record<string, string>)?.arguments || ''
      }))
      stateUpdated = applyStateUpdateFromToolCalls(accumulated, opts)
    }

    return { reply, stateUpdated }
  } finally {
    clearTimeout(timeout)
  }
}

// ── Streaming ──

export interface StreamCallbacks {
  onChunk: (text: string) => void
  onDone: (result: { reply: string; stateUpdated: boolean }) => void
  onError: (err: Error) => void
}

export async function sendMessageStream(
  opts: SendMessageOpts,
  callbacks: StreamCallbacks
): Promise<void> {
  const { messages, apiUrl, model } = buildMessages(opts)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 180000)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${opts.config.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2000,
        stream: true,
        stream_options: { include_usage: true },
        tools: [STATE_UPDATE_TOOL],
        tool_choice: 'auto'
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API error ${response.status}: ${err}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullReply = ''
    const toolCallMap = new Map<number, AccumulatedToolCall>()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') continue

        try {
          const chunk = JSON.parse(data)
          const delta = chunk.choices?.[0]?.delta
          if (!delta) continue

          // Text content
          if (delta.content) {
            fullReply += delta.content
            callbacks.onChunk(delta.content)
          }

          // Tool calls (fragmented across chunks)
          const tcDeltas = parseToolCalls(delta)
          for (const tc of tcDeltas) {
            const existing = toolCallMap.get(tc.index) || { id: '', name: '', arguments: '' }
            if (tc.id) existing.id = tc.id
            if (tc.function?.name) existing.name = tc.function.name
            if (tc.function?.arguments) existing.arguments += tc.function.arguments
            toolCallMap.set(tc.index, existing)
          }
        } catch {
          // skip unparseable chunks
        }
      }
    }

    // Execute accumulated tool calls
    const accumulated = Array.from(toolCallMap.values())
    const stateUpdated = accumulated.length > 0
      ? applyStateUpdateFromToolCalls(accumulated, opts)
      : false

    // Fallback: if no tools, try markdown-based extraction (backward compat)
    if (!stateUpdated && fullReply) {
      // try legacy markdown extraction if tools didn't fire
      const { extractStateJson } = await import('./state-updater')
      const update = extractStateJson(fullReply)
      if (update && opts.gameFilePath && opts.gameState) {
        console.log('[api-client] Fallback markdown state update:', JSON.stringify(update))
        const rawMd = fs.readFileSync(opts.gameFilePath, 'utf-8')
        const updatedMd = applyStateUpdate(rawMd, update)
        fs.writeFileSync(opts.gameFilePath, updatedMd, 'utf-8')
        callbacks.onDone({ reply: fullReply, stateUpdated: true })
        return
      }
    }

    callbacks.onDone({ reply: fullReply, stateUpdated })
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)))
  } finally {
    clearTimeout(timeout)
  }
}

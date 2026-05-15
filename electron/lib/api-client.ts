import { buildSystemPrompt } from './context-builder'
import { applyStateUpdate } from './state-updater'
import { readGame } from './game-manager'
import { lookupCards, formatCardsForPrompt } from './card-db'
import fs from 'fs'
import type { AppConfig, Persona, GameState } from '../../src/types'

interface SendMessageOpts {
  text: string
  imageBase64?: string[]
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

// ── Tool definitions ──

const STATE_UPDATE_TOOL = {
  type: 'function',
  function: {
    name: 'update_game_state',
    description: '更新杀戮尖塔游戏状态。调用条件：1) 用户发送截图时可自动识别层数/金币/生命值并更新（仅这三项可自动更新），2) 用户消息带【更新卡组/遗物/药水/状态】标签或明确说"更新XX"时更新对应字段，3) 用户明确要求修改具体数据时。卡组/遗物/药水严禁自动更新。严禁从疑问句、反问句、确认性提问中提取指令，只有明确的指令性语句才触发更新。只传需要变更的字段。',
    parameters: {
      type: 'object',
      properties: {
        hp: { type: 'string', description: '当前/最大生命值，如 "60/72"。已弃用，优先用 currentHp + maxHp' },
        currentHp: { type: 'integer', description: '当前生命值。如玩家说"掉了20血"，计算 当前-20；说"回满血"，设为 maxHp' },
        maxHp: { type: 'integer', description: '最大生命值。如玩家说"最大血量100"，设为 100' },
        gold: { type: 'integer', description: '当前金币数量' },
        floor: { type: 'integer', description: '当前层数' },
        act: { type: 'integer', description: '当前幕数 (1-4)' },
        addCards: { type: 'array', items: { type: 'string' }, description: '添加的卡牌。如"加一张防御"→["防御"]，"加两张打击"→["打击","打击"]' },
        removeCards: { type: 'array', items: { type: 'string' }, description: '移除的卡牌。如"删一张打击"→["打击"]，"删了两张防御"→["防御","防御"]' },
        upgradeCards: { type: 'array', items: { type: 'string' }, description: '升级的卡牌。如"把痛击升级了"→["痛击"]' },
        downgradeCards: { type: 'array', items: { type: 'string' }, description: '撤销升级的卡牌。如"安宁没有升级""XX的状态错了，没升级"→["安宁"]' },
        clearCards: { type: 'boolean', description: '清空所有卡牌。如"卡组全删了""清空卡组"' },
        addRelics: { type: 'array', items: { type: 'string' }, description: '添加的遗物。如"获得了开心小花"→["开心小花"]' },
        removeRelics: { type: 'array', items: { type: 'string' }, description: '移除的遗物。如"删掉开心小花"→["开心小花"]' },
        clearRelics: { type: 'boolean', description: '清空所有遗物。如"我没有遗物了""遗物全没了""清空遗物"' },
        addPotions: { type: 'array', items: { type: 'string' }, description: '添加的药水。如"获得爆炸药水"→["爆炸药水"]' },
        removePotions: { type: 'array', items: { type: 'string' }, description: '移除的药水。如"用掉爆炸药水"→["爆炸药水"]' },
        clearPotions: { type: 'boolean', description: '清空所有药水。如"药水全用完了""没有药水了"' },
        options: { type: 'string', description: '当前选项内容' },
        clearOptions: { type: 'boolean', description: '是否清空当前选项' }
      }
    }
  }
}

const LOOKUP_CARDS_TOOL = {
  type: 'function',
  function: {
    name: 'lookup_cards',
    description: '查询卡牌准确数据（费用/类型/效果/升级效果）。重要：涉及任何未在系统提示中出现的卡牌时，必须在回复前调用此工具获取准确数据。即使你认为自己记得该卡牌的效果，也必须通过此工具验证，因为记忆经常出错。严禁凭记忆编造卡牌效果。',
    parameters: {
      type: 'object',
      properties: {
        names: { type: 'array', items: { type: 'string' }, description: '要查询的卡牌名称列表' }
      },
      required: ['names']
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
    customPersonaPrompt: opts.config.customPersonaPrompt,
    model: opts.config.model
  })

  const messages: Array<{
    role: string
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
  }> = [
    { role: 'system', content: systemPrompt }
  ]

  if (opts.imageBase64 && opts.imageBase64.length > 0) {
    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = opts.imageBase64.map(img =>
      ({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${img}` } })
    )
    if (opts.text) {
      userContent.push({ type: 'text', text: opts.text })
    } else {
      const hint = opts.imageBase64.length > 1
        ? '请分析这些截图。如果不确定我的意图（选牌/更新状态/路线建议等），请先问我。'
        : '请分析这张截图。如果不确定我的意图（选牌/更新状态/路线建议等），请先问我。'
      userContent.push({ type: 'text', text: hint })
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
        tools: [STATE_UPDATE_TOOL, LOOKUP_CARDS_TOOL],
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

// ── Tool execution helpers ──

function executeLookupCards(args: string): string {
  try {
    const { names } = JSON.parse(args)
    if (!Array.isArray(names) || names.length === 0) return '未提供卡牌名称'
    const cards = lookupCards(names)
    if (cards.length === 0) return '未找到匹配卡牌，禁止编造效果'
    return '以下为准确卡牌数据，请以此为准回复：\n' + formatCardsForPrompt(cards)
  } catch {
    return 'lookup_cards 参数解析失败'
  }
}

// ── Streaming ──

interface StreamRoundResult {
  fullReply: string
  toolCalls: AccumulatedToolCall[]
}

async function streamSSE(
  response: Response,
  onChunk: (text: string) => void
): Promise<StreamRoundResult> {
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

        if (delta.content) {
          fullReply += delta.content
          onChunk(delta.content)
        }

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

  return { fullReply, toolCalls: Array.from(toolCallMap.values()) }
}

function makeStreamRequestBody(model: string, messages: Array<Record<string, unknown>>) {
  return JSON.stringify({
    model,
    messages,
    max_tokens: 2000,
    stream: true,
    stream_options: { include_usage: true },
    tools: [STATE_UPDATE_TOOL, LOOKUP_CARDS_TOOL],
    tool_choice: 'auto'
  })
}

export interface StreamCallbacks {
  onChunk: (text: string) => void
  onDone: (result: { reply: string; stateUpdated: boolean }) => void
  onError: (err: Error) => void
}

export async function sendMessageStream(
  opts: SendMessageOpts,
  callbacks: StreamCallbacks,
  externalController?: AbortController
): Promise<void> {
  const { messages: baseMessages, apiUrl, model } = buildMessages(opts)

  const controller = externalController || new AbortController()
  const timeout = externalController ? null : setTimeout(() => controller.abort(), 180000)

  // Mutable copy for multi-round
  const msgArr: Array<Record<string, unknown>> = [...baseMessages]

  try {
    let allReplies = ''
    let stateUpdated = false

    // ── Round 1 ──
    let response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${opts.config.apiKey}`
      },
      body: makeStreamRequestBody(model, msgArr),
      signal: controller.signal
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`API error ${response.status}: ${err}`)
    }

    const round1 = await streamSSE(response, callbacks.onChunk)
    const r1ToolCalls = round1.toolCalls

    // Separate tool calls by type
    const stateCalls = r1ToolCalls.filter(tc => tc.name === 'update_game_state')
    const lookupCalls = r1ToolCalls.filter(tc => tc.name === 'lookup_cards')

    // Execute state updates
    stateUpdated = applyStateUpdateFromToolCalls(stateCalls, opts)

    // Execute lookups and continue if any tool was called
    if (r1ToolCalls.length > 0) {
      // Append assistant message with tool calls
      const assistantMsg: Record<string, unknown> = { role: 'assistant', content: round1.fullReply || null }
      assistantMsg.tool_calls = r1ToolCalls.map(tc => ({
        id: tc.id,
        type: 'function',
        function: { name: tc.name, arguments: tc.arguments }
      }))
      msgArr.push(assistantMsg)

      // Execute lookups + state update confirmations
      for (const tc of lookupCalls) {
        const result = executeLookupCards(tc.arguments)
        msgArr.push({ role: 'tool', tool_call_id: tc.id, content: result })
      }
      for (const tc of stateCalls) {
        msgArr.push({ role: 'tool', tool_call_id: tc.id, content: '状态已更新' })
      }

      // ── Round 2 ──
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${opts.config.apiKey}`
        },
        body: makeStreamRequestBody(model, msgArr),
        signal: controller.signal
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`API error ${response.status}: ${err}`)
      }

      const round2 = await streamSSE(response, callbacks.onChunk)
      allReplies = round2.fullReply

      // Handle any additional tool calls from round 2
      const r2StateCalls = round2.toolCalls.filter(tc => tc.name === 'update_game_state')
      if (r2StateCalls.length > 0) {
        const updated = applyStateUpdateFromToolCalls(r2StateCalls, opts)
        if (updated) stateUpdated = true
      }
    } else {
      allReplies = round1.fullReply
    }

    // Fallback: if no tools fired, try markdown-based extraction (backward compat)
    if (!stateUpdated && allReplies) {
      const { extractStateJson } = await import('./state-updater')
      const update = extractStateJson(allReplies)
      if (update && opts.gameFilePath && opts.gameState) {
        console.log('[api-client] Fallback markdown state update:', JSON.stringify(update))
        const rawMd = fs.readFileSync(opts.gameFilePath, 'utf-8')
        const updatedMd = applyStateUpdate(rawMd, update)
        fs.writeFileSync(opts.gameFilePath, updatedMd, 'utf-8')
        callbacks.onDone({ reply: allReplies, stateUpdated: true })
        return
      }
    }

    callbacks.onDone({ reply: allReplies, stateUpdated })
  } catch (err) {
    callbacks.onError(err instanceof Error ? err : new Error(String(err)))
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

import { buildSystemPrompt } from './context-builder'
import { extractStateJson, applyStateUpdate } from './state-updater'
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
  DEFAULT_PERSONA,
  { id: 'lbw', name: '卢本伟', description: '口语化，东北腔，爱说"兄弟""干就完了"', preset: true },
  { id: 'yujie', name: '东北雨姐', description: '东北方言，爽朗豪迈', preset: true },
  { id: 'trump', name: '特朗普', description: '夸张自信，最高级形容词', preset: true },
  { id: 'custom', name: '✏ 自定义', description: '', preset: false }
]

export { PERSONAS }

export async function sendMessage(opts: SendMessageOpts): Promise<{
  reply: string
  stateUpdated: boolean
}> {
  const persona = opts.persona || DEFAULT_PERSONA

  const systemPrompt = buildSystemPrompt({
    gameState: opts.gameState,
    persona,
    depth: opts.config.depth,
    customPersonaPrompt: opts.config.customPersonaPrompt
  })

  const messages: Array<{
    role: string
    content: Array<{ type: string; text?: string; image_url?: { url: string } }>
  }> = [
    { role: 'system', content: [{ type: 'text', text: systemPrompt }] }
  ]

  const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = []
  if (opts.imageBase64) {
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${opts.imageBase64}` }
    })
  }
  if (opts.text) {
    userContent.push({ type: 'text', text: opts.text })
  } else if (opts.imageBase64 && !opts.text) {
    userContent.push({
      type: 'text',
      text: '请分析这张截图。如果不确定我的意图（选牌/更新状态/路线建议等），请先问我。'
    })
  }
  messages.push({ role: 'user', content: userContent })

  const baseUrl = opts.config.apiProvider === 'deepseek'
    ? 'https://api.deepseek.com'
    : opts.config.baseUrl
  const model = opts.config.apiProvider === 'deepseek' ? 'deepseek-chat' : opts.config.model

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opts.config.apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const reply = data.choices[0].message.content

  let stateUpdated = false
  if (opts.gameFilePath && opts.gameState) {
    const update = extractStateJson(reply)
    if (update) {
      const rawMd = fs.readFileSync(opts.gameFilePath, 'utf-8')
      const updatedMd = applyStateUpdate(rawMd, update)
      fs.writeFileSync(opts.gameFilePath, updatedMd, 'utf-8')
      stateUpdated = true
    }
  }

  return { reply, stateUpdated }
}

import fs from 'fs'
import path from 'path'

export interface CardDef {
  name: string
  cost: number
  type: '攻击' | '技能' | '能力' | '诅咒' | '状态'
  rarity: '基础' | '普通' | '罕见' | '稀有' | '诅咒' | '状态'
  character: string
  effect: string
  costUpgraded?: number
  effectUpgraded?: string
}

let cardMap: Map<string, CardDef> | null = null

function dataDir(): string {
  // In development, __dirname is electron/lib; in production, same
  return path.resolve(__dirname, '../../data/cards')
}

function loadCardFiles(): CardDef[] {
  const dir = dataDir()
  if (!fs.existsSync(dir)) return []
  const result: CardDef[] = []
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const cards = JSON.parse(raw) as CardDef[]
      result.push(...cards)
    } catch {
      // skip corrupt files
    }
  }
  return result
}

export function loadAllCards(): Map<string, CardDef> {
  if (cardMap) return cardMap
  cardMap = new Map()
  for (const card of loadCardFiles()) {
    cardMap.set(card.name, card)
  }
  return cardMap
}

export function lookupCards(names: string[]): CardDef[] {
  const db = loadAllCards()
  const result: CardDef[] = []
  for (const name of names) {
    const card = db.get(name)
    if (card) result.push(card)
  }
  return result
}

export function formatCardsForPrompt(cards: CardDef[]): string {
  return cards.map(c => {
    const costStr = c.cost === -1 ? 'X' : String(c.cost)
    const upgradeStr = c.costUpgraded !== undefined || c.effectUpgraded
      ? ` 升级: ${c.costUpgraded !== undefined && c.costUpgraded !== c.cost ? `${c.costUpgraded === -1 ? 'X' : c.costUpgraded}费 ` : ''}${c.effectUpgraded || c.effect}`
      : ''
    return `- ${c.name} (${costStr}费 ${c.type}): ${c.effect}${upgradeStr ? '。' + upgradeStr : ''}`
  }).join('\n')
}

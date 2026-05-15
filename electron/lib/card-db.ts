import fs from 'fs'
import path from 'path'

export interface CardDef {
  name: string
  cost: number | string
  type: '攻击' | '技能' | '能力' | '诅咒' | '状态'
  rarity: string
  character: string
  effect: string
  costUpgraded?: number
  effectUpgraded?: string
  upgrade?: string
}

let cardMap: Map<string, CardDef> | null = null

function dataDir(): string {
  // In development, __dirname is electron/lib; in production, same
  return path.resolve(__dirname, '../../data/cards')
}

function loadCardFiles(): CardDef[] {
  const dir = dataDir()
  if (!fs.existsSync(dir)) {
    console.log(`[card-db] Card data directory not found: ${dir}`)
    return []
  }
  const result: CardDef[] = []
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    try {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const cards = JSON.parse(raw) as CardDef[]
      result.push(...cards)
    } catch (e) {
      console.log(`[card-db] Failed to parse ${file}:`, e instanceof Error ? e.message : e)
    }
  }
  console.log(`[card-db] Loaded ${result.length} cards from ${dir}`)
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

export function findMentionedCards(text: string): CardDef[] {
  const db = loadAllCards()
  const result: CardDef[] = []
  for (const [name, card] of db) {
    if (text.includes(name)) {
      result.push(card)
    }
  }
  return result
}

export function formatCardsForPrompt(cards: CardDef[]): string {
  return cards.map(c => {
    let costStr: string
    if (typeof c.cost === 'number') {
      costStr = c.cost === -1 ? 'X' : String(c.cost)
    } else {
      costStr = c.cost
    }
    const costLabel = costStr === '不可打出' ? '不可打出' : `${costStr}费`

    let upgradeStr = ''
    if (c.upgrade) {
      upgradeStr = ` 升级: ${c.upgrade}`
    } else if (c.costUpgraded !== undefined || c.effectUpgraded) {
      const oldCost = typeof c.cost === 'number' ? c.cost : 0
      upgradeStr = ` 升级: ${c.costUpgraded !== undefined && c.costUpgraded !== oldCost ? `${c.costUpgraded === -1 ? 'X' : c.costUpgraded}费 ` : ''}${c.effectUpgraded || c.effect}`
    }

    return `- ${c.name} (${costLabel} ${c.type}): ${c.effect}${upgradeStr ? '。' + upgradeStr : ''}`
  }).join('\n')
}

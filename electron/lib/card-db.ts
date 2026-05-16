import defectCards from '../../data/cards/故障机器人.json'
import watcherCards from '../../data/cards/观者.json'
import ironcladCards from '../../data/cards/铁甲战士.json'
import silentCards from '../../data/cards/静默猎手.json'
import colorlessCards from '../../data/cards/无色.json'

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

function loadCardFiles(): CardDef[] {
  return [
    ...(defectCards as CardDef[]),
    ...(watcherCards as CardDef[]),
    ...(ironcladCards as CardDef[]),
    ...(silentCards as CardDef[]),
    ...(colorlessCards as CardDef[]),
  ]
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

export function formatCardsForPrompt(cards: CardDef[], countMap?: Map<string, number>, upgradeMap?: Map<string, boolean>): string {
  return cards.map(c => {
    const count = countMap?.get(c.name)
    const countStr = count !== undefined && count > 1 ? ` ×${count}` : ''
    const upgraded = upgradeMap?.get(c.name) ?? false

    let costStr: string
    let effectText: string
    let upgradeStr = ''

    if (upgraded) {
      // Show only upgraded state
      const uc = c.costUpgraded !== undefined ? c.costUpgraded : (typeof c.cost === 'number' ? c.cost : 0)
      costStr = uc === -1 ? 'X' : String(uc)
      effectText = c.effectUpgraded || c.effect
    } else {
      // Show base effect with upgrade preview
      if (typeof c.cost === 'number') {
        costStr = c.cost === -1 ? 'X' : String(c.cost)
      } else {
        costStr = c.cost
      }
      effectText = c.effect

      if (c.upgrade) {
        upgradeStr = ` 升级: ${c.upgrade}`
      } else if (c.costUpgraded !== undefined || c.effectUpgraded) {
        const oldCost = typeof c.cost === 'number' ? c.cost : 0
        upgradeStr = ` 升级: ${c.costUpgraded !== undefined && c.costUpgraded !== oldCost ? `${c.costUpgraded === -1 ? 'X' : c.costUpgraded}费 ` : ''}${c.effectUpgraded || c.effect}`
      }
    }

    const costLabel = costStr === '不可打出' ? '不可打出' : `${costStr}费`
    const upgradeTag = upgraded ? ' [已升级]' : ''
    const effectClean = effectText.endsWith('。') ? effectText.slice(0, -1) : effectText
    return `- ${c.name}${countStr} (${costLabel} ${c.type})${upgradeTag}: ${effectClean}${upgradeStr ? '。 ' + upgradeStr : ''}`
  }).join('\n')
}

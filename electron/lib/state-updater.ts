import { parseGameMd } from './md-parser'
import { writeGameMd } from './md-writer'

interface StateUpdate {
  hp?: string
  gold?: number
  floor?: number
  act?: number
  addCards?: string[]
  removeCards?: string[]
  upgradeCards?: string[]
  addRelics?: string[]
  removeRelics?: string[]
  addPotions?: string[]
  removePotions?: string[]
  options?: string
  clearOptions?: boolean
}

export function applyStateUpdate(mdContent: string, update: StateUpdate): string {
  const state = parseGameMd(mdContent)

  if (update.hp) state.hp = update.hp
  if (update.gold !== undefined) state.gold = update.gold
  if (update.floor) state.floor = update.floor
  if (update.act) state.act = update.act

  if (update.addCards) {
    for (const name of update.addCards) {
      const existing = state.cards.find(c => c.name === name)
      if (existing) { existing.count++ } else { state.cards.push({ name, upgraded: false, count: 1 }) }
    }
  }

  if (update.upgradeCards) {
    for (const name of update.upgradeCards) {
      const card = state.cards.find(c => c.name === name)
      if (card) { card.upgraded = true }
    }
  }

  if (update.addRelics) {
    for (const name of update.addRelics) {
      if (!state.relics.includes(name)) state.relics.push(name)
    }
  }

  if (update.addPotions) {
    for (const name of update.addPotions) {
      if (!state.potions.includes(name)) state.potions.push(name)
    }
  }

  if (update.clearOptions) {
    state.options = ''
  } else if (update.options) {
    state.options = update.options
  }

  state.updated = new Date().toISOString()
  return writeGameMd(state)
}

export function extractStateJson(aiResponse: string): StateUpdate | null {
  const match = aiResponse.match(/```json state\n([\s\S]*?)\n```/)
  if (!match) return null
  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

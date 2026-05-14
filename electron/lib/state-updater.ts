import { parseGameMd } from './md-parser'
import { writeGameMd } from './md-writer'

interface StateUpdate {
  hp?: string
  currentHp?: number
  maxHp?: number
  gold?: number
  floor?: number
  act?: number
  addCards?: string[]
  removeCards?: string[]
  upgradeCards?: string[]
  addRelics?: string[]
  removeRelics?: string[]
  clearRelics?: boolean
  addPotions?: string[]
  removePotions?: string[]
  clearPotions?: boolean
  clearCards?: boolean
  options?: string
  clearOptions?: boolean
}

export function applyStateUpdate(mdContent: string, update: StateUpdate): string {
  const state = parseGameMd(mdContent)

  // HP: support both "60/72" string and separate currentHp/maxHp numbers
  if (update.currentHp !== undefined || update.maxHp !== undefined) {
    const [cur, max] = state.hp.split('/').map(Number)
    const newCur = update.currentHp ?? cur
    const newMax = update.maxHp ?? max
    state.hp = `${newCur}/${newMax}`
  } else if (update.hp) {
    state.hp = update.hp
  }
  if (update.gold !== undefined) state.gold = update.gold
  if (update.floor) state.floor = update.floor
  if (update.act) state.act = update.act

  // Cards
  if (update.clearCards) {
    state.cards = []
  }
  if (update.addCards) {
    for (const name of update.addCards) {
      const existing = state.cards.find(c => c.name === name)
      if (existing) { existing.count++ } else { state.cards.push({ name, upgraded: false, count: 1 }) }
    }
  }
  if (update.removeCards) {
    for (const name of update.removeCards) {
      const card = state.cards.find(c => c.name === name)
      if (card) {
        card.count--
        if (card.count <= 0) state.cards = state.cards.filter(c => c !== card)
      }
    }
  }
  if (update.upgradeCards) {
    for (const name of update.upgradeCards) {
      const card = state.cards.find(c => c.name === name)
      if (card) { card.upgraded = true }
    }
  }

  // Relics
  if (update.clearRelics) {
    state.relics = []
  }
  if (update.addRelics) {
    for (const name of update.addRelics) {
      if (!state.relics.includes(name)) state.relics.push(name)
    }
  }
  if (update.removeRelics) {
    state.relics = state.relics.filter(r => !update.removeRelics!.includes(r))
  }

  // Potions
  if (update.clearPotions) {
    state.potions = []
  }
  if (update.addPotions) {
    for (const name of update.addPotions) {
      if (!state.potions.includes(name)) state.potions.push(name)
    }
  }
  if (update.removePotions) {
    state.potions = state.potions.filter(p => !update.removePotions!.includes(p))
  }

  // Options
  if (update.clearOptions) {
    state.options = ''
  } else if (update.options) {
    state.options = update.options
  }

  state.updated = new Date().toISOString()
  return writeGameMd(state)
}

export function extractStateJson(aiResponse: string): StateUpdate | null {
  // Forgiving regex: allow any whitespace after "json state", handle CRLF
  const match = aiResponse.match(/```json state[\s\S]*?\n([\s\S]*?)```/)
  if (!match) {
    console.log('[state-updater] No ```json state block found in AI response')
    return null
  }
  try {
    return JSON.parse(match[1].trim())
  } catch (e) {
    console.log('[state-updater] JSON parse failed:', e instanceof Error ? e.message : e)
    return null
  }
}

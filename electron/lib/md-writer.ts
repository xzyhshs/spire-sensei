import type { GameState } from '../../src/types'

export function writeGameMd(state: GameState): string {
  const lines: string[] = []

  // YAML front matter
  lines.push('---')
  lines.push(`character: ${state.character}`)
  lines.push(`floor: ${state.floor}`)
  lines.push(`hp: ${state.hp}`)
  lines.push(`gold: ${state.gold}`)
  lines.push(`act: ${state.act}`)
  lines.push(`created: ${state.created}`)
  lines.push(`updated: ${state.updated}`)
  lines.push('---')
  lines.push('')

  // Cards
  const cardCount = state.cards.reduce((sum, c) => sum + c.count, 0)
  lines.push(`# 卡组 (${cardCount})`)
  for (const card of state.cards) {
    const marker = card.upgraded ? '[x]' : '[ ]'
    const name = card.upgraded ? card.name + '+' : card.name
    const count = card.count > 1 ? ` x${card.count}` : ''
    lines.push(`- ${marker} ${name}${count}`)
  }
  lines.push('')

  // Relics
  lines.push(`# 遗物 (${state.relics.length})`)
  for (const relic of state.relics) {
    lines.push(`- ${relic}`)
  }
  lines.push('')

  return lines.join('\n') + '\n'
}

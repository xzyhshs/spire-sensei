import fs from 'fs'
import path from 'path'
import { parseGameMd } from './md-parser'
import { writeGameMd } from './md-writer'
import type { GameState } from '../../src/types'
import characters from '../../data/characters.json'

interface CharacterDef {
  id: string
  english_name: string
  maxHp: number
  starting_deck: Array<{ name: string; count: number }>
  starting_relic: { name: string; english_name: string; effect: string }
}

const CHAR_MAP = new Map<string, CharacterDef>(
  (characters as CharacterDef[]).map(c => [c.id, c])
)

function buildGameContent(character: string, now: string): string {
  const ch = CHAR_MAP.get(character)
  if (!ch) throw new Error(`未知角色: ${character}`)

  const cardLines = ch.starting_deck.map(
    c => `- [ ] ${c.name}${c.count > 1 ? ` x${c.count}` : ''}`
  )
  const cardCount = ch.starting_deck.reduce((sum, c) => sum + c.count, 0)

  return `---
character: ${character}
floor: 1
hp: ${ch.maxHp}/${ch.maxHp}
gold: 99
act: 1
created: ${now}
updated: ${now}
---

# 卡组 (${cardCount})
${cardLines.join('\n')}

# 遗物 (1)
- ${ch.starting_relic.name}

`
}

export function createGame(character: string, gamesDir: string): string {
  const now = new Date().toISOString()
  const filename = `${character}-${now.replace(/[:.]/g, '-').slice(0, 19)}.md`
  const filePath = path.join(gamesDir, filename)
  const content = buildGameContent(character, now)
  fs.writeFileSync(filePath, content, 'utf-8')
  return filePath
}

export function listGames(gamesDir: string): Array<{ path: string; character: string; updated: string }> {
  if (!fs.existsSync(gamesDir)) return []
  return fs.readdirSync(gamesDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const filePath = path.join(gamesDir, f)
      const content = fs.readFileSync(filePath, 'utf-8')
      const state = parseGameMd(content)
      return { path: filePath, character: state.character, updated: state.updated }
    })
    .sort((a, b) => b.updated.localeCompare(a.updated))
}

export function readGame(filePath: string): GameState {
  const content = fs.readFileSync(filePath, 'utf-8')
  return parseGameMd(content)
}

export function writeGame(filePath: string, state: GameState): void {
  const content = writeGameMd(state)
  fs.writeFileSync(filePath, content, 'utf-8')
}

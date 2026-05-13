import fs from 'fs'
import path from 'path'
import { parseGameMd } from './md-parser'
import { writeGameMd } from './md-writer'
import type { GameState } from '../../src/types'

const GAME_TEMPLATE = `---
character: {CHARACTER}
floor: 1
hp: 72/72
gold: 99
act: 1
created: {CREATED}
updated: {CREATED}
---

# 卡组 (10)
- [ ] 打击 x5
- [ ] 防御 x4
- [x] 痛击+ x1

# 遗物 (1)
- 痛楚印记

# 药水 (0)

# 当前选项
`

export function createGame(character: string, gamesDir: string): string {
  const now = new Date().toISOString()
  const filename = `${character}-${now.replace(/[:.]/g, '-').slice(0, 19)}.md`
  const filePath = path.join(gamesDir, filename)
  const content = GAME_TEMPLATE
    .replace(/{CHARACTER}/g, character)
    .replace(/{CREATED}/g, now)
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

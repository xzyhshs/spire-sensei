import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createGame, listGames, readGame } from '../electron/lib/game-manager'
import fs from 'fs'
import path from 'path'
import os from 'os'

const testDir = path.join(os.tmpdir(), 'spire-sensei-test-games')

describe('game-manager', () => {
  beforeEach(() => {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true })
    fs.mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true })
  })

  it('creates a new game file with template', () => {
    const filePath = createGame('铁甲战士', testDir)
    expect(fs.existsSync(filePath)).toBe(true)
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('character: 铁甲战士')
    expect(content).toContain('# 卡组')
  })

  it('lists all game files', () => {
    createGame('铁甲战士', testDir)
    createGame('静默猎手', testDir)
    const games = listGames(testDir)
    expect(games).toHaveLength(2)
  })

  it('reads a game file', () => {
    const filePath = createGame('观者', testDir)
    const state = readGame(filePath)
    expect(state.character).toBe('观者')
  })
})

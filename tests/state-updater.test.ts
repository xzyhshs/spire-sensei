import { describe, it, expect } from 'vitest'
import { applyStateUpdate, extractStateJson } from '../electron/lib/state-updater'
import { writeGameMd } from '../electron/lib/md-writer'
import { parseGameMd } from '../electron/lib/md-parser'

describe('applyStateUpdate', () => {
  const baseState = {
    character: '铁甲战士', floor: 12, hp: '45/72', gold: 188, act: 2,
    created: '2026-05-13T20:30:00+08:00', updated: '2026-05-13T21:15:00+08:00',
    cards: [
      { name: '打击', upgraded: false, count: 4 },
      { name: '防御', upgraded: false, count: 4 }
    ],
    relics: ['痛楚印记']
  }

  it('updates scalar fields (hp, gold, floor)', () => {
    const md = writeGameMd(baseState)
    const update = { hp: '38/72', gold: 200, floor: 13 }
    const updated = applyStateUpdate(md, update)
    const parsed = parseGameMd(updated)
    expect(parsed.hp).toBe('38/72')
    expect(parsed.gold).toBe(200)
    expect(parsed.floor).toBe(13)
  })

  it('adds new cards', () => {
    const md = writeGameMd(baseState)
    const update = { addCards: ['燃烧'] }
    const updated = applyStateUpdate(md, update)
    const parsed = parseGameMd(updated)
    expect(parsed.cards.find(c => c.name === '燃烧')).toBeDefined()
  })

  it('adds new relics', () => {
    const md = writeGameMd(baseState)
    const update = { addRelics: ['皇家枕套'] }
    const updated = applyStateUpdate(md, update)
    const parsed = parseGameMd(updated)
    expect(parsed.relics).toContain('皇家枕套')
  })

  it('upgrades a card', () => {
    const md = writeGameMd(baseState)
    const update = { upgradeCards: ['打击'] }
    const updated = applyStateUpdate(md, update)
    const parsed = parseGameMd(updated)
    const strike = parsed.cards.find(c => c.name === '打击')!
    expect(strike.upgraded).toBe(true)
  })

})

describe('extractStateJson', () => {
  it('extracts state JSON from AI response text', () => {
    const aiResponse = 'I recommend taking 燃烧.\n\n```json state\n{"addCards":["燃烧"]}\n```\n\nGood luck!'
    const json = extractStateJson(aiResponse)
    expect(json).toEqual({ addCards: ['燃烧'] })
  })

  it('returns null when no state JSON present', () => {
    const json = extractStateJson('Just some advice without state update.')
    expect(json).toBeNull()
  })
})

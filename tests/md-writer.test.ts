import { describe, it, expect } from 'vitest'
import { writeGameMd } from '../electron/lib/md-writer'
import { parseGameMd } from '../electron/lib/md-parser'

const sampleState = {
  character: '铁甲战士',
  floor: 13,
  hp: '38/72',
  gold: 200,
  act: 2,
  created: '2026-05-13T20:30:00+08:00',
  updated: '2026-05-13T21:20:00+08:00',
  cards: [
    { name: '打击', upgraded: false, count: 4 },
    { name: '痛击', upgraded: true, count: 1 },
    { name: '燃烧', upgraded: false, count: 1 }
  ],
  relics: ['痛楚印记', '皇家枕套'],
  potions: ['格挡药水'],
  options: '选择路线: 精英 / 篝火 / 商店'
}

describe('writeGameMd', () => {
  it('writes YAML front matter', () => {
    const md = writeGameMd(sampleState)
    expect(md).toContain('character: 铁甲战士')
    expect(md).toContain('floor: 13')
    expect(md).toContain('hp: 38/72')
    expect(md).toContain('gold: 200')
  })

  it('writes card list with upgrade markers', () => {
    const md = writeGameMd(sampleState)
    expect(md).toContain('- [ ] 打击 x4')
    expect(md).toContain('- [x] 痛击+')
    expect(md).toContain('- [ ] 燃烧')
  })

  it('writes relics and potions sections', () => {
    const md = writeGameMd(sampleState)
    expect(md).toContain('# 遗物 (2)')
    expect(md).toContain('- 痛楚印记')
    expect(md).toContain('# 药水 (1)')
  })

  it('writes current options section', () => {
    const md = writeGameMd(sampleState)
    expect(md).toContain('# 当前选项')
    expect(md).toContain('- 选择路线: 精英 / 篝火 / 商店')
  })

  it('round-trips through parser', () => {
    const md = writeGameMd(sampleState)
    const parsed = parseGameMd(md)
    expect(parsed.character).toBe(sampleState.character)
    expect(parsed.cards).toEqual(sampleState.cards)
    expect(parsed.relics).toEqual(sampleState.relics)
    expect(parsed.options).toBe(sampleState.options)
  })
})

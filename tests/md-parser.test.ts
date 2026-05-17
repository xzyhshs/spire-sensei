import { describe, it, expect } from 'vitest'
import { parseGameMd } from '../electron/lib/md-parser'

const sampleMd = `---
character: 铁甲战士
floor: 12
hp: 45/72
gold: 188
act: 2
created: 2026-05-13T20:30:00+08:00
updated: 2026-05-13T21:15:00+08:00
---

# 卡组 (15)
- [ ] 打击 x4
- [ ] 防御 x4
- [x] 痛击+ x1
- [ ] 旋风斩 x1

# 遗物 (4)
- 痛楚印记
- 皇家枕套

`

describe('parseGameMd', () => {
  it('parses YAML front matter', () => {
    const result = parseGameMd(sampleMd)
    expect(result.character).toBe('铁甲战士')
    expect(result.floor).toBe(12)
    expect(result.hp).toBe('45/72')
    expect(result.gold).toBe(188)
    expect(result.act).toBe(2)
  })

  it('parses cards with upgrade status and count', () => {
    const result = parseGameMd(sampleMd)
    expect(result.cards).toHaveLength(4)
    expect(result.cards[0]).toEqual({ name: '打击', upgraded: false, count: 4 })
    expect(result.cards[2]).toEqual({ name: '痛击', upgraded: true, count: 1 })
  })

  it('parses relics', () => {
    const result = parseGameMd(sampleMd)
    expect(result.relics).toEqual(['痛楚印记', '皇家枕套'])
  })


})

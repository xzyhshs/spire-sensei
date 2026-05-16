import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '../electron/lib/context-builder'

const gameState = {
  character: '铁甲战士', floor: 12, hp: '45/72', gold: 188, act: 2,
  created: '', updated: '',
  cards: [{ name: '打击', upgraded: false, count: 4 }, { name: '痛击', upgraded: true, count: 1 }],
  relics: ['痛楚印记'], options: '抓牌: 燃烧 / 双发 / 震波'
}

describe('buildSystemPrompt', () => {
  it('includes game state snapshot', () => {
    const prompt = buildSystemPrompt({
      gameState,
      persona: { id: 'default', name: '默认', description: '', preset: true },
      customPersonaPrompt: ''
    })
    expect(prompt).toContain('铁甲战士')
    expect(prompt).toContain('12')
    expect(prompt).toContain('45/72')
    expect(prompt).toContain('痛击')
    expect(prompt).toContain('痛楚印记')
  })

  it('includes persona description', () => {
    const prompt = buildSystemPrompt({
      gameState,
      persona: { id: 'lbw', name: '卢本伟', description: '说话像卢本伟', preset: true },
      customPersonaPrompt: ''
    })
    expect(prompt).toContain('说话像卢本伟')
  })

  it('handles null gameState', () => {
    const prompt = buildSystemPrompt({
      gameState: null,
      persona: { id: 'default', name: '默认', description: '', preset: true },
      customPersonaPrompt: ''
    })
    expect(prompt).toContain('当前没有活跃的游戏存档')
  })
})

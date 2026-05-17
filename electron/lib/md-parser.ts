import type { GameState, Card } from '../../src/types'

export function parseGameMd(content: string): GameState {
  const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!yamlMatch) throw new Error('Missing YAML front matter')

  const yaml = parseYaml(yamlMatch[1])
  const body = content.slice(yamlMatch[0].length).trim()

  return {
    character: yaml.character || '',
    floor: Number(yaml.floor) || 0,
    hp: yaml.hp || '0/0',
    gold: Number(yaml.gold) || 0,
    act: Number(yaml.act) || 1,
    created: yaml.created || '',
    updated: yaml.updated || '',
    cards: parseCards(body),
    relics: parseSection(body, '遗物')
  }
}

function parseYaml(yaml: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of yaml.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const value = line.slice(colonIdx + 1).trim()
    if (key) result[key] = value
  }
  return result
}

function parseCards(body: string): Card[] {
  const section = extractSection(body, '卡组')
  if (!section) return []
  return section.split('\n')
    .filter(line => line.startsWith('- ['))
    .map(line => {
      const upgraded = line.startsWith('- [x]')
      const content = line.slice(upgraded ? 6 : 5)
      const match = content.match(/^(.+?) x(\d+)$/)
      let name = match ? match[1].trim() : content.trim()
      // Strip trailing '+' for upgraded cards — the `upgraded` flag already indicates it
      if (upgraded && name.endsWith('+')) name = name.slice(0, -1)
      return { name, upgraded, count: match ? Number(match[2]) : 1 }
    })
}

function parseSection(body: string, heading: string): string[] {
  const section = extractSection(body, heading)
  if (!section) return []
  return section.split('\n')
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2).trim())
}

function extractSection(body: string, heading: string): string | null {
  const regex = new RegExp(`# ${heading}[^\\n]*\\n([\\s\\S]*?)(?=\\n# |$)`)
  const match = body.match(regex)
  return match ? match[1].trim() : null
}

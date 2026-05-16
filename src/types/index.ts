export interface GameState {
  character: string
  floor: number
  hp: string
  gold: number
  act: number
  created: string
  updated: string
  cards: Card[]
  relics: string[]
  options: string
}

export interface Card {
  name: string
  upgraded: boolean
  count: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  imageBase64?: string[]
  timestamp: number
}

export interface Persona {
  id: string
  name: string
  description: string
  preset: boolean
}

export interface AppConfig {
  vendorName: string
  apiKey: string
  baseUrl: string
  model: string
  depth: 'deep' | 'shallow'
  persona: string
  customPersonaPrompt: string
}

import type { GameState, AppConfig } from './index'

export interface ElectronAPI {
  readGameFile: (path: string) => Promise<GameState>
  writeGameFile: (path: string, content: string) => Promise<void>
  listGameFiles: () => Promise<Array<{ path: string; character: string; updated: string }>>
  createGameFile: (character: string) => Promise<string>
  getConfig: () => Promise<Record<string, unknown>>
  setConfig: (key: string, value: unknown) => Promise<void>
  sendMessage: (opts: { text: string; imageBase64?: string[]; config?: AppConfig }) => Promise<string>
  sendMessageStream: (opts: { text: string; imageBase64?: string[]; config?: AppConfig }) => Promise<void>
  onStreamChunk: (cb: (text: string) => void) => () => void
  onStreamDone: (cb: (data: { gameState: GameState | null }) => void) => () => void
  onStreamError: (cb: (msg: string) => void) => () => void
  cancelMessage: () => Promise<void>
  deleteGameFile: (path: string) => Promise<boolean>
  saveChatHistory: (gamePath: string, messages: unknown[]) => Promise<boolean>
  loadChatHistory: (gamePath: string) => Promise<{ messages: import('./index').ChatMessage[] }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

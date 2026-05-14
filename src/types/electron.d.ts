import type { GameState, AppConfig } from './index'

export interface ElectronAPI {
  readGameFile: (path: string) => Promise<GameState>
  writeGameFile: (path: string, content: string) => Promise<void>
  listGameFiles: () => Promise<Array<{ path: string; character: string; updated: string }>>
  createGameFile: (character: string) => Promise<string>
  getConfig: () => Promise<Record<string, unknown>>
  setConfig: (key: string, value: unknown) => Promise<void>
  sendMessage: (opts: { text: string; imageBase64?: string; config?: AppConfig }) => Promise<string>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

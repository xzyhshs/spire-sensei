import type { GameState } from '../types'

export async function listGameFiles() {
  return window.electronAPI.listGameFiles()
}

export async function createGameFile(character: string) {
  return window.electronAPI.createGameFile(character)
}

export async function readGameFile(path: string): Promise<GameState> {
  return window.electronAPI.readGameFile(path)
}

export async function writeGameFile(path: string, content: string) {
  return window.electronAPI.writeGameFile(path, content)
}

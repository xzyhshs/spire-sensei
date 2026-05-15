import type { GameState, ChatMessage } from '../types'

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

export async function deleteGameFile(path: string) {
  return window.electronAPI.deleteGameFile(path)
}

export async function saveChatHistory(gamePath: string, messages: ChatMessage[]) {
  return window.electronAPI.saveChatHistory(gamePath, messages)
}

export async function loadChatHistory(gamePath: string): Promise<ChatMessage[]> {
  const data = await window.electronAPI.loadChatHistory(gamePath)
  return data.messages
}

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  readGameFile: (path: string) => ipcRenderer.invoke('file:readGame', path),
  writeGameFile: (path: string, content: string) => ipcRenderer.invoke('file:writeGame', path, content),
  listGameFiles: () => ipcRenderer.invoke('file:listGames'),
  createGameFile: (character: string) => ipcRenderer.invoke('file:createGame', character),
  getConfig: () => ipcRenderer.invoke('config:get'),
  setConfig: (key: string, value: unknown) => ipcRenderer.invoke('config:set', key, value),
  sendMessage: (opts: { text: string; imageBase64?: string[] }) =>
    ipcRenderer.invoke('api:sendMessage', opts),
  sendMessageStream: (opts: { text: string; imageBase64?: string[] }) =>
    ipcRenderer.invoke('api:sendMessageStream', opts),
  onStreamChunk: (cb: (text: string) => void) => {
    const h = (_e: Electron.IpcRendererEvent, text: string) => cb(text)
    ipcRenderer.on('api:chunk', h)
    return () => { ipcRenderer.removeListener('api:chunk', h) }
  },
  onStreamDone: (cb: (data: { gameState: unknown }) => void) => {
    const h = (_e: Electron.IpcRendererEvent, data: { gameState: unknown }) => cb(data)
    ipcRenderer.on('api:done', h)
    return () => { ipcRenderer.removeListener('api:done', h) }
  },
  onStreamError: (cb: (msg: string) => void) => {
    const h = (_e: Electron.IpcRendererEvent, msg: string) => cb(msg)
    ipcRenderer.on('api:error', h)
    return () => { ipcRenderer.removeListener('api:error', h) }
  },
  onToolExecuting: (cb: (label: string) => void) => {
    const h = (_e: Electron.IpcRendererEvent, label: string) => cb(label)
    ipcRenderer.on('api:tool-executing', h)
    return () => { ipcRenderer.removeListener('api:tool-executing', h) }
  },
  cancelMessage: () => ipcRenderer.invoke('api:cancel'),
  sendUpdateCommand: (opts: { text: string; config?: Record<string, unknown>; gamePath?: string | null }) =>
    ipcRenderer.invoke('api:sendUpdate', opts),
  deleteGameFile: (path: string) => ipcRenderer.invoke('file:deleteGame', path),
  saveChatHistory: (gamePath: string, messages: unknown[]) => ipcRenderer.invoke('chat:save', gamePath, messages),
  loadChatHistory: (gamePath: string) => ipcRenderer.invoke('chat:load', gamePath)
})

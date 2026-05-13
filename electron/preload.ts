import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  readGameFile: (path: string) => ipcRenderer.invoke('file:readGame', path),
  writeGameFile: (path: string, content: string) => ipcRenderer.invoke('file:writeGame', path, content),
  listGameFiles: () => ipcRenderer.invoke('file:listGames'),
  createGameFile: (character: string) => ipcRenderer.invoke('file:createGame', character),
  getConfig: () => ipcRenderer.invoke('config:get'),
  setConfig: (key: string, value: unknown) => ipcRenderer.invoke('config:set', key, value),
  sendMessage: (opts: { text: string; imageBase64?: string }) =>
    ipcRenderer.invoke('api:sendMessage', opts)
})

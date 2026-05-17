import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { createGame, listGames, readGame, writeGame } from './lib/game-manager'
import { sendMessage, sendMessageStream, sendUpdateCommand, PERSONAS } from './lib/api-client'
import type { GameState } from '../src/types'

let mainWindow: BrowserWindow | null = null
let gamesDir: string
let configPath: string
let currentAbortController: AbortController | null = null

function initPaths() {
  const userDataPath = app.getPath('userData')
  gamesDir = path.join(userDataPath, 'games')
  configPath = path.join(userDataPath, 'config.json')
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }
  } catch { /* ignore */ }
  return {}
}

function saveConfig(config: Record<string, unknown>) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
}

function registerIpcHandlers() {
  // File: list games
  ipcMain.handle('file:listGames', async () => {
    ensureDir(gamesDir)
    return listGames(gamesDir)
  })

  // File: create game
  ipcMain.handle('file:createGame', async (_event, character: string) => {
    ensureDir(gamesDir)
    return createGame(character, gamesDir)
  })

  // File: read game
  ipcMain.handle('file:readGame', async (_event, filePath: string) => {
    return readGame(filePath)
  })

  // File: write game
  ipcMain.handle('file:writeGame', async (_event, filePath: string, state: GameState) => {
    writeGame(filePath, state)
  })

  // Config: get
  ipcMain.handle('config:get', async () => {
    return loadConfig()
  })

  // Config: set
  ipcMain.handle('config:set', async (_event, key: string, value: unknown) => {
    const config = loadConfig()
    config[key] = value
    saveConfig(config)
  })

  // API: send message (legacy non-streaming)
  ipcMain.handle('api:sendMessage', async (_event, opts: {
    text: string
    imageBase64?: string[]
    config?: Record<string, unknown>
    gamePath?: string | null
  }) => {
    const diskConfig = loadConfig()
    const mergedConfig = { ...diskConfig, ...opts.config }
    const appConfig = {
      vendorName: (mergedConfig.vendorName as string) || '',
      apiKey: (mergedConfig.apiKey as string) || '',
      baseUrl: (mergedConfig.baseUrl as string) || 'https://api.deepseek.com/v1',
      model: (mergedConfig.model as string) || 'deepseek-v4-pro',

      persona: (mergedConfig.persona as string) || 'default',
      customPersonaPrompt: (mergedConfig.customPersonaPrompt as string) || ''
    }

    if (!appConfig.apiKey) {
      return JSON.stringify({ reply: '请先在设置中配置 API Key。', gameState: null })
    }

    const personaId = appConfig.persona
    const persona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0]

    // Use frontend-provided gamePath, fallback to most recently updated game
    const games = listGames(gamesDir)
    const gamePath = opts.gamePath || (games.length > 0 ? games[0].path : null)
    const gameState = gamePath ? readGame(gamePath) : null

    try {
      const { reply } = await sendMessage({
        text: opts.text,
        imageBase64: opts.imageBase64,
        gameFilePath: gamePath,
        config: appConfig,
        persona,
        gameState
      })

      // Reload game state if it was updated
      if (gamePath && gameState) {
        const updated = readGame(gamePath)
        return JSON.stringify({ reply, gameState: updated })
      }

      return JSON.stringify({ reply, gameState: null })
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误'
      if (msg.includes('image_url')) {
        return JSON.stringify({ reply: `图片发送失败：${msg}`, gameState: null })
      }
      return JSON.stringify({ reply: `API 请求失败：${msg}`, gameState: null })
    }
  })

  // API: send message (streaming)
  ipcMain.handle('api:sendMessageStream', async (_event, opts: {
    text: string
    imageBase64?: string[]
    config?: Record<string, unknown>
    gamePath?: string | null
  }) => {
    try {
    const diskConfig = loadConfig()
    const mergedConfig = { ...diskConfig, ...opts.config }
    const appConfig = {
      vendorName: (mergedConfig.vendorName as string) || '',
      apiKey: (mergedConfig.apiKey as string) || '',
      baseUrl: (mergedConfig.baseUrl as string) || 'https://api.deepseek.com/v1',
      model: (mergedConfig.model as string) || 'deepseek-v4-pro',

      persona: (mergedConfig.persona as string) || 'default',
      customPersonaPrompt: (mergedConfig.customPersonaPrompt as string) || ''
    }

    if (!appConfig.apiKey) {
      mainWindow?.webContents.send('api:error', '请先在设置中配置 API Key。')
      return
    }

    const personaId = appConfig.persona
    const persona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0]

    // Use frontend-provided gamePath, fallback to most recently updated game
    const games = listGames(gamesDir)
    const gamePath = opts.gamePath || (games.length > 0 ? games[0].path : null)
    const gameState = gamePath ? readGame(gamePath) : null

    // Cancel any previous request, create new AbortController
    currentAbortController?.abort()
    const abortController = new AbortController()
    currentAbortController = abortController

    await sendMessageStream({
      text: opts.text,
      imageBase64: opts.imageBase64,
      gameFilePath: gamePath,
      config: appConfig,
      persona,
      gameState
    }, {
      onChunk(text) {
        mainWindow?.webContents.send('api:chunk', text)
      },
      onDone() {
        currentAbortController = null
        const updated = (gamePath && gameState) ? readGame(gamePath) : null
        mainWindow?.webContents.send('api:done', { gameState: updated })
      },
      onError(err) {
        currentAbortController = null
        const msg = err.message || '未知错误'
        mainWindow?.webContents.send('api:error', `API 请求失败：${msg}`)
      },
      onToolExecuting(label) {
        mainWindow?.webContents.send('api:tool-executing', label)
      }
    }, abortController)
    } catch (err) {
      currentAbortController = null
      const msg = err instanceof Error ? err.message : '未知错误'
      mainWindow?.webContents.send('api:error', `API 请求失败：${msg}`)
    }
  })

  // API: fast-path update command (non-streaming, minimal prompt)
  ipcMain.handle('api:sendUpdate', async (_event, opts: {
    text: string
    config?: Record<string, unknown>
    gamePath?: string | null
  }) => {
    try {
      const diskConfig = loadConfig()
      const mergedConfig = { ...diskConfig, ...opts.config }
      const appConfig = {
        vendorName: (mergedConfig.vendorName as string) || '',
        apiKey: (mergedConfig.apiKey as string) || '',
        baseUrl: (mergedConfig.baseUrl as string) || 'https://api.deepseek.com/v1',
        model: (mergedConfig.model as string) || 'deepseek-v4-pro',
        persona: (mergedConfig.persona as string) || 'default',
        customPersonaPrompt: (mergedConfig.customPersonaPrompt as string) || ''
      }

      if (!appConfig.apiKey) {
        return { reply: '请先在设置中配置 API Key。', stateUpdated: false }
      }

      const games = listGames(gamesDir)
      const gamePath = opts.gamePath || (games.length > 0 ? games[0].path : null)
      const gameState = gamePath ? readGame(gamePath) : null

      const { reply, stateUpdated } = await sendUpdateCommand({
        text: opts.text,
        gameFilePath: gamePath,
        config: appConfig,
        persona: PERSONAS[0],
        gameState
      })

      const updatedState = (stateUpdated && gamePath) ? readGame(gamePath) : null
      return { reply, stateUpdated, gameState: updatedState }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误'
      return { reply: `更新失败：${msg}`, stateUpdated: false, gameState: null }
    }
  })

  // API: cancel streaming
  ipcMain.handle('api:cancel', async () => {
    currentAbortController?.abort()
    return true
  })

  // File: delete game
  ipcMain.handle('file:deleteGame', async (_event, filePath: string) => {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      const chatPath = filePath.replace(/\.md$/, '.chat.json')
      if (fs.existsSync(chatPath)) fs.unlinkSync(chatPath)
      return true
    } catch (err) {
      console.error('[main] deleteGame error:', err)
      return false
    }
  })

  // Chat: save history
  ipcMain.handle('chat:save', async (_event, gamePath: string, messages: unknown[]) => {
    try {
      const chatPath = gamePath.replace(/\.md$/, '.chat.json')
      fs.writeFileSync(chatPath, JSON.stringify({ messages }, null, 2), 'utf-8')
      return true
    } catch (err) {
      console.error('[main] chat:save error:', err)
      return false
    }
  })

  // Chat: load history
  ipcMain.handle('chat:load', async (_event, gamePath: string) => {
    try {
      const chatPath = gamePath.replace(/\.md$/, '.chat.json')
      if (!fs.existsSync(chatPath)) return { messages: [] }
      const raw = fs.readFileSync(chatPath, 'utf-8')
      return JSON.parse(raw)
    } catch (err) {
      console.error('[main] chat:load error:', err)
      return { messages: [] }
    }
  })
}

function createWindow() {
  let title = 'Spire Sensei'
  try {
    const pkgPath = path.join(__dirname, '../package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    title = `Spire Sensei v${pkg.version}`
  } catch {
    console.error('[main] Failed to read package.json for version title')
  }
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  initPaths()
  registerIpcHandlers()
  createWindow()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

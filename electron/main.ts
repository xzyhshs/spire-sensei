import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { createGame, listGames, readGame, writeGame } from './lib/game-manager'
import { sendMessage, PERSONAS } from './lib/api-client'
import type { GameState } from '../src/types'

let mainWindow: BrowserWindow | null = null

const userDataPath = app.getPath('userData')
const gamesDir = path.join(userDataPath, 'games')
const configPath = path.join(userDataPath, 'config.json')

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
  ensureDir(userDataPath)
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

  // API: send message
  ipcMain.handle('api:sendMessage', async (_event, opts: {
    text: string
    imageBase64?: string
  }) => {
    const config = loadConfig()
    const appConfig = {
      apiProvider: (config.apiProvider as string) || 'deepseek',
      apiKey: (config.apiKey as string) || '',
      baseUrl: (config.baseUrl as string) || 'https://api.deepseek.com',
      model: (config.model as string) || 'deepseek-chat',
      depth: (config.depth as 'deep' | 'shallow') || 'deep',
      persona: (config.persona as string) || 'default',
      customPersonaPrompt: (config.customPersonaPrompt as string) || ''
    }

    const personaId = appConfig.persona
    const persona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0]

    // Get current game state if available
    const games = listGames(gamesDir)
    const activeGame = games.length > 0 ? games[0] : null
    const gameState = activeGame ? readGame(activeGame.path) : null

    const { reply } = await sendMessage({
      text: opts.text,
      imageBase64: opts.imageBase64,
      gameFilePath: activeGame?.path || null,
      config: appConfig,
      persona,
      gameState
    })

    // Reload game state if it was updated
    if (activeGame && gameState) {
      const updated = readGame(activeGame.path)
      return JSON.stringify({ reply, gameState: updated })
    }

    return JSON.stringify({ reply, gameState: null })
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'Spire Sensei',
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
  registerIpcHandlers()
  createWindow()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })

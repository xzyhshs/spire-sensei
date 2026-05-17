import { useState, useEffect } from 'react'
import { AppLayout } from './components/Layout/AppLayout'
import { useGameState } from './hooks/useGameState'
import { useChat } from './hooks/useChat'
import { SettingsDialog } from './components/Settings/SettingsDialog'
import type { AppConfig } from './types'

const DEFAULT_CONFIG: AppConfig = {
  vendorName: '',
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-v4-pro',
  persona: 'default',
  customPersonaPrompt: ''
}

function App() {
  const {
    gameState,
    currentPath,
    savedGames,
    loading,
    setLoading,
    createGame,
    switchGame,
    updateGameState,
    deleteGame
  } = useGameState()

  const { messages, sendingPhase, elapsedSeconds, receivedChars, sendMessage, cancelMessage, setMessages, saveChatHistory, loadChatHistory } = useChat()
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Load config from disk on startup
  useEffect(() => {
    window.electronAPI.getConfig().then((saved: Record<string, unknown>) => {
      setConfig(prev => ({ ...prev, ...saved }))
      setConfigLoaded(true)
    }).catch(() => setConfigLoaded(true))
  }, [])

  const handleConfigChange = (partial: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }))
    for (const [key, value] of Object.entries(partial)) {
      window.electronAPI.setConfig(key, value)
    }
  }

  const handleCreateGame = async (character: string) => {
    setLoading(true)
    try {
      if (currentPath) await saveChatHistory(currentPath)
      await createGame(character)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (text: string, imageBase64?: string[]) => {
    const updated = await sendMessage({ text, imageBase64: imageBase64, config, gameState, gamePath: currentPath })
    if (updated) updateGameState(updated)
    // Save chat after each message round completes
    if (currentPath) await saveChatHistory(currentPath)
  }

  const handleSwitchGame = async (path: string) => {
    setLoading(true)
    try {
      if (currentPath) await saveChatHistory(currentPath)
      await switchGame(path)
      await loadChatHistory(path)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGame = async (path: string) => {
    await deleteGame(path)
  }

  return (
    <>
      <AppLayout
        gameState={gameState}
        currentPath={currentPath}
        savedGames={savedGames}
        loading={loading}
        config={config}
        sendingPhase={sendingPhase}
        elapsedSeconds={elapsedSeconds}
        receivedChars={receivedChars}
        onGameStateChange={updateGameState}
        onCreateGame={handleCreateGame}
        onSwitchGame={handleSwitchGame}
        onDeleteGame={handleDeleteGame}
        onConfigChange={handleConfigChange}
        onOpenSettings={() => setShowSettings(true)}
        messages={messages}
        onSendMessage={handleSendMessage}
        onCancelMessage={cancelMessage}
      />

      {showSettings && (
        <SettingsDialog
          config={config}
          onConfigChange={handleConfigChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  )
}

export default App

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
  depth: 'deep',
  persona: 'default',
  customPersonaPrompt: ''
}

function App() {
  const {
    gameState,
    currentPath,
    savedGames,
    loading,
    createGame,
    switchGame,
    updateGameState
  } = useGameState()

  const { messages, sending, sendMessage } = useChat()
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

  const handleSendMessage = async (text: string, imageBase64?: string) => {
    const updated = await sendMessage({ text, imageBase64: imageBase64 || '', config, gameState })
    if (updated) updateGameState(updated)
  }

  return (
    <>
      <AppLayout
        gameState={gameState}
        currentPath={currentPath}
        savedGames={savedGames}
        loading={loading}
        config={config}
        sending={sending}
        onGameStateChange={updateGameState}
        onCreateGame={createGame}
        onSwitchGame={switchGame}
        onConfigChange={handleConfigChange}
        onOpenSettings={() => setShowSettings(true)}
        messages={messages}
        onSendMessage={handleSendMessage}
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

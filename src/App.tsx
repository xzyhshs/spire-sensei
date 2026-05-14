import { useState } from 'react'
import { AppLayout } from './components/Layout/AppLayout'
import { useGameState } from './hooks/useGameState'
import { useChat } from './hooks/useChat'
import { SettingsDialog } from './components/Settings/SettingsDialog'
import type { AppConfig } from './types'

const DEFAULT_CONFIG: AppConfig = {
  apiProvider: 'deepseek',
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-chat',
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
  const [showSettings, setShowSettings] = useState(false)

  const handleConfigChange = (partial: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }))
  }

  const handleSendMessage = (text: string, imageBase64?: string) => {
    sendMessage({ text, imageBase64: imageBase64 || '', config, gameState })
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

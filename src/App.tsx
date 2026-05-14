import { useState } from 'react'
import { AppLayout } from './components/Layout/AppLayout'
import { useGameState } from './hooks/useGameState'
import type { ChatMessage } from './types'

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

  const [messages, setMessages] = useState<ChatMessage[]>([])

  return (
    <AppLayout
      gameState={gameState}
      currentPath={currentPath}
      savedGames={savedGames}
      loading={loading}
      onGameStateChange={updateGameState}
      onCreateGame={createGame}
      onSwitchGame={switchGame}
      messages={messages}
      onSendMessage={(msg) => {
        setMessages(prev => [...prev, msg])
      }}
    />
  )
}

export default App

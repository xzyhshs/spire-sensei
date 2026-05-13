import { useState } from 'react'
import { AppLayout } from './components/Layout/AppLayout'
import type { GameState, ChatMessage } from './types'

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  return (
    <AppLayout
      gameState={gameState}
      onGameStateChange={setGameState}
      messages={messages}
      onSendMessage={(msg) => {
        setMessages(prev => [...prev, msg])
      }}
    />
  )
}

export default App

import { useState } from 'react'
import type { GameState, ChatMessage } from './types'

// Placeholder components until Phase 3-5
function App() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw'
    }}>
      <div style={{
        width: '35%',
        minWidth: '300px',
        borderRight: '1px solid #2a2a4a',
        overflow: 'auto',
        padding: '16px'
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#fff' }}>Spire Sensei</h2>
        {!gameState ? (
          <div style={{ color: '#888' }}>No active game. Click "New Game" to start.</div>
        ) : (
          <div style={{ color: '#e0e0e0' }}>
            <p>Character: {gameState.character}</p>
            <p>HP: {gameState.hp}</p>
            <p>Floor: {gameState.floor}</p>
          </div>
        )}
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          flex: 1,
          padding: '16px',
          overflow: 'auto'
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#666',
              marginTop: '40vh'
            }}>
              Start a new game or send a screenshot to begin.
            </div>
          )}
        </div>
        <div style={{
          padding: '12px',
          borderTop: '1px solid #2a2a4a'
        }}>
          <input
            type="text"
            placeholder="Describe your situation or paste a screenshot..."
            style={{
              width: '100%',
              padding: '10px 14px',
              background: '#16213e',
              border: '1px solid #2a2a4a',
              borderRadius: '8px',
              color: '#e0e0e0',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default App

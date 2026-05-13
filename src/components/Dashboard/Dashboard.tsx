import type { GameState } from '../../types'

interface Props {
  gameState: GameState | null
  onGameStateChange: (state: GameState) => void
}

export function Dashboard({ gameState }: Props) {
  return (
    <div style={{ padding: '16px' }}>
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
  )
}

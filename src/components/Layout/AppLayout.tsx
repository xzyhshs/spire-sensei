import { Dashboard } from '../Dashboard/Dashboard'
import { ChatPanel } from '../Chat/ChatPanel'
import type { GameState, ChatMessage } from '../../types'

interface Props {
  gameState: GameState | null
  onGameStateChange: (state: GameState) => void
  messages: ChatMessage[]
  onSendMessage: (msg: ChatMessage) => void
}

export function AppLayout({ gameState, onGameStateChange, messages, onSendMessage }: Props) {
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
        overflow: 'auto'
      }}>
        <Dashboard gameState={gameState} onGameStateChange={onGameStateChange} />
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <ChatPanel messages={messages} onSendMessage={onSendMessage} />
      </div>
    </div>
  )
}

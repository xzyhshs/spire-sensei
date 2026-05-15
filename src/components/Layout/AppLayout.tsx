import { Dashboard } from '../Dashboard/Dashboard'
import { ChatPanel } from '../Chat/ChatPanel'
import type { GameState, ChatMessage, AppConfig } from '../../types'

interface SavedGame {
  path: string
  character: string
  updated: string
}

interface Props {
  gameState: GameState | null
  currentPath: string | null
  savedGames: SavedGame[]
  loading: boolean
  config: AppConfig
  sending: boolean
  onGameStateChange: (state: GameState) => void
  onCreateGame: (character: string) => void
  onSwitchGame: (path: string) => void
  onConfigChange: (config: Partial<AppConfig>) => void
  onOpenSettings: () => void
  messages: ChatMessage[]
  onSendMessage: (text: string, imageBase64?: string[]) => void
  onCancelMessage: () => void
}

export function AppLayout({ gameState, currentPath, savedGames, loading, config, sending, onGameStateChange, onCreateGame, onSwitchGame, onConfigChange, onOpenSettings, messages, onSendMessage, onCancelMessage }: Props) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Left Dashboard */}
      <aside style={{
        width: '35%',
        minWidth: '320px',
        maxWidth: '420px',
        borderRight: '1px solid var(--border-subtle)',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Title Bar */}
        <header style={{
          padding: '20px 20px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'linear-gradient(180deg, rgba(201,169,110,0.06) 0%, transparent 100%)'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            letterSpacing: '0.06em',
            color: 'var(--gold)',
            textShadow: '0 0 20px rgba(201,169,110,0.2)',
            margin: 0
          }}>
            ✦ Spire Sensei
          </h1>
          <p style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginTop: '4px'
          }}>
            Slay the Spire · 新手导师
          </p>
        </header>

        {/* Dashboard Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Dashboard
            gameState={gameState}
            currentPath={currentPath}
            savedGames={savedGames}
            loading={loading}
            onGameStateChange={onGameStateChange}
            onCreateGame={onCreateGame}
            onSwitchGame={onSwitchGame}
          />
        </div>
      </aside>

      {/* Right Chat */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-deep)'
      }}>
        <ChatPanel
          messages={messages}
          sending={sending}
          config={config}
          onConfigChange={onConfigChange}
          onOpenSettings={onOpenSettings}
          onSendMessage={onSendMessage}
          onCancelMessage={onCancelMessage}
        />
      </main>
    </div>
  )
}

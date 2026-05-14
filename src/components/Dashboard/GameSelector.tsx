import { useState } from 'react'

const CHARACTERS = ['铁甲战士', '静默猎手', '故障机器人', '观者']

interface SavedGame {
  path: string
  character: string
  updated: string
}

interface Props {
  savedGames: SavedGame[]
  currentPath: string | null
  loading: boolean
  onCreateGame: (character: string) => void
  onSwitchGame: (path: string) => void
}

export function GameSelector({ savedGames, currentPath, loading, onCreateGame, onSwitchGame }: Props) {
  const [showNewGame, setShowNewGame] = useState(false)

  return (
    <div style={{ padding: '16px' }}>
      {/* Current game indicator */}
      <div
        className="panel-card gold-border"
        style={{
          padding: '12px 16px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Active Game
          </div>
          <div style={{
            fontSize: '14px',
            color: currentPath ? 'var(--gold)' : 'var(--text-muted)',
            fontFamily: currentPath ? 'var(--font-display)' : 'inherit',
            marginTop: '2px'
          }}>
            {currentPath ? currentPath.split('/').pop()?.replace('.md', '') : '未选择'}
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ fontSize: '12px', padding: '4px 14px' }}
          onClick={() => setShowNewGame(!showNewGame)}
          disabled={loading}
        >
          ✦ New Game
        </button>
      </div>

      {/* New game character picker */}
      {showNewGame && (
        <div className="panel-card" style={{ padding: '12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Select Character
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {CHARACTERS.map(char => (
              <button
                key={char}
                onClick={() => {
                  onCreateGame(char)
                  setShowNewGame(false)
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold-dim)'
                  e.currentTarget.style.background = 'rgba(201,169,110,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.background = 'var(--bg-input)'
                }}
              >
                {char}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved games list */}
      {savedGames.length > 0 && (
        <div className="panel-card" style={{ padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Saved Games
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {savedGames.map(game => (
              <button
                key={game.path}
                onClick={() => onSwitchGame(game.path)}
                disabled={game.path === currentPath}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  border: game.path === currentPath ? '1px solid var(--gold-dim)' : '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  background: game.path === currentPath ? 'rgba(201,169,110,0.06)' : 'transparent',
                  color: game.path === currentPath ? 'var(--gold)' : 'var(--text-secondary)',
                  cursor: game.path === currentPath ? 'default' : 'pointer',
                  fontSize: '12px',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (game.path !== currentPath) {
                    e.currentTarget.style.background = 'var(--bg-elevated)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (game.path !== currentPath) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span>{game.character}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                  {new Date(game.updated).toLocaleDateString('zh-CN')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

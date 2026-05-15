import { useState } from 'react'

const CHARACTERS = ['铁甲战士', '静默猎手', '故障机器人', '观者']
const PAGE_SIZE = 5

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
  onDeleteGame: (path: string) => void
}

function getFileName(p: string) {
  return p.replace(/\\/g, '/').split('/').pop()?.replace('.md', '') || p
}

export function GameSelector({ savedGames, currentPath, loading, onCreateGame, onSwitchGame, onDeleteGame }: Props) {
  const [showNewGame, setShowNewGame] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [page, setPage] = useState(0)

  const currentGame = savedGames.find(g => g.path === currentPath)
  const totalPages = Math.ceil(savedGames.length / PAGE_SIZE)
  const pageGames = savedGames.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

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
            当前存档
          </div>
          <div style={{
            fontSize: '14px',
            color: currentPath ? 'var(--gold)' : 'var(--text-muted)',
            fontFamily: currentPath ? 'var(--font-display)' : 'inherit',
            marginTop: '2px'
          }}>
            {currentPath ? getFileName(currentPath) : '未选择'}
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ fontSize: '12px', padding: '4px 14px' }}
          onClick={() => setShowNewGame(!showNewGame)}
          disabled={loading}
        >
          ✦ 新游戏
        </button>
      </div>

      {/* New game character picker */}
      {showNewGame && (
        <div className="panel-card" style={{ padding: '12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            选择角色
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

      {/* Saved games */}
      {savedGames.length > 0 && (
        <div className="panel-card" style={{ padding: '12px' }}>
          <div
            onClick={() => { setExpanded(!expanded); setPage(0) }}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', userSelect: 'none',
              marginBottom: expanded ? '8px' : '0'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              存档管理 ({savedGames.length})
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {expanded ? '▲' : '▼'}
            </span>
          </div>

          {/* Collapsed: show only current game */}
          {!expanded && currentGame && (
            <div style={{
              padding: '6px 12px', fontSize: '12px',
              color: 'var(--gold)', display: 'flex', justifyContent: 'space-between'
            }}>
              <span>{currentGame.character}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                {new Date(currentGame.updated).toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {/* Expanded: paginated list */}
          {expanded && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {pageGames.map(game => (
                  <div
                    key={game.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <button
                      onClick={() => onSwitchGame(game.path)}
                      disabled={game.path === currentPath}
                      style={{
                        flex: 1,
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
                        {new Date(game.updated).toLocaleString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`确定删除存档 "${game.character}" 吗？此操作不可撤销。`)) {
                          onDeleteGame(game.path)
                        }
                      }}
                      title="删除存档"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid transparent',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#c0392b'
                        e.currentTarget.style.color = '#e74c3c'
                        e.currentTarget.style.background = 'rgba(192,57,43,0.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent'
                        e.currentTarget.style.color = 'var(--text-muted)'
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  gap: '12px', marginTop: '8px', fontSize: '12px'
                }}>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{
                      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input)', color: page === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: page === 0 ? 'default' : 'pointer', padding: '2px 8px', fontSize: '11px'
                    }}
                  >
                    &lt;
                  </button>
                  <span style={{ color: 'var(--text-muted)' }}>{page + 1} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    style={{
                      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-input)', color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: page >= totalPages - 1 ? 'default' : 'pointer', padding: '2px 8px', fontSize: '11px'
                    }}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

import type { GameState, Card } from '../../types'

interface Props {
  gameState: GameState | null
  onGameStateChange: (state: GameState) => void
}

function HpBar({ hp }: { hp: string }) {
  const [current, max] = hp.split('/').map(Number)
  const pct = max ? Math.min(100, (current / max) * 100) : 0
  const isLow = pct < 30

  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px'
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>HP</span>
        <span style={{
          color: isLow ? 'var(--hp-red-glow)' : 'var(--text-primary)',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)'
        }}>
          {current}/{max}
        </span>
      </div>
      <div style={{
        height: '6px', background: 'var(--bg-input)', borderRadius: '3px',
        overflow: 'hidden', border: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: isLow
            ? 'linear-gradient(90deg, #c0392b, #e74c3c)'
            : 'linear-gradient(90deg, #c0392b, #e74c3c, #c9a96e)',
          borderRadius: '2px',
          transition: 'width var(--transition-normal)',
          boxShadow: isLow ? '0 0 8px rgba(231,76,60,0.4)' : 'none'
        }} />
      </div>
    </div>
  )
}

function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 0', borderBottom: '1px solid var(--border-subtle)'
    }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{label}</span>
      <span style={{
        color: accent ? 'var(--gold)' : 'var(--text-primary)',
        fontSize: '13px', fontWeight: 600,
        fontFamily: accent ? 'var(--font-display)' : 'var(--font-body)'
      }}>{value}</span>
    </div>
  )
}

function CardItem({ card }: { card: Card }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px',
      borderRadius: 'var(--radius-sm)',
      border: card.upgraded ? '1px solid var(--border-gold)' : '1px solid transparent',
      background: card.upgraded ? 'rgba(201,169,110,0.06)' : 'transparent',
      fontSize: '13px', transition: 'background var(--transition-fast)'
    }}>
      <span style={{
        width: '16px', textAlign: 'center',
        color: card.upgraded ? 'var(--gold)' : 'var(--text-muted)', fontSize: '11px'
      }}>
        {card.upgraded ? '✦' : '·'}
      </span>
      <span style={{
        color: card.upgraded ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1
      }}>
        {card.name}
      </span>
      {card.count > 1 && (
        <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          x{card.count}
        </span>
      )}
    </div>
  )
}

export function Dashboard({ gameState }: Props) {
  if (!gameState) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', padding: '40px 20px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🃏</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          No active game
        </p>
        <button className="btn btn-primary">✦ New Game</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* Status Panel */}
      <div className="panel-card gold-border" style={{ padding: '16px', marginBottom: '16px' }}>
        <div className="section-title">Status</div>
        <StatRow label="Character" value={gameState.character} accent />
        <StatRow label="Floor" value={gameState.floor} />
        <StatRow label="Gold" value={gameState.gold} />
        <StatRow label="Act" value={gameState.act} />
        <HpBar hp={gameState.hp} />
      </div>

      {/* Deck */}
      <div className="panel-card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div className="section-title">卡组 ({gameState.cards.reduce((s, c) => s + c.count, 0)})</div>
        <div className="gold-divider" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {gameState.cards.map((card, i) => (
            <CardItem key={`${card.name}-${i}`} card={card} />
          ))}
        </div>
      </div>

      {/* Relics */}
      {gameState.relics.length > 0 && (
        <div className="panel-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div className="section-title">遗物 ({gameState.relics.length})</div>
          <div className="gold-divider" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {gameState.relics.map((relic, i) => (
              <div key={i} style={{ padding: '4px 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--gold-dim)', marginRight: '8px' }}>◆</span>
                {relic}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Potions */}
      {gameState.potions.length > 0 && (
        <div className="panel-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div className="section-title">药水 ({gameState.potions.length})</div>
          <div className="gold-divider" />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {gameState.potions.map((p, i) => (
              <span key={i} className="badge badge-gold">{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* Options */}
      {gameState.options && (
        <div className="panel-card gold-border" style={{ padding: '16px' }}>
          <div className="section-title">当前选项</div>
          <div className="gold-divider" />
          <div style={{
            fontSize: '13px', color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap', lineHeight: 1.6
          }}>
            {gameState.options}
          </div>
        </div>
      )}
    </div>
  )
}

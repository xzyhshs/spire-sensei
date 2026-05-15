import { useRef } from 'react'
import type { GameState, Card } from '../../types'
import { GameSelector } from './GameSelector'

const ANIM_STYLE = `
@keyframes dashBounce {
  0% { transform: scale(1); color: inherit; }
  40% { transform: scale(1.3); color: #c9a96e; }
  100% { transform: scale(1); color: inherit; }
}
@keyframes dashHighlight {
  0% { background: rgba(201,169,110,0.25); }
  100% { background: transparent; }
}
@keyframes dashSlideIn {
  0% { opacity: 0; transform: translateX(-12px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes dashFadeGreen {
  0% { background: rgba(46,204,113,0.2); }
  100% { background: transparent; }
}
`

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
  onGameStateChange: (state: GameState) => void
  onCreateGame: (character: string) => void
  onSwitchGame: (path: string) => void
  onDeleteGame: (path: string) => void
}

function HpBar({ hp, changed }: { hp: string; changed: boolean }) {
  const [current, max] = hp.split('/').map(Number)
  const pct = max ? Math.min(100, (current / max) * 100) : 0
  const isLow = pct < 30

  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px'
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>生命值</span>
        <span key={`${current}/${max}`} style={{
          color: isLow ? 'var(--hp-red-glow)' : 'var(--text-primary)',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          display: 'inline-block',
          animation: changed ? 'dashBounce 0.45s ease-out' : 'none'
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
          transition: 'width 0.5s ease-out',
          boxShadow: isLow ? '0 0 8px rgba(231,76,60,0.4)' : 'none'
        }} />
      </div>
    </div>
  )
}

function StatRow({ label, value, accent, changed }: { label: string; value: string | number; accent?: boolean; changed?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '6px 0', borderBottom: '1px solid var(--border-subtle)',
      animation: changed ? 'dashHighlight 0.6s ease-out' : 'none'
    }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{label}</span>
      <span key={String(value)} style={{
        color: accent ? 'var(--gold)' : 'var(--text-primary)',
        fontSize: '13px', fontWeight: 600,
        fontFamily: accent ? 'var(--font-display)' : 'var(--font-body)',
        display: 'inline-block',
        animation: changed ? 'dashBounce 0.45s ease-out' : 'none'
      }}>{value}</span>
    </div>
  )
}

function CardItem({ card, isNew }: { card: Card; isNew: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px',
      borderRadius: 'var(--radius-sm)',
      border: card.upgraded ? '1px solid var(--border-gold)' : '1px solid transparent',
      background: card.upgraded ? 'rgba(201,169,110,0.06)' : 'transparent',
      fontSize: '13px', transition: 'background var(--transition-fast)',
      animation: isNew ? 'dashSlideIn 0.35s ease-out' : 'none'
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
        <span style={{
          color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-mono)',
          display: 'inline-block',
          animation: isNew ? 'dashBounce 0.35s ease-out' : 'none'
        }}>
          x{card.count}
        </span>
      )}
    </div>
  )
}

function RelicItem({ name, isNew }: { name: string; isNew: boolean }) {
  return (
    <div style={{
      padding: '4px 8px', fontSize: '13px', color: 'var(--text-secondary)',
      animation: isNew ? 'dashSlideIn 0.35s ease-out' : 'none'
    }}>
      <span style={{ color: 'var(--gold-dim)', marginRight: '8px' }}>◆</span>
      {name}
    </div>
  )
}

function PotionBadge({ name, isNew }: { name: string; isNew: boolean }) {
  return (
    <span className="badge badge-gold" style={{
      animation: isNew ? 'dashSlideIn 0.35s ease-out' : 'none'
    }}>{name}</span>
  )
}

export function Dashboard({ gameState, currentPath, savedGames, loading, onCreateGame, onSwitchGame, onDeleteGame }: Props) {
  const prevRef = useRef<GameState | null>(null)
  const prev = prevRef.current
  prevRef.current = gameState

  const epochRef = useRef<Map<string, number>>(new Map())
  const getEpoch = (name: string, isNew: boolean): number => {
    const cur = epochRef.current.get(name) ?? 0
    if (isNew) epochRef.current.set(name, cur + 1)
    return isNew ? cur + 1 : cur
  }

  const changed = {
    floor: prev && gameState ? prev.floor !== gameState.floor : false,
    gold: prev && gameState ? prev.gold !== gameState.gold : false,
    hp: prev && gameState ? prev.hp !== gameState.hp : false
  }

  const newCards = gameState && prev
    ? new Set(gameState.cards.filter(c => !prev.cards.find(p => p.name === c.name)).map(c => c.name))
    : new Set<string>()

  const newRelics = gameState && prev
    ? new Set(gameState.relics.filter(r => !prev.relics.includes(r)))
    : new Set<string>()

  const newPotions = gameState && prev
    ? new Set(gameState.potions.filter(p => !prev.potions.includes(p)))
    : new Set<string>()

  return (
    <div style={{ padding: '16px' }}>
      <style>{ANIM_STYLE}</style>
      {/* Game Selector */}
      <GameSelector
        savedGames={savedGames}
        currentPath={currentPath}
        loading={loading}
        onCreateGame={onCreateGame}
        onSwitchGame={onSwitchGame}
        onDeleteGame={onDeleteGame}
      />

      {!gameState ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '40px 20px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🃏</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            选择或创建游戏开始
          </p>
        </div>
      ) : (
      <>
      {/* Status Panel */}
      <div className="panel-card gold-border" style={{ padding: '16px', marginBottom: '16px' }}>
        <div className="section-title">状态</div>
        <StatRow label="角色" value={gameState.character} accent />
        <StatRow label="层数" value={gameState.floor} changed={changed.floor} />
        <StatRow label="金币" value={gameState.gold} changed={changed.gold} />
        <HpBar hp={gameState.hp} changed={changed.hp} />
      </div>

      {/* Deck */}
      <div className="panel-card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div className="section-title">卡组 ({gameState.cards.reduce((s, c) => s + c.count, 0)})</div>
        <div className="gold-divider" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {gameState.cards.map((card) => (
            <CardItem key={`${card.name}-${getEpoch(card.name, newCards.has(card.name))}`} card={card} isNew={newCards.has(card.name)} />
          ))}
        </div>
      </div>

      {/* Relics */}
      {gameState.relics.length > 0 && (
        <div className="panel-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div className="section-title">遗物 ({gameState.relics.length})</div>
          <div className="gold-divider" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {gameState.relics.map((relic) => (
              <RelicItem key={`${relic}-${getEpoch(relic, newRelics.has(relic))}`} name={relic} isNew={newRelics.has(relic)} />
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
            {gameState.potions.map((p) => (
              <PotionBadge key={`${p}-${getEpoch(p, newPotions.has(p))}`} name={p} isNew={newPotions.has(p)} />
            ))}
          </div>
        </div>
      )}

      {/* Options */}
      <div className="panel-card gold-border" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px', lineHeight: 1, marginTop: '1px' }}>🎯</span>
          <div style={{ flex: 1 }}>
            <div className="section-title" style={{ marginBottom: '2px' }}>当前选项</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              截图或描述当前面临的抉择，Sensei 帮你分析最佳方案
            </div>
          </div>
        </div>
        <div className="gold-divider" />
        {gameState.options ? (
          <div style={{
            fontSize: '13px', color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap', lineHeight: 1.6, marginTop: '8px'
          }}>
            {gameState.options}
          </div>
        ) : (
          <div style={{
            fontSize: '12px', color: 'var(--text-muted)',
            textAlign: 'center', padding: '14px 8px 4px',
            fontStyle: 'italic'
          }}>
            暂未记录选项 — 发送截图自动识别，或用"更新状态"手动录入
          </div>
        )}
      </div>
      </>
      )}
    </div>
  )
}

import type { AppConfig, Persona } from '../../types'

interface Props {
  config?: AppConfig
  onConfigChange?: (config: Partial<AppConfig>) => void
  onOpenSettings?: () => void
}

const PERSONAS: Persona[] = [
  { id: 'default', name: '默认', description: '', preset: true }
]

export function ChatToolbar({ config, onConfigChange, onOpenSettings }: Props) {
  const depth = config?.depth || 'deep'
  const persona = config?.persona || 'default'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      {/* Depth toggle */}
      <div style={{
        display: 'flex',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        fontSize: '12px'
      }}>
        <button
          onClick={() => onConfigChange?.({ depth: 'deep' })}
          style={{
            padding: '4px 12px',
            border: 'none',
            background: depth === 'deep' ? 'var(--gold-dark)' : 'transparent',
            color: depth === 'deep' ? 'var(--bg-deep)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: depth === 'deep' ? 600 : 400,
            transition: 'all var(--transition-fast)'
          }}
        >
          深度教学
        </button>
        <button
          onClick={() => onConfigChange?.({ depth: 'shallow' })}
          style={{
            padding: '4px 12px',
            border: 'none',
            borderLeft: '1px solid var(--border-subtle)',
            background: depth === 'shallow' ? 'var(--gold-dark)' : 'transparent',
            color: depth === 'shallow' ? 'var(--bg-deep)' : 'var(--text-muted)',
            cursor: 'pointer',
            fontWeight: depth === 'shallow' ? 600 : 400,
            transition: 'all var(--transition-fast)'
          }}
        >
          学一点点
        </button>
      </div>

      {/* Persona selector */}
      <select
        value={persona}
        onChange={(e) => onConfigChange?.({ persona: e.target.value })}
        style={{
          padding: '4px 8px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-secondary)',
          fontSize: '12px',
          cursor: 'pointer',
          outline: 'none'
        }}
      >
        {PERSONAS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Settings gear */}
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          title="Settings"
          style={{
            width: '28px', height: '28px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-input)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)'
          }}
        >
          ⚙
        </button>
      )}
    </div>
  )
}

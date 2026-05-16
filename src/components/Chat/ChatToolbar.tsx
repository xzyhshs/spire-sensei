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
  const persona = config?.persona || 'default'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
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

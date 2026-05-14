import type { AppConfig, Persona } from '../../types'

interface Props {
  config: AppConfig
  personas: Persona[]
  onChange: (config: Partial<AppConfig>) => void
}

export function PersonaEditor({ config, personas, onChange }: Props) {
  const current = personas.find(p => p.id === config.persona) || personas[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="section-title">教练角色</div>

      {/* Preset personas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {personas.filter(p => p.id !== 'custom').map(p => (
          <label
            key={p.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: config.persona === p.id
                ? '1px solid var(--border-gold)'
                : '1px solid var(--border-subtle)',
              background: config.persona === p.id
                ? 'rgba(201,169,110,0.06)'
                : 'var(--bg-input)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <input
              type="radio"
              name="persona"
              checked={config.persona === p.id}
              onChange={() => onChange({ persona: p.id })}
              style={{ accentColor: 'var(--gold)' }}
            />
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                {p.name}
              </div>
              {p.description && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {p.description}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Custom persona */}
      <label
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          border: config.persona === 'custom'
            ? '1px solid var(--border-gold)'
            : '1px solid var(--border-subtle)',
          background: config.persona === 'custom'
            ? 'rgba(201,169,110,0.06)'
            : 'var(--bg-input)',
          cursor: 'pointer'
        }}
      >
        <input
          type="radio"
          name="persona"
          checked={config.persona === 'custom'}
          onChange={() => onChange({ persona: 'custom' })}
          style={{ accentColor: 'var(--gold)' }}
        />
        <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>✏ 自定义</span>
      </label>

      {config.persona === 'custom' && (
        <textarea
          value={config.customPersonaPrompt}
          onChange={(e) => onChange({ customPersonaPrompt: e.target.value })}
          placeholder="描述你想要的教练风格，例如：说话像诸葛亮，引经据典，言之有物..."
          rows={3}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
            resize: 'vertical',
            outline: 'none'
          }}
        />
      )}
    </div>
  )
}

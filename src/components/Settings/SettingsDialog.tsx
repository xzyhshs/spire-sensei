import { ApiConfig } from './ApiConfig'
import { PersonaEditor } from './PersonaEditor'
import type { AppConfig, Persona } from '../../types'

const PERSONAS: Persona[] = [
  { id: 'default', name: '默认', description: '', preset: true }
]

interface Props {
  config: AppConfig
  onConfigChange: (config: Partial<AppConfig>) => void
  onClose: () => void
}

export function SettingsDialog({ config, onConfigChange, onClose }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div
        style={{
          width: '480px',
          maxHeight: '85vh',
          overflow: 'auto',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          padding: '24px'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            color: 'var(--gold)',
            margin: 0
          }}>
            ⚙ Settings
          </h2>
        </div>

        {/* API Config */}
        <div className="panel-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <ApiConfig config={config} onChange={onConfigChange} />
        </div>

        {/* Persona */}
        <div className="panel-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <PersonaEditor
            config={config}
            personas={PERSONAS}
            onChange={onConfigChange}
          />
        </div>

        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose}>
            保存并退出
          </button>
        </div>
      </div>
    </div>
  )
}

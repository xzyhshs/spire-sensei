import { ApiConfig } from './ApiConfig'
import { PersonaEditor } from './PersonaEditor'
import type { AppConfig, Persona } from '../../types'

const PERSONAS: Persona[] = [
  { id: 'default', name: '默认', description: '', preset: true },
  { id: 'lbw', name: '卢本伟', description: '口语化，东北腔，爱说"兄弟""干就完了"', preset: true },
  { id: 'yujie', name: '东北雨姐', description: '东北方言，爽朗豪迈', preset: true },
  { id: 'trump', name: '特朗普', description: '夸张自信，最高级形容词', preset: true },
  { id: 'custom', name: '✏ 自定义', description: '', preset: false }
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
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
          <button
            onClick={onClose}
            style={{
              width: '28px', height: '28px',
              border: 'none', background: 'none',
              color: 'var(--text-muted)', fontSize: '18px',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            ✕
          </button>
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
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

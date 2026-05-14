import type { AppConfig } from '../../types'

interface Props {
  config: AppConfig
  onChange: (config: Partial<AppConfig>) => void
}

export function ApiConfig({ config, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="section-title">API 设置</div>

      {/* Provider */}
      <div>
        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
          Provider
        </label>
        <select
          value={config.apiProvider}
          onChange={(e) => onChange({ apiProvider: e.target.value as 'deepseek' | 'custom' })}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none'
          }}
        >
          <option value="deepseek">DeepSeek</option>
          <option value="custom">Custom (OpenAI Compatible)</option>
        </select>
      </div>

      {/* API Key */}
      <div>
        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
          API Key
        </label>
        <input
          type="password"
          value={config.apiKey}
          onChange={(e) => onChange({ apiKey: e.target.value })}
          placeholder="sk-..."
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
      </div>

      {/* Base URL (only for custom) */}
      {config.apiProvider === 'custom' && (
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Base URL
          </label>
          <input
            type="text"
            value={config.baseUrl}
            onChange={(e) => onChange({ baseUrl: e.target.value })}
            placeholder="https://api.openai.com"
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Model */}
      <div>
        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
          Model
        </label>
        <input
          type="text"
          value={config.model}
          onChange={(e) => onChange({ model: e.target.value })}
          placeholder={config.apiProvider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o'}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
      </div>
    </div>
  )
}

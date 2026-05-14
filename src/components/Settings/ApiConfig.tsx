import { useMemo } from 'react'
import type { AppConfig } from '../../types'
import { VENDORS } from '../../data/vendors'

interface Props {
  config: AppConfig
  onChange: (config: Partial<AppConfig>) => void
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  background: 'var(--bg-input)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontSize: '13px',
  outline: 'none'
}

export function ApiConfig({ config, onChange }: Props) {
  const activeVendor = useMemo(() => VENDORS.find(v => v.name === config.vendorName), [config.vendorName])

  const handleVendorChange = (vendorName: string) => {
    const vendor = VENDORS.find(v => v.name === vendorName)
    if (vendor) {
      onChange({
        vendorName,
        baseUrl: vendor.baseUrl,
        model: vendor.models[0].id
      })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="section-title">API 设置</div>

      {/* 供应商名称 */}
      <div>
        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
          供应商名称
        </label>
        <select
          value={config.vendorName}
          onChange={(e) => handleVendorChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">-- 请选择 --</option>
          {VENDORS.map(v => (
            <option key={v.id} value={v.name}>{v.name}</option>
          ))}
        </select>
      </div>

      {/* 模型型号 */}
      <div>
        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
          模型型号
        </label>
        {activeVendor ? (
          <select
            value={config.model}
            onChange={(e) => onChange({ model: e.target.value })}
            style={inputStyle}
          >
            {activeVendor.models.map(m => (
              <option key={m.id} value={m.id}>{m.name} — {m.note}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={config.model}
            onChange={(e) => onChange({ model: e.target.value })}
            placeholder="deepseek-v4-pro"
            style={inputStyle}
          />
        )}
      </div>

      {/* API Key */}
      <div>
        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
          API Key
        </label>
        <input
          type="text"
          value={config.apiKey}
          onChange={(e) => onChange({ apiKey: e.target.value })}
          placeholder="sk-..."
          style={inputStyle}
        />
      </div>

      {/* 请求地址 */}
      <div>
        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
          请求地址
        </label>
        <input
          type="text"
          value={config.baseUrl}
          onChange={(e) => onChange({ baseUrl: e.target.value })}
          placeholder="https://api.deepseek.com/v1"
          style={inputStyle}
        />
      </div>
    </div>
  )
}

import { useState, useRef, useCallback } from 'react'

interface Props {
  onSend: (text: string, imageBase64?: string[]) => void
  onCancel: () => void
  disabled?: boolean
}

const MODES = [
  { key: 'cards', label: '更新卡组' },
  { key: 'relics', label: '更新遗物' },
  { key: 'potions', label: '更新药水' },
  { key: 'stats', label: '更新状态' }
]

export function ChatInput({ onSend, onCancel, disabled }: Props) {
  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [activeModes, setActiveModes] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = text.trim() || images.length > 0

  const addImage = (base64: string) => setImages(prev => [...prev, base64])

  const toggleMode = (key: string) => {
    setActiveModes(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue
        const reader = new FileReader()
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1]
          addImage(base64)
        }
        reader.readAsDataURL(file)
        return
      }
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      addImage(base64)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const activeLabels = MODES.filter(m => activeModes.has(m.key)).map(m => m.label)

  const handleSend = () => {
    if (!canSend) return
    let finalText = text
    if (activeLabels.length > 0) {
      const modeHint = `【${activeLabels.join('、')}】请识别内容并调用 update_game_state 更新对应数据`
      finalText = text ? `${modeHint}：${text}` : modeHint
    }
    onSend(finalText, images.length > 0 ? images : undefined)
    setText('')
    setImages([])
    setActiveModes(new Set())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index))

  return (
    <div
      style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-primary)'
      }}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Image previews */}
      {images.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
          flexWrap: 'wrap'
        }}>
          {images.map((img, i) => (
            <div key={i} style={{
              position: 'relative',
              display: 'inline-block'
            }}>
              <img
                src={`data:image/jpeg;base64,${img}`}
                alt={`Preview ${i + 1}`}
                style={{
                  maxHeight: '120px',
                  maxWidth: '200px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-gold)',
                  display: 'block'
                }}
              />
              <button
                onClick={() => removeImage(i)}
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick mode toggle chips */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '8px',
        flexWrap: 'wrap'
      }}>
        {MODES.map(mode => {
          const active = activeModes.has(mode.key)
          return (
            <button
              key={mode.key}
              onClick={() => toggleMode(mode.key)}
              disabled={disabled}
              style={{
                padding: '3px 10px',
                fontSize: '11px',
                borderRadius: '12px',
                border: active ? '1px solid var(--gold)' : '1px solid var(--border-subtle)',
                background: active ? 'rgba(201,169,110,0.12)' : 'var(--bg-input)',
                color: active ? 'var(--gold)' : 'var(--text-muted)',
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all var(--transition-fast)',
                fontWeight: active ? 600 : 400
              }}
            >
              {mode.label}
            </button>
          )
        })}
      </div>

      {/* Input row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px'
      }}>
        {/* Paste button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Paste screenshot (or Ctrl+V)"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-input)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all var(--transition-fast)'
          }}
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1]
              addImage(base64)
            }
            reader.readAsDataURL(file)
          }}
        />

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="描述情况或粘贴截图 (Ctrl+V)..."
          rows={1}
          style={{
            flex: 1,
            padding: '9px 14px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
            resize: 'none',
            outline: 'none',
            maxHeight: '120px',
            transition: 'border-color var(--transition-fast)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--gold-dim)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend || disabled}
          className={canSend && !disabled ? 'btn btn-primary' : 'btn'}
          style={{
            opacity: canSend && !disabled ? 1 : 0.4,
            flexShrink: 0,
            height: '36px',
            padding: '0 16px'
          }}
        >
          发送
        </button>

        {/* Cancel button — only visible when sending */}
        {disabled && (
          <button
            onClick={onCancel}
            style={{
              flexShrink: 0,
              height: '36px',
              width: '36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #c0392b',
              background: 'rgba(192,57,43,0.12)',
              color: '#e74c3c',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)'
            }}
            title="终止回复"
          >
            ⏹
          </button>
        )}
      </div>

      {/* Hint */}
      <div style={{
        marginTop: '6px',
        fontSize: '10px',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        Ctrl+V 粘贴截图 · 拖放图片 · Enter 发送 · Shift+Enter 换行
      </div>
    </div>
  )
}

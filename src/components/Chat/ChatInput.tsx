import { useState, useRef, useCallback } from 'react'

interface Props {
  onSend: (text: string, imageBase64?: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = text.trim() || image

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
          setImage(base64)
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
      setImage(base64)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleSend = () => {
    if (!canSend) return
    onSend(text, image || undefined)
    setText('')
    setImage(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const removeImage = () => setImage(null)

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
      {/* Image preview */}
      {image && (
        <div style={{
          position: 'relative',
          display: 'inline-block',
          marginBottom: '8px'
        }}>
          <img
            src={`data:image/jpeg;base64,${image}`}
            alt="Preview"
            style={{
              maxHeight: '120px',
              maxWidth: '240px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-gold)',
              display: 'block'
            }}
          />
          <button
            onClick={removeImage}
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
      )}

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
              setImage(base64)
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

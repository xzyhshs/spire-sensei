import type { ChatMessage } from '../../types'

interface Props {
  message: ChatMessage
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '4px'
    }}>
      {/* Role label */}
      <span style={{
        fontSize: '10px',
        color: 'var(--text-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '4px',
        padding: isUser ? '0 16px 0 0' : '0 0 0 16px'
      }}>
        {isUser ? 'You' : 'Sensei'}
      </span>

      {/* Image preview if present */}
      {message.imageBase64 && (
        <div style={{
          maxWidth: '240px',
          marginBottom: '8px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <img
            src={`data:image/jpeg;base64,${message.imageBase64}`}
            alt="Screenshot"
            style={{ width: '100%', display: 'block' }}
          />
        </div>
      )}

      {/* Text bubble */}
      {message.text && (
        <div style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: isUser
            ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)'
            : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
          background: isUser
            ? 'linear-gradient(135deg, var(--gold-dark), rgba(160,128,62,0.5))'
            : 'var(--bg-elevated)',
          border: isUser ? '1px solid var(--border-gold-active)' : '1px solid var(--border-subtle)',
          color: isUser ? 'var(--bg-deep)' : 'var(--text-primary)',
          fontSize: '14px',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          boxShadow: isUser ? 'var(--shadow-gold)' : 'var(--shadow-card)'
        }}>
          {message.text}
        </div>
      )}

      {/* Timestamp */}
      <span style={{
        fontSize: '10px',
        color: 'var(--text-muted)',
        marginTop: '4px',
        padding: isUser ? '0 12px 0 0' : '0 0 0 12px'
      }}>
        {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </span>
    </div>
  )
}

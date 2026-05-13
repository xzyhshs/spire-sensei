import type { ChatMessage } from '../../types'

interface Props {
  messages: ChatMessage[]
  onSendMessage: (msg: ChatMessage) => void
}

export function ChatPanel({ messages }: Props) {
  return (
    <>
      <div style={{
        flex: 1,
        padding: '16px',
        overflow: 'auto'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#666',
            marginTop: '40vh'
          }}>
            Start a new game or send a screenshot to begin.
          </div>
        )}
      </div>
      <div style={{
        padding: '12px',
        borderTop: '1px solid #2a2a4a'
      }}>
        <input
          type="text"
          placeholder="Describe your situation or paste a screenshot..."
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#16213e',
            border: '1px solid #2a2a4a',
            borderRadius: '8px',
            color: '#e0e0e0',
            fontSize: '14px'
          }}
        />
      </div>
    </>
  )
}

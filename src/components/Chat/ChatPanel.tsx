import { useRef, useEffect } from 'react'
import type { ChatMessage, AppConfig } from '../../types'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { ChatToolbar } from './ChatToolbar'

interface Props {
  messages: ChatMessage[]
  sending: boolean
  config: AppConfig
  onConfigChange: (config: Partial<AppConfig>) => void
  onOpenSettings: () => void
  onSendMessage: (text: string, imageBase64?: string) => void
}

export function ChatPanel({ messages, sending, config, onConfigChange, onOpenSettings, onSendMessage }: Props) {
  const messageListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight
    }
  }, [messages])

  return (
    <>
      {/* Header */}
      <header style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, rgba(26,18,31,0.95) 0%, rgba(26,18,31,0.8) 100%)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          letterSpacing: '0.04em'
        }}>
          Conversation
        </div>
        <ChatToolbar config={config} onConfigChange={onConfigChange} onOpenSettings={onOpenSettings} />
      </header>

      {/* Messages */}
      <div ref={messageListRef} style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.2 }}>⚔</div>
            <p style={{
              color: 'var(--text-muted)', fontSize: '14px', maxWidth: '320px', lineHeight: 1.6
            }}>
              Start a new game, then send a screenshot or describe your situation to get guidance.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {sending && (
              <div style={{
                alignSelf: 'flex-start',
                color: 'var(--text-muted)',
                fontSize: '12px',
                fontStyle: 'italic',
                padding: '8px 16px'
              }}>
                Sensei is thinking...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        disabled={sending}
      />
    </>
  )
}

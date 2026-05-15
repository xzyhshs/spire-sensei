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
  onSendMessage: (text: string, imageBase64?: string[]) => void
  onCancelMessage: () => void
}

export function ChatPanel({ messages, sending, config, onConfigChange, onOpenSettings, onSendMessage, onCancelMessage }: Props) {
  const messageListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = messageListRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight
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
          对话
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
              创建游戏后，发送截图或描述当前状况获取指导
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
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 16px'
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginRight: '4px' }}>思考中</span>
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'var(--gold-dim)',
                      display: 'inline-block',
                      animation: `senseiDotBounce 1.4s ease-in-out ${i * 0.2}s infinite`
                    }}
                  />
                ))}
                <style>{`
                  @keyframes senseiDotBounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
                    40% { transform: translateY(-6px); opacity: 1; }
                  }
                `}</style>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        onCancel={onCancelMessage}
        disabled={sending}
      />
    </>
  )
}

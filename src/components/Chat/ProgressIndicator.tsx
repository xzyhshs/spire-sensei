import type { SendingPhase } from '../../types'

interface Props {
  phase: SendingPhase
  elapsedSeconds: number
  receivedChars: number
}

const PHASE_CONFIG: Record<Exclude<SendingPhase, 'idle'>, { label: string; progress: number }> = {
  'sending': { label: '正在发送请求...', progress: 15 },
  'waiting': { label: '正在等待 AI 回复...', progress: 35 },
  'receiving': { label: '正在接收回复...', progress: 65 },
  'tool-executing': { label: '正在执行工具调用...', progress: 85 }
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

type ActivePhase = Exclude<SendingPhase, 'idle'>

export function ProgressIndicator({ phase, elapsedSeconds, receivedChars }: Props) {
  const info = PHASE_CONFIG[phase as ActivePhase] || PHASE_CONFIG['sending']

  const detail =
    phase === 'receiving' && receivedChars > 0
      ? `已接收 ${receivedChars} 字`
      : elapsedSeconds > 0
        ? `已等待 ${formatTime(elapsedSeconds)}`
        : ''

  return (
    <div style={{
      alignSelf: 'flex-start',
      padding: '12px 16px',
      minWidth: '280px'
    }}>
      {/* Label row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px'
      }}>
        <span style={{
          color: 'var(--text-muted)',
          fontSize: '12px',
          fontFamily: 'var(--font-body)'
        }}>
          {info.label}
        </span>
        {detail && (
          <span style={{
            color: 'var(--text-muted)',
            fontSize: '11px',
            opacity: 0.7
          }}>
            {detail}
          </span>
        )}
        {/* Pulsing dot during waiting */}
        {(phase === 'sending' || phase === 'waiting') && (
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--gold-dim)',
            display: 'inline-block',
            animation: 'senseiPulse 1s ease-in-out infinite'
          }} />
        )}
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '3px',
        background: 'var(--bg-input)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${info.progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))',
          borderRadius: '2px',
          transition: 'width 0.6s ease'
        }} />
      </div>

      <style>{`
        @keyframes senseiPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}

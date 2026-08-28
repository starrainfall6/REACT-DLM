import type { ReactNode } from 'react'
import { token } from './style'

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const toneMap: Record<BadgeTone, { bg: string; color: string }> = {
  success: { bg: 'rgba(52,168,83,0.12)', color: token.success },
  warning: { bg: 'rgba(251,188,5,0.12)', color: token.warning },
  danger: { bg: 'rgba(239,68,68,0.12)', color: token.danger },
  info: { bg: 'rgba(66,133,244,0.12)', color: token.primary },
  neutral: { bg: 'rgba(142,142,147,0.14)', color: token.text2 },
}

/** 状态徽章：小圆角药丸，沿用旧版状态标签视觉 */
export default function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  const t = toneMap[tone]
  return (
    <span
      className="inline-flex items-center justify-center px-2 py-0.5 whitespace-nowrap"
      style={{
        background: t.bg,
        color: t.color,
        borderRadius: token.radius,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  )
}

/** 状态文字（非徽章，用于低库存数量标红等） */
export function DangerText({ children }: { children: ReactNode }) {
  return <span style={{ color: token.danger, fontFamily: token.fontMono }}>{children}</span>
}

import type { CSSProperties, ReactNode } from 'react'
import { token } from './style'

const base: CSSProperties = {
  height: 36,
  borderRadius: token.radius,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: token.fontSans,
  border: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

interface PillProps {
  active?: boolean
  onClick?: () => void
  children: ReactNode
}

/** 筛选 pill：选中为 primary 实心，否则描边 */
export function Pill({ active, onClick, children }: PillProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center px-3 whitespace-nowrap"
      style={{
        ...base,
        background: active ? token.primary : token.surface,
        color: active ? token.primaryFg : token.mutedFg,
        border: active ? 'none' : `1px solid ${token.border}`,
      }}
    >
      {children}
    </button>
  )
}

interface PrimaryButtonProps {
  onClick?: () => void
  children: ReactNode
  height?: number
  icon?: ReactNode
  style?: CSSProperties
}

/** 主操作按钮（新增等） */
export function PrimaryButton({ onClick, children, height = 36, icon, style }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 whitespace-nowrap"
      style={{
        ...base,
        height,
        background: token.primary,
        color: token.primaryFg,
        fontSize: 14,
        ...style,
      }}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

interface GhostButtonProps {
  onClick?: () => void
  children?: ReactNode
  icon?: ReactNode
  height?: number
  title?: string
  danger?: boolean
  style?: CSSProperties
}

/** 次级/幽灵按钮（取消、行内操作） */
export function GhostButton({ onClick, children, icon, height = 38, title, danger, style }: GhostButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center px-4 py-2 whitespace-nowrap"
      style={{
        ...base,
        height,
        background: token.surface,
        color: danger ? token.danger : token.text1,
        border: `1px solid ${token.border}`,
        ...style,
      }}
    >
      {icon}
      {children}
    </button>
  )
}

/** 文本型小按钮（行内 借出/归还/编辑/删除） */
export function TextButton({ onClick, children, icon, danger, title }: {
  onClick?: () => void
  children?: ReactNode
  icon?: ReactNode
  danger?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center justify-center px-2 py-0 whitespace-nowrap"
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: 11,
        color: danger ? token.danger : token.mutedFg,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {icon}
      {children}
    </button>
  )
}

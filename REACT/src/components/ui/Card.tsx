import type { CSSProperties, ReactNode } from 'react'
import { token } from './style'

interface CardProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

/** 通用卡片容器：白色表面 + 细边框 + 轻阴影，沿用旧版卡片视觉 */
export default function Card({ children, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: token.surface,
        border: `1px solid ${token.border}`,
        borderRadius: token.radius,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

import type { CSSProperties } from 'react'
import { token } from './style'

const fieldBase: CSSProperties = {
  height: 40,
  padding: '0 12px',
  border: `1px solid var(--input, #e2e3e4)`,
  borderRadius: token.radius,
  background: token.surface,
  color: token.text1,
  fontSize: 14,
  fontFamily: token.fontSans,
  outline: 'none',
}

interface FieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
}

/** 表单字段容器（label + 控件） */
export function Field({ label, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontSize: 13, fontWeight: 500, color: token.text1 }}>
        {label} {required && <span style={{ color: token.danger }}>*</span>}
      </label>
      {children}
    </div>
  )
}

/** 文本/数字输入框 */
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { style, ...rest } = props
  return <input {...rest} style={{ ...fieldBase, ...style }} />
}

/** 文本域 */
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { style, ...rest } = props
  return (
    <textarea
      {...rest}
      style={{ ...fieldBase, height: 'auto', padding: '10px 12px', resize: 'vertical', minHeight: 72, ...style }}
    />
  )
}

/** 两列栅格（表单行） */
export function FormRow2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 mb-4">{children}</div>
}

/** 内联样式工具：用设计令牌 CSS 变量替代 Tailwind 的 var(--xxx) 依赖，
 *  使组件在迁移后的工程里不依赖 Tailwind 的语义色映射。 */
export const css = (strings: TemplateStringsArray, ...values: unknown[]): string =>
  strings.reduce((acc, str, i) => acc + str + (i < values.length ? String(values[i]) : ''), '')

/** 常用语义色，直接引用 index.css 中定义的设计令牌 */
export const token = {
  card: 'var(--card, #fff)',
  surface: 'var(--surface, #fff)',
  border: 'var(--border, rgba(0,0,0,0.08))',
  foreground: 'var(--foreground, #1d1d1f)',
  text1: 'var(--text-1, #1d1d1f)',
  text2: 'var(--text-2, #6e6e73)',
  text3: 'var(--text-3, #86868b)',
  muted: 'var(--muted, #eff1f4)',
  mutedFg: 'var(--muted-foreground, #7f8d9f)',
  primary: 'var(--primary, #4285f4)',
  primaryFg: 'var(--primary-foreground, #fff)',
  accent: 'var(--accent, #0071e3)',
  accentSoft: 'var(--accent-soft, rgba(0,113,227,0.1))',
  surface2: 'var(--surface-2, #f5f5f7)',
  bg: 'var(--bg, #fbfbfd)',
  neutral: 'var(--neutral, #8e8e93)',
  radius: 'var(--radius, 8px)',
  fontSans: "var(--font-sans, 'Manrope','Noto Sans SC',sans-serif)",
  fontMono: "var(--font-mono, 'JetBrains Mono',monospace)",
  success: 'var(--chart-5, #34a853)',
  warning: 'var(--chart-3, #fbbc05)',
  danger: 'var(--destructive, #ef4444)',
} as const

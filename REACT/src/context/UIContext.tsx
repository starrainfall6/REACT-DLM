import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

interface UIContextValue {
  theme: Theme
  toggleTheme: () => void
  collapsed: boolean
  toggleCollapsed: () => void
  setCollapsed: (v: boolean) => void
}

const UIContext = createContext<UIContextValue | null>(null)

function readInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem('dlm-theme')
    if (saved === 'dark' || saved === 'light') return saved
  } catch {}
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

function readInitialCollapsed(): boolean {
  try {
    return localStorage.getItem('dlm-collapsed') === '1'
  } catch {
    return false
  }
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)
  // 与 index.html 首帧脚本保持一致：初始 collapsed 由 html.collapsed 决定
  const [collapsed, setCollapsedState] = useState<boolean>(() =>
    document.documentElement.classList.contains('collapsed')
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('dlm-theme', theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    const html = document.documentElement
    if (collapsed) html.classList.add('collapsed')
    else html.classList.remove('collapsed')
    try {
      localStorage.setItem('dlm-collapsed', collapsed ? '1' : '0')
    } catch {}
  }, [collapsed])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  const toggleCollapsed = () => setCollapsedState((c) => !c)
  const setCollapsed = (v: boolean) => setCollapsedState(v)

  return (
    <UIContext.Provider
      value={{ theme, toggleTheme, collapsed, toggleCollapsed, setCollapsed }}
    >
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI 必须在 UIProvider 内使用')
  return ctx
}

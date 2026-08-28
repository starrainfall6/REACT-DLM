import { Sun, Moon } from 'lucide-react'
import { useUI } from '@/context/UIContext'

interface TopbarProps {
  page: string
}

export default function Topbar({ page }: TopbarProps) {
  const { toggleTheme, theme } = useUI()
  return (
    <header className="topbar">
      <button
        className="icon-btn mobile-toggle"
        aria-label="菜单"
        onClick={() => {
          const shell = document.querySelector('.shell')
          shell?.classList.toggle('mobile-open')
        }}
      >
        <svg viewBox="0 0 24 24">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <div className="topbar-title">
        <span className="page">{page}</span>
      </div>

      <div className="topbar-right">
        <button className="icon-btn theme-toggle" aria-label="切换主题" onClick={toggleTheme}>
          {theme === 'light' ? (
            <Sun className="sun" />
          ) : (
            <Moon className="moon" />
          )}
        </button>
      </div>
    </header>
  )
}

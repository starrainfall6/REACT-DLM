import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { navItems } from '@/data/nav'
import { useUI } from '@/context/UIContext'
import SidebarBrand from './SidebarBrand'

export default function Sidebar() {
  const { toggleCollapsed, collapsed } = useUI()
  return (
    <aside className="sidebar">
      <SidebarBrand />
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              title={item.title}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <button
        className="icon-btn collapse-toggle sidebar-foot"
        aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        onClick={toggleCollapsed}
      >
        <PanelLeftClose className="ic-collapse" />
        <PanelLeftOpen className="ic-expand" />
      </button>
    </aside>
  )
}

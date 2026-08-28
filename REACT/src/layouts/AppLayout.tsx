import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { useUI } from '@/context/UIContext'
import { navItems } from '@/data/nav'

/** 应用内主布局：侧栏 + 顶栏 + 内容区 + 移动端遮罩 */
export default function AppLayout() {
  const { setCollapsed } = useUI()
  const location = useLocation()
  const current = navItems.find((n) => location.pathname.startsWith(n.to))

  // 路由切换时关闭移动端抽屉并清掉首帧 no-anim
  useEffect(() => {
    const shell = document.querySelector('.shell')
    shell?.classList.remove('mobile-open')
  }, [location.pathname])

  return (
    <div className="shell">
      <div className="shell-scrim" onClick={() => document.querySelector('.shell')?.classList.remove('mobile-open')} />
      <Sidebar />
      <div className="main">
        <Topbar page={current?.title ?? 'DemoLineManager'} />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

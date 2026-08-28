import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Wrench,
  Boxes,
  Package,
  ClipboardList,
  ArrowLeftRight,
  ClipboardCheck,
  Users,
  Settings,
} from 'lucide-react'

export interface NavItemDef {
  to: string
  label: string
  title: string
  icon: LucideIcon
}

/** 与旧版 8 个导航项保持一致 */
export const navItems: NavItemDef[] = [
  { to: '/dashboard', label: '仪表盘', title: '仪表盘', icon: LayoutDashboard },
  { to: '/tools', label: '工具管理', title: '工具管理', icon: Wrench },
  { to: '/fixtures', label: '治具管理', title: '治具管理', icon: Boxes },
  { to: '/supplies', label: '备品管理', title: '备品管理', icon: Package },
  { to: '/records', label: '借用记录', title: '借用记录', icon: ClipboardList },
  { to: '/transactions', label: '出入库流水', title: '出入库流水', icon: ArrowLeftRight },
  { to: '/inventory-check', label: '盘点计划', title: '盘点计划', icon: ClipboardCheck },
  { to: '/users', label: '用户管理', title: '用户管理', icon: Users },
  { to: '/settings', label: '系统设置', title: '系统设置', icon: Settings },
]

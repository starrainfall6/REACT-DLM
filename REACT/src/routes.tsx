import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import AppLayout from '@/layouts/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Tools from '@/pages/Tools'
import Fixtures from '@/pages/Fixtures'
import Supplies from '@/pages/Supplies'
import Records from '@/pages/Records'
import Transactions from '@/pages/Transactions'
import InventoryCheck from '@/pages/InventoryCheck'
import Users from '@/pages/Users'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import { isLoggedIn } from '@/api/client'

/** 登录守卫：未登录时一律跳转到 /login */
function RequireAuth({ children }: { children: ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />
}

/** 应用路由表：/ 进入登录页，应用内 8 个路由需登录后访问 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/fixtures" element={<Fixtures />} />
        <Route path="/supplies" element={<Supplies />} />
        <Route path="/records" element={<Records />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/inventory-check" element={<InventoryCheck />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRoutes

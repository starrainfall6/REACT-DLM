/** 后端 API 基础路径：生产走同源 /api（nginx 反代），本地开发可用 VITE_API_BASE 覆盖 */
const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api'

const TOKEN_KEY = 'dlm_token'
const LOGIN_KEY = 'dlm_logged_in'
const USER_KEY = 'dlm_user'

export interface ApiUser {
  id: number
  username: string
  display_name: string
  role: 'super_admin' | 'admin' | 'user'
  created_at: string
}

export interface ApiItem {
  id: number
  code: string
  name: string
  type: string
  category: string
  drawing_number: string
  brand: string
  model: string
  spec: string
  quantity: number
  location: string
  status: string
  min_stock_alert: number
  notes: string
  borrowed_qty: number
}

export interface ApiSpare {
  id: number
  code: string
  name: string
  category: string
  drawing_number: string
  maker: string
  model: string
  quantity: number
  min_stock_alert: number
  location: string
  notes: string
}

export interface ApiBorrowRecord {
  id: number
  ref_no: string
  item_name: string
  item_code: string
  item_type: string
  borrower_name: string
  borrower_dept: string
  purpose: string
  borrow_date: string
  expected_return_date: string | null
  actual_return_date: string | null
  borrow_quantity: number
  returned_quantity: number
  status: string
  notes: string
}

export interface ApiTransaction {
  id: number
  ref_no: string
  item_code: string
  item_name: string
  item_type: string
  tx_type: string
  quantity: number
  operator: string
  dept: string
  note: string
  created_at: string
}

export interface ApiInventoryOrder {
  id: number
  ref_no: string
  type: string
  project: string
  time: string
  person: string
  status: string
  sync_time: string
}

export interface ApiStats {
  total_tools: number
  total_fixtures: number
  total_spares: number
  borrowed_items: number
  overdue_items: number
  low_stock_items: { code: string; name: string; quantity: number; min_stock_alert: number }[]
  low_stock_spares: { code: string; name: string; quantity: number; min_stock_alert: number }[]
  active_records: number
  returned_records: number
  overdue_records: number
}

/* ---------------- 认证令牌 ---------------- */

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY) ?? ''
}

/** 登录成功后保存令牌与登录态；remember=true 存 localStorage，否则存 sessionStorage */
export function saveAuth(
  token: string,
  user: { id: number; username: string; display_name: string; role: string },
  remember: boolean,
) {
  const store = remember ? localStorage : sessionStorage
  store.setItem(TOKEN_KEY, token)
  store.setItem(LOGIN_KEY, '1')
  store.setItem(USER_KEY, JSON.stringify(user))
  const other = remember ? sessionStorage : localStorage
  other.removeItem(TOKEN_KEY)
  other.removeItem(LOGIN_KEY)
  other.removeItem(USER_KEY)
}

export function clearAuth() {
  for (const store of [localStorage, sessionStorage]) {
    store.removeItem(TOKEN_KEY)
    store.removeItem(LOGIN_KEY)
    store.removeItem(USER_KEY)
  }
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(LOGIN_KEY) === '1' || sessionStorage.getItem(LOGIN_KEY) === '1'
}

export function getCurrentUser(): Pick<ApiUser, 'id' | 'username' | 'display_name' | 'role'> | null {
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ApiUser
  } catch {
    return null
  }
}

/** 个人资料修改成功后同步本地缓存用户信息 */
export function updateStoredUser(patch: { username?: string; display_name?: string }) {
  const cur = getCurrentUser()
  if (!cur) return
  const merged = { ...cur, ...patch }
  for (const store of [localStorage, sessionStorage]) {
    if (store.getItem(LOGIN_KEY) === '1') {
      store.setItem(USER_KEY, JSON.stringify(merged))
    }
  }
}

/* ---------------- 基础请求 ---------------- */

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  })
  if (res.status === 401 && !path.startsWith('/auth/login')) {
    clearAuth()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }
  if (!res.ok) {
    let detail = `请求失败 (${res.status})`
    try {
      const data = await res.json()
      if (data && typeof data.detail === 'string') detail = data.detail
      else if (data && data.detail) detail = JSON.stringify(data.detail)
    } catch {
      // 非 JSON 响应，保留默认错误信息
    }
    throw new Error(detail)
  }
  return (await res.json()) as T
}

function qs(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

/* ---------------- 请求负载类型 ---------------- */

export interface ItemPayload {
  name: string
  type: 'tool' | 'fixture'
  category: string
  drawing_number: string
  brand: string
  model: string
  spec: string
  quantity: number
  location: string
  min_stock_alert: number
  notes: string
}

export interface BorrowPayload {
  borrower_name: string
  borrower_dept: string
  borrow_quantity: number
  purpose: string
  expected_return_date?: string
  operator?: string
  note?: string
}

export interface ReturnPayload {
  record_no: string
  return_quantity: number
  operator?: string
  note?: string
}

export interface SparePayload {
  name: string
  category: string
  drawing_number?: string
  maker: string
  model: string
  quantity: number
  min_stock_alert: number
  location: string
  notes: string
}

export interface SpareIoPayload {
  quantity: number
  operator: string
  notes: string
}

/* ---------------- API ---------------- */

export const authApi = {
  login: (username: string, password: string) =>
    request<{
      access_token: string
      token_type: string
      user: { id: number; username: string; display_name: string; role: string }
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  me: () => request<ApiUser>('/auth/me'),
  updateProfile: (body: { username?: string; display_name?: string; old_password?: string; new_password?: string }) =>
    request<{ id: number; username: string; display_name: string; role: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
}

export const itemsApi = {
  list: (params: { type?: string; keyword?: string; page?: number; page_size?: number } = {}) =>
    request<{ items: ApiItem[]; total: number; page: number; page_size: number }>(`/items${qs(params)}`),
  create: (body: ItemPayload) => request<ApiItem>('/items', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<ItemPayload>) =>
    request<ApiItem>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: number) => request<{ success: boolean }>(`/items/${id}`, { method: 'DELETE' }),
  borrow: (id: number, body: BorrowPayload) =>
    request<ApiBorrowRecord>(`/items/${id}/borrow`, { method: 'POST', body: JSON.stringify(body) }),
  returnItem: (id: number, body: ReturnPayload) =>
    request<{ returned: boolean; returned_quantity: number }>(`/items/${id}/return`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

export const sparesApi = {
  list: (params: { keyword?: string; category?: string; page?: number; page_size?: number } = {}) =>
    request<{ items: ApiSpare[]; total: number; page: number; page_size: number }>(`/spares${qs(params)}`),
  create: (body: SparePayload) => request<ApiSpare>('/spares', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<SparePayload>) =>
    request<ApiSpare>(`/spares/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: number) => request<{ success: boolean }>(`/spares/${id}`, { method: 'DELETE' }),
  in: (id: number, body: SpareIoPayload) =>
    request<{ success: boolean; new_quantity: number }>(`/spares/${id}/in`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  out: (id: number, body: SpareIoPayload) =>
    request<{ success: boolean; new_quantity: number }>(`/spares/${id}/out`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

export const recordsApi = {
  list: (params: { keyword?: string; status?: string; item_type?: string; page?: number; page_size?: number } = {}) =>
    request<{ items: ApiBorrowRecord[]; total: number; page: number; page_size: number }>(`/records${qs(params)}`),
}

export const transactionsApi = {
  list: (params: { keyword?: string; type?: string; page?: number; page_size?: number } = {}) =>
    request<{ items: ApiTransaction[]; total: number; page: number; page_size: number }>(`/transactions${qs(params)}`),
}

export const inventoryApi = {
  checks: () => request<{ items: ApiInventoryOrder[]; total: number }>('/inventory-checks'),
  create: (body: { type: string; project: string; time?: string; person?: string }) =>
    request<ApiInventoryOrder>('/inventory-checks', { method: 'POST', body: JSON.stringify(body) }),
  sync: (id: number) => request<ApiInventoryOrder>(`/inventory-checks/${id}/sync`, { method: 'POST' }),
  remove: (id: number) => request<{ success: boolean }>(`/inventory-checks/${id}`, { method: 'DELETE' }),
}

export const statsApi = {
  stats: () => request<ApiStats>('/stats'),
}

export const usersApi = {
  list: (params: { page?: number; page_size?: number; keyword?: string; role?: string } = {}) =>
    request<{ items: ApiUser[]; total: number; page: number; page_size: number }>(`/users${qs(params)}`),
  create: (body: { username: string; password: string; display_name: string; role: string }) =>
    request<ApiUser>('/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: { display_name?: string; role?: string; password?: string }) =>
    request<ApiUser>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id: number) => request<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' }),
}

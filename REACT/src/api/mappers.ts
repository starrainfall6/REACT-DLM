import type { FixtureItem } from '@/data/fixtures'
import type { InventoryOrder } from '@/data/inventoryOrders'
import type { RecordItem } from '@/data/records'
import type { SupplyItem } from '@/data/supplies'
import type { ToolItem } from '@/data/tools'
import type { TransactionItem } from '@/data/transactions'
import type {
  ApiBorrowRecord,
  ApiInventoryOrder,
  ApiItem,
  ApiSpare,
  ApiTransaction,
} from './client'

/** 后端借出数 → 前端 在库/借出 状态 */
function itemStatus(borrowed: number): ToolItem['status'] {
  return borrowed > 0 ? '借出' : '在库'
}

/** 备品库存状态：无货=缺货；低于警戒=紧张；其余=充足 */
function spareStatus(stock: number, warn: number): SupplyItem['status'] {
  if (stock <= 0) return '缺货'
  if (stock < warn) return '紧张'
  return '充足'
}

export function toToolItem(i: ApiItem): ToolItem {
  const lent = i.borrowed_qty ?? 0
  return {
    dbId: i.id,
    id: i.code,
    name: i.name,
    maker: i.brand,
    model: i.model,
    spec: i.spec,
    inStock: Math.max(0, i.quantity - lent),
    lent,
    warn: i.min_stock_alert,
    location: i.location,
    note: i.notes || '-',
    status: itemStatus(lent),
  }
}

export function toFixtureItem(i: ApiItem): FixtureItem {
  const lent = i.borrowed_qty ?? 0
  return {
    dbId: i.id,
    id: i.code,
    name: i.name,
    category: i.category,
    drawing: i.drawing_number || '—',
    spec: i.spec,
    inStock: Math.max(0, i.quantity - lent),
    lent,
    warn: i.min_stock_alert,
    location: i.location,
    note: i.notes || '-',
    status: itemStatus(lent),
  }
}

export function toSupplyItem(s: ApiSpare): SupplyItem {
  return {
    dbId: s.id,
    id: s.code,
    name: s.name,
    category: s.category,
    maker: s.maker,
    model: s.model,
    drawing: s.drawing_number || '—',
    stock: s.quantity,
    warn: s.min_stock_alert,
    location: s.location,
    note: s.notes || '-',
    status: spareStatus(s.quantity, s.min_stock_alert),
  }
}

const RECORD_STATUS: Record<string, RecordItem['status']> = {
  active: '借用中',
  returned: '已归还',
  overdue: '逾期',
}

export function toRecordItem(r: ApiBorrowRecord): RecordItem {
  return {
    id: r.ref_no,
    item: r.item_name,
    borrower: r.borrower_name,
    dept: r.borrower_dept,
    lent: r.borrow_quantity,
    returned: r.returned_quantity,
    purpose: r.purpose,
    lendDate: r.borrow_date,
    expectReturn: r.expected_return_date || '—',
    actualReturn: r.actual_return_date || '—',
    status: RECORD_STATUS[r.status] ?? '借用中',
  }
}

export function toTransactionItem(t: ApiTransaction): TransactionItem {
  return {
    id: t.ref_no,
    item: t.item_name,
    type: t.tx_type === '入库' ? '入库' : '出库',
    qty: t.quantity,
    operator: t.operator,
    dept: t.dept,
    refNo: t.ref_no,
    time: t.created_at,
    note: t.note || undefined,
  }
}

export function toInventoryOrder(c: ApiInventoryOrder): InventoryOrder {
  return {
    dbId: c.id,
    id: c.ref_no,
    type: c.type === '年度' ? '年度' : '月度',
    project: c.project,
    time: c.time,
    person: c.person,
    status: c.status === '已同步' ? '已同步' : '待同步',
    syncTime: c.sync_time,
  }
}
import { useSyncExternalStore } from 'react'
import { records as seed, type RecordItem } from './records'

/**
 * 全局借用记录 store：工具/治具页执行“借出/归还”时写入，
 * 「借用记录」页订阅同一份数据，保持页面间一致。
 * 编号规则：R + 日期 + 三位序号（如 R-20260828-001）
 */
let records: RecordItem[] = [...seed]
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function commit(next: RecordItem[]) {
  records = next
  emit()
}

/** 借出：新增一条借用记录并置顶 */
export function addBorrowRecord(input: {
  item: string
  borrower: string
  dept: string
  qty: number
  purpose: string
  lendDate: string
  expectReturn: string
}): RecordItem {
  const today = input.lendDate.replace(/-/g, '')
  const maxSeq = records.reduce((m, r) => {
    if (r.id.startsWith(`R-${today}-`)) {
      const seq = parseInt(r.id.split('-').pop() ?? '0', 10) || 0
      return Math.max(m, seq)
    }
    return m
  }, 0)
  const rec: RecordItem = {
    id: `R-${today}-${String(maxSeq + 1).padStart(3, '0')}`,
    item: input.item,
    borrower: input.borrower,
    dept: input.dept,
    lent: input.qty,
    returned: 0,
    purpose: input.purpose,
    lendDate: input.lendDate,
    expectReturn: input.expectReturn || '—',
    actualReturn: '—',
    status: '借用中',
  }
  commit([rec, ...records])
  return rec
}

/** 某物品当前活跃（未结清）的借出单 */
export function getActiveRecords(item: string): RecordItem[] {
  return records.filter((r) => r.item === item && r.status !== '已归还' && r.returned < r.lent)
}

/** 归还指定借出单，返回更新后的记录；单号不存在或已结清时返回 null */
export function returnRecord(input: {
  recordId: string
  qty: number
  actualReturn: string
}): RecordItem | null {
  const rec = records.find((r) => r.id === input.recordId)
  if (!rec || rec.returned >= rec.lent) return null
  const qty = Math.min(input.qty, rec.lent - rec.returned)
  let updated: RecordItem | null = null
  commit(
    records.map((r) => {
      if (r.id !== input.recordId) return r
      const returned = r.returned + qty
      const status = returned >= r.lent ? '已归还' : r.status
      updated = { ...r, returned, actualReturn: input.actualReturn, status }
      return updated
    }),
  )
  return updated
}

/** 订阅当前全部借用记录 */
export function useRecords(): RecordItem[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => records,
  )
}
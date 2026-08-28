import { useSyncExternalStore } from 'react'
import dayjs from 'dayjs'
import { transactions as seed, type TransactionItem } from './transactions'

/**
 * 全局出入库流水 store：工具/治具/备品页执行 借出/归还/入库/出库 时写入，
 * 「出入库流水」页订阅同一份数据，保持页面间一致。
 * 编号规则：P + 日期 + 三位序号（如 P-20260828-001）
 */
let transactions: TransactionItem[] = [...seed]
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function commit(next: TransactionItem[]) {
  transactions = next
  emit()
}

/** 生成当天流水号：P-YYYYMMDD-NNN */
function nextId(date: string): string {
  const today = date.replace(/-/g, '')
  const maxSeq = transactions.reduce((m, t) => {
    if (t.id.startsWith(`P-${today}-`)) {
      const seq = parseInt(t.id.split('-').pop() ?? '0', 10) || 0
      return Math.max(m, seq)
    }
    return m
  }, 0)
  return `P-${today}-${String(maxSeq + 1).padStart(3, '0')}`
}

/** 新增一条出入库流水并置顶 */
export function addTransaction(input: {
  type: '入库' | '出库'
  direction: TransactionItem['direction']
  item: string
  qty: number
  operator: string
  dept: string
  refNo: string
  note: string
}): TransactionItem {
  const now = dayjs()
  const txn: TransactionItem = {
    id: nextId(now.format('YYYY-MM-DD')),
    item: input.item,
    type: input.type,
    direction: input.direction,
    qty: input.qty,
    operator: input.operator,
    dept: input.dept,
    refNo: input.refNo,
    time: now.format('YYYY-MM-DD HH:mm'),
    note: input.note,
  }
  commit([txn, ...transactions])
  return txn
}

/** 订阅当前全部流水 */
export function useTransactions(): TransactionItem[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => transactions,
  )
}

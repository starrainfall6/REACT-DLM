export interface InventoryOrder {
  /** 后端数据库主键 */
  dbId: number
  /** 盘点单号：PD-YYYYMMDD-NNN */
  id: string
  /** 盘点类型 */
  type: '年度' | '月度'
  /** 盘点项目：全部 / 工具 / 治具 / 备品 */
  project: string
  /** 盘点时间 YYYY-MM-DD */
  time: string
  /** 盘点人 */
  person: string
  /** 同步状态：创建后待同步，同步后已同步 */
  status: '待同步' | '已同步'
  /** 同步时间，未同步为 — */
  syncTime: string
}

export const inventoryOrders: InventoryOrder[] = [
  { id: 'PD-20260828-001', dbId: 1, type: '月度', project: '工具', time: '2026-08-28', person: '张三', status: '待同步', syncTime: '—' },
  { id: 'PD-20260828-002', dbId: 2, type: '月度', project: '治具', time: '2026-08-29', person: '李四', status: '待同步', syncTime: '—' },
  { id: 'PD-20260827-001', dbId: 3, type: '月度', project: '备品', time: '2026-08-27', person: '王五', status: '已同步', syncTime: '2026-08-26 15:20' },
  { id: 'PD-20260826-001', dbId: 4, type: '月度', project: '工具', time: '2026-08-26', person: '张三', status: '已同步', syncTime: '2026-08-25 09:30' },
  { id: 'PD-20260805-001', dbId: 5, type: '年度', project: '全部', time: '2026-08-05', person: '赵六', status: '已同步', syncTime: '2026-08-01 10:00' },
]

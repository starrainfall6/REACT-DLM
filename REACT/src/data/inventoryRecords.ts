export interface InventoryRecord {
  id: string
  /** 盘点类型 */
  type: string
  /** 盘点时间 */
  time: string
  /** 盘点人 */
  person: string
  /** 盘点结果 */
  result: string
  /** 备注 */
  note: string
}

export const inventoryRecords: InventoryRecord[] = [
  { id: 'R-2026-08-20', type: '全面盘点', time: '2026-08-20 09:30', person: '张三', result: '账实相符', note: '无' },
  { id: 'R-2026-08-21', type: '循环盘点', time: '2026-08-21 14:10', person: '李四', result: '存在差异', note: '治具 F-0012 数量不符' },
  { id: 'R-2026-08-22', type: '抽检盘点', time: '2026-08-22 10:00', person: '王五', result: '账实相符', note: '-' },
  { id: 'R-2026-08-23', type: '全面盘点', time: '2026-08-23 16:45', person: '赵六', result: '待复核', note: '系统未同步' },
  { id: 'R-2026-08-24', type: '循环盘点', time: '2026-08-24 11:20', person: '钱七', result: '账实相符', note: '无' },
  { id: 'R-2026-08-25', type: '抽检盘点', time: '2026-08-25 15:00', person: '孙八', result: '存在差异', note: '备品 S-0033 缺货' },
]

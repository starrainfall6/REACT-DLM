export interface TransactionItem {
  id: string
  item: string
  type: '入库' | '出库'
  /** 方向（旧字段，已废弃，保留兼容） */
  direction?: '采购入库' | '借出' | '归还' | '领用出库' | '盘点调整' | '库存调整'
  qty: number
  operator: string
  dept: string
  refNo: string
  time: string
  /** 备注：借出时取用途，归还/备品操作为弹窗备注 */
  note?: string
}

export const transactions: TransactionItem[] = [
  { id: 'TX-20250701001', item: '数显扭力扳手 T-0001', type: '入库', direction: '归还', qty: 1, operator: '张工', dept: '装配车间', refNo: 'R-20250624-01', time: '2025-07-01 09:12' },
  { id: 'TX-20250701002', item: '电动起子 T-0002', type: '出库', direction: '借出', qty: 2, operator: '李工', dept: '维修组', refNo: 'R-20250702-03', time: '2025-07-01 10:35' },
  { id: 'TX-20250701003', item: 'M3内六角螺丝 S-0001', type: '出库', direction: '领用出库', qty: 500, operator: '王工', dept: '装配车间', refNo: 'WO-24071', time: '2025-07-01 13:48' },
  { id: 'TX-20250702001', item: '游标卡尺 T-0003', type: '出库', direction: '借出', qty: 1, operator: '王工', dept: '质检部', refNo: 'R-20250628-11', time: '2025-07-02 08:50' },
  { id: 'TX-20250702002', item: 'USB-C连接器 S-0004', type: '入库', direction: '采购入库', qty: 2000, operator: '采购-林', dept: '采购部', refNo: 'PO-20250630', time: '2025-07-02 15:20' },
  { id: 'TX-20250703001', item: '示波器 T-0008', type: '入库', direction: '归还', qty: 1, operator: '陈工', dept: '研发部', refNo: 'R-20250625-02', time: '2025-07-03 11:05' },
  { id: 'TX-20250703002', item: '热风枪 T-0009', type: '出库', direction: '借出', qty: 1, operator: '刘工', dept: '维修组', refNo: 'R-20250704-07', time: '2025-07-03 14:30' },
  { id: 'TX-20250704001', item: 'PCB定位治具-A1 F-0001', type: '入库', direction: '归还', qty: 4, operator: '孙工', dept: 'SMT车间', refNo: 'R-20250620-09', time: '2025-07-04 09:40' },
  { id: 'TX-20250704002', item: '锂电池18650 S-0005', type: '出库', direction: '领用出库', qty: 20, operator: '周工', dept: '装配车间', refNo: 'WO-24075', time: '2025-07-04 16:15' },
  { id: 'TX-20250705001', item: '内六角扳手套装 T-0006', type: '出库', direction: '借出', qty: 1, operator: '赵工', dept: '装配车间', refNo: 'R-20250703-05', time: '2025-07-05 10:00' },
]

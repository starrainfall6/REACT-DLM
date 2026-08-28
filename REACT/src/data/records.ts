export interface RecordItem {
  id: string
  item: string
  borrower: string
  dept: string
  /** 借出的数量（该记录借出总数） */
  lent: number
  /** 已归还的数量 */
  returned: number
  purpose: string
  lendDate: string
  expectReturn: string
  actualReturn: string
  status: '借用中' | '已归还' | '逾期'
}

export const records: RecordItem[] = [
  { id: 'R-20250701-01', item: '数显扭力扳手 T-0001', borrower: '张工', dept: '装配车间', lent: 1, returned: 0, purpose: '电机装配扭力校验', lendDate: '2025-07-01', expectReturn: '2025-07-08', actualReturn: '—', status: '借用中' },
  { id: 'R-20250702-03', item: '电动起子 T-0002', borrower: '李工', dept: '维修组', lent: 2, returned: 2, purpose: '线体设备维护', lendDate: '2025-07-02', expectReturn: '2025-07-05', actualReturn: '2025-07-06', status: '已归还' },
  { id: 'R-20250628-11', item: '游标卡尺 T-0003', borrower: '王工', dept: '质检部', lent: 1, returned: 0, purpose: '首件检验', lendDate: '2025-06-28', expectReturn: '2025-07-01', actualReturn: '—', status: '逾期' },
  { id: 'R-20250703-05', item: '内六角扳手套装 T-0006', borrower: '赵工', dept: '装配车间', lent: 1, returned: 0, purpose: '治具拆装', lendDate: '2025-07-03', expectReturn: '2025-07-10', actualReturn: '—', status: '借用中' },
  { id: 'R-20250625-02', item: '示波器 T-0008', borrower: '陈工', dept: '研发部', lent: 1, returned: 1, purpose: '电路调试', lendDate: '2025-06-25', expectReturn: '2025-06-30', actualReturn: '2025-06-29', status: '已归还' },
  { id: 'R-20250704-07', item: '热风枪 T-0009', borrower: '刘工', dept: '维修组', lent: 1, returned: 0, purpose: '拆焊维修', lendDate: '2025-07-04', expectReturn: '2025-07-07', actualReturn: '—', status: '借用中' },
  { id: 'R-20250620-09', item: 'PCB定位治具-A1 F-0001', borrower: '孙工', dept: 'SMT车间', lent: 4, returned: 4, purpose: '贴片生产', lendDate: '2025-06-20', expectReturn: '2025-06-27', actualReturn: '2025-06-26', status: '已归还' },
  { id: 'R-20250705-01', item: '气动螺丝刀 T-0007', borrower: '周工', dept: '装配车间', lent: 2, returned: 0, purpose: '总装线', lendDate: '2025-07-05', expectReturn: '2025-07-12', actualReturn: '—', status: '借用中' },
  { id: 'R-20250618-04', item: '万用表 T-0004', borrower: '吴工', dept: '质检部', lent: 1, returned: 1, purpose: '电气检测', lendDate: '2025-06-18', expectReturn: '2025-06-25', actualReturn: '2025-06-24', status: '已归还' },
  { id: 'R-20250615-08', item: '贴片对位夹具-B3 F-0002', borrower: '郑工', dept: 'SMT车间', lent: 10, returned: 0, purpose: '批量生产', lendDate: '2025-06-15', expectReturn: '2025-06-22', actualReturn: '—', status: '逾期' },
]

export interface FixtureItem {
  /** 后端数据库主键 */
  dbId: number
  id: string
  name: string
  category: string
  drawing: string
  spec: string
  inStock: number
  lent: number
  warn: number
  location: string
  note: string
  status: '在库' | '借出'
}

export const fixtures: FixtureItem[] = [
  { id: 'F-0001', dbId: 101, name: 'PCB定位治具-A1', category: '测试治具', drawing: 'DWG-2024-001', spec: '300x200x50mm', inStock: 18, lent: 4, warn: 5, location: 'A区-01架', note: '正常', status: '在库' },
  { id: 'F-0002', dbId: 102, name: '贴片对位夹具-B3', category: '贴片夹具', drawing: 'DWG-2024-012', spec: '250x180x45mm', inStock: 6, lent: 10, warn: 4, location: 'B区-02架', note: '正常', status: '借出' },
  { id: 'F-0003', dbId: 103, name: 'FPC载板治具-C2', category: '载板治具', drawing: 'DWG-2024-025', spec: '180x120x30mm', inStock: 2, lent: 6, warn: 5, location: 'C区-01架', note: '库存不足', status: '借出' },
  { id: 'F-0004', dbId: 104, name: '焊接托盘-D1', category: '焊接治具', drawing: 'DWG-2023-118', spec: '400x300x20mm', inStock: 24, lent: 0, warn: 5, location: 'D区-01架', note: '正常', status: '在库' },
  { id: 'F-0005', dbId: 105, name: '点胶定位治具-A5', category: '点胶治具', drawing: 'DWG-2024-040', spec: '200x150x40mm', inStock: 9, lent: 2, warn: 4, location: 'A区-02架', note: '正常', status: '在库' },
  { id: 'F-0006', dbId: 106, name: '测试压头-B7', category: '测试治具', drawing: 'DWG-2024-052', spec: 'Φ12x60mm', inStock: 0, lent: 12, warn: 6, location: 'B区-03架', note: '缺货', status: '借出' },
  { id: 'F-0007', dbId: 107, name: '装配定位销-C9', category: '装配治具', drawing: 'DWG-2023-090', spec: 'M6x40mm', inStock: 30, lent: 5, warn: 8, location: 'C区-02架', note: '正常', status: '在库' },
  { id: 'F-0008', dbId: 108, name: '老化测试架-D4', category: '老化治具', drawing: 'DWG-2024-061', spec: '500x400x200mm', inStock: 4, lent: 1, warn: 3, location: 'D区-02架', note: '正常', status: '在库' },
  { id: 'F-0009', dbId: 109, name: '摄像头对位治具-A8', category: '贴片夹具', drawing: 'DWG-2024-070', spec: '220x160x35mm', inStock: 7, lent: 3, warn: 4, location: 'A区-03架', note: '正常', status: '在库' },
  { id: 'F-0010', dbId: 110, name: '螺丝锁付治具-B2', category: '装配治具', drawing: 'DWG-2023-105', spec: '280x200x55mm', inStock: 3, lent: 8, warn: 5, location: 'B区-01架', note: '库存不足', status: '借出' },
  { id: 'F-0011', dbId: 111, name: 'PCB定位治具-A2', category: '测试治具', drawing: 'DWG-2024-002', spec: '300x200x50mm', inStock: 14, lent: 3, warn: 5, location: 'A区-04架', note: '正常', status: '在库' },
  { id: 'F-0012', dbId: 112, name: '贴片对位夹具-B4', category: '贴片夹具', drawing: 'DWG-2024-013', spec: '250x180x45mm', inStock: 6, lent: 9, warn: 4, location: 'B区-04架', note: '正常', status: '借出' },
  { id: 'F-0013', dbId: 113, name: 'FPC载板治具-C3', category: '载板治具', drawing: 'DWG-2024-026', spec: '180x120x30mm', inStock: 4, lent: 5, warn: 5, location: 'C区-03架', note: '库存不足', status: '借出' },
  { id: 'F-0014', dbId: 114, name: '焊接托盘-D2', category: '焊接治具', drawing: 'DWG-2023-119', spec: '400x300x20mm', inStock: 22, lent: 0, warn: 5, location: 'D区-03架', note: '正常', status: '在库' },
  { id: 'F-0015', dbId: 115, name: '点胶定位治具-A6', category: '点胶治具', drawing: 'DWG-2024-041', spec: '200x150x40mm', inStock: 8, lent: 3, warn: 4, location: 'A区-05架', note: '正常', status: '在库' },
  { id: 'F-0016', dbId: 116, name: '测试压头-B8', category: '测试治具', drawing: 'DWG-2024-053', spec: 'Φ12x60mm', inStock: 1, lent: 11, warn: 6, location: 'B区-05架', note: '缺货', status: '借出' },
  { id: 'F-0017', dbId: 117, name: '装配定位销-C10', category: '装配治具', drawing: 'DWG-2023-091', spec: 'M6x40mm', inStock: 28, lent: 4, warn: 8, location: 'C区-04架', note: '正常', status: '在库' },
  { id: 'F-0018', dbId: 118, name: '老化测试架-D5', category: '老化治具', drawing: 'DWG-2024-062', spec: '500x400x200mm', inStock: 5, lent: 0, warn: 3, location: 'D区-04架', note: '正常', status: '在库' },
  { id: 'F-0019', dbId: 119, name: '摄像头对位治具-A9', category: '贴片夹具', drawing: 'DWG-2024-071', spec: '220x160x35mm', inStock: 6, lent: 4, warn: 4, location: 'A区-06架', note: '正常', status: '在库' },
  { id: 'F-0020', dbId: 120, name: '螺丝锁付治具-B3', category: '装配治具', drawing: 'DWG-2023-106', spec: '280x200x55mm', inStock: 2, lent: 7, warn: 5, location: 'B区-06架', note: '库存不足', status: '借出' },
  { id: 'F-0021', dbId: 121, name: 'PCB定位治具-A3', category: '测试治具', drawing: 'DWG-2024-003', spec: '300x200x50mm', inStock: 16, lent: 2, warn: 5, location: 'A区-07架', note: '正常', status: '在库' },
  { id: 'F-0022', dbId: 122, name: '贴片对位夹具-B5', category: '贴片夹具', drawing: 'DWG-2024-014', spec: '250x180x45mm', inStock: 7, lent: 8, warn: 4, location: 'B区-07架', note: '正常', status: '借出' },
  { id: 'F-0023', dbId: 123, name: 'FPC载板治具-C4', category: '载板治具', drawing: 'DWG-2024-027', spec: '180x120x30mm', inStock: 3, lent: 6, warn: 5, location: 'C区-05架', note: '库存不足', status: '借出' },
  { id: 'F-0024', dbId: 124, name: '焊接托盘-D3', category: '焊接治具', drawing: 'DWG-2023-120', spec: '400x300x20mm', inStock: 19, lent: 1, warn: 5, location: 'D区-05架', note: '正常', status: '在库' },
  { id: 'F-0025', dbId: 125, name: '点胶定位治具-A7', category: '点胶治具', drawing: 'DWG-2024-042', spec: '200x150x40mm', inStock: 9, lent: 1, warn: 4, location: 'A区-08架', note: '正常', status: '在库' },
  { id: 'F-0026', dbId: 126, name: '测试压头-B9', category: '测试治具', drawing: 'DWG-2024-054', spec: 'Φ12x60mm', inStock: 0, lent: 12, warn: 6, location: 'B区-08架', note: '缺货', status: '借出' },
  { id: 'F-0027', dbId: 127, name: '装配定位销-C11', category: '装配治具', drawing: 'DWG-2023-092', spec: 'M6x40mm', inStock: 31, lent: 3, warn: 8, location: 'C区-06架', note: '正常', status: '在库' },
  { id: 'F-0028', dbId: 128, name: '老化测试架-D6', category: '老化治具', drawing: 'DWG-2024-063', spec: '500x400x200mm', inStock: 3, lent: 2, warn: 3, location: 'D区-06架', note: '正常', status: '在库' },
  { id: 'F-0029', dbId: 129, name: '摄像头对位治具-A10', category: '贴片夹具', drawing: 'DWG-2024-072', spec: '220x160x35mm', inStock: 5, lent: 5, warn: 4, location: 'A区-09架', note: '正常', status: '在库' },
  { id: 'F-0030', dbId: 130, name: '螺丝锁付治具-B4', category: '装配治具', drawing: 'DWG-2023-107', spec: '280x200x55mm', inStock: 4, lent: 6, warn: 5, location: 'B区-09架', note: '库存不足', status: '借出' },
  { id: 'F-0031', dbId: 131, name: 'PCB定位治具-A4', category: '测试治具', drawing: 'DWG-2024-004', spec: '300x200x50mm', inStock: 13, lent: 4, warn: 5, location: 'A区-10架', note: '正常', status: '在库' },
  { id: 'F-0032', dbId: 132, name: '贴片对位夹具-B6', category: '贴片夹具', drawing: 'DWG-2024-015', spec: '250x180x45mm', inStock: 8, lent: 7, warn: 4, location: 'B区-10架', note: '正常', status: '借出' },
  { id: 'F-0033', dbId: 133, name: 'FPC载板治具-C5', category: '载板治具', drawing: 'DWG-2024-028', spec: '180x120x30mm', inStock: 5, lent: 4, warn: 5, location: 'C区-07架', note: '库存不足', status: '借出' },
  { id: 'F-0034', dbId: 134, name: '焊接托盘-D4', category: '焊接治具', drawing: 'DWG-2023-121', spec: '400x300x20mm', inStock: 21, lent: 0, warn: 5, location: 'D区-07架', note: '正常', status: '在库' },
  { id: 'F-0035', dbId: 135, name: '点胶定位治具-A8', category: '点胶治具', drawing: 'DWG-2024-043', spec: '200x150x40mm', inStock: 7, lent: 2, warn: 4, location: 'A区-11架', note: '正常', status: '在库' },
  { id: 'F-0036', dbId: 136, name: '测试压头-B10', category: '测试治具', drawing: 'DWG-2024-055', spec: 'Φ12x60mm', inStock: 2, lent: 9, warn: 6, location: 'B区-11架', note: '缺货', status: '借出' },
  { id: 'F-0037', dbId: 137, name: '装配定位销-C12', category: '装配治具', drawing: 'DWG-2023-093', spec: 'M6x40mm', inStock: 27, lent: 5, warn: 8, location: 'C区-08架', note: '正常', status: '在库' },
  { id: 'F-0038', dbId: 138, name: '老化测试架-D7', category: '老化治具', drawing: 'DWG-2024-064', spec: '500x400x200mm', inStock: 6, lent: 0, warn: 3, location: 'D区-08架', note: '正常', status: '在库' },
  { id: 'F-0039', dbId: 139, name: '摄像头对位治具-A11', category: '贴片夹具', drawing: 'DWG-2024-073', spec: '220x160x35mm', inStock: 4, lent: 6, warn: 4, location: 'A区-12架', note: '正常', status: '借出' },
  { id: 'F-0040', dbId: 140, name: '螺丝锁付治具-B5', category: '装配治具', drawing: 'DWG-2023-108', spec: '280x200x55mm', inStock: 3, lent: 8, warn: 5, location: 'B区-12架', note: '库存不足', status: '借出' },
]

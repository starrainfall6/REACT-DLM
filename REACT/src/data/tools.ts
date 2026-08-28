/** 各列表页共享的 mock 数据。真实项目中应来自 API，这里仅还原旧 HTML 中的示例数据。 */

export interface ToolItem {
  /** 后端数据库主键 */
  dbId: number
  id: string
  name: string
  maker: string
  model: string
  spec: string
  inStock: number
  lent: number
  warn: number
  location: string
  note: string
  status: '在库' | '借出'
}

export const tools: ToolItem[] = [
  { id: 'T-0001', dbId: 1, name: '数显扭力扳手', maker: '博世(BOSCH)', model: 'WT-30N', spec: '10-30N.m', inStock: 12, lent: 3, warn: 5, location: 'A区-01架', note: '-', status: '在库' },
  { id: 'T-0002', dbId: 2, name: '电动起子', maker: '牧田(MAKITA)', model: 'DF452DWE', spec: '4.8V', inStock: 8, lent: 6, warn: 3, location: 'B区-03架', note: '-', status: '借出' },
  { id: 'T-0003', dbId: 3, name: '游标卡尺', maker: '三丰(MITUTOYO)', model: 'CD-15DCX', spec: '0-150mm', inStock: 2, lent: 1, warn: 5, location: 'A区-02架', note: '-', status: '在库' },
  { id: 'T-0004', dbId: 4, name: '万用表', maker: '福禄克(FLUKE)', model: 'F117C', spec: '600V CAT III', inStock: 15, lent: 2, warn: 5, location: 'C区-01架', note: '-', status: '在库' },
  { id: 'T-0005', dbId: 5, name: '电烙铁', maker: '白光(HAKKO)', model: 'FX-951', spec: '70W', inStock: 5, lent: 4, warn: 3, location: 'B区-01架', note: '-', status: '借出' },
  { id: 'T-0006', dbId: 6, name: '内六角扳手套装', maker: '威汉(WERA)', model: '05077934001', spec: '1.5-10mm', inStock: 1, lent: 3, warn: 4, location: 'A区-03架', note: '-', status: '借出' },
  { id: 'T-0007', dbId: 7, name: '气动螺丝刀', maker: '利米托克(LEMTOM)', model: 'LB-2130', spec: '1/4"', inStock: 20, lent: 0, warn: 5, location: 'D区-02架', note: '-', status: '在库' },
  { id: 'T-0008', dbId: 8, name: '示波器', maker: '泰克(TEKTRONIX)', model: 'TBS1052B', spec: '50MHz 2CH', inStock: 3, lent: 1, warn: 2, location: 'C区-02架', note: '-', status: '在库' },
  { id: 'T-0009', dbId: 9, name: '热风枪', maker: '快克(HAKKO)', model: 'FR-810B', spec: '500W', inStock: 4, lent: 2, warn: 3, location: 'B区-04架', note: '-', status: '在库' },
  { id: 'T-0010', dbId: 10, name: '扭力螺丝刀', maker: '史丹利(STANLEY)', model: 'SSD-201', spec: '0.4-2N.m', inStock: 9, lent: 1, warn: 4, location: 'A区-01架', note: '-', status: '在库' },
  { id: 'T-0011', dbId: 11, name: '激光测距仪', maker: '徕卡(LEICA)', model: 'D2', spec: '0-100m', inStock: 6, lent: 0, warn: 3, location: 'C区-03架', note: '校准中', status: '在库' },
  { id: 'T-0012', dbId: 12, name: '棘轮扳手', maker: ' GearWrench', model: '81206', spec: '8-19mm', inStock: 0, lent: 7, warn: 4, location: 'A区-04架', note: '缺货', status: '借出' },
  { id: 'T-0013', dbId: 13, name: '电工钳', maker: '凯尼派克(KNIPEX)', model: '03 02 180', spec: '180mm', inStock: 14, lent: 1, warn: 5, location: 'D区-01架', note: '-', status: '在库' },
  { id: 'T-0014', dbId: 14, name: '角磨机', maker: '博世(BOSCH)', model: 'GWS 800', spec: '800W', inStock: 2, lent: 5, warn: 4, location: 'B区-02架', note: '-', status: '借出' },
  { id: 'T-0015', dbId: 15, name: '台式钻床', maker: '得伟(DEWALT)', model: 'DWE1090', spec: '13mm', inStock: 3, lent: 0, warn: 2, location: 'C区-04架', note: '-', status: '在库' },
  { id: 'T-0016', dbId: 16, name: '数显高度规', maker: '三丰(MITUTOYO)', model: 'CD-30AX', spec: '0-300mm', inStock: 7, lent: 2, warn: 3, location: 'C区-05架', note: '-', status: '在库' },
  { id: 'T-0017', dbId: 17, name: '百分表', maker: '三丰(MITUTOYO)', model: '2046S', spec: '0-10mm', inStock: 11, lent: 1, warn: 4, location: 'A区-05架', note: '-', status: '在库' },
  { id: 'T-0018', dbId: 18, name: '塞尺', maker: '史丹利(STANLEY)', model: 'STH-21', spec: '0.02-1mm', inStock: 1, lent: 4, warn: 3, location: 'A区-06架', note: '-', status: '借出' },
  { id: 'T-0019', dbId: 19, name: '水平尺', maker: '博世(BOSCH)', model: 'GLL60', spec: '600mm', inStock: 5, lent: 3, warn: 3, location: 'B区-05架', note: '-', status: '借出' },
  { id: 'T-0020', dbId: 20, name: '卷尺', maker: '田岛(TAJIMA)', model: 'TN-55', spec: '5m', inStock: 20, lent: 0, warn: 5, location: 'D区-03架', note: '-', status: '在库' },
  { id: 'T-0021', dbId: 21, name: '尖嘴钳', maker: '凯尼派克(KNIPEX)', model: '26 160', spec: '160mm', inStock: 9, lent: 2, warn: 4, location: 'D区-04架', note: '-', status: '在库' },
  { id: 'T-0022', dbId: 22, name: '斜口钳', maker: '凯尼派克(KNIPEX)', model: '70 125', spec: '125mm', inStock: 0, lent: 8, warn: 4, location: 'D区-05架', note: '缺货', status: '借出' },
  { id: 'T-0023', dbId: 23, name: '剥线钳', maker: '威汉(WERA)', model: '206', spec: '200mm', inStock: 6, lent: 1, warn: 3, location: 'A区-06架', note: '-', status: '在库' },
  { id: 'T-0024', dbId: 24, name: '压线钳', maker: '泛达(FANDY)', model: 'FT-11', spec: '6-6mm²', inStock: 3, lent: 5, warn: 3, location: 'B区-06架', note: '库存不足', status: '借出' },
  { id: 'T-0025', dbId: 25, name: '手电钻', maker: '牧田(MAKITA)', model: 'HP2050', spec: '650W', inStock: 4, lent: 2, warn: 2, location: 'C区-05架', note: '-', status: '在库' },
  { id: 'T-0026', dbId: 26, name: '冲击钻', maker: '博世(BOSCH)', model: 'GBH2-26', spec: '800W', inStock: 2, lent: 6, warn: 3, location: 'B区-07架', note: '库存不足', status: '借出' },
  { id: 'T-0027', dbId: 27, name: '曲线锯', maker: '牧田(MAKITA)', model: 'DJV180', spec: '450W', inStock: 8, lent: 1, warn: 3, location: 'C区-06架', note: '-', status: '在库' },
  { id: 'T-0028', dbId: 28, name: '砂光机', maker: '博世(BOSCH)', model: 'GSS230', spec: '230W', inStock: 1, lent: 3, warn: 2, location: 'B区-08架', note: '库存不足', status: '借出' },
  { id: 'T-0029', dbId: 29, name: '热熔胶枪', maker: '得力(DELI)', model: 'DL-60', spec: '60W', inStock: 12, lent: 0, warn: 4, location: 'E区-A01', note: '-', status: '在库' },
  { id: 'T-0030', dbId: 30, name: '真空吸笔', maker: '史丹利(STANLEY)', model: 'SB-01', spec: '-', inStock: 7, lent: 2, warn: 3, location: 'A区-07架', note: '-', status: '在库' },
  { id: 'T-0031', dbId: 31, name: '放大镜台灯', maker: '明可达(MK)', model: 'MK-88', spec: '5X', inStock: 5, lent: 1, warn: 3, location: 'C区-07架', note: '-', status: '在库' },
  { id: 'T-0032', dbId: 32, name: '防静电手环', maker: '3M', model: '710', spec: '可调节', inStock: 30, lent: 5, warn: 8, location: 'D区-06架', note: '-', status: '在库' },
  { id: 'T-0033', dbId: 33, name: '离子风机', maker: '基恩士(KEYENCE)', model: 'SJ-E', spec: '220V', inStock: 2, lent: 0, warn: 2, location: 'C区-08架', note: '-', status: '在库' },
  { id: 'T-0034', dbId: 34, name: '元件盒', maker: '国产', model: 'HC-20', spec: '20格', inStock: 18, lent: 0, warn: 5, location: 'E区-A02', note: '-', status: '在库' },
  { id: 'T-0035', dbId: 35, name: '标签机', maker: '兄弟(BROTHER)', model: 'PT-18', spec: '12mm', inStock: 3, lent: 2, warn: 2, location: 'B区-09架', note: '-', status: '在库' },
  { id: 'T-0036', dbId: 36, name: '稳压电源', maker: '固纬(GWINSTEK)', model: 'GPS-3030', spec: '30V/3A', inStock: 4, lent: 1, warn: 2, location: 'C区-09架', note: '-', status: '在库' },
  { id: 'T-0037', dbId: 37, name: '直流电子负载', maker: '艾德克斯(ITECH)', model: 'IT8511', spec: '150W', inStock: 1, lent: 3, warn: 2, location: 'C区-10架', note: '库存不足', status: '借出' },
  { id: 'T-0038', dbId: 38, name: '信号发生器', maker: '普源(RIGOL)', model: 'DG1022', spec: '20MHz', inStock: 2, lent: 0, warn: 2, location: 'C区-11架', note: '-', status: '在库' },
  { id: 'T-0039', dbId: 39, name: 'LCR数字电桥', maker: '同惠(TONGHUI)', model: 'TH2821', spec: '100kHz', inStock: 3, lent: 1, warn: 2, location: 'C区-12架', note: '-', status: '在库' },
  { id: 'T-0040', dbId: 40, name: '绝缘电阻测试仪', maker: '福禄克(FLUKE)', model: '1507', spec: '1000V', inStock: 0, lent: 4, warn: 2, location: 'C区-13架', note: '缺货', status: '借出' },
  { id: 'T-0041', dbId: 41, name: '接地电阻测试仪', maker: '胜利(VICTOR)', model: 'VC4105', spec: '-', inStock: 6, lent: 1, warn: 3, location: 'C区-14架', note: '-', status: '在库' },
  { id: 'T-0042', dbId: 42, name: '温湿度记录仪', maker: '德图(TESTO)', model: 'TP-01', spec: '-20~60℃', inStock: 9, lent: 0, warn: 3, location: 'D区-07架', note: '-', status: '在库' },
  { id: 'T-0043', dbId: 43, name: '照度计', maker: '希玛(SMART)', model: 'AR823', spec: '0-200klux', inStock: 4, lent: 2, warn: 2, location: 'D区-08架', note: '-', status: '在库' },
  { id: 'T-0044', dbId: 44, name: '推拉力计', maker: '艾德克斯(ITECH)', model: 'HF-50', spec: '50kg', inStock: 1, lent: 2, warn: 2, location: 'D区-09架', note: '库存不足', status: '借出' },
  { id: 'T-0045', dbId: 45, name: '数显扭力计', maker: '艾德克斯(ITECH)', model: 'HP-10', spec: '10N.m', inStock: 3, lent: 1, warn: 2, location: 'A区-08架', note: '-', status: '在库' },
]

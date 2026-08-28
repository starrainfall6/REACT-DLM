export interface SupplyItem {
  /** 后端数据库主键 */
  dbId: number
  id: string
  name: string
  category: string
  maker: string
  model: string
  drawing: string
  stock: number
  warn: number
  location: string
  note: string
  status: '充足' | '紧张' | '缺货'
}

export const supplies: SupplyItem[] = [
  { id: 'S-0001', dbId: 1001, name: 'M3内六角螺丝', category: '紧固件', maker: '晋亿', model: 'DIN912', drawing: '—', stock: 5200, warn: 1000, location: 'E区-A01', note: '正常', status: '充足' },
  { id: 'S-0002', dbId: 1002, name: '0805贴片电阻', category: '电子料', maker: '国巨', model: 'RC0805', drawing: '—', stock: 86000, warn: 20000, location: 'E区-B12', note: '正常', status: '充足' },
  { id: 'S-0003', dbId: 1003, name: '导热硅脂', category: '辅料', maker: '信越', model: 'X-23', drawing: '—', stock: 80, warn: 120, location: 'E区-C03', note: '补货中', status: '紧张' },
  { id: 'S-0004', dbId: 1004, name: 'USB-C连接器', category: '连接器', maker: '立讯', model: 'LC-24P', drawing: 'DG-15', stock: 0, warn: 500, location: 'E区-D07', note: '缺货', status: '缺货' },
  { id: 'S-0005', dbId: 1005, name: '锂电池18650', category: '电源', maker: '松下', model: 'NCR18650B', drawing: '—', stock: 340, warn: 200, location: 'E区-A09', note: '正常', status: '充足' },
  { id: 'S-0006', dbId: 1006, name: '高温胶带', category: '辅料', maker: '3M', model: '5413', drawing: '—', stock: 60, warn: 80, location: 'E区-C08', note: '补货中', status: '紧张' },
  { id: 'S-0007', dbId: 1007, name: '排针2.54mm', category: '连接器', maker: '得润', model: '2x10P', drawing: 'DG-22', stock: 4500, warn: 1000, location: 'E区-D12', note: '正常', status: '充足' },
  { id: 'S-0008', dbId: 1008, name: 'IC STM32F103', category: '电子料', maker: 'ST', model: 'LQFP48', drawing: '—', stock: 0, warn: 300, location: 'E区-B21', note: '缺货', status: '缺货' },
  { id: 'S-0009', dbId: 1009, name: '硅胶按键', category: '结构件', maker: '禾昌', model: 'HK-12', drawing: 'DG-31', stock: 1200, warn: 500, location: 'E区-A15', note: '正常', status: '充足' },
  { id: 'S-0010', dbId: 1010, name: '线束扎带', category: '辅料', maker: '长园', model: '4x200', drawing: '—', stock: 95, warn: 150, location: 'E区-C15', note: '补货中', status: '紧张' },
  { id: 'S-0011', dbId: 1011, name: 'M4内六角螺丝', category: '紧固件', maker: '晋亿', model: 'DIN912', drawing: '—', stock: 4300, warn: 1000, location: 'E区-A02', note: '正常', status: '充足' },
  { id: 'S-0012', dbId: 1012, name: 'M5内六角螺丝', category: '紧固件', maker: '晋亿', model: 'DIN912', drawing: '—', stock: 3800, warn: 1000, location: 'E区-A03', note: '正常', status: '充足' },
  { id: 'S-0013', dbId: 1013, name: '1206贴片电容', category: '电子料', maker: '村田', model: 'GRM32', drawing: '—', stock: 52000, warn: 20000, location: 'E区-B13', note: '正常', status: '充足' },
  { id: 'S-0014', dbId: 1014, name: '0603贴片电阻', category: '电子料', maker: '国巨', model: 'RC0603', drawing: '—', stock: 61000, warn: 20000, location: 'E区-B14', note: '正常', status: '充足' },
  { id: 'S-0015', dbId: 1015, name: '贴片电感', category: '电子料', maker: '顺络', model: 'SWPA', drawing: '—', stock: 9000, warn: 3000, location: 'E区-B15', note: '正常', status: '充足' },
  { id: 'S-0016', dbId: 1016, name: '晶振32.768k', category: '电子料', maker: '爱普生', model: 'FC-135', drawing: 'DG-40', stock: 1500, warn: 800, location: 'E区-B16', note: '正常', status: '充足' },
  { id: 'S-0017', dbId: 1017, name: '排母2.54mm', category: '连接器', maker: '得润', model: '1x8P', drawing: 'DG-23', stock: 3200, warn: 1000, location: 'E区-D13', note: '正常', status: '充足' },
  { id: 'S-0018', dbId: 1018, name: 'HDMI连接器', category: '连接器', maker: '立讯', model: 'TYPE-A', drawing: 'DG-24', stock: 2600, warn: 1000, location: 'E区-D14', note: '正常', status: '充足' },
  { id: 'S-0019', dbId: 1019, name: '排线1.25mm', category: '连接器', maker: '得润', model: '10P', drawing: 'DG-25', stock: 1800, warn: 800, location: 'E区-D15', note: '正常', status: '充足' },
  { id: 'S-0020', dbId: 1020, name: '纽扣电池CR2032', category: '电源', maker: '松下', model: 'CR2032', drawing: '—', stock: 620, warn: 300, location: 'E区-A16', note: '正常', status: '充足' },
  { id: 'S-0021', dbId: 1021, name: '聚合物电池', category: '电源', maker: '比亚迪', model: '503562', drawing: '—', stock: 240, warn: 200, location: 'E区-A17', note: '正常', status: '充足' },
  { id: 'S-0022', dbId: 1022, name: '电源适配器12V', category: '电源', maker: '明纬', model: 'MW12V', drawing: 'DG-41', stock: 90, warn: 120, location: 'E区-A18', note: '补货中', status: '紧张' },
  { id: 'S-0023', dbId: 1023, name: '导热垫片', category: '辅料', maker: '莱尔德', model: 'TGPS', drawing: '—', stock: 70, warn: 100, location: 'E区-C04', note: '补货中', status: '紧张' },
  { id: 'S-0024', dbId: 1024, name: '三防漆', category: '辅料', maker: '汉思', model: 'HS-100', drawing: '—', stock: 45, warn: 60, location: 'E区-C05', note: '补货中', status: '紧张' },
  { id: 'S-0025', dbId: 1025, name: '焊锡丝0.8mm', category: '辅料', maker: '千住', model: 'M705', drawing: '—', stock: 110, warn: 150, location: 'E区-C06', note: '补货中', status: '紧张' },
  { id: 'S-0026', dbId: 1026, name: '助焊剂', category: '辅料', maker: '阿尔法', model: 'AF-30', drawing: '—', stock: 30, warn: 50, location: 'E区-C07', note: '补货中', status: '紧张' },
  { id: 'S-0027', dbId: 1027, name: '尼龙柱', category: '结构件', maker: '国产', model: 'M3x10', drawing: 'DG-32', stock: 2000, warn: 1000, location: 'E区-A19', note: '正常', status: '充足' },
  { id: 'S-0028', dbId: 1028, name: '橡胶脚垫', category: '结构件', maker: '国产', model: 'Φ10', drawing: 'DG-33', stock: 1500, warn: 800, location: 'E区-A20', note: '正常', status: '充足' },
  { id: 'S-0029', dbId: 1029, name: '铝外壳', category: '结构件', maker: '国产', model: '80x50', drawing: 'DG-34', stock: 380, warn: 200, location: 'E区-A21', note: '正常', status: '充足' },
  { id: 'S-0030', dbId: 1030, name: '散热片', category: '结构件', maker: '国产', model: '40x40', drawing: 'DG-35', stock: 520, warn: 300, location: 'E区-A22', note: '正常', status: '充足' },
  { id: 'S-0031', dbId: 1031, name: 'M2.5螺丝', category: '紧固件', maker: '晋亿', model: 'DIN84', drawing: '—', stock: 2600, warn: 1000, location: 'E区-A23', note: '正常', status: '充足' },
  { id: 'S-0032', dbId: 1032, name: '弹簧垫圈', category: '紧固件', maker: '晋亿', model: 'M4', drawing: '—', stock: 3400, warn: 1000, location: 'E区-A24', note: '正常', status: '充足' },
  { id: 'S-0033', dbId: 1033, name: '钽电容', category: '电子料', maker: 'AVX', model: 'TAJB', drawing: '—', stock: 0, warn: 300, location: 'E区-B22', note: '缺货', status: '缺货' },
  { id: 'S-0034', dbId: 1034, name: 'LED指示灯', category: '电子料', maker: '亿光', model: '5mm红', drawing: '—', stock: 1200, warn: 500, location: 'E区-B23', note: '正常', status: '充足' },
  { id: 'S-0035', dbId: 1035, name: '轻触开关', category: '电子料', maker: '阿尔卑斯', model: 'SKRH', drawing: 'DG-42', stock: 0, warn: 400, location: 'E区-B24', note: '缺货', status: '缺货' },
  { id: 'S-0036', dbId: 1036, name: 'USB-A连接器', category: '连接器', maker: '立讯', model: 'TYPE-B', drawing: 'DG-26', stock: 2100, warn: 1000, location: 'E区-D16', note: '正常', status: '充足' },
  { id: 'S-0037', dbId: 1037, name: '排线2.0mm', category: '连接器', maker: '得润', model: '6P', drawing: 'DG-27', stock: 1300, warn: 600, location: 'E区-D17', note: '正常', status: '充足' },
  { id: 'S-0038', dbId: 1038, name: '锂电池充电器', category: '电源', maker: '小米', model: '2A', drawing: '—', stock: 75, warn: 100, location: 'E区-A25', note: '补货中', status: '紧张' },
  { id: 'S-0039', dbId: 1039, name: '绝缘胶带', category: '辅料', maker: '3M', model: '1300', drawing: '—', stock: 60, warn: 80, location: 'E区-C08', note: '补货中', status: '紧张' },
  { id: 'S-0040', dbId: 1040, name: '扎带固定座', category: '结构件', maker: '长园', model: '10mm', drawing: 'DG-36', stock: 900, warn: 500, location: 'E区-A26', note: '正常', status: '充足' },
]

/**
 * 李军暖通南昌项目材料库
 *
 * 供应链：
 * - 地暖管：曼瑞德 MENRED De20 PE-RT
 * - 辅材：保利
 * - 分集水器：巴姆比
 * - 锅炉：德国茵格斯达 INGOSTAR 全预混冷凝炉
 *
 * 报价模式：地暖末端约80元/㎡含辅材
 * 自有施工团队，不外包分包
 */

export interface MaterialItem {
  /** SKU/型号 */
  sku: string;
  /** 名称 */
  name: string;
  /** 规格描述 */
  spec: string;
  /** 单位 */
  unit: 'm' | 'm2' | 'piece' | 'set' | 'roll' | 'bag';
  /** 单价（元） */
  unitPrice: number;
  /** 品牌 */
  brand: string;
  /** 用量规则说明 */
  usageRule: string;
}

/** 地暖管材 */
export const PIPES: MaterialItem[] = [
  {
    sku: 'MENRED-PERT-20',
    name: '曼瑞德 PE-RT 地暖管',
    spec: 'De20×2.0 mm',
    unit: 'm',
    unitPrice: 12,
    brand: 'MENRED 曼瑞德',
    usageRule: '按设计管路总长计算，加5%损耗；单路≤90m',
  },
];

/** 保温辅材（保利） */
export const INSULATION: MaterialItem[] = [
  {
    sku: 'POLY-FOIL-2',
    name: '保利 反射膜（铝箔）',
    spec: '2mm 厚，1m 宽',
    unit: 'm2',
    unitPrice: 8,
    brand: '保利',
    usageRule: '按采暖面积计算，满铺',
  },
  {
    sku: 'POLY-BOARD-20',
    name: '保利 XPS 挤塑保温板',
    spec: '20mm 厚，≥300kPa',
    unit: 'm2',
    unitPrice: 28,
    brand: '保利',
    usageRule: '南昌新建房中间层20mm；老房/顶层/底层建议30mm',
  },
  {
    sku: 'POLY-EDGE-STRIP',
    name: '保利 边界保温条',
    spec: '8mm×150mm，自粘',
    unit: 'm',
    unitPrice: 3,
    brand: '保利',
    usageRule: '按房间周长计算，所有与墙交接处满贴',
  },
  {
    sku: 'POLY-CLIP',
    name: '保利 卡丁/管卡',
    spec: 'De20 专用',
    unit: 'bag',
    unitPrice: 25,
    brand: '保利',
    usageRule: '每㎡约20个，每袋500个',
  },
];

/** 分集水器（巴姆比） */
export const MANIFOLDS: MaterialItem[] = [
  {
    sku: 'BAMBI-MANIFOLD-2',
    name: '巴姆比 分集水器（2路）',
    spec: '黄铜镀镍，含流量计',
    unit: 'set',
    unitPrice: 380,
    brand: '巴姆比',
    usageRule: '每路带独立流量计和温控阀',
  },
  {
    sku: 'BAMBI-MANIFOLD-3',
    name: '巴姆比 分集水器（3路）',
    spec: '黄铜镀镍，含流量计',
    unit: 'set',
    unitPrice: 480,
    brand: '巴姆比',
    usageRule: '',
  },
  {
    sku: 'BAMBI-MANIFOLD-4',
    name: '巴姆比 分集水器（4路）',
    spec: '黄铜镀镍，含流量计',
    unit: 'set',
    unitPrice: 580,
    brand: '巴姆比',
    usageRule: '',
  },
  {
    sku: 'BAMBI-MANIFOLD-5',
    name: '巴姆比 分集水器（5路）',
    spec: '黄铜镀镍，含流量计',
    unit: 'set',
    unitPrice: 680,
    brand: '巴姆比',
    usageRule: '',
  },
  {
    sku: 'BAMBI-MANIFOLD-6',
    name: '巴姆比 分集水器（6路）',
    spec: '黄铜镀镍，含流量计',
    unit: 'set',
    unitPrice: 780,
    brand: '巴姆比',
    usageRule: '≤8路，超过需双台',
  },
  {
    sku: 'BAMBI-MANIFOLD-7',
    name: '巴姆比 分集水器（7路）',
    spec: '黄铜镀镍，含流量计',
    unit: 'set',
    unitPrice: 880,
    brand: '巴姆比',
    usageRule: '',
  },
  {
    sku: 'BAMBI-MANIFOLD-8',
    name: '巴姆比 分集水器（8路）',
    spec: '黄铜镀镍，含流量计',
    unit: 'set',
    unitPrice: 980,
    brand: '巴姆比',
    usageRule: '单台上限',
  },
];

/** 锅炉（茵格斯达冷凝炉） */
export const BOILERS: MaterialItem[] = [
  {
    sku: 'INGOSTAR-LL1GBQ24-D2',
    name: '茵格斯达 全预混冷凝壁挂炉',
    spec: 'LL1GBQ24-D2，24kW，效率106-109%',
    unit: 'piece',
    unitPrice: 11850,
    brand: 'INGOSTAR 德国茵格斯达',
    usageRule: '按采暖面积选型：120㎡以内24kW；120-180㎡需28kW',
  },
];

/** 辅助材料 */
export const ACCESSORIES: MaterialItem[] = [
  {
    sku: 'MIXING-VALVE',
    name: '混水耦合罐组件',
    spec: '一二次水力分离，含循环泵',
    unit: 'set',
    unitPrice: 1800,
    brand: '威科/威乐',
    usageRule: '系统阻力大、管路超100m或二次侧设备多时必装',
  },
  {
    sku: 'THERMOSTAT-SM',
    name: '森威尔 有线温控器',
    spec: '周编程，室温控制',
    unit: 'piece',
    unitPrice: 180,
    brand: '森威尔',
    usageRule: '每主要房间一个，符合JGJ142分户温控要求',
  },
  {
    sku: 'EXPANSION-VESSEL',
    name: '东贝 膨胀水箱',
    spec: '按系统水容量选配',
    unit: 'piece',
    unitPrice: 350,
    brand: '东贝',
    usageRule: '锅炉内置不足时外置补充',
  },
];

/** 根据采暖面积推荐保温板厚度 */
export function recommendedInsulationThickness(
  floorType: 'middle' | 'top' | 'bottom' | 'old',
): number {
  switch (floorType) {
    case 'old': return 30;      // 老房无保温加厚
    case 'top': return 30;       // 顶层屋面损失大
    case 'bottom': return 30;    // 底层地面损失
    case 'middle':
    default: return 20;          // 新建中间层标准
  }
}

/** 根据环路数选分集水器型号 */
export function selectManifold(loops: number): MaterialItem | null {
  if (loops <= 0 || loops > 8) return null;
  return MANIFOLDS.find((m) => m.sku.endsWith(`-${loops}`)) ?? null;
}

/** 根据采暖面积推荐锅炉功率 */
export function selectBoiler(areaM2: number): MaterialItem {
  // 南昌100W/㎡，120㎡≈12kW，加生活热水峰值24kW足够
  // 120㎡以上需28kW
  return BOILERS[0]; // 原型阶段统一24kW，后续加28kW型号
}

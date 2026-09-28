/**
 * 南昌地区采暖热负荷计算模块
 *
 * 设计依据：
 * - JGJ 142-2012 《辐射供暖供冷技术规程》
 * - GB 55015-2021 《建筑节能与可再生能源利用通用规范》夏热冬冷地区
 * - GB 50736-2012 《民用建筑供暖通风与空气调节设计规范》
 *
 * 南昌设计参数：
 * - 室外采暖计算温度：-1.3℃
 * - 室内设计温度：20℃（卧室）/ 22℃（客厅）
 * - 计算温差：21.3℃
 */

export type Orientation = 'north' | 'south' | 'east' | 'west';
export type FloorType = 'middle' | 'top' | 'bottom' | 'old';

export interface HeatLoadInput {
  /** 房间面积 ㎡ */
  areaM2: number;
  /** 主要朝向（取最差一面墙） */
  orientation: Orientation;
  /** 楼层类型 */
  floorType: FloorType;
  /** 窗墙比 0-1，默认 0.3 */
  windowWallRatio?: number;
}

export interface HeatLoadResult {
  /** 总热负荷 W */
  totalW: number;
  /** 单位面积热负荷 W/㎡ */
  perSqm: number;
  /** 围护结构基本耗热 W */
  envelopeW: number;
  /** 冷风渗透附加 W */
  infiltrationW: number;
  /** 朝向修正 W */
  orientationAdjustW: number;
  /** 楼层修正 W */
  floorAdjustW: number;
}

/**
 * 南昌新建住宅单位面积采暖热负荷基准 W/㎡
 * （中间层、南向、窗墙比0.3、GB 55015围护结构达标）
 */
const BASE_LOAD_PER_SQM = 100;

/** 朝向修正系数（基于基础指标的增量 W/㎡） */
const ORIENTATION_ADJUST: Record<Orientation, number> = {
  north: 20,   // 北向无太阳辐射，冬季主导风向
  east: 5,     // 上午有日照，下午冷
  west: 8,     // 西晒夏季热，冬季影响小
  south: -5,   // 南向有太阳辐射，可减
};

/** 楼层修正系数（基于基础指标的增量 W/㎡） */
const FLOOR_ADJUST: Record<FloorType, number> = {
  middle: 0,    // 中间层，上下有相邻采暖房间
  top: 15,      // 顶层，屋面传热损失
  bottom: 10,   // 底层，地面/不采暖地下室传热
  old: 25,      // 老房无外保温，外墙K值不达标
};

/** 窗墙比修正（相对0.3基准的增量 W/㎡） */
function windowAdjust(wwr: number): number {
  // 每增加0.1窗墙比，单位负荷增加约8 W/㎡（外窗K值~3.0 vs 外墙K值~0.8）
  return (wwr - 0.3) * 80;
}

/**
 * 南昌住宅热负荷快速估算
 *
 * 用法：
 *   const load = estimateHeatLoad({ areaM2: 18, orientation: 'north', floorType: 'middle' });
 *   // load.totalW ≈ 2160W（100+20=120 W/㎡ × 18㎡）
 */
export function estimateHeatLoad(input: HeatLoadInput): HeatLoadResult {
  const wwr = input.windowWallRatio ?? 0.3;
  const base = BASE_LOAD_PER_SQM;
  const orientAdj = ORIENTATION_ADJUST[input.orientation];
  const floorAdj = FLOOR_ADJUST[input.floorType];
  const winAdj = windowAdjust(wwr);

  const perSqm = Math.max(60, base + orientAdj + floorAdj + winAdj);
  const total = perSqm * input.areaM2;

  // 拆分各项用于展示
  const envelopeW = (base + winAdj) * input.areaM2;
  const orientationAdjustW = orientAdj * input.areaM2;
  const floorAdjustW = floorAdj * input.areaM2;
  // 冷风渗透按围护结构的15%估算（换气次数0.5次/h）
  const infiltrationW = envelopeW * 0.15;

  return {
    totalW: Math.round(total),
    perSqm: Math.round(perSqm),
    envelopeW: Math.round(envelopeW),
    infiltrationW: Math.round(infiltrationW),
    orientationAdjustW: Math.round(orientationAdjustW),
    floorAdjustW: Math.round(floorAdjustW),
  };
}

/**
 * 详细版：按围护结构逐项计算 Q = K·F·ΔT
 * 用于需要精确计算的项目（老房、非标准建筑）
 */
export interface EnvelopeElement {
  type: 'wall' | 'window' | 'door' | 'roof' | 'floor';
  /** 面积 ㎡ */
  areaM2: number;
  /** 传热系数 W/(㎡·K) */
  uValue: number;
}

export const NANCHANG_T_OUTSIDE = -1.3;
export const NANCHANG_T_INSIDE = 20;
export const NANCHANG_DELTA_T = NANCHANG_T_INSIDE - NANCHANG_T_OUTSIDE; // 21.3

/**
 * 按 GB 55015 夏热冬冷地区围护结构限值
 */
export const U_VALUE_LIMITS = {
  roof: 0.40,      // W/(㎡·K)
  wall: 0.80,      // W/(㎡·K)
  window: 3.2,     // 外窗K限值（窗墙比≤0.4时）
  floor: 0.50,
} as const;

export function detailedHeatLoad(elements: EnvelopeElement[]): {
  envelopeW: number;
  infiltrationW: number;
  totalW: number;
} {
  let envelopeW = 0;
  for (const el of elements) {
    envelopeW += el.uValue * el.areaM2 * NANCHANG_DELTA_T;
  }
  // 冷风渗透：按换气次数 0.5 次/h，层高3m
  // Q = 0.5 × V × 1.2 × 1.005 × ΔT / 3.6
  // 简化：取围护结构的 15%
  const infiltrationW = envelopeW * 0.15;
  return {
    envelopeW: Math.round(envelopeW),
    infiltrationW: Math.round(infiltrationW),
    totalW: Math.round(envelopeW + infiltrationW),
  };
}

/**
 * 根据总热负荷计算所需管路流量
 * Q = c·ρ·ΔT·V  =>  V(L/min) = Q(W) / (4186 × ΔT/60)
 * ΔT=8℃ 时：V = Q / 558
 */
export function requiredFlowLpm(totalW: number, deltaTC: number = 8): number {
  return totalW / (4186 * deltaTC / 60);
}

/**
 * 校验单路负荷是否在分集水器每路容量内
 * 巴姆比分集水器每路推荐 ≤ 1.5kW
 */
export function loopCountNeeded(totalW: number, maxPerLoopW = 1500): number {
  return Math.max(1, Math.ceil(totalW / maxPerLoopW));
}

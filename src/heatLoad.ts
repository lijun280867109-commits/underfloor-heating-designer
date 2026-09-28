/**
 * 南昌地暖热负荷计算模块
 *
 * 严格按《中欧体系｜冷凝壁挂炉低温辐射采暖系统效能架构设计依据》表取值
 * 设计基准：tw=-1.3℃, tn=20℃, ΔT=8℃小温差大流量
 */

// ===== 枚举选项（与xlsx表一致）=====

export type Orientation = 'south' | 'north' | 'east' | 'west' | 'through';
export type FloorPos = 'middle' | 'villaMid' | 'first' | 'top';
export type Insulation = 'good' | 'old' | 'selfbuilt';
export type WindowType = 'lowE' | 'double' | 'bay' | 'single';
export type FloorMaterial = 'tile' | 'laminate' | 'solidWood';

export interface RoomInput {
  name: string;
  areaM2: number;
  orientation: Orientation;
  floorPos: FloorPos;
  insulation: Insulation;
  windowType: WindowType;
  floorMaterial: FloorMaterial;
}

export interface RoomCalc extends RoomInput {
  /** 单位热负荷 W/㎡ */
  loadPerSqm: number;
  /** 房间总热负荷 W */
  totalLoadW: number;
  /** 单路设计流量 L/h */
  flowLph: number;
  /** 推荐盘管规格 */
  pipeSpec: string;
  /** 推荐回路数 */
  loopCount: number;
  /** 单路平均管长 m */
  avgLoopLengthM: number;
  /** 管路总长 m */
  totalPipeLengthM: number;
}

// ===== 修正系数表（来自xlsx"计算参数说明"sheet）=====

const BASE_LOAD = 100; // W/㎡，南昌新建商品房中间层标准

const ORIENTATION_ADJUST: Record<Orientation, number> = {
  south: 0,
  north: 20,
  east: 10,
  west: 10,
  through: 5, // 南北通透
};

const FLOOR_ADJUST: Record<FloorPos, number> = {
  middle: 0,
  villaMid: 10,
  first: 15,
  top: 20,
};

const INSULATION_ADJUST: Record<Insulation, number> = {
  good: 0,
  old: 25,
  selfbuilt: 40,
};

const WINDOW_ADJUST: Record<WindowType, number> = {
  lowE: 0,
  double: 10,
  bay: 20,
  single: 25,
};

const FLOOR_MATERIAL_ADJUST: Record<FloorMaterial, number> = {
  tile: 0,
  laminate: 10,
  solidWood: 25,
};

// ===== 计算常量 =====

/** 150mm间距实际管长系数 m/㎡（扣边距后） */
const PIPE_LENGTH_PER_SQM = 5.0;

/** 单路最大管长 m（JGJ142允许120，李军基准≤90） */
const MAX_LOOP_LENGTH_M = 90;

/** 设计供回水温差 ℃ */
const DESIGN_DELTA_T = 8;

/** 天然气低位热值 kWh/m³ */
const GAS_KWH_PER_M3 = 9.97;

/** 燃气价 元/m³（南昌统一价） */
export const GAS_PRICE_PER_M3 = 4.1;

// ===== 单房间计算 =====

export function calcRoom(input: RoomInput): RoomCalc {
  const loadPerSqm =
    BASE_LOAD +
    ORIENTATION_ADJUST[input.orientation] +
    FLOOR_ADJUST[input.floorPos] +
    INSULATION_ADJUST[input.insulation] +
    WINDOW_ADJUST[input.windowType] +
    FLOOR_MATERIAL_ADJUST[input.floorMaterial];

  const totalLoadW = loadPerSqm * input.areaM2;

  // 流量 L/h = Q(W) × 0.86 / ΔT(℃)
  const flowLph = (totalLoadW * 0.86) / DESIGN_DELTA_T;

  // 管路总长
  const totalPipeLengthM = input.areaM2 * PIPE_LENGTH_PER_SQM;

  // 回路数：按单路≤90m反推
  const loopCount = Math.max(1, Math.ceil(totalPipeLengthM / MAX_LOOP_LENGTH_M));

  // 单路平均管长
  const avgLoopLengthM = totalPipeLengthM / loopCount;

  return {
    ...input,
    loadPerSqm,
    totalLoadW: Math.round(totalLoadW),
    flowLph: Math.round(flowLph),
    pipeSpec: 'De20 PE-RT',
    loopCount,
    avgLoopLengthM: Math.round(avgLoopLengthM * 10) / 10,
    totalPipeLengthM: Math.round(totalPipeLengthM),
  };
}

// ===== 全屋汇总 =====

export interface SystemSummary {
  totalLoadW: number;
  totalLoadKW: number;
  recommendedBoilerKW: number;
  totalLoops: number;
  avgLoopLengthM: number;
  totalPipeLengthM: number;
  secondaryFlowM3h: number;
  secondaryMainPipe: string;
  secondaryVelocityMps: number;
  primaryFlowM3h: number;
  primaryMainPipe: string;
  gasDailyM3: Record<string, number>;
  gasMonthlyM3: number;
}

export function calcSystem(rooms: RoomCalc[]): SystemSummary {
  const totalLoadW = rooms.reduce((s, r) => s + r.totalLoadW, 0);
  const totalLoadKW = totalLoadW / 1000;
  const totalLoops = rooms.reduce((s, r) => s + r.loopCount, 0);
  const totalPipeLengthM = rooms.reduce((s, r) => s + r.totalPipeLengthM, 0);
  const avgLoopLengthM = totalLoops > 0 ? totalPipeLengthM / totalLoops : 0;

  // 锅炉选型：留20%余量，选常规规格
  const boilerChoice = [24, 28, 32, 35].find((kw) => totalLoadKW * 1.2 <= kw) ?? 35;

  // 二次侧总流量 m³/h = 总负荷(W) × 0.86 / 8 / 1000
  const secondaryFlowM3h = (totalLoadW * 0.86) / DESIGN_DELTA_T / 1000;

  // 主管规格：按经济流速0.3-0.8m/s选
  const secondaryMainPipe = selectPipe(secondaryFlowM3h);
  const secondaryVelocityMps = flowVelocity(secondaryFlowM3h, secondaryMainPipe);

  // 一次侧（锅炉侧）按10℃温差
  const primaryFlowM3h = (totalLoadW * 0.86) / 10 / 1000;
  const primaryMainPipe = selectPipe(primaryFlowM3h);

  // 耗气量：按4个温度区间加权
  const gasDailyM3 = estimateGasDaily(totalLoadKW, boilerChoice);
  const gasMonthlyM3 = Math.round(
    Object.values(gasDailyM3).reduce((a, b) => a + b, 0) / 4 * 30,
  );

  return {
    totalLoadW,
    totalLoadKW: Math.round(totalLoadKW * 100) / 100,
    recommendedBoilerKW: boilerChoice,
    totalLoops,
    avgLoopLengthM: Math.round(avgLoopLengthM * 10) / 10,
    totalPipeLengthM: Math.round(totalPipeLengthM),
    secondaryFlowM3h: Math.round(secondaryFlowM3h * 100) / 100,
    secondaryMainPipe,
    secondaryVelocityMps: Math.round(secondaryVelocityMps * 100) / 100,
    primaryFlowM3h: Math.round(primaryFlowM3h * 100) / 100,
    primaryMainPipe,
    gasDailyM3,
    gasMonthlyM3,
  };
}

// ===== 管道选型 =====

const PPR_PIPES = [
  { size: 'DN20', innerDiameter: 16 },
  { size: 'DN25', innerDiameter: 21 },
  { size: 'DN32', innerDiameter: 26 },
  { size: 'DN40', innerDiameter: 33 },
] as const;

function selectPipe(flowM3h: number): string {
  for (const p of PPR_PIPES) {
    // 流速 = 流量(m³/h) / 截面积(m²) / 3600
    const area = Math.PI * (p.innerDiameter / 1000) ** 2 / 4;
    const velocity = flowM3h / 3600 / area;
    if (velocity <= 0.8) return p.size;
  }
  return 'DN40';
}

function flowVelocity(flowM3h: number, size: string): number {
  const pipe = PPR_PIPES.find((p) => p.size === size) ?? PPR_PIPES[1];
  const area = Math.PI * (pipe.innerDiameter / 1000) ** 2 / 4;
  return flowM3h / 3600 / area;
}

// ===== 耗气量估算 =====

function estimateGasDaily(totalLoadKW: number, boilerKW: number): Record<string, number> {
  // 按4个温度区间的负荷系数和效率估算
  // 从xlsx表提取：24kW炉在南昌的日耗气参考值
  const scenarios = [
    { range: '8~12℃(38℃)', factor: 0.12, efficiency: 1.09, days: 30 },
    { range: '4~8℃(41℃)', factor: 0.18, efficiency: 1.08, days: 35 },
    { range: '0~4℃(44℃)', factor: 0.28, efficiency: 1.07, days: 15 },
    { range: '-3~0℃(47℃)', factor: 0.35, efficiency: 1.06, days: 10 },
  ];

  const result: Record<string, number> = {};
  for (const s of scenarios) {
    // 实际输出功率 = 总负荷 × 负荷系数（部分负荷率）
    const actualKW = totalLoadKW * s.factor * (boilerKW / 24);
    // 日耗气 = 实际功率 × 24h / (热值 × 效率)
    result[s.range] = Math.round(
      (actualKW * 24) / (GAS_KWH_PER_M3 * s.efficiency) * 10,
    ) / 10;
  }
  return result;
}

// ===== 选项列表（供UI下拉用）=====

export const ORIENTATION_OPTIONS: { value: Orientation; label: string; adj: number }[] = [
  { value: 'south', label: '南向', adj: 0 },
  { value: 'north', label: '北向', adj: 20 },
  { value: 'east', label: '东向', adj: 10 },
  { value: 'west', label: '西向', adj: 10 },
  { value: 'through', label: '南北通透', adj: 5 },
];

export const FLOOR_POS_OPTIONS: { value: FloorPos; label: string; adj: number }[] = [
  { value: 'middle', label: '中间层', adj: 0 },
  { value: 'villaMid', label: '别墅中层', adj: 10 },
  { value: 'first', label: '一楼/地坪', adj: 15 },
  { value: 'top', label: '顶楼/顶层', adj: 20 },
];

export const INSULATION_OPTIONS: { value: Insulation; label: string; adj: number }[] = [
  { value: 'good', label: '有外保温(新建商品房)', adj: 0 },
  { value: 'old', label: '无外保温(老房)', adj: 25 },
  { value: 'selfbuilt', label: '自建房保温差', adj: 40 },
];

export const WINDOW_OPTIONS: { value: WindowType; label: string; adj: number }[] = [
  { value: 'lowE', label: '断桥中空Low-E', adj: 0 },
  { value: 'double', label: '普通双层玻璃', adj: 10 },
  { value: 'bay', label: '大面积落地窗', adj: 20 },
  { value: 'single', label: '单层玻璃', adj: 25 },
];

export const FLOOR_MAT_OPTIONS: { value: FloorMaterial; label: string; adj: number }[] = [
  { value: 'tile', label: '地砖/石材', adj: 0 },
  { value: 'laminate', label: '复合木地板', adj: 10 },
  { value: 'solidWood', label: '纯实木地板', adj: 25 },
];

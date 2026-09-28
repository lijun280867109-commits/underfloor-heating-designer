/**
 * 李军暖通南昌项目报价计算模块
 *
 * 严格按《地暖系统架构报价单模板》18项配置
 * 采暖面积 × 80元/㎡（末端含辅材）+ 20元/㎡（人工）
 * 自有施工团队，无外包分包
 */

export interface QuoteItem {
  no: number;
  name: string;
  brand: string;
  spec: string;
  unit: string;
  unitPrice: number;
  qty: number;
  subtotal: number;
}

export interface QuoteInput {
  /** 采暖总面积 ㎡ */
  areaM2: number;
  /** 分集水器回路数 */
  loops: number;
  /** 房间数（温控器数量） */
  roomCount: number;
  /** 推荐锅炉功率 kW */
  boilerKW: number;
}

export interface QuoteResult {
  items: QuoteItem[];
  total: number;
  /** 单位面积造价 元/㎡ */
  perSqm: number;
}

/** 锅炉选型价 */
function boilerPrice(kw: number): { name: string; price: number } {
  if (kw <= 24) return { name: '茵格斯达 LL1GBQ24-D2 24kW', price: 11850 };
  if (kw <= 28) return { name: '茵格斯达 28kW', price: 13800 };
  return { name: '茵格斯达 35kW', price: 16800 };
}

export function calcQuote(input: QuoteInput): QuoteResult {
  const boiler = boilerPrice(input.boilerKW);

  const items: QuoteItem[] = [
    {
      no: 1,
      name: '全预混一级能效冷凝炉',
      brand: '德国茵格斯达 INGOSTAR',
      spec: boiler.name + '，不锈钢全预混换热器，效率106-109%',
      unit: '台',
      unitPrice: boiler.price,
      qty: 1,
      subtotal: boiler.price,
    },
    {
      no: 3,
      name: '全屋智能总控',
      brand: '定制嵌入系统',
      spec: '壁挂炉APP远程控制、分房独立控温、实时监测',
      unit: '套',
      unitPrice: 230,
      qty: 1,
      subtotal: 230,
    },
    {
      no: 4,
      name: '温控器',
      brand: '森威尔',
      spec: '分房独立控温，每主要房间一只',
      unit: '只',
      unitPrice: 120,
      qty: Math.max(1, input.roomCount),
      subtotal: 120 * Math.max(1, input.roomCount),
    },
    {
      no: 5,
      name: '气候联动变水温控制',
      brand: '定制嵌入系统',
      spec: '网络温感联动，自适应供水温度43/45/47℃',
      unit: '套',
      unitPrice: 630,
      qty: 1,
      subtotal: 630,
    },
    {
      no: 6,
      name: '自适应变流量控制',
      brand: '定制嵌入系统',
      spec: '永磁变频泵，扬程15m，最大流量2.0m³/h',
      unit: '套',
      unitPrice: 1160,
      qty: 1,
      subtotal: 1160,
    },
    {
      no: 7,
      name: '全系统节能逻辑控制',
      brand: '定制嵌入系统',
      spec: '锅炉启停抑制、最小负荷匹配、延时停机',
      unit: '套',
      unitPrice: 160,
      qty: 1,
      subtotal: 160,
    },
    {
      no: 8,
      name: '本地气候场景适配模块',
      brand: '定制嵌入系统',
      spec: '南昌阴冷/寒潮专属运行曲线，室外温湿度实时采集',
      unit: '套',
      unitPrice: 200,
      qty: 1,
      subtotal: 200,
    },
    {
      no: 9,
      name: '联动控制器',
      brand: '定制嵌入系统',
      spec: '水泵启停/信号传输，含户外防水控制箱',
      unit: '套',
      unitPrice: 80,
      qty: 1,
      subtotal: 80,
    },
    {
      no: 10,
      name: '二次水力系统',
      brand: '定制嵌入系统',
      spec: '一二次回路水力分离，小温差大流量',
      unit: '套',
      unitPrice: 800,
      qty: 1,
      subtotal: 800,
    },
    {
      no: 11,
      name: '地暖末端全套辅材',
      brand: '曼瑞德 MENRED + 保利',
      spec: 'De20 PE-RT管150mm间距 + XPS保温板 + 反射膜 + 边界条',
      unit: '㎡',
      unitPrice: 80,
      qty: Math.round(input.areaM2 * 10) / 10,
      subtotal: Math.round(input.areaM2 * 80),
    },
    {
      no: 12,
      name: '地暖盘管安装人工费',
      brand: '自有施工团队（不外包）',
      spec: '保温层铺设、盘管固定、单回路打压测试',
      unit: '㎡',
      unitPrice: 20,
      qty: Math.round(input.areaM2 * 10) / 10,
      subtotal: Math.round(input.areaM2 * 20),
    },
    {
      no: 13,
      name: '不锈钢分集水器+执行器',
      brand: '巴姆比 BAMBI',
      spec: '一体挤压成型+电热执行器+压差旁通+排气阀',
      unit: '路',
      unitPrice: 230,
      qty: Math.max(2, input.loops),
      subtotal: 230 * Math.max(2, input.loops),
    },
    {
      no: 14,
      name: '中央控制器',
      brand: '定制嵌入系统',
      spec: '集中控制分集水器/温控器/信号汇总',
      unit: '套',
      unitPrice: 260,
      qty: 1,
      subtotal: 260,
    },
    {
      no: 15,
      name: '系统主管/支管',
      brand: 'PPR稳态管',
      spec: '一次侧DN25/二次侧DN40/支管DN25，含保温管件',
      unit: '项',
      unitPrice: 1600,
      qty: 1,
      subtotal: 1600,
    },
    {
      no: 16,
      name: '耦合罐',
      brand: '含辅材/安装',
      spec: '保证壁挂炉最小连续运行≥3分钟',
      unit: '项',
      unitPrice: 380,
      qty: 1,
      subtotal: 380,
    },
    {
      no: 17,
      name: '主机及系统安装调试',
      brand: '自有施工团队',
      spec: '锅炉连接、管道焊接、智能布线、打压排气、程序调试',
      unit: '项',
      unitPrice: 800,
      qty: 1,
      subtotal: 800,
    },
    {
      no: 18,
      name: '首年度免费服务',
      brand: '自有售后团队',
      spec: '采暖前上门安检、系统检查、运行校准、能耗优化',
      unit: '年',
      unitPrice: 0,
      qty: 1,
      subtotal: 0,
    },
  ];

  const total = items.reduce((s, it) => s + it.subtotal, 0);
  const perSqm = input.areaM2 > 0 ? Math.round(total / input.areaM2) : 0;

  return { items, total, perSqm };
}

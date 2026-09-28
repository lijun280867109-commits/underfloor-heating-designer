/**
 * 管材物理参数 — 李军暖通南昌项目基准
 *
 * 管路：曼瑞德 MENRED De20 PE-RT（耐热聚乙烯）
 * 标准：JGJ 142-2012 《辐射供暖供冷技术规程》
 * 对标：EN 1264 / REHVA / CIBSE
 */

/**
 * 管路最小弯曲半径（中心线），mm。
 *
 * De20 PE-RT 盘管，按施工手册最小弯曲半径 ≥ 8D = 160mm，
 * 现场手煨留余量取 10D = 200mm。
 *
 * 这是每一个弯头（包括 leader 管和螺旋弯）的硬性下限——
 * 弯曲半径是管材属性，不是画图属性。
 *
 * 间距小于 2×R（400mm）时，最中间两趟管路会被自动拉开到 2×R，
 * 中间区域会略空，这是正常的施工余量。
 */
export const PIPE_BEND_RADIUS_MM = 200;

/**
 * 默认管材外径 mm — 曼瑞德 De20 PE-RT
 */
export const DEFAULT_PIPE_OUTER_DIAMETER_MM = 20;

/**
 * 常用管材外径选项 mm
 * - 20: 曼瑞德 De20 PE-RT（本项目主力）
 * - 16: 备用/小回路
 */
export const COMMON_PIPE_OUTER_DIAMETERS_MM = [16, 20];

/**
 * 管壁厚度 mm — PE-RT De20 通常 2.0mm
 */
export const PIPE_WALL_MM = 2.0;

/**
 * 单路最大管路长度 m — JGJ 142 要求环路 ≤ 120m，
 * 李军设计基准取 ≤ 90m（流速保证 0.3-0.8m/s，水力平衡更易做）
 */
export const MAX_LOOP_LENGTH_M = 90;

/**
 * 分集水器每路最大负荷 kW
 * 巴姆比分集水器每路推荐 ≤ 1.5kW
 */
export const MAX_LOAD_PER_LOOP_KW = 1.5;

/**
 * 设计供回水温差 ℃ — 李军基准 8℃ 小温差大流量
 * （JGJ 142 允许 5-10℃，取 8℃ 兼顾均匀性和水泵能耗）
 */
export const DESIGN_DELTA_T_C = 8;

/**
 * 设计供水温度 ℃ — 气候补偿区间 38/41/44/47℃，
 * 默认取中间值 41℃（南昌中间层新房）
 */
export const DESIGN_SUPPLY_TEMP_C = 41;

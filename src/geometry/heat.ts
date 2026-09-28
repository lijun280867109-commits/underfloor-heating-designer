/**
 * 管路水系统热力计算
 * Q = 质量流量 × 比热容 × 供回水温差
 * 水密度 1 kg/L，cp = 4186 J/(kg·K)
 */
import {
  PIPE_WALL_MM,
  DEFAULT_PIPE_OUTER_DIAMETER_MM,
  COMMON_PIPE_OUTER_DIAMETERS_MM,
} from '../pipeSpec';

const WATER_HEAT_CONSTANT = 4186 / 60; // W per (L/min · K)

/** 单路流量（L/min），按管路长度比例分配 */
export function zoneFlowLpm(pipeLengthM: number, flowLpmPer100m: number): number {
  return (pipeLengthM / 100) * flowLpmPer100m;
}

/** 单路散热量 W：Q = 流量 × ΔT × 常数 */
export function zoneHeatOutputW(
  pipeLengthM: number,
  flowLpmPer100m: number,
  supplyTempC: number,
  returnTempC: number,
): number {
  const deltaT = Math.max(0, supplyTempC - returnTempC);
  const flowLpm = zoneFlowLpm(pipeLengthM, flowLpmPer100m);
  return flowLpm * deltaT * WATER_HEAT_CONSTANT;
}

export {
  PIPE_WALL_MM,
  DEFAULT_PIPE_OUTER_DIAMETER_MM,
  COMMON_PIPE_OUTER_DIAMETERS_MM,
};

/** 每米管容水量（L/m），按内径计算 */
export function pipeLitresPerMetre(outerDiameterMm: number): number {
  const boreMm = Math.max(0, outerDiameterMm - 2 * PIPE_WALL_MM);
  return (Math.PI * (boreMm / 2) ** 2) / 1000;
}

/** 管段总容水量（L） */
export function pipeVolumeLitres(pipeLengthM: number, outerDiameterMm: number): number {
  return pipeLengthM * pipeLitresPerMetre(outerDiameterMm);
}

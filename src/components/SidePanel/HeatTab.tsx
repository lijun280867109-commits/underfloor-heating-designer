import { Flame, Thermometer, TriangleAlert } from 'lucide-react';
import { useStore } from '../../state/store';
import { PIPE_WALL_MM, pipeLitresPerMetre, pipeVolumeLitres, zoneFlowLpm, zoneHeatOutputW } from '../../geometry/heat';
import { mm2ToSquareMeters, mmToMeters } from '../../geometry/length';

export default function HeatTab() {
  const {
    zones,
    supplyTempC,
    returnTempC,
    flowLpmPer100m,
    pipeOuterDiameterMm,
    setSupplyTempC,
    setReturnTempC,
    setFlowLpmPer100m,
  } = useStore();

  const deltaT = Math.max(0, supplyTempC - returnTempC);
  const totalHeatW = zones.reduce(
    (sum, zone) => sum + zoneHeatOutputW(mmToMeters(zone.spiralLengthMm+zone.leaderLengthMm), flowLpmPer100m, supplyTempC, returnTempC),
    0,
  );
  const totalFlowLpm = zones.reduce((sum, zone) => sum + zoneFlowLpm(mmToMeters(zone.spiralLengthMm+zone.leaderLengthMm), flowLpmPer100m), 0);
  const totalPipeM = zones.reduce((sum, zone) => sum + mmToMeters(zone.spiralLengthMm + zone.leaderLengthMm), 0);
  const totalVolumeL = pipeVolumeLitres(totalPipeM, pipeOuterDiameterMm);

  return (
    <div className="side-panel-tab-content">
      <section className="panel-section">
        <h2><Thermometer /> 供回水温度</h2>

        <div className="slider-row">
          <div className="slider-row-label">
            <label>供水温度</label>
            <span className="slider-value">{supplyTempC.toFixed(1)}℃</span>
          </div>
          <input
            type="range"
            min={20}
            max={60}
            step={0.5}
            value={supplyTempC}
            onChange={(event) => setSupplyTempC(Number(event.target.value))}
          />
        </div>

        <div className="slider-row">
          <div className="slider-row-label">
            <label>回水温度</label>
            <span className="slider-value">{returnTempC.toFixed(1)}℃</span>
          </div>
          <input
            type="range"
            min={15}
            max={55}
            step={0.5}
            value={returnTempC}
            onChange={(event) => setReturnTempC(Number(event.target.value))}
          />
        </div>

        <div className="slider-row">
          <div className="slider-row-label">
            <label>每百米流量</label>
            <span className="slider-value">{flowLpmPer100m.toFixed(1)} L/min/100m</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={6}
            step={0.1}
            value={flowLpmPer100m}
            onChange={(event) => setFlowLpmPer100m(Number(event.target.value))}
          />
        </div>

        {deltaT === 0 && <p className="warning"><TriangleAlert /> 回水温度必须低于供水温度。</p>}
        <p className="info">温差 {deltaT.toFixed(1)}℃ · 小温差大流量系统</p>
      </section>

      <section className="panel-section">
        <h2><Flame /> 散热量</h2>
        {zones.length === 0 && <p className="info">还没有管路设计。</p>}
        <div className="zone-list">
          {zones.map((zone) => {
            const flowLpm = zoneFlowLpm(mmToMeters(zone.spiralLengthMm+zone.leaderLengthMm), flowLpmPer100m);
            const heatW = zoneHeatOutputW(mmToMeters(zone.spiralLengthMm+zone.leaderLengthMm), flowLpmPer100m, supplyTempC, returnTempC);
            const wPerM2 = mm2ToSquareMeters(zone.areaMm2) > 0 ? heatW / mm2ToSquareMeters(zone.areaMm2) : 0;
            return (
              <div key={zone.id} className="zone-card" style={{ borderLeftColor: zone.color, cursor: 'default' }}>
                <div className="zone-card-header">
                  <span className="zone-name">{zone.name}</span>
                  <span className="zone-name">{heatW.toFixed(0)} W</span>
                </div>
                <span className="info">
                  {flowLpm.toFixed(2)} L/min · {wPerM2.toFixed(0)} W/㎡ · {mmToMeters(zone.spiralLengthMm+zone.leaderLengthMm).toFixed(1)}m 回路
                </span>
              </div>
            );
          })}
        </div>

        {zones.length > 0 && (
          <div className="grand-total">
            <strong>总散热量: {totalHeatW.toFixed(0)} W</strong>
            <br />
            <strong>总流量: {totalFlowLpm.toFixed(2)} L/min</strong>
          </div>
        )}
        {zones.length > 0 && (
          <>
            <div className="grand-total">
              <strong>系统水容量: {totalVolumeL.toFixed(1)} L</strong>
              <br />
              <strong>管路总长: {totalPipeM.toFixed(1)} m</strong>
            </div>
          </>
        )}
        <p className="info">
          De{pipeOuterDiameterMm}×{PIPE_WALL_MM} PE-RT 管（内径{pipeOuterDiameterMm - 2 * PIPE_WALL_MM}mm）·{' '}
          {pipeLitresPerMetre(pipeOuterDiameterMm).toFixed(3)} L/m · 不含分集水器和锅炉侧
        </p>
      </section>
    </div>
  );
}

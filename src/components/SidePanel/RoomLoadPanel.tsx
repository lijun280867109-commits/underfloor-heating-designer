import { useState } from 'react';
import { Plus, Trash2, Flame, Building2, Droplets, Coins } from 'lucide-react';
import {
  calcRoom,
  calcSystem,
  ORIENTATION_OPTIONS,
  FLOOR_POS_OPTIONS,
  INSULATION_OPTIONS,
  WINDOW_OPTIONS,
  FLOOR_MAT_OPTIONS,
  GAS_PRICE_PER_M3,
  type RoomInput,
  type RoomCalc,
} from '../../heatLoad';

const DEFAULT_ROOM: RoomInput = {
  name: '客厅',
  areaM2: 20,
  orientation: 'south',
  floorPos: 'middle',
  insulation: 'good',
  windowType: 'lowE',
  floorMaterial: 'tile',
};

export default function RoomLoadPanel() {
  const [rooms, setRooms] = useState<RoomCalc[]>([
    calcRoom({ ...DEFAULT_ROOM, name: '客厅餐厅' }),
    calcRoom({ ...DEFAULT_ROOM, name: '主卧', areaM2: 16, orientation: 'north' }),
  ]);

  const updateRoom = (idx: number, patch: Partial<RoomInput>) => {
    setRooms((prev) => {
      const next = [...prev];
      next[idx] = calcRoom({ ...next[idx], ...patch });
      return next;
    });
  };

  const addRoom = () => {
    setRooms((prev) => [...prev, calcRoom({ ...DEFAULT_ROOM, name: `房间${prev.length + 1}` })]);
  };

  const removeRoom = (idx: number) => {
    setRooms((prev) => prev.filter((_, i) => i !== idx));
  };

  const summary = calcSystem(rooms);

  return (
    <div className="side-panel-tab-content">
      <section className="panel-section">
        <h2><Building2 /> 房间负荷计算</h2>
        <p className="info" style={{ fontSize: '0.75rem' }}>
          南昌基准：tw=-1.3℃, tn=20℃, ΔT=8℃
        </p>

        {rooms.map((room, idx) => (
          <div key={idx} className="zone-card" style={{ marginBottom: '8px' }}>
            <div className="zone-card-header">
              <input
                type="text"
                value={room.name}
                onChange={(e) => updateRoom(idx, { name: e.target.value })}
                style={{ border: 'none', background: 'transparent', fontWeight: 600, width: '40%' }}
              />
              <button className="btn btn-secondary" onClick={() => removeRoom(idx)} style={{ padding: '2px 6px' }}>
                <Trash2 size={14} />
              </button>
            </div>

            <div className="setting-row">
              <label>面积</label>
              <input
                type="number"
                min={1}
                value={room.areaM2}
                onChange={(e) => updateRoom(idx, { areaM2: Number(e.target.value) })}
              />
              <span>㎡</span>
            </div>

            <div className="setting-row">
              <label>朝向</label>
              <select
                value={room.orientation}
                onChange={(e) => updateRoom(idx, { orientation: e.target.value as RoomInput['orientation'] })}
              >
                {ORIENTATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label} ({o.adj >= 0 ? '+' : ''}{o.adj})</option>
                ))}
              </select>
            </div>

            <div className="setting-row">
              <label>楼层</label>
              <select
                value={room.floorPos}
                onChange={(e) => updateRoom(idx, { floorPos: e.target.value as RoomInput['floorPos'] })}
              >
                {FLOOR_POS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label} ({o.adj >= 0 ? '+' : ''}{o.adj})</option>
                ))}
              </select>
            </div>

            <div className="setting-row">
              <label>保温</label>
              <select
                value={room.insulation}
                onChange={(e) => updateRoom(idx, { insulation: e.target.value as RoomInput['insulation'] })}
              >
                {INSULATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label} (+{o.adj})</option>
                ))}
              </select>
            </div>

            <div className="setting-row">
              <label>窗户</label>
              <select
                value={room.windowType}
                onChange={(e) => updateRoom(idx, { windowType: e.target.value as RoomInput['windowType'] })}
              >
                {WINDOW_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label} (+{o.adj})</option>
                ))}
              </select>
            </div>

            <div className="setting-row">
              <label>地面</label>
              <select
                value={room.floorMaterial}
                onChange={(e) => updateRoom(idx, { floorMaterial: e.target.value as RoomInput['floorMaterial'] })}
              >
                {FLOOR_MAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label} (+{o.adj})</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '6px', padding: '6px', background: '#f0f7f0', borderRadius: '4px', fontSize: '0.8rem' }}>
              <div><b>{room.loadPerSqm} W/㎡</b> × {room.areaM2}㎡ = <b>{room.totalLoadW} W</b></div>
              <div style={{ color: '#555' }}>
                {room.loopCount}路 · 单路{room.avgLoopLengthM}m · 流量{room.flowLph}L/h
              </div>
            </div>
          </div>
        ))}

        <button className="btn" onClick={addRoom}>
          <Plus /> 添加房间
        </button>
      </section>

      <section className="panel-section">
        <h2><Flame /> 系统汇总</h2>
        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr><td>总热负荷</td><td style={{ textAlign: 'right' }}><b>{summary.totalLoadKW} kW</b></td></tr>
            <tr><td>推荐锅炉</td><td style={{ textAlign: 'right' }}><b>{summary.recommendedBoilerKW} kW</b></td></tr>
            <tr><td>分集水器路数</td><td style={{ textAlign: 'right' }}><b>{summary.totalLoops} 路</b></td></tr>
            <tr><td>平均单路管长</td><td style={{ textAlign: 'right' }}>{summary.avgLoopLengthM} m</td></tr>
            <tr><td>管路总长</td><td style={{ textAlign: 'right' }}>{summary.totalPipeLengthM} m</td></tr>
            <tr><td>二次侧流量</td><td style={{ textAlign: 'right' }}>{summary.secondaryFlowM3h} m³/h</td></tr>
            <tr><td>二次侧主管</td><td style={{ textAlign: 'right' }}>{summary.secondaryMainPipe} ({summary.secondaryVelocityMps} m/s)</td></tr>
            <tr><td>一次侧主管</td><td style={{ textAlign: 'right' }}>{summary.primaryMainPipe}</td></tr>
          </tbody>
        </table>
      </section>

      <section className="panel-section">
        <h2><Coins /> 耗气量估算</h2>
        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ textAlign: 'left' }}>室外温度</th>
              <th style={{ textAlign: 'right' }}>日耗气</th>
              <th style={{ textAlign: 'right' }}>月费</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary.gasDailyM3).map(([range, daily]) => (
              <tr key={range} style={{ borderBottom: '1px solid #eee' }}>
                <td>{range}</td>
                <td style={{ textAlign: 'right' }}>{daily} m³</td>
                <td style={{ textAlign: 'right' }}>¥{Math.round(daily * 30 * GAS_PRICE_PER_M3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="info" style={{ fontSize: '0.7rem', marginTop: '4px' }}>
          气价按南昌 {GAS_PRICE_PER_M3} 元/m³
        </p>
      </section>
    </div>
  );
}

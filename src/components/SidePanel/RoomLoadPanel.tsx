import { useState } from 'react';
import { Plus, Trash2, Flame, Building2, Coins, Receipt, FileDown } from 'lucide-react';
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
import { calcQuote } from '../../materials';

const DEFAULT_ROOM: RoomInput = {
  name: '客厅',
  areaM2: 20,
  orientation: 'south',
  floorPos: 'middle',
  insulation: 'good',
  windowType: 'lowE',
  floorMaterial: 'tile',
};

// 默认户型：南昌三房两厅两卫 110㎡
const DEFAULT_ROOMS: RoomInput[] = [
  { name: '客餐厅', areaM2: 37.9, orientation: 'through', floorPos: 'middle', insulation: 'good', windowType: 'lowE', floorMaterial: 'tile' },
  { name: '主卧', areaM2: 16.8, orientation: 'north', floorPos: 'middle', insulation: 'good', windowType: 'lowE', floorMaterial: 'laminate' },
  { name: '次卧1', areaM2: 13.8, orientation: 'north', floorPos: 'middle', insulation: 'good', windowType: 'lowE', floorMaterial: 'laminate' },
  { name: '次卧2', areaM2: 12.4, orientation: 'south', floorPos: 'middle', insulation: 'good', windowType: 'lowE', floorMaterial: 'laminate' },
  { name: '次卧3', areaM2: 14.4, orientation: 'east', floorPos: 'middle', insulation: 'good', windowType: 'lowE', floorMaterial: 'laminate' },
  { name: '厨房', areaM2: 6.3, orientation: 'south', floorPos: 'middle', insulation: 'good', windowType: 'lowE', floorMaterial: 'tile' },
  { name: '卫生间1', areaM2: 4.5, orientation: 'south', floorPos: 'middle', insulation: 'good', windowType: 'double', floorMaterial: 'tile' },
  { name: '卫生间2', areaM2: 4.7, orientation: 'west', floorPos: 'middle', insulation: 'good', windowType: 'double', floorMaterial: 'tile' },
];

function exportQuotePDF(
  rooms: RoomCalc[],
  summary: ReturnType<typeof calcSystem>,
  quote: ReturnType<typeof calcQuote>,
) {
  const today = new Date().toLocaleDateString('zh-CN');
  const totalArea = rooms.reduce((s, r) => s + r.areaM2, 0);
  const roomRows = rooms
    .map(
      (r) => `<tr>
        <td>${r.name}</td><td style="text-align:right">${r.areaM2}</td>
        <td style="text-align:right">${r.loadPerSqm}</td>
        <td style="text-align:right">${r.totalLoadW}</td>
        <td style="text-align:right">${r.loopCount}</td>
        <td style="text-align:right">${r.avgLoopLengthM}</td>
      </tr>`,
    )
    .join('');

  const quoteRows = quote.items
    .map(
      (it) => `<tr>
        <td>${it.no}</td>
        <td>${it.name}<br/><small style="color:#888">${it.brand} · ${it.spec}</small></td>
        <td style="text-align:center">${it.unit}</td>
        <td style="text-align:right">${it.qty}</td>
        <td style="text-align:right">${it.unitPrice.toLocaleString()}</td>
        <td style="text-align:right">${it.subtotal.toLocaleString()}</td>
      </tr>`,
    )
    .join('');

  const gasRows = Object.entries(summary.gasDailyM3)
    .map(
      ([range, daily]) => `<tr>
        <td>${range}</td>
        <td style="text-align:right">${daily} m³</td>
        <td style="text-align:right">¥${Math.round(daily * 30)}</td>
        <td style="text-align:right">¥${Math.round(daily * 30 * GAS_PRICE_PER_M3)}</td>
      </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>地暖系统报价单 - ${today}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Microsoft YaHei", "PingFang SC", sans-serif; margin: 0; padding: 30px; color: #1f1f1f; font-size: 13px; line-height: 1.6; }
  .header { text-align: center; border-bottom: 3px solid #009A44; padding-bottom: 16px; margin-bottom: 20px; }
  .header h1 { margin: 0; font-size: 22px; color: #009A44; }
  .header .sub { color: #666; font-size: 13px; margin-top: 4px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 12px; color: #555; }
  h2 { font-size: 15px; color: #009A44; border-left: 4px solid #009A44; padding-left: 8px; margin: 20px 0 10px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  .total-row { font-weight: 700; background: #f0f7f0; }
  .total-row td { border-top: 2px solid #009A44; }
  .notes { font-size: 11px; color: #666; margin-top: 16px; line-height: 1.8; }
  .notes li { margin-bottom: 4px; }
  .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 12px; }
  .footer .sign { border-top: 1px solid #999; width: 180px; text-align: center; padding-top: 6px; }
  @media print { body { padding: 15px; } .no-print { display: none; } }
</style>
</head>
<body>

<div class="header">
  <h1>李军暖通 · 全预混冷凝炉地暖系统报价单</h1>
  <div class="sub">中欧体系｜冷凝壁挂炉低温辐射采暖系统效能架构</div>
</div>

<div class="meta">
  <span>报价日期：${today}</span>
  <span>设计基准：南昌 tw=-1.3℃ / tn=20℃ / ΔT=8℃</span>
</div>

<h2>一、房间负荷计算表</h2>
<table>
  <thead>
    <tr><th>房间</th><th>面积(㎡)</th><th>单位负荷(W/㎡)</th><th>总负荷(W)</th><th>回路数</th><th>单路管长(m)</th></tr>
  </thead>
  <tbody>${roomRows}</tbody>
</table>

<h2>二、系统选型</h2>
<table>
  <tr><th>采暖面积</th><td>${totalArea} ㎡</td><th>总热负荷</th><td>${summary.totalLoadKW} kW</td></tr>
  <tr><th>推荐锅炉</th><td>${summary.recommendedBoilerKW} kW 冷凝炉</td><th>分集水器</th><td>${summary.totalLoops} 路</td></tr>
  <tr><th>管路总长</th><td>${summary.totalPipeLengthM} m</td><th>二次侧主管</th><td>${summary.secondaryMainPipe}</td></tr>
</table>

<h2>三、设备与材料明细</h2>
<table>
  <thead>
    <tr><th>序号</th><th>项目名称 / 规格</th><th>单位</th><th>数量</th><th>单价(元)</th><th>小计(元)</th></tr>
  </thead>
  <tbody>
    ${quoteRows}
    <tr class="total-row">
      <td colspan="5" style="text-align:right">系统总报价（含税）</td>
      <td style="text-align:right">¥${quote.total.toLocaleString()}</td>
    </tr>
    <tr>
      <td colspan="5" style="text-align:right;color:#666">单位面积造价</td>
      <td style="text-align:right;color:#666">¥${quote.perSqm}/㎡</td>
    </tr>
  </tbody>
</table>

<h2>四、运行能耗估算</h2>
<table>
  <thead>
    <tr><th>室外温度区间</th><th>日耗气(m³)</th><th>月耗气(m³)</th><th>月燃气费(元)</th></tr>
  </thead>
  <tbody>${gasRows}</tbody>
</table>

<div class="notes">
  <b>备注：</b>
  <ol>
    <li>本报价含全部材料、人工、调试、首年售后，无隐形增项；不含生活热水改造、电源材料。</li>
    <li>所有材料为家用一线品牌，禁止工程款替代；曼瑞德 De20 PE-RT 管 + 保利 XPS 保温 + 巴姆比分水器 + 德国茵格斯达冷凝炉。</li>
    <li>自有施工团队，禁止外包分包；能耗承诺写入合同附件，具备法律效力。</li>
    <li>气价按南昌民用 4.1 元/m³ 计算；实际费用因使用习惯、房屋保温而异。</li>
  </ol>
</div>

<div class="footer">
  <div class="sign">客户签字 / 日期</div>
  <div class="sign">李军暖通 / 日期</div>
</div>

<p style="text-align:center;margin-top:30px;font-size:11px;color:#999">
  李军暖通 · 南昌高端住宅地暖系统设计 · 中欧标准对标（GB + EN1264 + REHVA/CIBSE）
</p>

<script>
  window.onload = function() { setTimeout(function(){ window.print(); }, 300); }
</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('请允许弹出窗口以导出PDF');
    return;
  }
  win.document.write(html);
  win.document.close();
}

export default function RoomLoadPanel() {
  const [rooms, setRooms] = useState<RoomCalc[]>(
    DEFAULT_ROOMS.map((r) => calcRoom(r)),
  );

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
  const totalArea = rooms.reduce((s, r) => s + r.areaM2, 0);
  const quote = calcQuote({
    areaM2: totalArea,
    loops: summary.totalLoops,
    roomCount: rooms.length,
    boilerKW: summary.recommendedBoilerKW,
  });

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
            <tr><td>采暖面积</td><td style={{ textAlign: 'right' }}>{totalArea} ㎡</td></tr>
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
        <h2><Receipt /> 系统报价</h2>
        <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ textAlign: 'left' }}>项目</th>
              <th style={{ textAlign: 'right' }}>数量</th>
              <th style={{ textAlign: 'right' }}>单价</th>
              <th style={{ textAlign: 'right' }}>小计</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((it) => (
              <tr key={it.no} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '3px 0' }}>
                  {it.name}
                  <div style={{ fontSize: '0.65rem', color: '#888' }}>{it.brand}</div>
                </td>
                <td style={{ textAlign: 'right' }}>{it.qty}{it.unit}</td>
                <td style={{ textAlign: 'right' }}>{it.unitPrice}</td>
                <td style={{ textAlign: 'right' }}>{it.subtotal.toLocaleString()}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid #333', fontWeight: 700 }}>
              <td colSpan={3}>系统总报价</td>
              <td style={{ textAlign: 'right' }}>¥{quote.total.toLocaleString()}</td>
            </tr>
            <tr style={{ color: '#666' }}>
              <td colSpan={3}>单位面积造价</td>
              <td style={{ textAlign: 'right' }}>¥{quote.perSqm}/㎡</td>
            </tr>
          </tbody>
        </table>
        <p className="info" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
          含材料+人工+调试+首年售后，无隐形增项；不含生活热水改造
        </p>
        <button
          className="btn"
          style={{ marginTop: '8px', width: '100%' }}
          onClick={() => exportQuotePDF(rooms, summary, quote)}
        >
          <FileDown /> 导出PDF报价单
        </button>
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

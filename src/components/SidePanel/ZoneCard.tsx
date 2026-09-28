import { useState } from 'react';
import { MoveHorizontal, MoveVertical, Pencil, Trash2, TriangleAlert } from 'lucide-react';
import { SpiralStartDirection, Zone, ZoneConnectionCorner } from '../../types';
import { useStore } from '../../state/store';
import EditableSelect from './EditableSelect';
import { mm2ToSquareMeters, mmToMeters } from '../../geometry/length';

interface Props {
  zone: Zone;
  isSelected: boolean;
  maxCircuitLengthM: number;
}

const SPACING_PRESETS = [100, 150, 200, 250];
const PADDING_PRESETS = [0, 50, 100, 150];
const CORNER_OPTIONS: Array<{ value: ZoneConnectionCorner; label: string }> = [
  { value: 'top-left', label: '左上角' },
  { value: 'top-right', label: '右上角' },
  { value: 'bottom-left', label: '左下角' },
  { value: 'bottom-right', label: '右下角' },
];
const START_DIRECTION_OPTIONS: Array<{
  value: SpiralStartDirection;
  label: string;
  Icon: typeof MoveHorizontal;
}> = [
  { value: 'horizontal', label: '横向', Icon: MoveHorizontal },
  { value: 'vertical', label: '纵向', Icon: MoveVertical },
];

export default function ZoneCard({ zone, isSelected, maxCircuitLengthM }: Props) {
  const {
    selectZone,
    deleteZone,
    updateZoneSpacing,
    updateZonePadding,
    updateZoneConnectionCorner,
    updateZoneStartDirection,
    updateZoneName,
    setToolMode,
  } = useStore();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(zone.name);

  const totalLength = mmToMeters(zone.spiralLengthMm + zone.leaderLengthMm);
  const isOverLimit = totalLength > maxCircuitLengthM;

  const commitName = () => {
    const nextName = nameValue.trim() || zone.name;
    updateZoneName(zone.id, nextName);
    setNameValue(nextName);
    setEditingName(false);
  };

  return (
    <div
      className={`zone-card ${isSelected ? 'selected' : ''}`}
      onClick={() => selectZone(zone.id)}
      style={{ borderLeftColor: zone.color }}
    >
      <div className="zone-card-header">
        {editingName ? (
          <input
            autoFocus
            value={nameValue}
            onChange={(event) => setNameValue(event.target.value)}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                commitName();
              }
            }}
            className="zone-name-input"
          />
        ) : (
          <span
            className="zone-name"
            onDoubleClick={() => {
              setEditingName(true);
              setNameValue(zone.name);
            }}
          >
            {zone.name}
          </span>
        )}
        <div className="zone-actions">
          <button
            className="btn-icon"
            title="编辑边界"
            onClick={(event) => {
              event.stopPropagation();
              selectZone(zone.id);
              setToolMode('editBoundary');
            }}
          >
            <Pencil />
          </button>
          <button
            className="btn-icon btn-danger"
            title="删除房间"
            onClick={(event) => {
              event.stopPropagation();
              deleteZone(zone.id);
            }}
          >
            <Trash2 />
          </button>
        </div>
      </div>

      <div className="zone-spacing">
        <label>管间距:</label>
        <div className="spacing-presets">
          <EditableSelect
            value={zone.spacingMm}
            presets={SPACING_PRESETS}
            min={50}
            max={500}
            onChange={(value) => updateZoneSpacing(zone.id, value)}
          />
          <span>mm</span>
        </div>
      </div>

      <div className="zone-spacing">
        <label>边距:</label>
        <div className="spacing-presets">
          <EditableSelect
            value={zone.paddingMm}
            presets={PADDING_PRESETS}
            min={0}
            max={1000}
            onChange={(value) => updateZonePadding(zone.id, value)}
          />
          <span>mm</span>
        </div>
      </div>

      <div className="zone-spacing">
        <label>分集水器接口:</label>
        <div className="spacing-presets">
          <select
            value={zone.connectionCorner}
            onChange={(event) =>
              updateZoneConnectionCorner(zone.id, event.target.value as ZoneConnectionCorner)
            }
            className="zone-select"
            onClick={(event) => event.stopPropagation()}
          >
            {CORNER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="zone-spacing">
        <label>盘管方向:</label>
        <div className="spacing-presets">
          {START_DIRECTION_OPTIONS.map(({ Icon, ...option }) => (
            <button
              key={option.value}
              className={`btn-preset ${zone.startDirection === option.value ? 'active' : ''}`}
              title={`盘管从分集水器${option.label}出发`}
              onClick={(event) => {
                event.stopPropagation();
                updateZoneStartDirection(zone.id, option.value);
              }}
            >
              <Icon />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`zone-lengths ${isOverLimit ? 'over-limit' : ''}`}>
        <div className="length-row">
          <span>
            {mm2ToSquareMeters(zone.areaMm2).toFixed(2)} ㎡ · 盘管{' '}
            {mmToMeters(zone.spiralLengthMm).toFixed(1)}m · 引管{' '}
            {mmToMeters(zone.leaderLengthMm).toFixed(1)}m
          </span>
        </div>
        <div className="length-row total">
          <span>总管长:</span>
          <span>{totalLength.toFixed(1)} m</span>
        </div>
        {isOverLimit && <div className="warning"><TriangleAlert /> 超过{maxCircuitLengthM}m单路限制！</div>}
      </div>
    </div>
  );
}

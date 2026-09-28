import {
    Link2,
    Maximize2,
    MousePointer2,
    RectangleHorizontal,
    RulerDimensionLine, Waypoints,
    Wrench,
} from 'lucide-react';
import { useStore } from '../../state/store';
import { ToolMode } from '../../types';

const TOOL_OPTIONS: Array<{ mode: ToolMode; label: string; Icon: typeof Wrench }> = [
  { mode: 'select', label: '选择', Icon: MousePointer2 },
  { mode: 'placeManifold', label: '分集水器', Icon: Wrench },
  { mode: 'drawZone', label: '多边形房间', Icon: Waypoints },
  { mode: 'drawRect', label: '矩形房间', Icon: RectangleHorizontal },
  { mode: 'routeLeader', label: '引管路由', Icon: Link2 },
  { mode: 'measure', label: '测量', Icon: RulerDimensionLine },
];

export default function Toolbar() {
  const toolMode = useStore((state) => state.toolMode);
  const setToolMode = useStore((state) => state.setToolMode);
  const fitViewToContent = useStore((state) => state.fitViewToContent);

  return (
    <div className="top-toolbar-tools">
      {TOOL_OPTIONS.map(({ mode, label, Icon }) => (
        <button
          key={mode}
          className={`btn tool-btn ${toolMode === mode ? 'active' : ''}`}
          onClick={() => setToolMode(mode)}
        >
          <Icon />
          {label}
        </button>
      ))}
      <button
        className="btn tool-btn"
        onClick={() => fitViewToContent(window.innerWidth - 320, window.innerHeight - 44)}
        title="缩放并平移以显示全部内容"
      >
        <Maximize2 />
        适应视图
      </button>
    </div>
  );
}

import { Check } from 'lucide-react';
import { useStore } from '../../state/store';
import Toolbar from '../Toolbar';

function useToolHint(): string | null {
  const toolMode = useStore((state) => state.toolMode);
  const routing = useStore((state) => state.routing);

  switch (toolMode) {
    case 'drawZone':
      return '点击添加顶点，双击或回车闭合多边形。';
    case 'drawRect':
      return '先点一个角，再点对角，画出矩形房间。';
    case 'placeManifold':
      return '在画布上点击放置分集水器。';
    case 'measure':
      return '点击两点测量距离，Esc清除卷尺。';
    case 'panBackground':
      return '拖动任意位置移动户型图，房间和分集水器保持不动。';
    case 'routeLeader':
      return routing
        ? '绘制引管路径——点击添加节点（仅水平/垂直），点击分集水器连接供回水管。Esc取消。'
        : '点击一个房间开始绘制引管，或拖动分集水器上的连接点调整位置。';
    default:
      return null;
  }
}

export default function TopToolbar() {
  const manifold = useStore((state) => state.manifold);
  const hint = useToolHint();

  return (
    <div className="top-toolbar">
      <Toolbar />
      <div className="top-toolbar-status">
        {hint && <span className="toolbar-hint">{hint}</span>}
        {manifold && <span className="toolbar-hint success"><Check /> 分集水器已放置</span>}
      </div>
    </div>
  );
}

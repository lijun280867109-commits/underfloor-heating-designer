import { type ChangeEvent, useRef, useState } from 'react';
import DxfParser from 'dxf-parser';
import {
    Check,
    FolderOpen,
    Home,
    Flame,
    Building2,
    Map,
    Move,
    RefreshCw,
    Ruler,
    Save,
    Settings,
    Thermometer,
    Trash2,
    Upload,
} from 'lucide-react';
import { parseDxfEntities, placeDxfInDrawing } from '../../geometry/dxfHelpers';
import { mmToMeters } from '../../geometry/length';
import { UFH_STORE_STORAGE_KEY, partializeStoreState, useStore } from '../../state/store';
import HeatTab from './HeatTab';
import RoomLoadPanel from './RoomLoadPanel';
import { COMMON_PIPE_OUTER_DIAMETERS_MM, PIPE_WALL_MM } from '../../geometry/heat';
import ZoneCard from './ZoneCard';

const PROJECT_STORAGE_VERSION = 0;

const IMAGE_ACCEPT = '.png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif';

const ASSUMED_IMAGE_MM_PER_PIXEL = 10;

export default function SidePanel() {
    const {
        zones,
        selectedZoneId,
        manifold,
        calibration,
        maxCircuitLengthM,
        defaultSpacingMm,
        pipeOuterDiameterMm,
        setPipeOuterDiameter,
        background,
        toolMode,
        setToolMode,
        setBackground,
        setMaxCircuitLength,
        setDefaultSpacing,
        setManifoldRotation,
        startCalibration,
        finishCalibration,
        cancelCalibration,
        fitViewToContent,
    } = useStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const projectFileInputRef = useRef<HTMLInputElement>(null);
    const [calibrationDistance, setCalibrationDistance] = useState('1000');
    const [importError, setImportError] = useState<string | null>(null);
    const [projectError, setProjectError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'setup' | 'zones' | 'heat' | 'load'>('load');

    const handleSaveProject = () => {
        const persisted = partializeStoreState(useStore.getState());
        const blob = new Blob([JSON.stringify(persisted, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ufh-design-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoadProjectFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        setProjectError(null);

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            try {
                const parsed = JSON.parse(loadEvent.target?.result as string);
                if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.zones)) {
                    setProjectError('Not a valid UFH Designer project file.');
                    return;
                }
                if (!window.confirm('Loading a project replaces your current work. Continue?')) return;
                localStorage.setItem(
                    UFH_STORE_STORAGE_KEY,
                    JSON.stringify({ state: parsed, version: PROJECT_STORAGE_VERSION }),
                );
                window.location.reload();
            } catch (error) {
                setProjectError('Failed to load project file. Make sure it is a valid exported UFH Designer file.');
                console.error(error);
            }
        };
        reader.onerror = () => setProjectError('Failed to read file.');
        reader.readAsText(file);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImportError(null);

        const isDxf = file.name.toLowerCase().endsWith('.dxf');

        if (isDxf) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                try {
                    const content = loadEvent.target?.result as string;
                    const parser = new DxfParser();
                    const dxf = parser.parseSync(content);
                    const entities = parseDxfEntities(dxf as { entities: unknown[] });
                    if (entities.length === 0) {
                        setImportError('DXF parsed but contains no supported entities (LINE, POLYLINE, CIRCLE, ARC). Try importing an image instead.');
                        return;
                    }
                    setBackground({
                        kind: 'dxf',
                        entities,
                        transform: placeDxfInDrawing(entities),
                    });
                    fitViewToContent(
                        Math.max(window.innerWidth - 320, 320),
                        window.innerHeight - 44,
                    );
                } catch (error) {
                    setImportError('Failed to parse DXF. Make sure it is a valid AutoCAD DXF file, or try importing an image.');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        } else {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const src = loadEvent.target?.result;
                if (typeof src !== 'string') {
                    setImportError('Failed to read image file.');
                    return;
                }

                const img = new window.Image();
                img.onload = () => {
                    setBackground({
                        kind: 'image',
                        src,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                        x: 0,
                        y: 0,
                        mmPerPixel: ASSUMED_IMAGE_MM_PER_PIXEL,
                    });
                    fitViewToContent(
                        Math.max(window.innerWidth - 320, 320),
                        window.innerHeight - 44,
                    );
                };
                img.onerror = () => {
                    setImportError('Failed to load image file.');
                };
                img.src = src;
            };
            reader.onerror = () => {
                setImportError('Failed to read image file.');
            };
            reader.readAsDataURL(file);
        }

        event.target.value = '';
    };

    const totalGrand = zones.reduce(
        (sum, zone) => sum + mmToMeters(zone.spiralLengthMm + zone.leaderLengthMm),
        0,
    );

    const bgStatus = background === null
        ? null
        : background.kind === 'dxf'
            ? `DXF loaded – ${background.entities.length} entities`
            : `Image loaded – ${background.naturalWidth}×${background.naturalHeight} px`;

    return (
        <div className="side-panel">
            <div className="panel-header">
                <h1><Thermometer /> 李军暖通</h1>
            </div>

            <div className="side-panel-tabs">
                <button
                    className={`side-panel-tab ${activeTab === 'load' ? 'active' : ''}`}
                    onClick={() => setActiveTab('load')}
                >
                    <Building2 /> 负荷
                </button>
                <button
                    className={`side-panel-tab ${activeTab === 'setup' ? 'active' : ''}`}
                    onClick={() => setActiveTab('setup')}
                >
                    <Settings /> 设置
                </button>
                <button
                    className={`side-panel-tab ${activeTab === 'zones' ? 'active' : ''}`}
                    onClick={() => setActiveTab('zones')}
                >
                    <Home /> 管路 {zones.length > 0 && <><br/><span className="zone-count">{zones.length}</span></>}
                </button>
                <button
                    className={`side-panel-tab ${activeTab === 'heat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('heat')}
                >
                    <Flame /> 水力
                </button>
            </div>

            {activeTab === 'load' && <RoomLoadPanel />}

            {activeTab === 'setup' && (
                <div className="side-panel-tab-content">
                    <section className="panel-section">
                        <h2><Save /> 项目</h2>
                        <input
                            ref={projectFileInputRef}
                            type="file"
                            accept=".json,application/json"
                            onChange={handleLoadProjectFile}
                            style={{ display: 'none' }}
                        />
                        <button className="btn" onClick={handleSaveProject}>
                            <Save /> 保存项目
                        </button>
                        <button
                            className="btn btn-secondary"
                            style={{ marginTop: '4px' }}
                            onClick={() => projectFileInputRef.current?.click()}
                        >
                            <FolderOpen /> 加载项目
                        </button>
                        {projectError && <p className="error">{projectError}</p>}
                    </section>

                    <section className="panel-section">
                        <h2><Map /> 户型图</h2>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={`.dxf,${IMAGE_ACCEPT}`}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <button className="btn" onClick={() => fileInputRef.current?.click()}>
                            {background ? <><RefreshCw /> 重新导入户型图</> : <><Upload /> 导入DXF或图片</>}
                        </button>
                        <p className="info" style={{ fontSize: '0.75rem' }}>
                            支持 DXF, PNG, JPG, WEBP, GIF
                        </p>
                        {importError && <p className="error">{importError}</p>}
                        {bgStatus && <p className="info">{bgStatus}</p>}
                        {background && (
                            <>
                                <button
                                    className={`btn ${toolMode === 'panBackground' ? 'active' : ''}`}
                                    style={{ marginTop: '4px' }}
                                    onClick={() =>
                                        setToolMode(toolMode === 'panBackground' ? 'select' : 'panBackground')
                                    }
                                >
                                    <Move /> {toolMode === 'panBackground' ? '完成移动' : '移动户型图'}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    style={{ marginTop: '4px' }}
                                    onClick={() => setBackground(null)}
                                >
                                    <Trash2 /> 清除背景
                                </button>
                            </>
                        )}
                    </section>

                    <section className="panel-section">
                        <h2><Ruler /> 比例尺校准</h2>
                        <p className="info">
                            点击户型图上两个已知距离的点，输入实际距离。
                        </p>
                        {!background && (
                            <p className="info">请先导入户型图。</p>
                        )}
                        {!calibration.active ? (
                            <button className="btn" onClick={startCalibration} disabled={!background}>
                                <Ruler /> 开始校准
                            </button>
                        ) : (
                            <div>
                                <p className="info">
                                    {!calibration.point1
                                        ? '在图上点第一个点'
                                        : !calibration.point2
                                            ? '在图上点第二个点'
                                            : '输入两点实际距离'}
                                </p>
                                {calibration.point2 && (
                                    <div className="calibration-input">
                                        <input
                                            type="number"
                                            step="10"
                                            min="1"
                                            value={calibrationDistance}
                                            onChange={(event) => setCalibrationDistance(event.target.value)}
                                            placeholder="实际距离 (mm)"
                                        />
                                        <span>mm</span>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => finishCalibration(Number(calibrationDistance))}
                                        >
                                            <Check /> 应用
                                        </button>
                                    </div>
                                )}
                                <button className="btn btn-secondary" onClick={cancelCalibration}>
                                    取消
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="panel-section">
                        <h2><Settings /> 默认设置</h2>
                        <div className="setting-row">
                            <label>单路最大长度:</label>
                            <input
                                type="number"
                                min={10}
                                max={500}
                                value={maxCircuitLengthM}
                                onChange={(event) => setMaxCircuitLength(Number(event.target.value))}
                            />
                            <span>m</span>
                        </div>
                        <div className="setting-row">
                            <label>默认间距:</label>
                            <input
                                type="number"
                                min={50}
                                max={500}
                                value={defaultSpacingMm}
                                onChange={(event) => setDefaultSpacing(Number(event.target.value))}
                            />
                            <span>mm</span>
                        </div>
                        <div className="setting-row">
                            <label>管径:</label>
                            <select
                                className="zone-select"
                                value={pipeOuterDiameterMm}
                                onChange={(event) => setPipeOuterDiameter(Number(event.target.value))}
                            >
                                {COMMON_PIPE_OUTER_DIAMETERS_MM.map((od) => (
                                    <option key={od} value={od}>
                                        {od}×{PIPE_WALL_MM} mm
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="setting-row">
                            <label>分集水器角度:</label>
                            <input
                                type="number"
                                step={1}
                                value={manifold?.rotationDeg ?? 0}
                                disabled={!manifold}
                                onChange={(event) => {
                                    const next = Number(event.target.value);
                                    if (Number.isFinite(next)) {
                                        setManifoldRotation(next);
                                    }
                                }}
                            />
                            <span>deg</span>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'zones' && (
                <div className="side-panel-tab-content">
                    <section className="panel-section">
                        {zones.length === 0 && (
                            <p className="info">还没有房间。用"多边形房间"或"矩形房间"创建。</p>
                        )}
                        <div className="zone-list">
                            {zones.map((zone) => (
                                <ZoneCard
                                    key={zone.id}
                                    zone={zone}
                                    isSelected={zone.id === selectedZoneId}
                                    maxCircuitLengthM={maxCircuitLengthM}
                                />
                            ))}
                        </div>

                        {zones.length > 0 && (
                            <div className="grand-total">
                                <strong>管路总长: {totalGrand.toFixed(1)} m</strong>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {activeTab === 'heat' && <HeatTab />}
        </div>
    );
}

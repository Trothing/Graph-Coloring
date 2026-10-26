# Layouts

App shell: left Sidebar (280px fixed) + main column (GraphCanvas fills, bottom bar 192px with Statistics + Log). Single page, no router.

### `src/App.tsx`

```tsx
import React, { useState, useCallback } from 'react';
import { GraphCanvas } from './components/GraphCanvas/GraphCanvas';
import { Sidebar } from './components/Sidebar/Sidebar';
import { AlgorithmStatistics } from './components/AlgorithmStatistics/AlgorithmStatistics';
import { LogPanel } from './components/LogPanel/LogPanel';
import { useGraph } from './hooks/useGraph';
import { useColoring } from './hooks/useColoring';
import type { AlgorithmType } from './domain/types';
import styles from './App.module.scss';

const App: React.FC = () => {
  const [interactionMode, setInteractionMode] = useState<'add-vertex' | 'add-edge' | 'select'>('add-vertex');

  const {
    graph, result, setResult,
    addVertex, addEdge, removeVertex, removeEdge,
    generateRandom, clearGraph,
    importJSON, exportJSON, exportJSONWithResult,
  } = useGraph();

  const {
    isRunning, logs, selectedAlgorithm,
    setAlgorithm, runColoring, validateColoring,
    clearLogs, addLog, cancelColoring,
  } = useColoring();

  const handleRun = useCallback(async () => {
    const res = await runColoring(graph);
    if (res) setResult(res);
  }, [graph, runColoring, setResult]);

  const handleValidate = useCallback(() => {
    if (!result) { addLog('Спочатку запустіть алгоритм', 'warn'); return; }
    validateColoring(graph, result);
  }, [result, graph, validateColoring, addLog]);

  const handleImport = useCallback((json: string) => {
    try {
      cancelColoring();
      const restored = importJSON(json);
      if (restored) {
        addLog(`Граф імпортовано з результатом (χ = ${restored.chromaticNumber})`, 'success');
      } else {
        addLog('Граф успішно імпортовано', 'success');
      }
    } catch (e) {
      addLog(`Помилка імпорту: ${String(e)}`, 'error');
    }
  }, [importJSON, addLog, cancelColoring]);

  const handleAlgorithmChange = useCallback((type: AlgorithmType) => {
    setAlgorithm(type);
    setResult(null);
  }, [setAlgorithm, setResult]);

  const handleGenerate = useCallback((count: number, density: number) => {
    cancelColoring();
    generateRandom(count, density);
    addLog(`Згенеровано: ${count} вершин, щільність ${Math.round(density * 100)}%`, 'info');
  }, [generateRandom, addLog, cancelColoring]);

  const handleClear = useCallback(() => {
    cancelColoring();
    clearGraph();
    addLog('Граф очищено', 'info');
  }, [clearGraph, addLog, cancelColoring]);

  const handleAddVertex = useCallback((x: number, y: number) => {
    if (isRunning) cancelColoring();
    addVertex(x, y);
  }, [isRunning, cancelColoring, addVertex]);

  const handleAddEdge = useCallback((sourceId: string, targetId: string) => {
    if (isRunning) cancelColoring();
    addEdge(sourceId, targetId);
  }, [isRunning, cancelColoring, addEdge]);

  const handleRemoveVertex = useCallback((id: string) => {
    if (isRunning) cancelColoring();
    removeVertex(id);
  }, [isRunning, cancelColoring, removeVertex]);

  const handleRemoveEdge = useCallback((id: string) => {
    if (isRunning) cancelColoring();
    removeEdge(id);
  }, [isRunning, cancelColoring, removeEdge]);

  return (
      <div className={styles.app}>
        <Sidebar
            interactionMode={interactionMode}
            selectedAlgorithm={selectedAlgorithm}
            isRunning={isRunning}
            vertexCount={graph.vertices.length}
            edgeCount={graph.edges.length}
            hasResult={result !== null}
            onModeChange={setInteractionMode}
            onAlgorithmChange={handleAlgorithmChange}
            onRun={handleRun}
            onClear={handleClear}
            onGenerate={handleGenerate}
            onImport={handleImport}
            onExport={exportJSON}
            onExportWithResult={exportJSONWithResult}
            onValidate={handleValidate}
        />

        <div className={styles.main}>
          <div className={styles.canvasArea}>
            <GraphCanvas
                graph={graph}
                result={result}
                interactionMode={interactionMode}
                onAddVertex={handleAddVertex}
                onAddEdge={handleAddEdge}
                onRemoveVertex={handleRemoveVertex}
                onRemoveEdge={handleRemoveEdge}
            />
          </div>

          <div className={styles.bottomBar}>
            <div className={styles.statsArea}>
              <AlgorithmStatistics
                  result={result}
                  selectedAlgorithm={selectedAlgorithm}
                  vertexCount={graph.vertices.length}
                  edgeCount={graph.edges.length}
              />
            </div>
            <div className={styles.logArea}>
              <LogPanel logs={logs} onClear={clearLogs} />
            </div>
          </div>
        </div>
      </div>
  );
};

export default App;
```

### `src/App.module.scss`

```scss
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500&display=swap');

:root {
  --bg: #0f172a;
  --bg-elevated: #1e293b;
  --bg-surface: #162032;
  --bg-hover: rgba(255, 255, 255, 0.04);
  --bg-active: rgba(37, 99, 235, 0.1);

  --border: #1e293b;
  --border-strong: #334155;
  --border-accent: rgba(37, 99, 235, 0.5);

  --text-1: #f1f5f9;
  --text-2: #94a3b8;
  --text-3: #475569;

  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --accent-dim: rgba(37, 99, 235, 0.12);
  --accent-text: #93c5fd;

  --success: #10b981;
  --success-dim: rgba(16, 185, 129, 0.1);
  --error: #f43f5e;
  --error-dim: rgba(244, 63, 94, 0.1);
  --warn: #f59e0b;
  --warn-dim: rgba(245, 158, 11, 0.1);

  --font-ui: system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, 'SF Mono', 'Fira Code', monospace;

  --radius-sm: 4px;
  --radius: 6px;
  --radius-lg: 8px;

  --ease: 0.15s ease;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { border: none; background: none; cursor: pointer; font: inherit; }

.app {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--text-1);
  line-height: 1.5;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.canvasArea {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-left: 1px solid var(--border);
}

.bottomBar {
  display: flex;
  height: 192px;
  flex-shrink: 0;
  border-top: 1px solid var(--border);
  border-left: 1px solid var(--border);
}

.statsArea {
  flex: 1;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  overflow: hidden;
}

.logArea {
  flex: 1.5;
  min-width: 0;
  overflow: hidden;
}

```

### `src/components/GraphCanvas/GraphCanvas.tsx`

```tsx
import React, { useCallback, useRef, useState, useMemo } from 'react';
import type { Graph, ColoringResult } from '../../domain/types';
import styles from './GraphCanvas.module.scss';

interface GraphCanvasProps {
  graph: Graph;
  result: ColoringResult | null;
  interactionMode: 'add-vertex' | 'add-edge' | 'select';
  onAddVertex: (x: number, y: number) => void;
  onAddEdge: (sourceId: string, targetId: string) => void;
  onRemoveVertex: (id: string) => void;
  onRemoveEdge: (id: string) => void;
}

const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#14b8a6', '#a855f7', '#eab308',
  '#0ea5e9', '#22c55e', '#f43f5e', '#d946ef',
  '#fb923c', '#a3e635', '#38bdf8', '#4ade80',
  '#c084fc', '#fbbf24', '#f87171', '#34d399',
  '#818cf8', '#2dd4bf', '#fb7185', '#a78bfa',
  '#facc15', '#86efac', '#67e8f9', '#fca5a5',
];

const VERTEX_RADIUS = 19;
const UNCOLORED_FILL = '#1e293b';
const UNCOLORED_STROKE = '#334155';

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph, result, interactionMode,
  onAddVertex, onAddEdge, onRemoveVertex, onRemoveEdge,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pendingEdgeSource, setPendingEdgeSource] = useState<string | null>(null);
  const [hoveredVertex, setHoveredVertex] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);

  const getSVGPoint = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (interactionMode !== 'add-vertex') return;
    if ((e.target as SVGElement).closest('[data-vertex]')) return;
    const { x, y } = getSVGPoint(e);
    onAddVertex(x, y);
  }, [interactionMode, getSVGPoint, onAddVertex]);

  const handleVertexClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (interactionMode !== 'add-edge') return;
    if (!pendingEdgeSource) {
      setPendingEdgeSource(id);
    } else if (pendingEdgeSource !== id) {
      onAddEdge(pendingEdgeSource, id);
      setPendingEdgeSource(null);
    } else {
      setPendingEdgeSource(null);
    }
  }, [interactionMode, pendingEdgeSource, onAddEdge]);

  const handleVertexDoubleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (interactionMode === 'select') onRemoveVertex(id);
  }, [interactionMode, onRemoveVertex]);

  const handleEdgeDoubleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (interactionMode === 'select') onRemoveEdge(id);
  }, [interactionMode, onRemoveEdge]);

  const handleMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (interactionMode !== 'select') return;
    e.stopPropagation();
    const { x, y } = getSVGPoint(e);
    const v = graph.vertices.find(v => v.id === id)!;
    setDragging({ id, ox: x - v.x, oy: y - v.y });
  }, [interactionMode, getSVGPoint, graph.vertices]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const { x, y } = getSVGPoint(e);
    const nx = x - dragging.ox, ny = y - dragging.oy;
    const vEl = svgRef.current?.querySelector(`[data-vertex="${dragging.id}"]`);
    if (vEl) {
      vEl.setAttribute('transform', `translate(${nx}, ${ny})`);
      svgRef.current?.querySelectorAll(`[data-edge-src="${dragging.id}"]`)
        ?.forEach(l => { l.setAttribute('x1', String(nx)); l.setAttribute('y1', String(ny)); });
      svgRef.current?.querySelectorAll(`[data-edge-tgt="${dragging.id}"]`)
        ?.forEach(l => { l.setAttribute('x2', String(nx)); l.setAttribute('y2', String(ny)); });
      const v = graph.vertices.find(v => v.id === dragging.id)!;
      v.x = nx; v.y = ny;
    }
  }, [dragging, getSVGPoint, graph.vertices]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  const vertexFill = useCallback((id: string): string => {
    if (!result?.success) return UNCOLORED_FILL;
    const idx = result.coloring.get(id);
    return idx !== undefined ? PALETTE[idx % PALETTE.length] + '26' : UNCOLORED_FILL;
  }, [result]);

  const vertexStroke = useCallback((id: string): string => {
    if (!result?.success) return UNCOLORED_STROKE;
    const idx = result.coloring.get(id);
    return idx !== undefined ? PALETTE[idx % PALETTE.length] : UNCOLORED_STROKE;
  }, [result]);

  const edgeConflicts = useMemo(() => {
    if (!result) return new Set<string>();
    const s = new Set<string>();
    for (const e of graph.edges) {
      const sc = result.coloring.get(e.source);
      const tc = result.coloring.get(e.target);
      if (sc !== undefined && sc === tc) s.add(e.id);
    }
    return s;
  }, [result, graph.edges]);

  const cursorStyle =
    interactionMode === 'add-vertex' ? 'crosshair' :
    interactionMode === 'add-edge' ? 'cell' : 'default';

  const badgeText =
    interactionMode === 'add-vertex' ? 'Натисність щоб добавити вершину' :
    interactionMode === 'add-edge'
      ? (pendingEdgeSource ? 'Оберіть ціль' : 'Оберіть джерело')
      : 'Перетягування - рух | Подвійний клік - видалення';

  return (
    <div className={styles.wrapper}>
      <svg
        ref={svgRef}
        className={styles.canvas}
        style={{ cursor: cursorStyle }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
          </pattern>

          <filter id="vtx-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {graph.edges.map(edge => {
          const src = graph.vertices.find(v => v.id === edge.source);
          const tgt = graph.vertices.find(v => v.id === edge.target);
          if (!src || !tgt) return null;
          const isConflict = edgeConflicts.has(edge.id);
          return (
            <line
              key={edge.id}
              data-edge-src={edge.source}
              data-edge-tgt={edge.target}
              x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
              className={`${styles.edge} ${isConflict ? styles.edgeConflict : ''}`}
              onDoubleClick={e => handleEdgeDoubleClick(e, edge.id)}
            />
          );
        })}

        {pendingEdgeSource && (() => {
          const src = graph.vertices.find(v => v.id === pendingEdgeSource);
          return src
            ? <circle cx={src.x} cy={src.y} r={VERTEX_RADIUS + 9} className={styles.pendingRing} />
            : null;
        })()}

        {graph.vertices.map(vertex => {
          const fill = vertexFill(vertex.id);
          const stroke = vertexStroke(vertex.id);
          const isHovered = hoveredVertex === vertex.id;
          const isPending = pendingEdgeSource === vertex.id;

          return (
            <g
              key={vertex.id}
              data-vertex={vertex.id}
              transform={`translate(${vertex.x}, ${vertex.y})`}
              onClick={e => handleVertexClick(e, vertex.id)}
              onDoubleClick={e => handleVertexDoubleClick(e, vertex.id)}
              onMouseDown={e => handleMouseDown(e, vertex.id)}
              onMouseEnter={() => setHoveredVertex(vertex.id)}
              onMouseLeave={() => setHoveredVertex(null)}
              className={styles.vertex}
              style={{ cursor: interactionMode === 'select' ? 'grab' : 'pointer' }}
            >
              {(isHovered || isPending) && (
                <circle
                  r={VERTEX_RADIUS + 6}
                  fill="none"
                  stroke={isPending ? '#2563eb' : stroke}
                  strokeWidth="1.5"
                  opacity={0.4}
                />
              )}

              <circle
                r={VERTEX_RADIUS}
                fill={fill}
                stroke={isPending ? '#2563eb' : stroke}
                strokeWidth={isPending ? 2 : 1.5}
                style={{ filter: 'url(#vtx-shadow)' }}
              />

              <text
                textAnchor="middle"
                dominantBaseline="central"
                className={styles.vertexLabel}
                style={{ fill: stroke === UNCOLORED_STROKE ? 'rgba(255,255,255,0.45)' : stroke }}
              >
                {vertex.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className={styles.modeBadge}>{badgeText}</div>
    </div>
  );
};

```

### `src/components/GraphCanvas/GraphCanvas.module.scss`

```scss
.wrapper {
  padding-top: 10px;
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--bg);
  overflow: hidden;
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
}

.edge {
  stroke: #334155;
  stroke-width: 1.5;
  stroke-linecap: round;
  transition: stroke var(--ease);

  &:hover { stroke: #475569; cursor: pointer; }
}

.edgeConflict {
  stroke: var(--error);
  stroke-width: 2;
  animation: conflictBlink 1.6s ease-in-out infinite;
}

@keyframes conflictBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.pendingRing {
  fill: none;
  stroke: var(--accent);
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
  opacity: 0.7;
  animation: dashSpin 2s linear infinite;
}

@keyframes dashSpin {
  to { stroke-dashoffset: -36; }
}

.vertex {
  transition: opacity var(--ease);
}

.vertexLabel {
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 400;
  fill: rgba(255,255,255,0.8);
  pointer-events: none;
  letter-spacing: 0.02em;
}

.modeBadge {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-family: var(--font-ui);
  color: var(--text-3);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 4px 12px;
  white-space: nowrap;
  pointer-events: none;
  letter-spacing: 0.01em;
}

```


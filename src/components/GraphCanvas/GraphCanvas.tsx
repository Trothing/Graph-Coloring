import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import type { Graph, ColoringResult, InteractionMode } from '../../domain/types';
import { PALETTE, pigmentFor } from '../../domain/palette';
import styles from './GraphCanvas.module.scss';

interface GraphCanvasProps {
  graph: Graph;
  result: ColoringResult | null;
  interactionMode: InteractionMode;
  onAddVertex: (x: number, y: number) => void;
  onAddEdge: (sourceId: string, targetId: string) => void;
  onRemoveVertex: (id: string) => void;
  onRemoveEdge: (id: string) => void;
  onResize: (width: number, height: number) => void;
}

interface Measure {
  width: number;
  height: number;
  /** Root font size in px; vertices and the grid scale with it. */
  unit: number;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph, result, interactionMode,
  onAddVertex, onAddEdge, onRemoveVertex, onRemoveEdge, onResize,
}) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [measure, setMeasure] = useState<Measure | null>(null);
  const [pendingEdgeSource, setPendingEdgeSource] = useState<string | null>(null);
  const [hoveredVertex, setHoveredVertex] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null);

  // The canvas takes whatever room the layout gives it and follows every resize.
  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      const unit = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setMeasure(prev =>
        prev && prev.width === width && prev.height === height && prev.unit === unit
          ? prev
          : { width, height, unit });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const width = measure?.width;
  const height = measure?.height;
  useEffect(() => {
    if (width && height) onResize(width, height);
  }, [width, height, onResize]);

  const unit = measure?.unit ?? 16;
  const radius = unit * 1.35;
  const cell = unit * 1.7;

  const getSVGPoint = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  }, []);

  const clampPoint = useCallback((x: number, y: number) => ({
    x: Math.min(Math.max(x, radius), Math.max((width ?? 0) - radius, radius)),
    y: Math.min(Math.max(y, radius), Math.max((height ?? 0) - radius, radius)),
  }), [radius, width, height]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (interactionMode !== 'add-vertex') return;
    if ((e.target as SVGElement).closest('[data-vertex]')) return;
    const p = getSVGPoint(e);
    const { x, y } = clampPoint(p.x, p.y);
    onAddVertex(x, y);
  }, [interactionMode, getSVGPoint, clampPoint, onAddVertex]);

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
    const p = getSVGPoint(e);
    const { x: nx, y: ny } = clampPoint(p.x - dragging.ox, p.y - dragging.oy);
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
  }, [dragging, getSVGPoint, clampPoint, graph.vertices]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  const colorIndex = useCallback((id: string): number | undefined => {
    if (!result?.success) return undefined;
    return result.coloring.get(id);
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

  const hint =
    interactionMode === 'add-vertex' ? 'Click to add a vertex' :
    interactionMode === 'add-edge'
      ? (pendingEdgeSource ? 'Pick a target vertex' : 'Pick a source vertex')
      : 'Drag to move · double-click to delete';

  return (
    <div className={styles.wrapper}>
      <div className={styles.hintBar} role="status">
        <span className={styles.hintDot} data-mode={interactionMode} />
        {hint}
      </div>

      <div className={styles.surface} ref={surfaceRef}>
        {measure && (
          <svg
            ref={svgRef}
            className={styles.canvas}
            width={measure.width}
            height={measure.height}
            viewBox={`0 0 ${measure.width} ${measure.height}`}
            style={{ cursor: cursorStyle }}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <pattern id="grid-minor" width={cell} height={cell} patternUnits="userSpaceOnUse">
                <path d={`M ${cell} 0 L 0 0 0 ${cell}`} fill="none" stroke="rgba(22,20,26,0.07)" strokeWidth="1" />
              </pattern>
              <pattern id="grid-major" width={cell * 5} height={cell * 5} patternUnits="userSpaceOnUse">
                <rect width={cell * 5} height={cell * 5} fill="url(#grid-minor)" />
                <path d={`M ${cell * 5} 0 L 0 0 0 ${cell * 5}`} fill="none" stroke="rgba(22,20,26,0.13)" strokeWidth="1" />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid-major)" />

            {graph.edges.map(edge => {
              const src = graph.vertices.find(v => v.id === edge.source);
              const tgt = graph.vertices.find(v => v.id === edge.target);
              if (!src || !tgt) return null;
              const isConflict = edgeConflicts.has(edge.id);
              const coords = { x1: src.x, y1: src.y, x2: tgt.x, y2: tgt.y };
              return (
                <g key={edge.id} onDoubleClick={e => handleEdgeDoubleClick(e, edge.id)}>
                  <line
                    data-edge-src={edge.source}
                    data-edge-tgt={edge.target}
                    {...coords}
                    className={`${styles.edge} ${isConflict ? styles.edgeConflict : ''}`}
                    strokeWidth={isConflict ? unit * 0.2 : unit * 0.12}
                  />
                  {/* Wide invisible stroke so thin edges are easy to double-click. */}
                  <line
                    data-edge-src={edge.source}
                    data-edge-tgt={edge.target}
                    {...coords}
                    className={styles.edgeHit}
                    strokeWidth={unit}
                  />
                </g>
              );
            })}

            {pendingEdgeSource && (() => {
              const src = graph.vertices.find(v => v.id === pendingEdgeSource);
              return src
                ? <circle cx={src.x} cy={src.y} r={radius + unit * 0.55} className={styles.pendingRing} />
                : null;
            })()}

            {graph.vertices.map(vertex => {
              const idx = colorIndex(vertex.id);
              const pigment = idx !== undefined ? pigmentFor(idx) : null;
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
                  style={{ cursor: interactionMode === 'select' ? 'grab' : 'pointer' }}
                >
                  <g className={styles.vertexBody}>
                    {(isHovered || isPending) && (
                      <circle
                        r={radius + unit * 0.4}
                        fill="none"
                        stroke={isPending ? 'var(--accent)' : 'var(--ink-1)'}
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                    )}

                    <circle
                      r={radius}
                      fill={pigment ? pigment.fill : 'var(--paper-2)'}
                      stroke="var(--ink-1)"
                      strokeWidth={unit * 0.14}
                    />

                    {idx !== undefined && idx >= PALETTE.length && (
                      <circle
                        r={radius * 0.68}
                        fill="none"
                        stroke={pigment!.ink}
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.8"
                      />
                    )}

                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={styles.vertexLabel}
                      style={{ fill: pigment ? pigment.ink : 'var(--ink-1)', fontSize: unit * 0.82 }}
                    >
                      {vertex.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};

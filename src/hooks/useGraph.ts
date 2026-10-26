import { useState, useCallback, useRef } from 'react';
import type { Graph, ColoringResult } from '../domain/types';
import { GraphService } from '../services/GraphService';

interface UseGraphReturn {
  graph: Graph;
  result: ColoringResult | null;
  setGraph: (g: Graph) => void;
  setResult: (r: ColoringResult | null) => void;
  addVertex: (x: number, y: number) => void;
  addEdge: (sourceId: string, targetId: string) => void;
  removeVertex: (id: string) => void;
  removeEdge: (id: string) => void;
  generateRandom: (count: number, density: number) => void;
  resizeCanvas: (width: number, height: number) => void;
  clearGraph: () => void;
  clearColoring: () => void;
  importJSON: (json: string) => ColoringResult | null;
  exportJSON: () => void;
  exportJSONWithResult: () => void;
}

const FALLBACK_SIZE = { width: 1200, height: 520 };
const FIT_PADDING = 48;

export function useGraph(): UseGraphReturn {
  const [graph, setGraph] = useState<Graph>(GraphService.createEmpty());
  const [result, setResult] = useState<ColoringResult | null>(null);
  const canvasSize = useRef<{ width: number; height: number } | null>(null);

  const addVertex = useCallback((x: number, y: number) => {
    setGraph(prev => GraphService.addVertex(prev, x, y));
    setResult(null);
  }, []);

  const addEdge = useCallback((sourceId: string, targetId: string) => {
    setGraph(prev => GraphService.addEdge(prev, sourceId, targetId));
    setResult(null);
  }, []);

  const removeVertex = useCallback((id: string) => {
    setGraph(prev => GraphService.removeVertex(prev, id));
    setResult(null);
  }, []);
  const removeEdge = useCallback((id: string) => {
    setGraph(prev => GraphService.removeEdge(prev, id))
    setResult(null)
  }, []);

  const generateRandom = useCallback((count: number, density: number) => {
    const { width, height } = canvasSize.current ?? FALLBACK_SIZE;
    setGraph(GraphService.generateRandom(count, density, width, height));
    setResult(null);
  }, []);

  const resizeCanvas = useCallback((width: number, height: number) => {
    const prev = canvasSize.current;
    canvasSize.current = { width, height };
    if (!prev || (prev.width === width && prev.height === height)) return;
    setGraph(g => GraphService.rescale(g, width / prev.width, height / prev.height));
  }, []);

  const clearGraph = useCallback(() => {
    setGraph(GraphService.createEmpty());
    setResult(null);
  }, []);

  const clearColoring = useCallback(() => {
    setResult(null);
  }, []);

  const importJSON = useCallback((json: string): ColoringResult | null => {
    try {
      const { graph: parsed, result: r } = GraphService.fromJSON(json);
      const size = canvasSize.current;
      const g = size ? GraphService.fitInto(parsed, size.width, size.height, FIT_PADDING) : parsed;
      setGraph(g);
      setResult(r);
      return r;
    } catch {
      throw new Error('Invalid graph JSON format');
    }
  }, []);

  const exportJSON = useCallback(() => {
    const json = GraphService.toJSON(graph);
    downloadJSON(json, 'graph.json');
  }, [graph]);

  const exportJSONWithResult = useCallback(() => {
    const json = result
        ? GraphService.toJSONWithResult(graph, result)
        : GraphService.toJSON(graph);
    downloadJSON(json, 'graph_colored.json');
  }, [graph, result]);

  return {
    graph,
    result,
    setGraph,
    setResult,
    addVertex,
    addEdge,
    removeVertex,
    generateRandom,
    resizeCanvas,
    clearGraph,
    clearColoring,
    importJSON,
    exportJSON,
    removeEdge,
    exportJSONWithResult
  };
}

function downloadJSON(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

import type {Graph, Vertex, Edge, ColoringResult} from '../domain/types';

export class GraphService {
  static buildAdjacency(vertices: Vertex[], edges: Edge[]): Map<string, Set<string>> {
    const adj = new Map<string, Set<string>>(vertices.map(v => [v.id, new Set()]));
    for (const e of edges) {
      adj.get(e.source)?.add(e.target);
      adj.get(e.target)?.add(e.source);
    }
    return adj;
  }

  static createEmpty(): Graph {
    return { vertices: [], edges: [], adjacency: new Map() };
  }

  static addVertex(graph: Graph, x: number, y: number): Graph {
    const id = `v${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const label = `${graph.vertices.length + 1}`;
    const vertex: Vertex = { id, x, y, color: null, label };
    const vertices = [...graph.vertices, vertex];
    const edges = graph.edges;
    return { vertices, edges, adjacency: GraphService.buildAdjacency(vertices, edges) };
  }

  static addEdge(graph: Graph, sourceId: string, targetId: string): Graph {
    if (sourceId === targetId) return graph;
    const exists = graph.edges.some(
      e =>
        (e.source === sourceId && e.target === targetId) ||
        (e.source === targetId && e.target === sourceId),
    );
    if (exists) return graph;

    const edge: Edge = {
      id: `e${Date.now()}`,
      source: sourceId,
      target: targetId,
    };
    const edges = [...graph.edges, edge];
    return { vertices: graph.vertices, edges, adjacency: GraphService.buildAdjacency(graph.vertices, edges) };
  }

  static removeVertex(graph: Graph, vertexId: string): Graph {
    const vertices = graph.vertices.filter(v => v.id !== vertexId);
    const edges = graph.edges.filter(e => e.source !== vertexId && e.target !== vertexId);
    return { vertices, edges, adjacency: GraphService.buildAdjacency(vertices, edges) };
  }
  static removeEdge(graph: Graph, edgeId: string): Graph {
    const vertices = graph.vertices;
    const edges = graph.edges.filter(e => e.id !== edgeId);
    return { vertices, edges, adjacency: GraphService.buildAdjacency(vertices, edges) };
  }

  static rescale(graph: Graph, sx: number, sy: number): Graph {
    const vertices = graph.vertices.map(v => ({ ...v, x: v.x * sx, y: v.y * sy }));
    return { vertices, edges: graph.edges, adjacency: graph.adjacency };
  }

  /** Scales a graph so every vertex sits inside the canvas; graphs that already fit are untouched. */
  static fitInto(graph: Graph, canvasW: number, canvasH: number, padding: number): Graph {
    if (graph.vertices.length === 0) return graph;
    const xs = graph.vertices.map(v => v.x);
    const ys = graph.vertices.map(v => v.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const fits = minX >= padding && minY >= padding &&
        maxX <= canvasW - padding && maxY <= canvasH - padding;
    if (fits) return graph;

    const innerW = Math.max(canvasW - padding * 2, 1);
    const innerH = Math.max(canvasH - padding * 2, 1);
    const spreadX = maxX - minX;
    const spreadY = maxY - minY;
    const vertices = graph.vertices.map(v => ({
      ...v,
      x: padding + (spreadX > 0 ? ((v.x - minX) / spreadX) * innerW : innerW / 2),
      y: padding + (spreadY > 0 ? ((v.y - minY) / spreadY) * innerH : innerH / 2),
    }));
    return { vertices, edges: graph.edges, adjacency: graph.adjacency };
  }

  static generateRandom(count: number, density: number, canvasW: number, canvasH: number): Graph {
    const padding = Math.min(56, canvasW / 6, canvasH / 6);
    const innerW = Math.max(canvasW - padding * 2, 1);
    const innerH = Math.max(canvasH - padding * 2, 1);
    // Keep vertices apart so none hides another; relax the gap when the canvas is crowded.
    const minGap = Math.min(72, Math.sqrt((innerW * innerH) / count) * 0.75);

    const placed: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      let best = { x: 0, y: 0 };
      let bestDist = -1;
      for (let attempt = 0; attempt < 40; attempt++) {
        const p = {
          x: padding + Math.random() * innerW,
          y: padding + Math.random() * innerH,
        };
        const nearest = placed.reduce(
            (min, q) => Math.min(min, Math.hypot(p.x - q.x, p.y - q.y)),
            Infinity,
        );
        if (nearest > bestDist) { best = p; bestDist = nearest; }
        if (nearest >= minGap) break;
      }
      placed.push(best);
    }

    const vertices: Vertex[] = placed.map((p, i) => ({
      id: `v${i}`,
      x: p.x,
      y: p.y,
      color: null,
      label: String(i + 1),
    }));

    const edges: Edge[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (Math.random() < density) {
          edges.push({ id: `e${i}_${j}`, source: `v${i}`, target: `v${j}` });
        }
      }
    }

    return { vertices, edges, adjacency: GraphService.buildAdjacency(vertices, edges) };
  }

  static toJSON(graph: Graph): string {
    return JSON.stringify({ vertices: graph.vertices, edges: graph.edges }, null, 2);
  }

  static toJSONWithResult(
      graph: Graph,
      result: import('../domain/types').ColoringResult,
  ): string {
    return JSON.stringify(
        {
          vertices: graph.vertices,
          edges: graph.edges,
          coloring: Object.fromEntries(result.coloring.entries()),
          chromaticNumber: result.chromaticNumber,
          timeMs: result.timeMs,
          comparisons: result.comparisons,
        },
        null,
        2,
    );
  }

  static fromJSON(json: string): {
    graph: Graph;
    result: ColoringResult | null;
  } {
    const parsed = JSON.parse(json) as {
      vertices: Vertex[];
      edges: Edge[];
      coloring?: Record<string, number>;
      chromaticNumber?: number;
      timeMs?: number;
      comparisons?: number;
    };

    const graph: Graph = {
      vertices: parsed.vertices,
      edges: parsed.edges,
      adjacency: GraphService.buildAdjacency(parsed.vertices, parsed.edges),
    };

    if (!parsed.coloring) return { graph, result: null };

    const coloring = new Map<string, number>(Object.entries(parsed.coloring));

    const result: ColoringResult = {
      coloring,
      chromaticNumber: parsed.chromaticNumber ?? new Set(coloring.values()).size,
      timeMs: parsed.timeMs ?? 0,
      comparisons: parsed.comparisons ?? 0,
      success: true,
    };

    return { graph, result };
  }

  static validate(graph: Graph, coloring: Map<string, number>): { valid: boolean; conflicts: string[] } {
    const conflicts: string[] = [];
    for (const e of graph.edges) {
      if (coloring.get(e.source) === coloring.get(e.target) &&
          coloring.get(e.source) !== undefined) {
        conflicts.push(e.id);
      }
    }
    return { valid: conflicts.length === 0, conflicts };
  }

  static degree(graph: Graph, vertexId: string): number {
    return graph.adjacency.get(vertexId)?.size ?? 0;
  }
}



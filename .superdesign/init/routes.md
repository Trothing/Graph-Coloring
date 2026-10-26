# Routes

Single-page app, no router. `src/main.tsx` renders `<App />` (`src/App.tsx`).

| Path | Component | Layout |
|------|-----------|--------|
| `/` | `src/App.tsx` | Sidebar + canvas + bottom bar (stats, log) |

The page is an interactive graph-coloring workbench: build a graph on an SVG canvas (add vertex / add edge / select+drag+delete), pick one of 3 algorithms (Greedy, Backtracking MRV, Backtracking Degree), run it in a Web Worker, see coloured vertices, chromatic number, time, comparisons, colour legend, and an event log. Random graph generator (3-50 vertices, density 5-90%), JSON import/export, coloring validation.

Known issue: `src/hooks/useGraph.ts` hardcodes `CANVAS_W = 1200`, `CANVAS_H = 520` for random generation, so graphs do not adapt to the real canvas size.

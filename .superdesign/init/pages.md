# Pages

## / (Graph Coloring workbench)
Entry: `src/App.tsx`
Dependencies:
- `src/App.module.scss` (also defines :root design tokens)
- `src/components/Sidebar/Sidebar.tsx` (+ `Sidebar.module.scss`)
  - `src/services/ColoringContext.ts`
- `src/components/GraphCanvas/GraphCanvas.tsx` (+ `GraphCanvas.module.scss`)
  - `src/domain/types.ts`
- `src/components/AlgorithmStatistics/AlgorithmStatistics.tsx` (+ `.module.scss`)
  - `src/services/ColoringContext.ts`
- `src/components/LogPanel/LogPanel.tsx` (+ `.module.scss`)
- `src/hooks/useGraph.ts` (hardcoded canvas 1200x520 for random graph)
  - `src/services/GraphService.ts`
- `src/hooks/useColoring.ts`
  - `src/workers/coloring.worker.ts`
  - `src/services/algorithms/*`

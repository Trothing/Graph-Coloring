# Extractable components

## Sidebar
- Source: `src/components/Sidebar/Sidebar.tsx`
- Category: layout
- Description: Left control panel: title, vertex/edge counters, mode switch, algorithm list, run/validate/clear, random graph sliders, JSON import/export
- Extractable props: interactionMode (string, default: "add-vertex"), selectedAlgorithm (string, default: "greedy"), isRunning (boolean, default: false)
- Hardcoded: labels, icons, all CSS

## StatsPanel
- Source: `src/components/AlgorithmStatistics/AlgorithmStatistics.tsx`
- Category: basic
- Description: Result metrics (chromatic number, time, vertices, edges, comparisons), status, colour legend
- Extractable props: none required
- Hardcoded: labels, CSS

## LogPanel
- Source: `src/components/LogPanel/LogPanel.tsx`
- Category: basic
- Description: Timestamped event log with clear button
- Extractable props: none required
- Hardcoded: labels, CSS

import React, { useState, useCallback } from 'react';
import { GraphCanvas } from './components/GraphCanvas/GraphCanvas';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ToolDock } from './components/ToolDock/ToolDock';
import { ToolsPanel } from './components/ToolsPanel/ToolsPanel';
import { AlgorithmStatistics } from './components/AlgorithmStatistics/AlgorithmStatistics';
import { LogPanel } from './components/LogPanel/LogPanel';
import { useGraph } from './hooks/useGraph';
import { useColoring } from './hooks/useColoring';
import type { AlgorithmType, InteractionMode } from './domain/types';
import styles from './App.module.scss';

const App: React.FC = () => {
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('add-vertex');

  const {
    graph, result, setResult,
    addVertex, addEdge, removeVertex, removeEdge,
    generateRandom, resizeCanvas, clearGraph,
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
    if (!result) { addLog('Run an algorithm first', 'warn'); return; }
    validateColoring(graph, result);
  }, [result, graph, validateColoring, addLog]);

  const handleImport = useCallback((json: string) => {
    try {
      cancelColoring();
      const restored = importJSON(json);
      if (restored) {
        addLog(`Graph imported with a coloring (χ = ${restored.chromaticNumber})`, 'success');
      } else {
        addLog('Graph imported', 'success');
      }
    } catch (e) {
      addLog(`Import failed: ${String(e)}`, 'error');
    }
  }, [importJSON, addLog, cancelColoring]);

  const handleAlgorithmChange = useCallback((type: AlgorithmType) => {
    setAlgorithm(type);
    setResult(null);
  }, [setAlgorithm, setResult]);

  const handleGenerate = useCallback((count: number, density: number) => {
    cancelColoring();
    generateRandom(count, density);
    addLog(`Generated ${count} vertices, density ${Math.round(density * 100)}%`, 'info');
  }, [generateRandom, addLog, cancelColoring]);

  const handleClear = useCallback(() => {
    cancelColoring();
    clearGraph();
    addLog('Graph cleared', 'info');
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
      <header className={styles.header}>
        <h1 className={styles.title}>Graph Coloring</h1>
        <div className={styles.counters}>
          <div className={styles.counter}><strong>{graph.vertices.length}</strong><span>Vertices</span></div>
          <div className={styles.counter}><strong>{graph.edges.length}</strong><span>Edges</span></div>
        </div>
        <span className={styles.tagline}>Compare 3 coloring algorithms</span>
      </header>

      <div className={styles.dock}>
        <ToolDock
          interactionMode={interactionMode}
          onModeChange={setInteractionMode}
          onClear={handleClear}
        />
      </div>

      <main className={styles.stage}>
        <GraphCanvas
          graph={graph}
          result={result}
          interactionMode={interactionMode}
          onAddVertex={handleAddVertex}
          onAddEdge={handleAddEdge}
          onRemoveVertex={handleRemoveVertex}
          onRemoveEdge={handleRemoveEdge}
          onResize={resizeCanvas}
        />
      </main>

      <div className={styles.log}>
        <LogPanel logs={logs} onClear={clearLogs} />
      </div>

      <aside className={styles.side}>
        <Sidebar
          selectedAlgorithm={selectedAlgorithm}
          isRunning={isRunning}
          onAlgorithmChange={handleAlgorithmChange}
          onRun={handleRun}
          onValidate={handleValidate}
        />
        <AlgorithmStatistics result={result} selectedAlgorithm={selectedAlgorithm} />
        <ToolsPanel
          hasResult={result !== null}
          onGenerate={handleGenerate}
          onImport={handleImport}
          onExport={exportJSON}
          onExportWithResult={exportJSONWithResult}
        />
      </aside>
    </div>
  );
};

export default App;

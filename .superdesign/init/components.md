# Shared UI components

Framework: React 19 + TypeScript + Vite. Styling: SCSS Modules (no Tailwind, no component library). All components are custom. There is no ui/ primitive folder; panels are feature components.

### `src/components/Sidebar/Sidebar.tsx`

```tsx
import React, { useRef, useState } from 'react';
import type { AlgorithmType } from '../../domain/types';
import { ColoringContext } from '../../services/ColoringContext';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  interactionMode: 'add-vertex' | 'add-edge' | 'select';
  selectedAlgorithm: AlgorithmType;
  isRunning: boolean;
  vertexCount: number;
  edgeCount: number;
  hasResult: boolean;
  onModeChange: (mode: 'add-vertex' | 'add-edge' | 'select') => void;
  onAlgorithmChange: (type: AlgorithmType) => void;
  onRun: () => void;
  onClear: () => void;
  onGenerate: (count: number, density: number) => void;
  onImport: (json: string) => void;
  onExport: () => void;
  onExportWithResult: () => void;
  onValidate: () => void;
}

const ALGORITHMS: { value: AlgorithmType; label: string; badge: string }[] = [
  { value: 'greedy', label: 'Greedy', badge: 'Швидкий' },
  { value: 'backtracking-mrv', label: 'Backtracking MRV', badge: 'Евристика 1' },
  { value: 'backtracking-degree', label: 'Backtracking Degree', badge: 'Евристика 2' },
];

const MODES: { value: SidebarProps['interactionMode']; label: string; icon: string }[] = [
  { value: 'add-vertex', label: 'Вершина', icon: '☉' },
  { value: 'add-edge', label: 'Ребро', icon: '↔' },
  { value: 'select', label: 'Вибір', icon: '𖤂' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  interactionMode, selectedAlgorithm, isRunning,
  vertexCount, edgeCount, hasResult,
  onModeChange, onAlgorithmChange, onRun, onClear,
  onGenerate, onImport, onExport, onExportWithResult, onValidate,
}) => {
  const [genCount, setGenCount] = useState(10);
  const [genDensity, setGenDensity] = useState(0.4);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onImport(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  const strategyDesc = ColoringContext.getByType(selectedAlgorithm).description;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.logoText}>Graph Coloring</span>
      </div>

      <div className={styles.statsStrip}>
        <div className={styles.stat}>
          <span className={styles.statVal}>{vertexCount}</span>
          <span className={styles.statLbl}>Вершин</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statVal}>{edgeCount}</span>
          <span className={styles.statLbl}>Ребр</span>
        </div>
      </div>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>Режим</p>
        <div className={styles.modeGroup}>
          {MODES.map(m => (
            <button
              key={m.value}
              className={`${styles.modeBtn} ${interactionMode === m.value ? styles.active : ''}`}
              onClick={() => onModeChange(m.value)}
            >
              <span className={styles.modeIcon}>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>Алгоритм</p>
        <div className={styles.algoList}>
          {ALGORITHMS.map(a => (
            <button
              key={a.value}
              className={`${styles.algoBtn} ${selectedAlgorithm === a.value ? styles.active : ''}`}
              onClick={() => onAlgorithmChange(a.value)}
            >
              <span className={styles.algoLabel}>{a.label}</span>
              <span className={styles.algoBadge}>{a.badge}</span>
            </button>
          ))}
        </div>
        <p className={styles.algoDesc}>{strategyDesc}</p>
      </section>

      <section className={styles.section}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onRun}
          disabled={isRunning}
        >
          {isRunning
            ? <><span className={styles.spinner} />Працює…</>
            : 'Запустити Алгоритм'}
        </button>
        <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onValidate}>
          Перевірити розфарбування
        </button>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onClear}>
          Очистити граф
        </button>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>Рандомний граф</p>

        <div className={styles.sliderLabel}>
          <span>Вершини</span>
          <strong>{genCount}</strong>
        </div>
        <input
          type="range" min={3} max={50} value={genCount}
          onChange={e => setGenCount(+e.target.value)}
          className={styles.slider}
        />

        <div className={styles.sliderLabel} style={{ marginTop: 6 }}>
          <span>Щільність</span>
          <strong>{Math.round(genDensity * 100)}%</strong>
        </div>
        <input
          type="range" min={0.05} max={0.9} step={0.05} value={genDensity}
          onChange={e => setGenDensity(+e.target.value)}
          className={styles.slider}
        />

        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          style={{ marginTop: 6 }}
          onClick={() => onGenerate(genCount, genDensity)}
        >
          Згенерувати
        </button>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>JSON</p>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => fileRef.current?.click()}>
          Імпорт
        </button>
        <div className={styles.row}>
          <button
            className={`${styles.btn} ${styles.btnGhost} ${styles.half}`}
            onClick={onExport}
            title="Export graph without coloring"
          >
            Експорт
          </button>
          <button
            className={`${styles.btn} ${styles.btnGhost} ${styles.half} ${!hasResult ? styles.disabled : ''}`}
            onClick={onExportWithResult}
            disabled={!hasResult}
            title={hasResult ? 'Export with coloring result' : 'Run algorithm first'}
          >
            + Кольори
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileImport}
        />
      </section>
    </aside>
  );
};

```

### `src/components/Sidebar/Sidebar.module.scss`

```scss
.sidebar {
  display: flex;
  flex-direction: column;
  width: 280px;
  flex-shrink: 0;
  height: 100%;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 2px; }
}

.header {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 14px;
  height: 48px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
}

.logoText {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.01em;
}

.statsStrip {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  gap: 1px;
}

.statVal {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  color: var(--text-1);
  line-height: 1;
}

.statLbl {
  font-size: 10px;
  color: var(--text-3);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.statDivider {
  background: var(--border);
  align-self: stretch;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 12px 14px;
  border-bottom: 1px solid var(--border);

  &:last-child { border-bottom: none; }
}

.sectionLabel {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-3);
  padding: 0 2px;
  margin-bottom: 4px;
}

.modeGroup {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  padding: 2px;
  background: var(--bg-elevated);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.modeBtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 7px 4px;
  border-radius: 3px;
  font-size: 11px;
  color: var(--text-2);
  transition: background var(--ease), color var(--ease);

  &:hover { color: var(--text-1); background: var(--bg-hover); }

  &.active {
    background: var(--bg-surface);
    color: var(--text-1);
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
}

.modeIcon {
  font-size: 14px;
  line-height: 1;
}

.algoList {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.algoBtn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 9px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  transition: background var(--ease), border-color var(--ease);

  &:hover { background: var(--bg-hover); }

  &.active {
    background: var(--accent-dim);
    border-color: var(--border-accent);
  }
}

.algoLabel {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-1);

  .active & { color: var(--accent-text); }
}

.algoBadge {
  font-size: 10px;
  color: var(--text-3);
  padding: 1px 6px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 99px;
  font-weight: 500;
  line-height: 1.6;

  .active & {
    background: var(--accent-dim);
    border-color: var(--border-accent);
    color: var(--accent-text);
  }
}

.algoDesc {
  font-size: 11px;
  line-height: 1.55;
  color: var(--text-3);
  padding: 2px 1px 0;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  transition: background var(--ease), border-color var(--ease), color var(--ease), opacity var(--ease);

  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.btnPrimary {
  background: var(--accent);
  color: #fff;

  &:hover:not(:disabled) { background: var(--accent-hover); }
}

.btnSecondary {
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  color: var(--text-1);

  &:hover { background: var(--bg-hover); border-color: #475569; }
}

.btnGhost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-2);

  &:hover { background: var(--bg-hover); color: var(--text-1); border-color: var(--border-strong); }
}

.spinner {
  width: 12px;
  height: 12px;
  border: 1.5px solid rgba(255,255,255,0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

.sliderLabel {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 12px;
  color: var(--text-2);
  margin-bottom: 2px;

  strong {
    font-family: var(--font-mono);
    font-weight: 400;
    font-size: 11.5px;
    color: var(--text-1);
  }
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 3px;
  background: var(--border-strong);
  border-radius: 99px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--text-1);
    border: 2px solid var(--bg-surface);
    cursor: pointer;
    transition: background var(--ease);

    &:hover { background: var(--accent-text); }
  }
}

.row {
  display: flex;
  gap: 5px;
}

.half { flex: 1; }

.disabled { opacity: 0.35; pointer-events: none; }

```

### `src/components/AlgorithmStatistics/AlgorithmStatistics.tsx`

```tsx
import React from 'react';
import type { ColoringResult, AlgorithmType } from '../../domain/types';
import { ColoringContext } from '../../services/ColoringContext';
import styles from './AlgorithmStatistics.module.scss';

interface AlgorithmStatisticsProps {
  result: ColoringResult | null;
  selectedAlgorithm: AlgorithmType;
  vertexCount: number;
  edgeCount: number;
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

function formatComparisons(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const AlgorithmStatistics: React.FC<AlgorithmStatisticsProps> = ({
                                                                          result,
                                                                          selectedAlgorithm,
                                                                          vertexCount,
                                                                          edgeCount,
                                                                        }) => {
  const strategyName = ColoringContext.getByType(selectedAlgorithm).name;

  const usedColors = result?.success
      ? Array.from(new Set(result.coloring.values())).sort((a, b) => a - b)
      : [];

  const colorGroups = usedColors.map(c => ({
    colorIdx: c,
    count: [...result!.coloring.values()].filter(v => v === c).length,
  }));

  return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>Статистика</span>
          <span className={styles.algoTag}>{strategyName}</span>
        </div>

        <div className={styles.body}>
          {!result ? (
              <span className={styles.empty}>Запустіть алгоритм для перегляду результатів</span>
          ) : (
              <>
                <div className={styles.metrics}>
                  <div className={styles.metric}>
                <span
                    className={styles.metricValue}
                    style={{ color: result.success ? 'var(--success)' : 'var(--error)' }}
                >
                  {result.success ? result.chromaticNumber : '—'}
                </span>
                    <span className={styles.metricLabel}>Хром. число</span>
                  </div>

                  <div className={styles.metric}>
                    <span className={styles.metricValue}>{result.timeMs.toFixed(2)}</span>
                    <span className={styles.metricLabel}>Час (мс)</span>
                  </div>

                  <div className={styles.metric}>
                    <span className={styles.metricValue}>{vertexCount}</span>
                    <span className={styles.metricLabel}>Вершин</span>
                  </div>

                  <div className={styles.metric}>
                    <span className={styles.metricValue}>{edgeCount}</span>
                    <span className={styles.metricLabel}>Ребер</span>
                  </div>
                </div>

                <div className={styles.metricsWide}>
                  <div className={styles.metric}>
                <span
                    className={styles.metricValue}
                    title={result.comparisons !== undefined ? String(result.comparisons) : '—'}
                >
                  {result.comparisons !== undefined ? formatComparisons(result.comparisons) : '—'}
                </span>
                    <span className={styles.metricLabel}>Порівнянь</span>
                  </div>
                </div>

                <div className={`${styles.status} ${result.success ? styles.statusOk : styles.statusFail}`}>
                  {result.success ? 'Розфарбовування знайдено' : 'Розв\'язок не знайдено'}
                </div>

                {result.success && colorGroups.length > 0 && (
                    <div className={styles.legendContainer}>
                      <span className={styles.legendTitle}>Розподіл кольорів по вершинах:</span>
                      <div className={styles.legend}>
                        {colorGroups.map(({ colorIdx, count }) => (
                            <div key={colorIdx} className={styles.legendItem}>
                              <div className={styles.legendColorBlock}>
                        <span
                            className={styles.legendDot}
                            style={{ background: PALETTE[colorIdx % PALETTE.length] }}
                        />
                                <span className={styles.legendText}>Колір {colorIdx + 1}</span>
                              </div>
                              <span className={styles.legendCount} title={`Кількість вершин: ${count}`}>
                        {count}
                      </span>
                            </div>
                        ))}
                      </div>
                    </div>
                )}
              </>
          )}
        </div>
      </div>
  );
};
```

### `src/components/AlgorithmStatistics/AlgorithmStatistics.module.scss`

```scss
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-surface);
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 36px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
}

.headerTitle {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-3);
  flex: 1;
}

.algoTag {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 400;
  color: var(--accent-text);
  background: var(--accent-dim);
  border: 1px solid var(--border-accent);
  border-radius: 99px;
  padding: 1px 8px;
  line-height: 1.6;
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 2px; }
}

.empty {
  font-size: 12px;
  color: var(--text-3);
  margin: auto 0;
  text-align: center;
  padding: 12px 0;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.metricsWide {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 4px;
  background: var(--bg-elevated);
}

.metricValue {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 500;
  color: var(--text-1);
  line-height: 1;
  letter-spacing: -0.02em;
}

.metricLabel {
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-3);
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid;
  flex-shrink: 0;
}

.statusOk {
  color: var(--success);
  background: var(--success-dim);
  border-color: rgba(16, 185, 129, 0.25);
}

.statusFail {
  color: var(--error);
  background: var(--error-dim);
  border-color: rgba(244, 63, 94, 0.25);
}

.legendContainer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.legendTitle {
  font-size: 11px;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.legendItem {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-strong);
  padding: 4px 6px 4px 8px;
  border-radius: var(--radius-sm);
}

.legendColorBlock {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legendDot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.legendText {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-1);
}

.legendCount {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--accent-text);
  background: var(--bg);
  border: 1px solid var(--border);
  padding: 1px 6px;
  border-radius: 3px;
  min-width: 24px;
  text-align: center;
}
```

### `src/components/LogPanel/LogPanel.tsx`

```tsx
import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../../domain/types';
import styles from './LogPanel.module.scss';

interface LogPanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

const TYPE_ICONS: Record<LogEntry['type'], string> = {
  info: '›',
  success: '✓',
  error: '✕',
  warn: '⚠',
};

export const LogPanel: React.FC<LogPanelProps> = ({ logs, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const fmt = (ts: number) =>
    new Date(ts).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Лог</span>
        <span className={styles.count}>{logs.length}</span>
        <button className={styles.clearBtn} onClick={onClear}>Очистити</button>
      </div>
      <div className={styles.body}>
        {logs.length === 0 && (
          <span className={styles.empty}>Поки що нічого...</span>
        )}
        {logs.map(entry => (
          <div key={entry.id} className={`${styles.entry} ${styles[entry.type]}`}>
            <span className={styles.icon}>{TYPE_ICONS[entry.type]}</span>
            <span className={styles.time}>{fmt(entry.timestamp)}</span>
            <span className={styles.message}>{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

```

### `src/components/LogPanel/LogPanel.module.scss`

```scss
.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-surface);
}

.header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 12px;
  height: 36px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-3);
}

.count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-3);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 0 6px;
  min-width: 20px;
  text-align: center;
  line-height: 1.7;
}

.clearBtn {
  margin-left: auto;
  height: 24px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: color var(--ease), border-color var(--ease), background var(--ease);

  &:hover {
    color: var(--error);
    border-color: rgba(244, 63, 94, 0.35);
    background: var(--error-dim);
  }
}

.body {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  min-height: 0;

  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 2px; }
}

.empty {
  display: block;
  padding: 14px 12px;
  font-size: 12px;
  color: var(--text-3);
}

.entry {
  display: grid;
  grid-template-columns: 16px 58px 1fr;
  gap: 0 6px;
  align-items: baseline;
  padding: 2.5px 12px;
  font-family: var(--font-mono);
  font-size: 11.5px;
  line-height: 1.55;
  transition: background var(--ease);

  &:hover { background: var(--bg-hover); }
}

.icon { text-align: center; }
.time { color: var(--text-3); font-size: 10.5px; white-space: nowrap; }
.message { color: var(--text-2); word-break: break-word; }

.info { .icon { color: var(--text-3); } }
.success { .icon { color: var(--success); } .message { color: #6ee7b7; } }
.error { .icon { color: var(--error); } .message { color: #fca5a5; } }
.warn { .icon { color: var(--warn); } .message { color: #fcd34d; } }

```


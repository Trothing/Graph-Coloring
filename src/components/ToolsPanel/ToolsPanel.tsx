import React, { useRef, useState } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './ToolsPanel.module.scss';

interface ToolsPanelProps {
  hasResult: boolean;
  onGenerate: (count: number, density: number) => void;
  onImport: (json: string) => void;
  onExport: () => void;
  onExportWithResult: () => void;
}

const prefersOpen = () =>
  typeof window === 'undefined' || window.matchMedia('(min-height: 880px)').matches;

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  hasResult, onGenerate, onImport, onExport, onExportWithResult,
}) => {
  const [open, setOpen] = useState(prefersOpen);
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

  return (
    <section className={styles.panel} aria-label="Tools">
      <button
        className={styles.toggle}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>Tools</span>
        <Icon name="chevron" className={open ? styles.chevronOpen : ''} />
      </button>

      {open && (
        <div className={styles.body}>
          <div className={styles.group}>
            <p className={styles.label}>Random graph</p>

            <label className={styles.sliderLabel} htmlFor="gen-count">
              <span>Vertices</span>
              <strong>{genCount}</strong>
            </label>
            <input
              id="gen-count" type="range" min={3} max={50} value={genCount}
              onChange={e => setGenCount(+e.target.value)}
              className={styles.slider}
            />

            <label className={styles.sliderLabel} htmlFor="gen-density">
              <span>Density</span>
              <strong>{Math.round(genDensity * 100)}%</strong>
            </label>
            <input
              id="gen-density" type="range" min={0.05} max={0.9} step={0.05} value={genDensity}
              onChange={e => setGenDensity(+e.target.value)}
              className={styles.slider}
            />

            <button className={styles.btn} onClick={() => onGenerate(genCount, genDensity)}>
              <Icon name="dice" size="1.1em" />Generate
            </button>
          </div>

          <div className={styles.group}>
            <p className={styles.label}>JSON</p>
            <button className={`${styles.btn} ${styles.ghost}`} onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size="1.1em" />Import
            </button>
            <div className={styles.row}>
              <button
                className={`${styles.btn} ${styles.ghost}`}
                onClick={onExport}
                title="Export the graph without a coloring"
              >
                <Icon name="download" size="1.1em" />Export
              </button>
              <button
                className={`${styles.btn} ${styles.ghost}`}
                onClick={onExportWithResult}
                disabled={!hasResult}
                title={hasResult ? 'Export with the coloring result' : 'Run an algorithm first'}
              >
                <Icon name="download" size="1.1em" />+ Colors
              </button>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".json"
            hidden
            onChange={handleFileImport}
          />
        </div>
      )}
    </section>
  );
};

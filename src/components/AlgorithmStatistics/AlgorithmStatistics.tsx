import React from 'react';
import type { ColoringResult, AlgorithmType } from '../../domain/types';
import { pigmentFor } from '../../domain/palette';
import { ColoringContext } from '../../services/ColoringContext';
import styles from './AlgorithmStatistics.module.scss';

interface AlgorithmStatisticsProps {
  result: ColoringResult | null;
  selectedAlgorithm: AlgorithmType;
}

function formatComparisons(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const AlgorithmStatistics: React.FC<AlgorithmStatisticsProps> = ({
  result,
  selectedAlgorithm,
}) => {
  const strategyName = ColoringContext.getByType(selectedAlgorithm).name;

  const counts = new Map<number, number>();
  if (result?.success) {
    for (const c of result.coloring.values()) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  const colorGroups = [...counts.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <section className={styles.panel} aria-label="Results" aria-live="polite">
      <header className={styles.header}>
        <span className={styles.label}>Result</span>
        <span className={styles.algoTag}>{strategyName}</span>
      </header>

      {!result ? (
        <div className={styles.empty}>
          <span className={styles.ghostChi} aria-hidden="true">χ</span>
          <span>Run an algorithm to see results</span>
        </div>
      ) : (
        <>
          <div className={styles.hero}>
            <div className={styles.chi}>
              <span className={styles.label}>Chromatic number (χ)</span>
              <span
                key={`${result.chromaticNumber}-${result.timeMs}`}
                className={`${styles.chiValue} ${result.success ? '' : styles.chiFail}`}
              >
                {result.success ? result.chromaticNumber : '—'}
              </span>
            </div>

            <dl className={styles.metrics}>
              <div>
                <dd>{result.timeMs.toFixed(2)} ms</dd>
                <dt>Time</dt>
              </div>
              <div>
                <dd title={String(result.comparisons)}>{formatComparisons(result.comparisons)}</dd>
                <dt>Comparisons</dt>
              </div>
            </dl>
          </div>

          <div className={`${styles.status} ${result.success ? styles.statusOk : styles.statusFail}`}>
            {result.success ? 'Coloring found' : 'No solution found'}
          </div>

          {result.success && colorGroups.length > 0 && (
            <div className={styles.legend}>
              <span className={styles.label}>Vertices per color</span>
              <ul>
                {colorGroups.map(([colorIdx, count]) => (
                  <li key={colorIdx} title={`${count} vertices`}>
                    <span
                      className={styles.dot}
                      style={{ background: pigmentFor(colorIdx).fill }}
                    />
                    <span>Color {colorIdx + 1}</span>
                    <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
};

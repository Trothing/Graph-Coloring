import React from 'react';
import type { AlgorithmType } from '../../domain/types';
import { ColoringContext } from '../../services/ColoringContext';
import { Icon } from '../Icon/Icon';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  selectedAlgorithm: AlgorithmType;
  isRunning: boolean;
  onAlgorithmChange: (type: AlgorithmType) => void;
  onRun: () => void;
  onValidate: () => void;
}

const ALGORITHMS: { value: AlgorithmType; label: string; badge: string }[] = [
  { value: 'greedy', label: 'Greedy', badge: 'Fast' },
  { value: 'backtracking-mrv', label: 'MRV', badge: 'Heuristic 1' },
  { value: 'backtracking-degree', label: 'Degree', badge: 'Heuristic 2' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  selectedAlgorithm, isRunning,
  onAlgorithmChange, onRun, onValidate,
}) => {
  const strategy = ColoringContext.getByType(selectedAlgorithm);
  const badge = ALGORITHMS.find(a => a.value === selectedAlgorithm)?.badge;

  return (
    <section className={styles.panel} aria-label="Algorithm">
      <p className={styles.label}>Algorithm</p>
      <div className={styles.tabs} role="tablist">
        {ALGORITHMS.map(a => (
          <button
            key={a.value}
            role="tab"
            aria-selected={selectedAlgorithm === a.value}
            className={`${styles.tab} ${selectedAlgorithm === a.value ? styles.active : ''}`}
            onClick={() => onAlgorithmChange(a.value)}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className={styles.desc}>
        <span className={styles.name}>{strategy.name}<em>{badge}</em></span>
        <p>{strategy.description}</p>
      </div>

      <button
        className={`${styles.btn} ${styles.primary} ${isRunning ? styles.running : ''}`}
        onClick={onRun}
        disabled={isRunning}
      >
        {isRunning
          ? <>Working…</>
          : <><Icon name="play" size="1.1em" />Run algorithm</>}
      </button>
      <button className={styles.btn} onClick={onValidate}>
        <Icon name="check" size="1.1em" />Validate coloring
      </button>
    </section>
  );
};

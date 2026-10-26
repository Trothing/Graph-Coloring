import React from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import type { InteractionMode } from '../../domain/types';
import styles from './ToolDock.module.scss';

interface ToolDockProps {
  interactionMode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  onClear: () => void;
}

const MODES: { value: InteractionMode; label: string; icon: IconName }[] = [
  { value: 'add-vertex', label: 'Vertex', icon: 'vertex' },
  { value: 'add-edge', label: 'Edge', icon: 'edge' },
  { value: 'select', label: 'Move', icon: 'move' },
];

export const ToolDock: React.FC<ToolDockProps> = ({ interactionMode, onModeChange, onClear }) => (
  <nav className={styles.dock} aria-label="Tools">
    {MODES.map(m => (
      <button
        key={m.value}
        className={`${styles.tool} ${interactionMode === m.value ? styles.active : ''}`}
        onClick={() => onModeChange(m.value)}
        aria-pressed={interactionMode === m.value}
      >
        <Icon name={m.icon} size="1.5rem" />
        <span>{m.label}</span>
      </button>
    ))}
    <hr className={styles.divider} />
    <button className={`${styles.tool} ${styles.danger}`} onClick={onClear}>
      <Icon name="trash" size="1.5rem" />
      <span>Clear</span>
    </button>
  </nav>
);

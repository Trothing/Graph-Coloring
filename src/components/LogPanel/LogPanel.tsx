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
  warn: '!',
};

const fmt = (ts: number) =>
  new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const LogPanel: React.FC<LogPanelProps> = ({ logs, onClear }) => {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Scroll only the log itself; scrollIntoView could drag the whole page along.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <section className={styles.panel} aria-label="Log">
      <header className={styles.header}>
        <span className={styles.title}>Log</span>
        <span className={styles.count}>{logs.length}</span>
        <button className={styles.clearBtn} onClick={onClear} disabled={logs.length === 0}>Clear</button>
      </header>
      <div className={styles.body} ref={bodyRef}>
        {logs.length === 0 && (
          <span className={styles.empty}>Nothing here yet…</span>
        )}
        {logs.map(entry => (
          <div key={entry.id} className={`${styles.entry} ${styles[entry.type]}`}>
            <span className={styles.icon}>{TYPE_ICONS[entry.type]}</span>
            <span className={styles.time}>{fmt(entry.timestamp)}</span>
            <span className={styles.message}>{entry.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

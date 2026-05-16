import type { StatCard } from "@/client.config";
import styles from "./StatStrip.module.css";

interface Props {
  stats: StatCard[];
  /** Optionally hide individual stat cards by index — used by approval-item toggles */
  hiddenIndices?: number[];
}

export function StatStrip({ stats, hiddenIndices = [] }: Props) {
  const visibleStats = stats.filter((_, i) => !hiddenIndices.includes(i));

  return (
    <div className={styles.strip} role="list" aria-label="Credibility stats">
      {visibleStats.map((stat, i) => (
        <div key={i} className={styles.card} role="listitem">
          <div className={styles.value}>{stat.value}</div>
          <div className={styles.label}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

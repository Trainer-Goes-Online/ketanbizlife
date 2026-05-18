import { Icon } from "./Icon";
import styles from "./MoneyBackBadge.module.css";

interface Props {
  title: string;
  body: string;
}

/**
 * In-hero money-back guarantee badge. Compact glass pill + supporting line.
 */
export function MoneyBackBadge({ title, body }: Props) {
  return (
    <div className={styles.wrap} role="note" aria-label={title}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name="shield" size={18} />
      </span>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <p className={styles.body}>{body}</p>
      </div>
    </div>
  );
}

import styles from "./EventDetailsStrip.module.css";

interface Props {
  text: string;
}

export function EventDetailsStrip({ text }: Props) {
  return (
    <div className={styles.strip} role="group" aria-label="Event details">
      {text}
    </div>
  );
}

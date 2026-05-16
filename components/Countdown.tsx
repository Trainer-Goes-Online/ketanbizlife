"use client";

import { useEffect, useState } from "react";
import styles from "./Countdown.module.css";

interface Props {
  /** ISO 8601 datetime string for the countdown target */
  targetISO: string;
  label?: string;
  /** Text to show after the countdown reaches zero */
  expiredMessage?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  expired: boolean;
}

function computeTimeLeft(targetISO: string): TimeLeft {
  const target = new Date(targetISO).getTime();
  const now = Date.now();
  const totalMs = Math.max(0, target - now);
  const totalSeconds = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
    expired: totalSeconds === 0,
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function Countdown({
  targetISO,
  label = "Webinar shuru hone me",
  expiredMessage = "Webinar shuru ho gaya hai",
}: Props) {
  const [hasMounted, setHasMounted] = useState(false);
  const [time, setTime] = useState<TimeLeft>(() => computeTimeLeft(targetISO));

  useEffect(() => {
    setHasMounted(true);
    setTime(computeTimeLeft(targetISO));
    const interval = setInterval(() => {
      setTime(computeTimeLeft(targetISO));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetISO]);

  // SSR + first paint: render zero-state to avoid hydration mismatch
  if (!hasMounted) {
    return (
      <div className={styles.countdown} aria-live="off">
        <div className={styles.label}>{label}</div>
        <div className={styles.grid}>
          <CountdownCell value="--" unit="DAYS" />
          <CountdownCell value="--" unit="HRS" />
          <CountdownCell value="--" unit="MIN" />
          <CountdownCell value="--" unit="SEC" />
        </div>
      </div>
    );
  }

  if (time.expired) {
    return (
      <div className={styles.countdown}>
        <div className={styles.label}>{expiredMessage}</div>
      </div>
    );
  }

  const isUrgent = time.totalSeconds <= 60;

  return (
    <div
      className={`${styles.countdown} ${isUrgent ? styles.urgent : ""}`}
      aria-live="polite"
      aria-label={`${label}: ${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds`}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.grid}>
        <CountdownCell value={pad(time.days)} unit="DAYS" />
        <CountdownCell value={pad(time.hours)} unit="HRS" />
        <CountdownCell value={pad(time.minutes)} unit="MIN" />
        <CountdownCell value={pad(time.seconds)} unit="SEC" />
      </div>
    </div>
  );
}

function CountdownCell({ value, unit }: { value: string; unit: string }) {
  return (
    <div className={styles.cell}>
      <span className={styles.value}>{value}</span>
      <span className={styles.unit}>{unit}</span>
    </div>
  );
}

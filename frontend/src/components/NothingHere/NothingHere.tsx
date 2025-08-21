"use client";

import styles from "./NothingHere.module.scss";

export default function NothingHere({ message }: { message?: string }) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.message}>{message ?? "Oops! Empty shelf…"}</p>
    </div>
  );
}

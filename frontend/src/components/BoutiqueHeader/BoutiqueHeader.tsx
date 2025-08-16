"use client";

import styles from "./BoutiqueHeader.module.scss";

export default function BoutiqueHeader({
  title = "My Boutique",
  subtitle = "A collection of your favourite routines.",
  count,
}: {
  title?: string;
  subtitle?: string;
  count?: number; 
}) {
  return (
    <header className={styles.header}>
      <div className={styles.texts}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      {typeof count === "number" && (
        <span className={styles.count}>
          {count} {count === 1 ? "routine" : "routines"}
        </span>
      )}
    </header>
  );
}

import styles from "./Notes.module.scss";

export default function Notes({ notes }: { notes: string | null }) {
  if (!notes) return null;
  return (
    <section className={styles.notes}>
      <div className={styles.title}>Notes</div>
      <p className={styles.box}>{notes}</p>
    </section>
  );
}
